#!/usr/bin/env python3

import os, sys

client='build_LND.ESKMGCY6Y31VHT.PackageShop.dependencies'
workspace='/Users/nexu/PackageShop/Dependencies/my_lnd'

def main():
	fmt = 'p4 -c {0} sync {1}/...#head'
	cmd = fmt.format(client, workspace)
	print(cmd)
	os.system(cmd)

if __name__ == "__main__":
	main()
