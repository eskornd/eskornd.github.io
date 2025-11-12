#!/usr/bin/env bash
if [ -z "$1" ]; then
	echo "doxygen.sh <Input Folder> [Output Folder]"
	exit 1
fi

INPUT=$1
PROJECT_NAME=${INPUT}
if [ -z "$2" ]; then
OUTPUT_DIRECTORY=${INPUT}_Docs
else
OUTPUT_DIRECTORY=$2
fi

#doxygen -D INPUT=${INPUT} OUTPUT_DIRECTORY=${OUTPUT_DIRECTORY} ~/toolbox/Doxyfile_Template
export DOXYGEN_INPUT=${INPUT} && export DOXYGEN_OUTPUT_DIRECTORY=${OUTPUT_DIRECTORY} && export DOXYGEN_PROJECT_NAME=${PROJECT_NAME} && doxygen ~/toolbox/Doxyfile_Template

echo 
echo Done. Output: ${OUTPUT_DIRECTORY}
open ${OUTPUT_DIRECTORY}/html/index.html
