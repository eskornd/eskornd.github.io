#!/usr/bin/env python3

import os, shutil, subprocess, sys

# cmake bin as default
P4_ROOT='/Users/nexu/p4'
CMAKE_OUTPUT_PATH='/CMake_Output_Debug'
CMAKE_OUTPUT_PATH_RELEASE='/CMake_Output_Release'

workspaces=['nexu_l_ai26A1', 'nexu_l_ai25A3']
def user_input_workspace():
	print('Select Workspace:')
	index = 0
	for ws in workspaces:
		print(str(index) + ') ' + ws)
		index+=1
	op = input('Please Enter (index or workspacename):')
	if (len(op)==0):
		op='0'
	try:
		selectedIndex = int(op)
		if ( selectedIndex < len(workspaces) ):
			return workspaces[selectedIndex]
		else:
			return op
	except ValueError:
		return op

WORKSPACE=''
if (len(sys.argv)>1):
	debug_output=sys.argv[1]
else:
	WORKSPACE=user_input_workspace()
	print(CMAKE_OUTPUT_PATH + " is chosen for debug")
	DEBUG_OUTPUT_DIR=CMAKE_OUTPUT_PATH + '/bin'
	RELEASE_OUTPUT_DIR=CMAKE_OUTPUT_PATH_RELEASE + '/bin'
	debug_output=P4_ROOT + '/' + WORKSPACE + DEBUG_OUTPUT_DIR

print('Selected workspace: ' + WORKSPACE)

ai18_root='/Applications/Adobe Illustrator CC 2014/Plug-ins.localized/Esko'
ai19_root='/Applications/Adobe Illustrator CC 2015/Plug-ins.localized/Esko'
ai16_root='/Applications/Adobe Illustrator CS6/Plug-ins.localized/Esko'
ai20_root='/Applications/Adobe Illustrator CC 2015.3/Plug-ins.localized/Esko'
ai21_root='/Applications/Adobe Illustrator CC 2017/Plug-ins.localized/Esko'
ai22_root='/Applications/Adobe Illustrator CC 2018/Plug-ins.localized/Esko'
ai23_root='/Applications/Adobe Illustrator CC 2019/Plug-ins.localized/Esko'
ai24_root='/Applications/Adobe Illustrator 2020/Plug-ins.localized/Esko'
ai25_root='/Applications/Adobe Illustrator 2021/Plug-ins.localized/Esko'
ai26_root='/Applications/Adobe Illustrator 2022/Plug-ins.localized/Esko'
ai27_root='/Applications/Adobe Illustrator 2023/Plug-ins.localized/Esko'
ai28_root='/Applications/Adobe Illustrator 2024/Plug-ins.localized/Esko'
ai29_root='/Applications/Adobe Illustrator 2025/Plug-ins.localized/Esko'
ai30_root='/Applications/Adobe Illustrator 2026/Plug-ins.localized/Esko'
output_root=debug_output
ai_root=ai29_root

print('Src folder '+ output_root)

op=''
def user_input_ai_version():
	root=''
	print('1) CC2026')	
	print('2) CC2025')	
	print('3) CC2024')	
	op = input('Please Enter:')
	if   (op=='0'): return '0'
	elif (op=='1'): return '30'
	elif (op=='2'): return '29'
	elif (op=='3'): return '28'

aiver=user_input_ai_version()
if (aiver=='18'):
	ai_root=ai18_root
elif(aiver=='19'):
	ai_root=ai19_root
elif(aiver=='16'):
	ai_root=ai16_root	
elif(aiver=='20'):
	ai_root=ai20_root	
elif(aiver=='21'):
	ai_root=ai21_root	
elif(aiver=='22'):
	ai_root=ai22_root	
elif(aiver=='23'):
	ai_root=ai23_root	
elif(aiver=='24'):
	ai_root=ai24_root	
elif(aiver=='25'):
	ai_root=ai25_root	
elif(aiver=='26'):
	ai_root=ai26_root	
elif(aiver=='27'):
	ai_root=ai27_root	
elif(aiver=='28'):
	ai_root=ai28_root	
elif(aiver=='29'):
	ai_root=ai29_root	
elif(aiver=='30'):
	ai_root=ai30_root	

def user_input_output(aiversion):
	output = P4_ROOT + '/' + WORKSPACE
	print('1) debug')
	print('2) release')
	op = input('Please Enter:')
	if (op=='1'):
		output = output + DEBUG_OUTPUT_DIR
	elif (op=='2'):
		output = output + RELEASE_OUTPUT_DIR
	return output
if (len(sys.argv)<=1):
	output_root=user_input_output(aiver)
	print('output_root: ' + output_root) 



class AIPlugin(object):
	def __init__(self, root, dir):
		self.root = root 
		self.srcdir = dir
		self.plugin_name = dir[0:len(dir)-5]
		self.debug_aip = self.plugin_name + 'd.aip'
		self.release_aip = self.plugin_name + 'r.aip'
	def __str__(self):
		return self.root + '/' + self.srcdir


def enum_plugins(root_dir):
	print('enum plugins in dir', root_dir)
	plugins = []
	for root,dirs, files in os.walk(root_dir):
		for dir in dirs:
			if (dir.endswith(aiver + 'd.aip') or dir.endswith(aiver + 'r.aip')):
				fulldir = root +'/' + dir + '/Contents/MacOS'
				#validate the dir
				if (os.path.isdir(fulldir)):
					if (len(os.listdir(fulldir)) > 0):
						plugins.append(AIPlugin(root, dir))

	return plugins

def do_replace(src_plugin, target_root):
	tgt_plugins=enum_plugins(target_root)
	ln_target=target_root + '/' + src_plugin.srcdir
	for tgt_plugin in tgt_plugins:
		if (src_plugin.plugin_name == tgt_plugin.plugin_name):
			print('Plugin exists in target folder: ' + tgt_plugin.srcdir )
			print('rm -rf ' + str(tgt_plugin))
			subprocess.call(['rm','-rf',str(tgt_plugin)])
			ln_target=tgt_plugin.root + '/' + src_plugin.srcdir
	print('create symbolic link: ' + ln_target + ' -> ' + str(src_plugin))
	os.symlink(str(src_plugin), ln_target)	


src_plugins=enum_plugins(output_root)

op=''
if (len(src_plugins) >=1 ):
	print('Select the plugins that you want to replace:')
	print('a) All plugins')
	index = 0
	for plugin in src_plugins:
		print( str(index) + ') ' + plugin.srcdir)
		index+=1
	op = input('Please Enter:')
else:
	print ('No plugins found!')
	sys.exit(1)

if (op=='a'):
	print ('You selected All Plugins')
	for src_plugin in src_plugins:
		print ('Replacing ' + src_plugin.plugin_name)
		do_replace(src_plugin, ai_root)
else:
	print ('OP is ' + op )
	index=int(op)
	if (index<len(src_plugins)):
		print ('You selected ' + src_plugins[index].plugin_name)
		do_replace(src_plugins[index], ai_root)
	else:
		print ('Index out of bound: ' + str(index))
		exit()

print('')
print('Done')


