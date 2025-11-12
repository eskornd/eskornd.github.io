#!/usr/bin/env python3
from subprocess import call
import os
import sys

print('Update python');

class Config:
	p4_port = "perforce.esko-graphics.com:1666"
	mac_template = "/Users/nexu/toolbox/p4_client_template.txt"
	win_template = "/Users/nexu/toolbox/p4_client_template_windows.txt"
	win_host = "ESKW210397"
	mac_host = "ESKMGCY6Y31VHT"
	jenkins_job_prefix = "http://miniarm01.esko-graphics.com/view/EnabledJobs/job/"
	jenkins_job_suffix = "/lastSuccessfulBuild/artifact/"

class Workspace:
	def __init__(self, workspace_name, spec_url, hostname, template_file):
		self.workspace_name = workspace_name
		self.spec_url = spec_url
		self.hostname = hostname
		self.template_file = template_file

def makeSpecURL(jenkins_job, specname = 'spec.txt' ):
	url = Config.jenkins_job_prefix + jenkins_job + Config.jenkins_job_suffix +specname 
	return url

def macWorkspace(name, job_name, specname = 'spec.txt'):
	workspace = Workspace(name, makeSpecURL(job_name, specname), Config.mac_host, Config.mac_template)
	return workspace

def winWorkspace(name, job_name, specname = 'spec.txt'):
	workspace = Workspace(name, makeSpecURL(job_name, specname), Config.win_host, Config.win_template)
	return workspace


def updateSpec(workspace):
	client = workspace.workspace_name
	url = workspace.spec_url
	hostname = workspace.hostname
	template_file = workspace.template_file
	os.chdir('/tmp')
	# Download
	print('Downloading spec: ' + url)
	os.system('curl -L ' + url + ' > spec.txt ')
	# Replace "DEPOT" with your workspacename in the spec
	fmt = 'cat spec.txt | sed "s|DEPOT|{0}|" > {1}_spec.txt'
	cmd = fmt.format(client, client)
	os.system(cmd)
	# Replace the template file of the CLIENT and HOSTNAME
	fmt = 'cat {0} | sed "s|CLIENT|{1}|g" | sed "s|HOSTNAME|{2}|g"> {3}_full_p4_spec.txt'
	cmd = fmt.format(template_file, client, hostname, client)
	os.system(cmd)
	# Append the spec to the end of the .txt
	fmt = 'cat {0}_spec.txt | sed "s|^|  |" >> {1}_full_p4_spec.txt'
	cmd = fmt.format(client, client)
	os.system(cmd)
	# update to P4
	fmt = 'p4 -p {0} client -i < /tmp/{1}_full_p4_spec.txt'
	cmd = fmt.format(Config.p4_port, client)
	print(cmd)
	os.system(cmd)

