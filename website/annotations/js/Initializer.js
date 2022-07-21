//# sourceURL=Initializer.js

async function InitEditor()
{
	let waitForEditor = new Promise((resolve, reject) =>{
		document.addEventListener('com.esko.editorconnector.ready', (ev) => {
			let editor = window[ev.detail.globalPropertyName];
			resolve(editor);
		});
	});

	const userAgent = window.navigator.userAgent;
	if ( undefined != window.cep)
	{
		console.log('Initializer.js: InitEditor() for cep');
		let cepInitializer = new AdobeCEPInitializer();
		cepInitializer.initEditor()
			.then(()=>{ console.log('initEditor() succeeded!'); }
			, (err) => { 
				alert('Error: Unable to connect to EditorConnector, please check if EditorConnector plugin is correctly installed. \n' + JSON.stringify(err));
			})
			.catch((err)=>{
				alert('Exception: Unable to connect to EditorConnector, please check if EditorConnector plugin is correctly installed. \n' + JSON.stringify(err));
			});
	} else if ( userAgent.includes('ArtPro+') || userAgent.includes('QtWebEngine') )
	{ 
		console.log('Initializer.js: InitEditor() for ArtPro+');
		let appInitializer = new ArtProPlusInitializer();
		appInitializer.initEditor()
			.then(()=>{})
			.catch( (err) => {
				alert('Unable to connecto ot ArtProPlus: ' + JSON.stringify(err));
			});
	}
	
	return waitForEditor;	
}
