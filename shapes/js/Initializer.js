//# sourceURL=Initializer.js

async function InitEditor()
{
	const userAgent = window.navigator.userAgent;
	const isAdobeCEP = () => { return undefined != window.cep; };
	const isArtProPlus = () => { return userAgent.includes('ArtPro+'); };

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
	} else if ( isArtProPlus() )
	{
		initializer = new ArtProPlusInitializer();
	} else {
		// Not supported
		return Promise.reject('Not in ArtPro+ or DeskPack');
	}
	
	try {
		await initializer.initEditor();
		console.log('initEditor() succeeded!');
		return waitForEditor;
	} catch (err) {
		return Promise.reject(err);
	}
}
