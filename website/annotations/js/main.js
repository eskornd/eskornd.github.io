import {log} from './log.js';
import {injectEditor_AI} from './AI.js';
import {ctx} from './ctx.js';
import {Rect} from './Rect.js';
import {PageBox, HighlightEvent, HighlightType} from './HighlightEvent.js';

function View()
{}

View.prototype = {
	onDocumentChanged : () => {
		var name = ctx.editor.getCurrentDocumentName();
		$("#currentDocument").text(name);
	},
	onInitialized : () => {
		$("#hostApp").text(ctx.editor.name);		
	},
	name : "Context View"
}

function Editor()
{}

Editor.prototype = {
	init: ()=>{},
	hello : ()=>{ alert("TODO: Say Hello!");},
	highlight : (rect)=>{ 
		alert("TODO: Unhandled highlight rect:" + JSON.stringify(rect));
	},
	getCurrentDocumentName : () => { return ""; },
	name : "prototype"
};

ctx.view = new View();
ctx.editor = new Editor();	

function initEventHandlers()
{
	$("#hello").on("click", ()=>{
		ctx.editor.hello();
	});
	$("#highlight_mediabox").on("click", ()=>{
		var event = new HighlightEvent();
		event.type = HighlightType.ePageBox;
		event.pageBox = PageBox.eMediaBox;
		log("highlight_mediabox clicked");
		ctx.editor.highlight(event);
	});
	$("#highlight_area1").on("click", ()=>{
		log("highlight_area1 clicked");
		var event = new HighlightEvent();
		event.type = HighlightType.eRect;
		event.rect = {x:0, y:0, width: 100, height:100};
		ctx.editor.highlight(event);
	});
	$("#highlight_custom").on("click", ()=>{
		var x = $("#custom_x").val();
		var y = $("#custom_y").val();
		var w = $("#custom_width").val();
		var h = $("#custom_height").val();
		var rect = { x: x, y:y, width: w, height: h};
		var event = new HighlightEvent();
		event.type = HighlightType.eRect;
		event.rect = rect;
		ctx.editor.highlight(event);
		log("highlight_custom clicked: " + JSON.stringify(event));
	});
}

function isCEP()
{
	return ( typeof window.cep != "undefined" );
}

function isArtProPlus()
{
	// TODO: check if host app is AP+
	return false;
}

function isBrowser()
{
	return window.isBrowser;
}

function checkHostApp()
{
	if ( isCEP() )
	{
		ctx.hostApp = "Adobe";
	} else if ( isArtProPlus() ) {
		ctx.hostApp = "ArtProPlus";
	} else if ( isBrowser() ) {
		ctx.hostApp = "Browser";
	} else {
		ctx.hostApp = window.navigator.userAgent;
	}
	log("checkHostApp(): hostApp=" + ctx.hostApp);

	// init host app implementations
	if (ctx.hostApp == "Adobe")
	{
		try {
			injectEditor_AI("#inject");
		} catch (err) {
			alert("Caught Exception: " + err);
		}
	} else {
	}
	ctx.view.onInitialized();
		
}

function initUI()
{
	// show location
	$("#pageUrl").text(window.location.href);
	$("#currentDocument").text("");
}

function init()
{
	initUI();
	checkHostApp();
	initEventHandlers();
}

$(()=>{
	log("Loaded");
	init();
});

var annotator = 
{
	editor : {},
	model : {
		notifyDocumentChange : () => {
			log("model.notifyDocumentChange()");
			ctx.view.onDocumentChanged();
		}
	}, 
	setEditor : (inEditor)=>{
		log("window.eskoAnnotator.setEditor(): " + JSON.stringify(inEditor));
		//validate
		var editorPrototype = new Editor();	
		
		for ( var v  in editorPrototype)
		{
			var valid = inEditor.hasOwnProperty(v) && typeof inEditor[v] == typeof editorPrototype[v];
			console.assert(valid, "setEditor(): inEditor." + v + " is " + typeof inEditor[v]);
		}	
		annotator.editor = inEditor;
		ctx.editor = inEditor;
		ctx.editor.init();
	},
	name : "eskoAnnotator"
};
window.eskoAnnotator = annotator;
