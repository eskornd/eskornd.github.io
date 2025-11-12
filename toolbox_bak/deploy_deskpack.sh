#!/bin/bash
if [ "$1" != "" ]; then
	VERSION=$1
else
	VERSION=`curl -s 'http://miniarm01.esko-graphics.com/view/EnabledJobs/job/PublishAIBuild/lastSuccessfulBuild/artifact/artifacts/buildnumber.txt'`
fi

DOWNLOADED_FILE=~/.deskpack_downloaded_version
DOWNLOADED_VERSION=""
if [ -f ${DOWNLOADED_FILE} ]; then
	DOWNLOADED_VERSION=`cat ${DOWNLOADED_FILE}`	
fi

WORKSPACE=
WORKSPACE_FILE=~/.deskpack_workspace
if [ -f ${WORKSPACE_FILE} ]; then
	WORKSPACE=`cat ${WORKSPACE_FILE}`	
else
	echo "Please specify workspace in ${WORKSPACE_FILE}. E.g. \"/Users/nexu/p4/<NAME>\""
	exit -1
fi

TGT=~/Desktop/Builds/$VERSION

CC2014='/tmp/ai_links/2014'
CC2015='/tmp/ai_links/CC2015'
AI21='/tmp/ai_links/AI21'
AI22='/tmp/ai_links/AI22'
AI23='/tmp/ai_links/AI23'
AI24='/tmp/ai_links/AI24'
AI25='/tmp/ai_links/AI25'
AI26='/tmp/ai_links/AI26'
AI27='/tmp/ai_links/AI27'
AI28='/tmp/ai_links/AI28'
AI29='/tmp/ai_links/AI29'
AI30='/tmp/ai_links/AI30'
CC='/tmp/ai_links/CC'
CS6='/tmp/ai_links/CS6'

CMAKE_DIR=${WORKSPACE}/CMake_Output_Debug

BLACKLIST='"Visualizer"'
NON_SHA_PLUGINS='"Toolkit for Boxes"
"Toolkit for Labels"
"Toolkit for Shrink Sleeves" 
"Trapping" 
"Variable Data" 
"Visualizer" 
"Designer" 
"CHILI" 
"Instant Trapper" 
"PowerLayout" 
"PowerTrapper" 
"Dynamic Panels" 
"Dynamic Tables" 
"Dynamic Barcodes"
"Dynamic VDP"  
"Dynamic Art" 
"Automated Testers"/Dynamic*
"Automated Testers"/PDFExportTester* 
'

#echo ${NON_SHA_PLUGINS}

echo ""
echo "========================================"
echo "workspace: ${WORKSPACE}"
echo "Latest Version: ${VERSION}"
echo "Downloaded Version: ${DOWNLOADED_VERSION}"
echo "Download? (y/n) [n]"
DO_COPY=0

read OPT
case $OPT in
    y) DO_COPY=1;;
esac

echo 
echo "Which AI version to deploy? "
echo '0) CC2026'
echo '1) CC2025'
echo '2) CC2024'
echo '3) CC2023'
echo '4) CC2022'
echo '5) CC2021'

read OPT
case $OPT in
	0) AI_LINK_DIR=$AI30 SDKVER=30 LIC_SUB=AI30 ;; 
	1) AI_LINK_DIR=$AI29 SDKVER=29 LIC_SUB=AI29 ;; 
	2) AI_LINK_DIR=$AI28 SDKVER=28 LIC_SUB=AI28 ;; 
	3) AI_LINK_DIR=$AI27 SDKVER=27 LIC_SUB=AI27 ;; 
	4) AI_LINK_DIR=$AI26 SDKVER=26 LIC_SUB=AI26 ;; 
	5) AI_LINK_DIR=$AI25 SDKVER=25 LIC_SUB=AI25 ;; 
esac

echo
echo "Only SHA plugins ? (y/n) [y]"
ONLY_SHA=1

read OPT
case $OPT in
    n) ONLY_SHA=0;;
esac

echo
echo "Deploy Debug ? (y/n) [y]"
DO_DBG_LIC=1

read OPT
case $OPT in
    n) DO_DBG_LIC=0;;
esac

echo ===== START DEPLOY =====
echo WORKSPACE=${WORKSPACE}
echo SDKVER=${SDKVER}
echo ONLY_SHA=${ONLY_SHA}
echo DO_DBG_LIC=${DO_DBG_LIC}


function prepare()
{
	sudo echo 
	rm -rf /tmp/ai_links
	mkdir /tmp/ai_links/
	cd /tmp/ai_links
	ln -s /Applications/Adobe\ Illustrator\ CS6 CS6
	ln -s /Applications/Adobe\ Illustrator\ CC\ 2014 CC2014
	ln -s /Applications/Adobe\ Illustrator\ CC\ 2015 CC2015
	ln -s /Applications/Adobe\ Illustrator\ CC\ 2015.3 AI20
	ln -s /Applications/Adobe\ Illustrator\ CC\ 2017 AI21
	ln -s /Applications/Adobe\ Illustrator\ CC\ 2018 AI22
	ln -s /Applications/Adobe\ Illustrator\ CC\ 2019 AI23
	ln -s /Applications/Adobe\ Illustrator\ 2020 AI24
	ln -s /Applications/Adobe\ Illustrator\ 2021 AI25
	ln -s /Applications/Adobe\ Illustrator\ 2022 AI26
	ln -s /Applications/Adobe\ Illustrator\ 2023 AI27
	ln -s /Applications/Adobe\ Illustrator\ 2024 AI28
	ln -s /Applications/Adobe\ Illustrator\ 2025 AI29
	ln -s /Applications/Adobe\ Illustrator\ 2026 AI30
}

