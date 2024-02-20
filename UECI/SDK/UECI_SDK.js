//# sourceURL=UECI_SDK.js

console.log('UECI_SDK.js loaded');

// Must match AIEditorConnector/Private/Include/ScriptDefines.h
const kPluginScriptName = 'AIEditorConnector';
const kPluginScriptSelector = 'PluginScriptingMessage';
const kPluginScriptProfileMessage = 'profile';

class AdobeCEPInitializer
{
	constructor()
	{ }
	

	evalScript(script, callback)
	{
		if(callback === null || callback === undefined)
		{
			callback = function(result){};
		}
		window.__adobe_cep__.evalScript(script, callback);
	}

	asyncEvalScript(script)
	{
		return new Promise((resolve, reject)=>{
			this.evalScript(script, resolve);
		});
	}

	toPosixPath(macOrWindowsPath)
	{
		let posixPath = macOrWindowsPath.replace(/\\/g, '/');
		return posixPath;
	}

	handlePluginResponse_AI(response)
	{
		// Result is a json string that contains:
		// "pluginFolder" the plugin binary folder
		// "clientScripts" array of client .js files that should be loaded
		// "hostScripts" array of host .jsx files that should be evaled
		let profile;
		try{
			profile = JSON.parse(response);
		} catch (err) {
			console.error('Unable to parse plugin response: ' + response);
			throw { message : 'Unable to parse plugin response.', response : response };
		}
		
		if (profile.bootloader !== undefined )
		{
			this.bootload(profile);
		}

	}

	bootload(profile)
	{
		let posixPath = this.toPosixPath(profile.bootloader);// handle windows path
		let result = window.cep.fs.readFile(posixPath);
		if ( result.err === 0)
		{
			let scriptElem = document.createElement('script');
			scriptElem.setAttribute('type', 'text/javascript');
			scriptElem.setAttribute('id', 'bootloader');
			scriptElem.innerHTML = result.data;
			
			document.body.append(scriptElem);
		} else {
			console.error('Unable to load bootloader: ' + posixPath);
		}
		
		return;
	}

	async waitForEditorReady()
	{
		const kEventEditorReady = 'com.esko.editorconnector.ready'; // Sent by editor_AI.js when global window.__esko_editor__ object is set
		return new Promise((resolve, reject) => {
			document.addEventListener(kEventEditorReady, function(e) {
				let esko_editor = window[e.detail.globalPropertyName];
				resolve(esko_editor);
			});
		});
	}

	async initEditor_AI()
	{
		let composeMessageScript = (message) => {
			// corresponds to the native plugin name and EGW_AIScriptMessage name
			let script = 'app.sendScriptMessage(' 
				+ '\'' + kPluginScriptName + '\'' 
				+ ', \'' + kPluginScriptSelector + '\'' 
				+ ', \'' + message + '\''
				+ ');';
			return script;
		};
		let script = composeMessageScript(kPluginScriptProfileMessage);
		let response = await this.asyncEvalScript(script);
		this.handlePluginResponse_AI(response);

		return this.waitForEditorReady();
	}
	
	async initEditor()
	{
		try {
			return this.initEditor_AI();
		} catch (err) {
			return Promise.reject(new Error('Unable to connect to EditorConnector: ' + JSON.stringify(err)) );
		}
	}
		
}

class ArtProPlusInitializer
{
	constructor ()
	{}

	async initEditor()
	{
		// add a 2000 ms timeout to wait for the editor connector javascript injectionw
		let timeout = 2000; //timeout
		let step = 100; //ms
		let intervalHandle = setInterval(()=>
		{
			timeout -= step;
			if ( undefined != window.__esko_bootloader__ )
			{
				clearInterval(intervalHandle);
				return window.__esko_bootloader__.initEditor();
			}
			if ( timeout <= 0 )
			{
				clearInterval(intervalHandle);
				return Promise.reject(new Error('Unable to connect to ArtProPlus: initEditor timeout'));
			}
		}, step);

	}
}

// Export global initializers
window.AdobeCEPInitializer = AdobeCEPInitializer;
window.ArtProPlusInitializer = ArtProPlusInitializer;

async function InitEditor()
{
	const userAgent = window.navigator.userAgent;
	const isAdobeCEP = () => { return undefined != window.cep; };
	const isArtProPlus = () => { return userAgent.includes('ArtPro+'); };
	const isEskoCloudClient = () => { return userAgent.includes('EskoCloudClient'); };

	let waitForEditor = new Promise((resolve, reject) =>{
		document.addEventListener('com.esko.editorconnector.ready', (ev) => {
			let editor = window[ev.detail.globalPropertyName];
			resolve(editor);
		});
	});

	let initializer;
	if ( isAdobeCEP() )
	{
		initializer = new AdobeCEPInitializer();
	} else if ( isArtProPlus() || isEskoCloudClient() )
	{
		initializer = new ArtProPlusInitializer();
	} else {
		// Not supported
		return Promise.reject('UECI_SDK.js: Not in ArtPro+/EskoCloudClient or DeskPack');
	}
	
	try {
		await initializer.initEditor();
		console.log('UECI_SDK.js initEditor() succeeded!');
		return waitForEditor;
	} catch (err) {
		return Promise.reject(err);
	}
}

