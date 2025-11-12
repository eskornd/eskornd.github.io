#!/bin/bash
  
export P4CONFIG=~/.p4askneil
sudo apachectl stop
cd /Users/RNDBuild/p4/nexu_eaw14md701_webfoss/depot/askneil_com/
p4 label -d askneil_published
p4 tag -l askneil_published `pwd`/...#have
p4 sync `pwd`/...#head

sudo apachectl start
