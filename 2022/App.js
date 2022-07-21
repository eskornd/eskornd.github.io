// For running inside electron/node js
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
 
const path = require('path');
const url = require('url');
let win;
function createWindow () {
	// Create the browser window.
	win = new BrowserWindow({	
		width: 800
		, height: 600
		, webPreferences: {
			nodeIntegration: true,
		}
	});

	// open dev console
	// win.webContents.openDevTools()

	// and load the index.html of the app.
	win.loadURL(url.format({
		//pathname: path.join(__dirname, '/editor.html'),
		pathname: path.join(__dirname, 'editor.html'),
		protocol: 'file:',
		slashes: true
	}));
}
app.on('ready', createWindow);

