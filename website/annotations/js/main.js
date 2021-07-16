import {log} from './log.js';
import {Editor, validateEditor} from './Editor.js';
import {Model} from './Model.js';
import {injectEditor_AI, injectEditor_PS} from './AdobeCEPSupport.js';
import {getHostApp} from './utils.js';
import {ctx} from './ctx.js';
import {Rect} from './Rect.js';
import {PageBox, HighlightEvent, HighlightType} from './HighlightEvent.js';

function View()
{}

var gCount = 0;
View.prototype = {
	onDocumentChanged : async () => {
		var name = await ctx.editor.getCurrentDocumentName();
		$("#currentDocument").text(name);
	},
	onInitialized : () => {
		$("#hostApp").text(ctx.editor.name);		
	},
	addAnnotation : (annotation) => {
		// add html
		var displayText = annotation.name + ' @ x:' + annotation.rect.x + ', y:'+annotation.rect.y; 
		var id = 'smile_' + gCount;
		++gCount;
		var obj = new HighlightEvent();
		obj.type = HighlightType.eRect;
		obj.rect = annotation.rect;
		var data = JSON.stringify(obj);
		$("#highlight_section").append('<div class="clickable rectAnnotation" id="' + id +'">' + displayText + '</div>').ready(()=>{
			var obj = new HighlightEvent();
			obj.type = HighlightType.eRect;
			obj.rect = annotation.rect;
			$('#' + id).attr('data', JSON.stringify(obj));
		});
	},
	name : "Context View"
}

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
		ctx.editor.clearHighlights();
		ctx.editor.highlight(event);
	});

	var obj = new HighlightEvent();
	obj.type = HighlightType.eRect;
	obj.rect = {x:0, y:0, width: 200, height:200};
	$("#highlight_area2").attr('data', JSON.stringify(obj));
	obj.rect = {x:0, y:0, width: 100, height:100};
	$("#highlight_area1").attr('data', JSON.stringify(obj));
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
	// use event delegate rather than direct bind, so that we can handle dynamic items
	$('#highlight_section').on('click', '.rectAnnotation', (e)=>{ 
		log(".rectAnnotation clicked");
		var data = $("#" + e.target.id).attr('data');
		var obj = JSON.parse(data);
		ctx.editor.clearHighlights();
		ctx.editor.highlight(obj);
	});
}

function checkHostApp()
{
	ctx.hostApp = getHostApp();
	log("checkHostApp(): hostApp=" + ctx.hostApp);

	// init host app implementations
	if (ctx.hostApp == "AdobeIllustrator")
	{
		try {
			console.assert(typeof injectEditor_AI == "function");
			injectEditor_AI("#injection");
		} catch (err) {
			alert("Caught Exception: " + err);
		}
	} else if (ctx.hostApp == "AdobePhotoshop") {
		try {
			console.assert(typeof injectEditor_PS == "function");
			injectEditor_PS("#injection");
		} catch (err) {
			alert("Caught Exception: " + err);
		}
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
