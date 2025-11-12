#!/bin/bash

ACROBAT="/Applications/Adobe Acrobat DC/Adobe Acrobat.app/Contents/Plug-ins/Esko"
READER="/Applications/Adobe Acrobat Reader DC.app/Contents/Plug-ins/Esko"
REPO="/Library/Application Support/Esko-Graphics/DeskPack Plug-In Repository/Acrobat XMP"
RECEIPT="/Library/Receipts/Acrobat XMP.pkg"
IFS=":"
PATHS=("${READER}":"${ACROBAT}":"${REPO}":"${RECEIPT}")

echo Uninstalling Acrobat XMP from:
for file in ${PATHS}; do
	echo "${file}"
	sudo rm -Rf "${file}"
done
