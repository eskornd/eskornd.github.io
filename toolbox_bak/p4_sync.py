#!/usr/bin/env python3

import os, sys

def usage():
	print('Usage:')
	print('    ' + sys.argv[0] + ' <p4 client name>')
	exit(0)

def main():
	if len(sys.argv)<2:
		usage()

	client=sys.argv[1]
	fmt = 'p4 -c {0} sync ~/p4/{0}/depot/...#head'
	cmd = fmt.format(client)
	print(cmd)
	os.system(cmd)


if __name__ == "__main__":
	main()
