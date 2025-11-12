#!/bin/bash

APPNAME="Underline2503"
ZIP="${APPNAME}_Mac.zip"
APP="${APPNAME}.app"
pushd ~/Desktop/Builds
ls
rm -Rf ${ZIP}
rm -Rf ${APP}
curl -L "http://miniarm01.esko-graphics.com/view/EnabledJobs/job/Underline_25.03/label=iMac_Maggie/lastSuccessfulBuild/artifact/artifacts/${ZIP}" -O

xattr -cr ${ZIP}
unzip ${ZIP}

file ${APP}/Contents/Info.plist
popd
