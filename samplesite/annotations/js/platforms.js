import {getHostApp} from './utils.js';
import {log} from './log.js';
import {ctx} from './ctx.js';

// Host (platform) related initialization
async function platformInit()
{
	var hostApp = getHostApp();
	log("platformInit(): hostApp=" + ctx.hostApp);

	// init host app implementations
	if (hostApp == "AdobeIllustrator")
	{
		let cepSupport = new AdobeCEPSupport();
		return cepSupport.initEditor();
	} else if (hostApp == "AdobePhotoshop") {
		console.warn('AdobePhotoshop not supported');
	} else if (hostApp == "QtWebEngine")
	{
		alert('is QtWebEngine');
		// initialization for QtWebEngine
		/*
		document.addEventListener('com.esko.editorconnector.ready', (ev) => {
			alert('hahaha');	
			let editor = window[ev.detail.globalPropertyName];
			return editor;
		});
		*/
	}
	return null;	
}

export {platformInit};
