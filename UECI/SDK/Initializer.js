//# sourceURL=Initializer.js

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
		return Promise.reject('Initializer.js: Not in ArtPro+/EskoCloudClient or DeskPack');
	}
	
	try {
		await initializer.initEditor();
		console.log('initEditor() succeeded!');
		return waitForEditor;
	} catch (err) {
		return Promise.reject(err);
	}
}
