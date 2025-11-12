#!/bin/bash

DOWNLOAD="http://macmini.esko-graphics.com:8080/view/EnabledJobs/job/ArtProPlus_23.11/label=askneil/lastSuccessfulBuild/artifact/artifacts/ArtProPlusMac.zip"

ZIP="ArtProPlusMac.zip"
cd ~/Applications
rm -Rf ${ZIP}
curl -O "${DOWNLOAD}" 

rm -Rf "ArtProPlus.app"
unzip ${ZIP}

