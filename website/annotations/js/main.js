import {log} from './log.js';
import {validateEditor} from './validate.js';
import {Model} from './Model.js';
import {ctx} from './ctx.js';
import PageView from './PageView.js';

async function onInitialized()
{
	var appName = await ctx.editor.appName();
	var verStr = await ctx.editor.versionString();
	ctx.view.setHostAppText(appName + ' ' + verStr);
	if ( typeof ctx.editor.openURL === 'undefined' )
	{
		ctx.view.setOpenUrlDisabled();
	}
}

async function initEskoConnector()
{
	let waitForEditor = new Promise((resolve, reject) =>{
		document.addEventListener('com.esko.editorconnector.ready', (ev) => {
			let editor = window[ev.detail.globalPropertyName];
			resolve(editor);
		});
	});

	console.log('Entry: initEskoConnector()');
	let connector = 
	{
		editor : {},
		model : new Model(), 
		setEditor : (inEditor)=>{
		
			inEditor.onDocumentChanged = async () => { 
				ctx.controller.onDocumentChanged();
			};
			inEditor.onCreateAnnotationRequest = async (annotation) => {
				ctx.controller.onCreateAnnotationRequest(annotation);
			};
			log("setEditor(): " + JSON.stringify(inEditor));
			
			//validate
			validateEditor(inEditor);
			
			connector.editor = inEditor;
			ctx.editor = inEditor;
			if ( 'init' in ctx.editor)
			{
				ctx.editor.init();
			}
			setTimeout(()=>{
				onInitialized();
				ctx.controller.onDocumentChanged();
			}, 100);
		},
		version : 21011001
	};

	ctx.editor = {};
	ctx.view = new PageView();
	ctx.view.init();

	window.eskoConnector = { setEditor: ()=>{} };
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
	
	let editor = await waitForEditor;	
	if ( null != editor )
	{
		connector.setEditor(editor);
	}
}

// Create the context menu
// Leave the responsibility to web-app for now
// TODO: check how context menu can be created in QtWebEngine/QWebEngineView, if needed, we could consider move the responsibility to UECI
function initContextMenu()
{
	if ( undefined != window.__adobe_cep__ )
	{
		let menuObj = 
		{ menu : [
			{ id : 'reload'
				, label : 'Reload'
				, enabled : true
				, checkable : false
			}
		]};
		let setMenu = (menu, callback) => {
			window.__adobe_cep__.invokeAsync('setContextMenuByJSON', menu, callback);
		};
		setMenu(JSON.stringify(menuObj), (id)=>{
			if ('reload' == id) { 
				window.location.reload();}
		});

		//Flyout menu
		let menuXML = '<Menu><MenuItem id="reload" label="Reload" Enabled="true"/></Menu>';
		window.__adobe_cep__.invokeSync('setPanelFlyoutMenu', menuXML);
	}
}

initContextMenu();
initEskoConnector();
