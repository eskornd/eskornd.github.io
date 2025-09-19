#!/bin/bash

TOKEN=1AoSpUyjMRaNAjSmE1xomUwPDc35z69iPoWub8GqrfJPvQ9dPbmXTpUfLwjMLnXrc1m3dv5JzQdcUnQzZwxsREMiQdHt63zDCdSHTTHDvz1nQcosvaZt
TOKEN_HEADER="EskoCloud-Token: ${TOKEN}"

URL_0=https://repo.qa-eu-1.test.cloudi.city/CONTENT/v0/4mLnEfDNyLp2S2/Home/Customer/Superprint/Projects/StayTuned/Binaries/download_latest_url_mac.txt
echo URL_0: ${URL_0}
CONTENT_URL_0=`curl -H "${TOKEN_HEADER}" "${URL_0}" `
echo CONTENT_URL_0: ${CONTENT_URL_0}
URL_1=`curl -H "${TOKEN_HEADER}" "${CONTENT_URL_0}" `
echo URL_1: ${URL_1}
CONTENT_URL_1=`curl -H "${TOKEN_HEADER}" "${URL_1}" `
echo CONTENT_URL_1: ${CONTENT_URL_1}

echo Downloading eskoSSO pkg ...
curl -H "${TOKEN_HEADER}" -L "${CONTENT_URL_1}" -o ~/Desktop/eskoSSO_latest.pkg

echo Downloaded: ~/Desktop/eskoSSO_latest.pkg
