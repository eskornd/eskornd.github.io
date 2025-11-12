#!/bin/bash


DEV_URL="https://eskornd.github.io/samplesite/boot"
STAGING_URL="https://w2p.future.dev.cloudi.city/panelcomponent/panel/main"
PROD_URL="https://applink.ci.dev.cloudi.city/panelcomponent/panel/main"
echo "0) ${PROD_URL}"
echo "1) ${STAGING_URL}"
echo "2) ${DEV_URL}"

URL=${PROD_URL}
OPT=0
read OPT
if [ $OPT == "0" ]; then
	URL=${PROD_URL}
elif [ ${OPT} == "1" ]; then 
	URL=${STAGING_URL}	
elif [ ${OPT} == "2" ]; then 
	URL=${DEV_URL}	
fi 
echo "VAR is ${VAR}"
echo Old:
defaults read /Users/nexu/Library/Preferences/com.esko.ArtPro+.plist /ShareAndApproveSettings/LandingPage 

defaults write /Users/nexu/Library/Preferences/com.esko.ArtPro+.plist /ShareAndApproveSettings/LandingPage ${URL}

#echo New value:
echo New:
defaults read /Users/nexu/Library/Preferences/com.esko.ArtPro+.plist /ShareAndApproveSettings/LandingPage 
