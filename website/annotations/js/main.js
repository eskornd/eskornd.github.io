import {log} from './log.js';
import {Editor, validateEditor} from './Editor.js';
import {Model} from './Model.js';
import {injectEditor_AI} from './AI.js';
import {getHostApp} from './utils.js';
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

ctx.view = new View();
ctx.editor = new Editor();	

function initEventHandlers()
{
	$("#hello").on("click", ()=>{
		ctx.editor.clearHighlights();
		ctx.editor.hello();
	});
	$("#highlight_mediabox").on("click", ()=>{
		var event = new HighlightEvent();
		event.type = HighlightType.ePageBox;
		event.pageBox = PageBox.eMediaBox;
		log("highlight_mediabox clicked");
		ctx.editor.clearHighlights();
		ctx.editor.highlight(event);
	});
	$("#highlight_area1").on("click", ()=>{
		log("highlight_area1 clicked");
		var event = new HighlightEvent();
		event.type = HighlightType.eRect;
		event.rect = {x:0, y:0, width: 100, height:100};
		ctx.editor.clearHighlights();
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
		ctx.editor.clearHighlights();
		ctx.editor.highlight(event);
		log("highlight_custom clicked: " + JSON.stringify(event));
	});
}

function checkHostApp()
{
	ctx.hostApp = getHostApp();
	log("checkHostApp(): hostApp=" + ctx.hostApp);

	// init host app implementations
	if (ctx.hostApp == "Adobe")
	{
		try {
			console.assert(typeof injectEditor_AI == "function");
			injectEditor_AI("#injection");
		} catch (err) {
			alert("Caught Exception: " + err);
		}
	} else {
	}
		
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
	initEventHandlers();
}

$(()=>{
	log("Loaded");
	init();
});

checkHostApp();
var annotator = 
{
	editor : {},
	model : new Model(), 
	setEditor : (inEditor)=>{
		log("window.eskoAnnotator.setEditor(): " + JSON.stringify(inEditor));
		
		//validate
		validateEditor(inEditor);
		
		annotator.editor = inEditor;
		ctx.editor = inEditor;
		ctx.editor.init();
		ctx.view.onInitialized();
	},
	version : 21011001
};

window.eskoAnnotator = annotator;
