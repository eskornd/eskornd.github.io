import {log} from './log.js';
// import {validateEditor} from './validate.js';
import {Model} from './Model.js';
import {ctx} from './ctx.js';
import PageView from './PageView.js';

console.log('main.js loaded');
async function onInitialized()
{
	var appName = await ctx.editor.appName().catch((err)=>{console.error(err);});
	var verStr = await ctx.editor.versionString().catch((err)=>{console.error(err);});
	ctx.view.setHostAppText(appName + ' ' + verStr);
	var appInfo = await ctx.editor.appInfo().catch((err)=>{console.error(err);});
	ctx.view.setLanguageText(appInfo.language);
	ctx.view.setCustomerID(appInfo.customerID);
}

async function initEskoConnector()
{
	let connector = 
	{
		editor : {},
		model : new Model(), 
		setEditor : (inEditor)=>{
		
			inEditor.onDocumentChanged = async () => { 
				ctx.controller.onDocumentChanged();
			};
			inEditor.onAnnotationCreated2 = async (annotation, params) => {
				ctx.controller.onAnnotationCreated2(annotation, params);
			};
			inEditor.onAnnotationSelected = async (annotationID) => {
				ctx.controller.onAnnotationSelected(annotationID);
			};
			inEditor.onDocumentPageNumberChanged = async () => {
				ctx.controller.onDocumentPageNumberChanged();
			};
			inEditor.onDocumentPageBoxesChanged = async () => {
				ctx.controller.onDocumentPageBoxesChanged();
			};
			log("setEditor(): " + JSON.stringify(inEditor));
			
			//validate
			// validateEditor(inEditor);
			
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
	// InitEditor defined in InitEditor.js
	let editor = null;
	try {
		editor= await InitEditor();
	} catch (err) {
		alert('main.js: Unable to InitEditor(): ' + JSON.stringify(err));
	}

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
