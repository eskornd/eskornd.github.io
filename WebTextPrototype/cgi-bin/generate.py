#!/usr/bin/python

# Import modules for CGI handling 
import cgi, cgitb 
import subprocess
import sys
import os
import logging

#config the log
logging.basicConfig(filename='PDFTypesetter_log.txt', level=logging.INFO)

# config TODO deploy
#typesetter='/p4/nexu_l_app18A4/cm_minimum/bin/ArtPro+.app/Contents/MacOS/PDFTypesetter';
typesetter = os.path.expanduser("~/bin/ArtPro+.app/Contents/MacOS/PDFTypesetter")
outputPDF = os.path.expanduser("~/Desktop/PDFTypesetter.pdf")

# Create instance of FieldStorage 
form = cgi.FieldStorage() 

# Get data from fields
rawText = form.getvalue('rawText')
fontSize  = form.getvalue('fontSize')
postscriptName  = form.getvalue('postscriptName')
textBoxWidth  = form.getvalue('textBoxWidth')
textBoxHeight  = form.getvalue('textBoxHeight')
cmd=[typesetter, rawText, postscriptName, fontSize, textBoxWidth, textBoxHeight]
# log the command
logging.info(cmd)

p=subprocess.Popen(cmd,stdout=subprocess.PIPE)
out=p.communicate()[0]

sys.stderr.write("RAW TEXT:\n")
sys.stderr.write(rawText)
sys.stderr.write("\n")

sys.stdout.write("Content-Disposition: attachment; filename = \"WebTextPrototype.pdf\"\r\n\n")
# Send the actual image data
#sleep(5)

with open(outputPDF, 'rb') as f:
    sys.stdout.write(f.read())


sys.exit(0)
