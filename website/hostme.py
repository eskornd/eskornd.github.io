#!/usr/bin/env python
# simple http server with MIME type mapped
import sys
import http.server
import socketserver

PORT=8000
if (len(sys.argv) >1):
	PORT=int(sys.argv[1])

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
".js": "application/javascript",
".wasm" : "application/wasm",
});

httpd = socketserver.TCPServer(("", PORT), Handler)
httpd.serve_forever()
