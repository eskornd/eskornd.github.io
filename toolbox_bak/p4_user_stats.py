#!/usr/bin/env python3

import os
import re
import subprocess
import sys
import argparse
from datetime import datetime, timedelta
import csv
import json

def get_user_changes(user, start_date=None, end_date=None):
    """Get all changelists for a specific user within a time range"""
    cmd = ['p4', 'changes', '-u', user]
    
    if start_date and end_date:
        date_range = f"@{start_date.strftime('%Y/%m/%d')},@{end_date.strftime('%Y/%m/%d')}"
        cmd = ['p4', 'changes', '-u', user, date_range]
        print(cmd)
    elif start_date:
        cmd.extend(['@' + start_date.strftime('%Y/%m/%d'), '@now'])
        print(cmd)
    elif end_date:
        cmd.extend(['@0', '@' + end_date.strftime('%Y/%m/%d')])
        print(cmd)
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running 'p4 changes': {result.stderr}")
        sys.exit(1)
    
    changes = []
    for line in result.stdout.splitlines():
        parts = line.split()
        if len(parts) >= 2:
            changelist = parts[1]
            changes.append(changelist)
    return changes

def get_change_details(changelist):
    """Get detailed information for a single changelist"""
    cmd = ['p4', 'describe', '-du', changelist]
    print('\tdescribing: ' + changelist)
    result = subprocess.run(cmd, capture_output=True, encoding='utf-8', text=True)
    if result.returncode != 0:
        print(f"Error describing changelist {changelist}: {result.stderr}")
        return (0, 0, 0, [])
    
    additions = 0
    deletions = 0
    files_changed = 0
    file_types = set()
    
    in_diff = False
    
    lines = result.stdout
    if lines is None:
        print(f"Error describing changelist {changelist}: result.stdout is None")
        return (0, 0, 0, [])

    for line in lines.splitlines():
        if line.startswith('Affected files'):
            continue
            
        if line.startswith('... ') and '#' in line:
            # File line
            files_changed += 1
            line = line.replace('#', ' ')
            parts = line.split()
            if len(parts) >= 4:
                file_path = parts[1]
                file_ext = os.path.splitext(file_path)[1]
                if file_ext:
                    file_types.add(file_ext)
        
        elif line.startswith('===='):
            # Diff section starts
            in_diff = True
            continue
            
        if in_diff:
            if line.startswith('+++') or line.startswith('---'):
                continue
            if line.startswith('+') and not line.startswith('+++'):
                additions += 1
            elif line.startswith('-') and not line.startswith('---'):
                deletions += 1
    
    return (additions, deletions, files_changed, list(file_types))

def parse_date(date_str):
    """Parse date string"""
    formats = ['%Y-%m-%d', '%Y/%m/%d', '%m/%d/%Y', '%d/%m/%Y']
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Cannot parse date: {date_str}")

def analyze_multiple_users(users, start_date=None, end_date=None, output_format='text'):
    """Analyze workload for multiple users"""
    results = []
    
    for username in users:
        print(f"\nAnalyzing user: {username}")
        changes = get_user_changes(username, start_date, end_date)
        total_changes = len(changes)
        
        total_additions = 0
        total_deletions = 0
        total_files_changed = 0
        all_file_types = set()
        
        print(f"Found {total_changes} changelists. Analyzing...")
        
        for i, cl in enumerate(changes, 1):
            add, delete, files, file_types = get_change_details(cl)
            total_additions += add
            total_deletions += delete
            total_files_changed += files
            all_file_types.update(file_types)
            
            if i % 10 == 0:
                print(f"  Processed {i}/{total_changes} changelists...")
        
        net_lines = total_additions - total_deletions
        avg_lines_per_commit = (total_additions + total_deletions) / total_changes if total_changes > 0 else 0
        
        user_result = {
            'username': username,
            'total_commits': total_changes,
            'lines_added': total_additions,
            'lines_deleted': total_deletions,
            'net_lines': net_lines,
            'files_changed': total_files_changed,
            'file_types': list(all_file_types),
            'avg_lines_per_commit': round(avg_lines_per_commit, 1),
        }
        
        results.append(user_result)
    
    return results

