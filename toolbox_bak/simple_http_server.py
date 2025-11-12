#!/usr/bin/env python
# simple http server with MIME type mapped
import sys
import http.server
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver

PORT=8000
if (len(sys.argv) >1):
	PORT=int(sys.argv[1])

class MyRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        #self.send_header('Access-Control-Allow-Origin', '*')
        #self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        return super(MyRequestHandler, self).end_headers()


Handler = MyRequestHandler
Handler.extensions_map.update({
    ".js": "application/javascript",
    ".wasm" : "application/wasm",
});

httpd = HTTPServer(("", PORT), Handler)
httpd.serve_forever()
