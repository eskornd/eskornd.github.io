//# sourceURL=InitEditor.js

async function initEditor()
{
	let waitForEditor = new Promise((resolve, reject) =>{
		document.addEventListener('com.esko.editorconnector.ready', (ev) => {
			let editor = window[ev.detail.globalPropertyName];
			resolve(editor);
		});
	});

	console.log('Entry: initEditor()');

	if ( undefined != window.__esko_bootloader__ )
	{
		let appInitializer = new ArtProPlusInitializer();
		appInitializer.initEditor()
			.then(()=>{})
			.catch( (err) => {
				alert('Unable to connecto ot ArtProPlus: ' + JSON.stringify(err));
			});
	}
	if ( undefined != window.cep)
	{
		let cepInitializer = new AdobeCEPInitializer();
		cepInitializer.initEditor()
			.then(()=>{ console.log('initEditor() succeeded!'); }
			, (err) => { 
				alert('Error: Unable to connect to EditorConnector, please check if EditorConnector plugin is correctly installed. \n' + JSON.stringify(err));
			})
			.catch((err)=>{
				alert('Exception: Unable to connect to EditorConnector, please check if EditorConnector plugin is correctly installed. \n' + JSON.stringify(err));
			});
	}
	
	return waitForEditor;	
}