def print_results(results, output_format, output_file=None):
    """Print results in specified format"""
    if output_format == 'json':
        output_data = json.dumps(results, indent=2, ensure_ascii=False)
    elif output_format == 'csv':
        output = []
        for result in results:
            output.append({
                'Username': result['username'],
                'Total_Commits': result['total_commits'],
                'Lines_Added': result['lines_added'],
                'Lines_Deleted': result['lines_deleted'],
                'Net_Lines': result['net_lines'],
                'Files_Changed': result['files_changed'],
                'Avg_Lines_Per_Commit': result['avg_lines_per_commit'],
                'File_Types_Count': len(result['file_types']),
            })
        
        if output_file:
            with open(output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=output[0].keys())
                writer.writeheader()
                writer.writerows(output)
            print(f"Results saved to: {output_file}")
            return
        else:
            # Simple text format for CSV
            headers = output[0].keys()
            print(','.join(headers))
            for row in output:
                print(','.join(str(row[col]) for col in headers))
            return
    else:
        # Text format
        output_data = "\n" + "="*80 + "\n"
        output_data += "Programmer Workload Statistics Report\n"
        output_data += "="*80 + "\n\n"
        
        # Sort by net lines changed
        results.sort(key=lambda x: x['net_lines'], reverse=True)
        
        for result in results:
            output_data += f"User: {result['username']}\n"
            output_data += f"  Total Commits:           {result['total_commits']:>6}\n"
            output_data += f"  Lines Added:             {result['lines_added']:>6}\n"
            output_data += f"  Lines Deleted:           {result['lines_deleted']:>6}\n"
            output_data += f"  Net Lines Changed:       {result['net_lines']:>6}\n"
            output_data += f"  Files Changed:           {result['files_changed']:>6}\n"
            output_data += f"  Avg Lines Per Commit:    {result['avg_lines_per_commit']:>6.1f}\n"
            output_data += f"  File Types:              {', '.join(result['file_types'][:5])}{'...' if len(result['file_types']) > 5 else ''}\n"
            output_data += "-" * 40 + "\n"
    
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(output_data)
        print(f"Results saved to: {output_file}")
    else:
        print(output_data)

def main():
    parser = argparse.ArgumentParser(description='Programmer workload statistics analysis tool')
    parser.add_argument('usernames', nargs='+', help='P4 usernames to analyze (multiple users supported)')
    parser.add_argument('--start-date', '-s', help='Start date (format: YYYY-MM-DD)')
    parser.add_argument('--end-date', '-e', help='End date (format: YYYY-MM-DD)')
    parser.add_argument('--last-week', action='store_true', help='Analyze last week')
    parser.add_argument('--last-month', action='store_true', help='Analyze last month')
    parser.add_argument('--last-half-year', action='store_true', help='Analyze last half year')
    parser.add_argument('--all', action='store_true', help='Analyze last half year')
    parser.add_argument('--output', '-o', help='Output filename')
    parser.add_argument('--format', '-f', choices=['text', 'csv', 'json'], 
                       default='text', help='Output format (default: text)')
    
    args = parser.parse_args()
    
    # Process time range
    start_date = None
    end_date = datetime.now()
    end_date += timedelta(days=1)
    
    if args.last_week:
        start_date = datetime.now() - timedelta(days=7)
    elif args.last_month:
        start_date = datetime.now() - timedelta(days=30)
    elif args.last_half_year:
        start_date = datetime.now() - timedelta(days=180)
    elif args.start_date:
        start_date = parse_date(args.start_date)
    elif args.all:
        start_date = ''
    else:
        start_date = datetime.now() - timedelta(days=7)

    
    if args.end_date:
        end_date = parse_date(args.end_date)
    
    # Display analysis range
    time_range_info = "All time"
    if start_date:
        time_range_info = f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
    
    print(f"Starting analysis...")
    print(f"Time range: {time_range_info}")
    print(f"Analyzing users: {', '.join(args.usernames)}")
    
    # Analyze all users
    results = analyze_multiple_users(args.usernames, start_date, end_date, args.format)
    
    # Output results
    print_results(results, args.format, args.output)

if __name__ == '__main__':
    main()
