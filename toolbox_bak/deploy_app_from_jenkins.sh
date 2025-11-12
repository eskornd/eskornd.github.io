#!/bin/bash

ZIP="ArtProPlusMac.zip"
DOWNLOAD="http://macmini.esko-graphics.com:8080/view/EnabledJobs/job/ArtProPlus_23.11/label=askneil/lastSuccessfulBuild/artifact/artifacts/ArtProPlusMac.zip"

cd ~/Applications
rm -Rf ${ZIP}
curl -O "${DOWNLOAD}" 
xattr -cr ${ZIP}

rm -Rf ArtPro+.app
unzip ${ZIP}