workspaces = [
	macWorkspace("nexu_l_aa18A1", "Shopping_aa18A1"),
	winWorkspace("nexu_d_aa18A1", "Shopping_aa18A1"),
	macWorkspace("nexu_l_aa18A5", "Shopping_aa18A5"),
	winWorkspace("nexu_d_aa18A5", "Shopping_aa18A5"),
	macWorkspace("nexu_l_aa20A1", "Shopping_aa20A1"),
	winWorkspace("nexu_d_aa20A1", "Shopping_aa20A1"),
	winWorkspace("nexu_d_aa21A3", "Shopping_aa21A3"),
	macWorkspace("nexu_l_aa21A3", "Shopping_aa21A3"),
	winWorkspace("nexu_d_aa22A1", "Shopping_aa22A1"),
	macWorkspace("nexu_l_aa22A1", "Shopping_aa22A1"),
	winWorkspace("nexu_d_aa23A2", "Shopping_aa23.07"),
	macWorkspace("nexu_l_aa23A2", "Shopping_aa23.07"),
	winWorkspace("nexu_d_aa24A1", "Shopping_aa24.03"),
	macWorkspace("nexu_l_aa24A1", "Shopping_aa24.03"),
	winWorkspace("nexu_d_aa24A2", "Shopping_aa24.07"),
	macWorkspace("nexu_l_aa24A2", "Shopping_aa24.07"),
	winWorkspace("nexu_d_aa25A2", "Shopping_aa25.07"),
	macWorkspace("nexu_l_aa25A2", "Shopping_aa25.07"),
	macWorkspace("nexu_l_2019", "Shopping_2019"),
	macWorkspace("nexu_l_2020", "Shopping_2020"),
	macWorkspace("nexu_l_ai18A1", "Shopping_ai18A1"),
	macWorkspace("nexu_l_app18A2", "Shopping_applus18A2"),
	macWorkspace("nexu_l_app18A3", "Shopping_applus18A3"),
	macWorkspace("nexu_l_app18A4", "Shopping_applus18A4"),
	winWorkspace("nexu_d_app18A4", "Shopping_applus18A4"),
	macWorkspace("nexu_l_app18A5", "Shopping_app18A5"),
	winWorkspace("nexu_d_app18A5", "Shopping_app18A5"),
	macWorkspace("nexu_l_app20A1", "Shopping_app20A1"),
	winWorkspace("nexu_d_app20A1", "Shopping_app20A1"),
	macWorkspace("nexu_l_app20A2", "Shopping_app20A2"),
	winWorkspace("nexu_d_app20A2", "Shopping_app20A2"),
	macWorkspace("nexu_l_app21A1", "Shopping_app21A1"),
	winWorkspace("nexu_d_app21A1", "Shopping_app21A1"),
	macWorkspace("nexu_l_app21A2", "Shopping_app21A2"),
	winWorkspace("nexu_d_app21A2", "Shopping_app21A2"),
	macWorkspace("nexu_l_app21A3", "Shopping_app21A3"),
	winWorkspace("nexu_d_app21A3", "Shopping_app21A3"),
	macWorkspace("nexu_l_app22A1", "Shopping_app22A1"),
	winWorkspace("nexu_d_app22A1", "Shopping_app22A1"),
	macWorkspace("nexu_l_app22A2", "Shopping_app22.07"),
	winWorkspace("nexu_d_app22A2", "Shopping_app22.07"),
	macWorkspace("nexu_l_app22A3", "Shopping_app22.11"),
	winWorkspace("nexu_d_app22A3", "Shopping_app22.11"),
	macWorkspace("nexu_l_app23A1", "Shopping_app23.03"),
	winWorkspace("nexu_d_app23A1", "Shopping_app23.03"),
	macWorkspace("nexu_l_app23A2", "Shopping_app23.07"),
	winWorkspace("nexu_d_app23A2", "Shopping_app23.07"),
	macWorkspace("nexu_l_app23A3", "Shopping_app23.11"),
	winWorkspace("nexu_d_app23A3", "Shopping_app23.11"),
	macWorkspace("nexu_l_app24A1", "Shopping_app24.03"),
	winWorkspace("nexu_d_app24A1", "Shopping_app24.03"),
	macWorkspace("nexu_l_app24A2", "Shopping_app24.07"),
	winWorkspace("nexu_d_app24A2", "Shopping_app24.07"),
	macWorkspace("nexu_l_app24A3", "Shopping_app24.11"),
	winWorkspace("nexu_d_app24A3", "Shopping_app24.11"),
	macWorkspace("nexu_l_app25A1", "Shopping_app25.03"),
	winWorkspace("nexu_d_app25A1", "Shopping_app25.03"),
	macWorkspace("nexu_l_app25A2", "Shopping_app25.07"),
	winWorkspace("nexu_d_app25A2", "Shopping_app25.07"),
	macWorkspace("nexu_l_app25A3", "Shopping_app25.11"),
	winWorkspace("nexu_d_app25A3", "Shopping_app25.11"),
	macWorkspace("nexu_l_app26A1", "Shopping_app26.03"),
	winWorkspace("nexu_d_app26A1", "Shopping_app26.03"),
	macWorkspace("nexu_l_underline24A1", "Shopping_underline_24.03"),
	winWorkspace("nexu_d_underline24A1", "Shopping_underline_24.03"),
	macWorkspace("nexu_l_underline25A1", "Shopping_underline_25.03", "underline_spec.txt"),
	winWorkspace("nexu_d_underline25A1", "Shopping_underline_25.03", "underline_spec.txt"),
	macWorkspace("nexu_l_ai18A2", "Shopping_ai18A2"),
	winWorkspace("nexu_d_ai18A2", "Shopping_ai18A2"),
	macWorkspace("nexu_l_ps18A2", "Shopping_ps18A2"),
	winWorkspace("nexu_d_ps18A2", "Shopping_ps18A2"),
	macWorkspace("nexu_l_ps18A3", "Shopping_ps18A3"),
	winWorkspace("nexu_d_ps18A3", "Shopping_ps18A3"),
	macWorkspace("nexu_l_ps18A4", "Shopping_ps18A4"),
	winWorkspace("nexu_d_ps18A4", "Shopping_ps18A4"),
	macWorkspace("nexu_l_ps18A5", "Shopping_ps18A5"),
	winWorkspace("nexu_d_ps18A5", "Shopping_ps18A5"),
	macWorkspace("nexu_l_ps20A1", "Shopping_ps20A1"),
	winWorkspace("nexu_d_ps20A1", "Shopping_ps20A1"),
	macWorkspace("nexu_l_ps20A2", "Shopping_ps20A2"),
	winWorkspace("nexu_d_ps20A2", "Shopping_ps20A2"),
	macWorkspace("nexu_l_ps21A1", "Shopping_ps21A1"),
	winWorkspace("nexu_d_ps21A1", "Shopping_ps21A1"),
	macWorkspace("nexu_l_ps21A2", "Shopping_ps21A2"),
	winWorkspace("nexu_d_ps21A2", "Shopping_ps21A2"),
	macWorkspace("nexu_l_ps21A3", "Shopping_ps21A3"),
	winWorkspace("nexu_d_ps21A3", "Shopping_ps21A3"),
	macWorkspace("nexu_l_ps22A1", "Shopping_ps22A1"),
	winWorkspace("nexu_d_ps22A1", "Shopping_ps22A1"),
	macWorkspace("nexu_l_ps22A2", "Shopping_ps22.07"),
	winWorkspace("nexu_d_ps22A2", "Shopping_ps22.07"),
	macWorkspace("nexu_l_ps22A3", "Shopping_ps22.11"),
	winWorkspace("nexu_d_ps22A3", "Shopping_ps22.11"),
	macWorkspace("nexu_l_ps23A1", "Shopping_ps23.03"),
	winWorkspace("nexu_d_ps23A1", "Shopping_ps23.03"),
	macWorkspace("nexu_l_ps23A2", "Shopping_ps23.07"),
	winWorkspace("nexu_d_ps23A2", "Shopping_ps23.07"),
	macWorkspace("nexu_l_ps23A3", "Shopping_ps23.11"),
	winWorkspace("nexu_d_ps23A3", "Shopping_ps23.11"),
	macWorkspace("nexu_l_ps24A1", "Shopping_ps24.03"),
	winWorkspace("nexu_d_ps24A1", "Shopping_ps24.03"),
	macWorkspace("nexu_l_ps24A2", "Shopping_ps24.07"),
	winWorkspace("nexu_d_ps24A2", "Shopping_ps24.07"),
	macWorkspace("nexu_l_ps24A3", "Shopping_ps24.11"),
	winWorkspace("nexu_d_ps24A3", "Shopping_ps24.11"),
	macWorkspace("nexu_l_ps25A1", "Shopping_ps25.03"),
	winWorkspace("nexu_d_ps25A1", "Shopping_ps25.03"),
	macWorkspace("nexu_l_ps25A2", "Shopping_ps25.07"),
	winWorkspace("nexu_d_ps25A2", "Shopping_ps25.07"),
	macWorkspace("nexu_l_ps25A3", "Shopping_ps25.11"),
	winWorkspace("nexu_d_ps25A3", "Shopping_ps25.11"),
	macWorkspace("nexu_l_ps26A1", "Shopping_ps26.03"),
	winWorkspace("nexu_d_ps26A1", "Shopping_ps26.03"),
	macWorkspace("nexu_l_ai18A3", "Shopping_ai18A3"),
	winWorkspace("nexu_d_ai18A3", "Shopping_ai18A3"),
	macWorkspace("nexu_l_ai18A5", "Shopping_ai18A5"),
	winWorkspace("nexu_d_ai18A5", "Shopping_ai18A5"),
	macWorkspace("nexu_l_ai20A1", "Shopping_ai20A1"),
	winWorkspace("nexu_d_ai20A1", "Shopping_ai20A1"),
	macWorkspace("nexu_l_ai20A2", "Shopping_ai20A2"),
	winWorkspace("nexu_d_ai20A2", "Shopping_ai20A2"),
	macWorkspace("nexu_l_ai21A1", "Shopping_ai21A1"),
	winWorkspace("nexu_d_ai21A1", "Shopping_ai21A1"),
	macWorkspace("nexu_l_ai21A2", "Shopping_ai21A2"),
	winWorkspace("nexu_d_ai21A2", "Shopping_ai21A2"),
	macWorkspace("nexu_l_ai21A3", "Shopping_ai21A3"),
	winWorkspace("nexu_d_ai21A3", "Shopping_ai21A3"),
	macWorkspace("nexu_l_ai22A1", "Shopping_ai22A1"),
	winWorkspace("nexu_d_ai22A1", "Shopping_ai22A1"),
	macWorkspace("nexu_l_ai22A2", "Shopping_ai22.07"),
	winWorkspace("nexu_d_ai22A2", "Shopping_ai22.07"),
	macWorkspace("nexu_l_ai22A3", "Shopping_ai22.11"),
	winWorkspace("nexu_d_ai22A3", "Shopping_ai22.11"),
	macWorkspace("nexu_l_ai23A1", "Shopping_ai23.03"),
	winWorkspace("nexu_d_ai23A1", "Shopping_ai23.03"),
	macWorkspace("nexu_l_ai23A2", "Shopping_ai23.07"),
	winWorkspace("nexu_d_ai23A2", "Shopping_ai23.07"),
	macWorkspace("nexu_l_ai23A3", "Shopping_ai23.11"),
	winWorkspace("nexu_d_ai23A3", "Shopping_ai23.11"),
	macWorkspace("nexu_l_ai24A1", "Shopping_ai24.03"),
	winWorkspace("nexu_d_ai24A1", "Shopping_ai24.03"),
	macWorkspace("nexu_l_ai24A2", "Shopping_ai24.07"),
	winWorkspace("nexu_d_ai24A2", "Shopping_ai24.07"),
	macWorkspace("nexu_l_ai24A3", "Shopping_ai24.11"),
	winWorkspace("nexu_d_ai24A3", "Shopping_ai24.11"),
	macWorkspace("nexu_l_ai25A1", "Shopping_ai25.03"),
	winWorkspace("nexu_d_ai25A1", "Shopping_ai25.03"),
	macWorkspace("nexu_l_ai25A2", "Shopping_ai25.07"),
	winWorkspace("nexu_d_ai25A2", "Shopping_ai25.07"),
	macWorkspace("nexu_l_ai25A3", "Shopping_ai25.11"),
	winWorkspace("nexu_d_ai25A3", "Shopping_ai25.11"),
	macWorkspace("nexu_l_ai26A1", "Shopping_ai26.03"),
	winWorkspace("nexu_d_ai26A1", "Shopping_ai26.03"),
	macWorkspace("nexu_l_aiunder25A1", "Shopping_AI_underline_25.03", 'underline_spec.txt'),
	winWorkspace("nexu_d_aiunder25A1", "Shopping_AI_underline_25.03", 'underline_spec.txt'),
	macWorkspace("nexu_l_typesettingsandbox", "Shopping_TypesettingSandbox"),
	macWorkspace("nexu_l_appsandbox", "Shopping_app_sandbox"),
	winWorkspace("nexu_d_appsandbox", "Shopping_app_sandbox"),
	macWorkspace("nexu_l_webtext", "Shopping_WebTextPrototype"),
	macWorkspace("nexu_l_emdemo", "Shopping_EmscriptenDemo"),
	winWorkspace("nexu_d_emdemo", "Shopping_EmscriptenDemo"),
	macWorkspace("nexu_l_wasmdemo", "Shopping_WebAssemblyDemo"),
	macWorkspace("nexu_l_dtpscript", "Shopping_dtpscript"),
	winWorkspace("nexu_d_dtpscript", "Shopping_dtpscript"),
	macWorkspace("nexu_l_ctpreview24A2", "Shopping_ctpreview"),
	winWorkspace("nexu_d_ctpreview24A2", "Shopping_ctpreview"),
]

def main():
	if len(sys.argv) < 2:
		print('Must supply workspace name')
		exit(0)
	
	print('You choosed: ')
	n = len(sys.argv)
	for i in range (1, len(sys.argv)):
		print(sys.argv[i])

	for i in range (1, len(sys.argv)):
		client_name = sys.argv[i]	
		for w in workspaces:
			if client_name == w.workspace_name:
				print('Matched workspace: ' + client_name)
				updateSpec(w)

if __name__ == "__main__":
	main()