function Usage ()
{
echo Usage: 
echo '	'`basename $0` '<Version>' 
echo Example:
echo '	'`basename $0` 14.0.100
echo 
exit 0
}

function Error ()
{
	echo $1
	exit -1
}

function extract_7z ()
{
	cd $TGT
	if [ ! -d "EskoLoc" ]; then
		sudo rm -rf Esko
		7z x *_Mac_Localisation.7z
		mv Esko EskoLoc
	fi

	if [ ! -d "Esko28" ]; then
		sudo rm -rf Esko
		7z x *_Mac_AI28.7z
		mv Esko Esko28
	fi

	if [ ! -d "Esko29" ]; then
		sudo rm -rf Esko
		7z x *_Mac_AI29.7z
		mv Esko Esko29
	fi

	if [ ! -d "Esko30" ]; then
		sudo rm -rf Esko
		7z x *_Mac_AI30.7z
		mv Esko Esko30
	fi
}

function deploy_AI ()
{
	AIDIR=$1
	PLUGIN=Esko$2
	test -d "$AIDIR" || Error "AI dir $AIDIR does not exist"
	test -d "${TGT}/EskoLoc" || Error "${TGT}/EskoLoc does not exist"
	test -d "${TGT}/$PLUGIN" || Error "${TGT}/${PLUGIN} does not exist"

	cd $AIDIR
	sudo rm -rf Esko
	sleep 1
	sudo mkdir Esko
	sudo chmod 777 Esko
	echo  cp -rf ${TGT}/EskoLoc/* Esko/
	cp -rf ${TGT}/EskoLoc/* Esko/

	sudo rm -rf Plug-ins.localized/Esko
	sleep 1
	sudo mkdir Plug-ins.localized/Esko
	sudo chmod 777  Plug-ins.localized/Esko
	echo  cp -rf ${TGT}/${PLUGIN}/* Plug-ins.localized/Esko/
	cp -rf ${TGT}/${PLUGIN}/* Plug-ins.localized/Esko/

	cd Plug-ins.localized/Esko/
	echo rm -Rf ${BLACKLIST}
	eval rm -Rf ${BLACKLIST}

	echo $ONLY_SHA
	if [ "${ONLY_SHA}" = "1" ];
	then
		cd ${AIDIR}
		cd Plug-ins.localized/Esko/
		echo rm -Rf ${NON_SHA_PLUGINS}
		eval rm -Rf ${NON_SHA_PLUGINS}
	fi
	echo Plugins Deployed!!!
}

function deploy_Debug_Licensing ()
{
	AIDIR=$1
	PLUGIN=Esko$2
	test -d "$AIDIR" || Error "AI dir $AIDIR does not exist"
	test -d "${TGT}/EskoLoc" || Error "${TGT}/EskoLoc does not exist"
	test -d "${TGT}/$PLUGIN" || Error "${TGT}/${PLUGIN} does not exist"

	cd $AIDIR

	rm -rf Plug-ins.localized/Esko/Licensing/*
	echo  Copying license debug plugin
	cp -Rvf ${CMAKE_DIR}/bin/Licensing_MAI${SDKVER}d.aip Plug-ins.localized/Esko/Licensing/

	# QT6!
	echo Copying Qt6 debug .dylib

	# Seems bin/Qt/libQt5* is incomplete
	cp -rfv ${CMAKE_DIR}/bin/Qt/libQt*.dylib Plug-ins.localized/Esko/UI/
	cp -rfv ${CMAKE_DIR}/bin/Qt/libqcocoa_debug.dylib Plug-ins.localized/Esko/UI/
	# cp -rfv ${CMAKE_DIR}/bin/AI${SDKVER}/libBGADMQt5Managerd_AI${SDKVER}.dylib Plug-ins.localized/Esko/UI/
	cp -rfv ${CMAKE_DIR}/bin/AI${SDKVER}/libBGADMQt*.dylib Plug-ins.localized/Esko/UI/
	cp -rfv ${CMAKE_DIR}/bin/Qt/imageformats Plug-ins.localized/Esko/UI/
	cp -rfv ${CMAKE_DIR}/bin/Qt/styles Plug-ins.localized/Esko/UI/


	# BGAMDQtUIHelper
	cp -rfv ${CMAKE_DIR}/bin/BGADMUIHelper_MAI${SDKVER}d.aip Plug-ins.localized/Esko/UI

	echo Debug License and QT Deployed!!!
}

function main ()
{
	prepare

	# Check if parameter is given
	test $VERSION || Usage

	if [[ "$DO_COPY" == "1" ]]; 
	then
		mkdir -p ${TGT}
		cd ${TGT}
		curl -O 'http://miniarm01.esko-graphics.com/job/PublishAIBuild/lastSuccessfulBuild/artifact/artifacts/downloads.txt'
		cat downloads.txt | grep Mac| xargs -L1 curl -O
		echo "$VERSION" > ${DOWNLOADED_FILE}
	else
		VERSION=$DOWNLOADED_VERSION
	fi

	#extract the 7z anyway, 
	extract_7z

	echo
	echo deploy_AI $AI_LINK_DIR $SDKVER
	echo

	deploy_AI $AI_LINK_DIR $SDKVER

	if [[ "$DO_DBG_LIC" == "1" ]];
	then
		deploy_Debug_Licensing $AI_LINK_DIR $SDKVER
	fi
}


main
