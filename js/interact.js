var ctx = {};

function View()
{}

View.prototype = {
	onDocumentChanged : () => {
		var name = ctx.host.getCurrentDocumentName();
		$("#currentDocument").text(name);
	},
	onInitialized : () => {
		$("#hostApp").text(ctx.hostApp);		
	},
	name : "Context View"
}

function Host()
{}

Host.prototype = {
	init: ()=>{},
	hello : ()=>{ alert("TODO: Say Hello!");},
	highlight : (rect)=>{ 
		alert("TODO: Unhandled highlight rect:" + JSON.stringify(rect));
	},
	highlightPage : ()=> { 
		alert("TODO: Unhandled highlightPage()");
	},
	getCurrentDocumentName : () => { return ""; },
	name : "Context Host"
};

function log(text)
{
	console.log(text);
}

function initEventHandlers()
{
	$("#hello").on("click", ()=>{
		ctx.host.hello();
	});
	$("#highlight_mediabox").on("click", ()=>{
		log("highlight_mediabox clicked");
		ctx.host.highlightPage();
	});
	$("#highlight_area1").on("click", ()=>{
		log("highlight_area1 clicked");
		ctx.host.highlight({x:0, y:0, width: 100, height:100});
	});
	$("#highlight_custom").on("click", ()=>{
		var x = $("#custom_x").val();
		var y = $("#custom_y").val();
		var w = $("#custom_width").val();
		var h = $("#custom_height").val();
		var rect = { x: x, y:y, width: w, height: h};
		ctx.host.highlight(rect);
		log("highlight_custom clicked: " + JSON.stringify(rect));
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

function checkHostApp()
{
	if ( isCEP() )
	{
		ctx.hostApp = "Adobe";
	} else if ( isArtProPlus() ) {
		ctx.hostApp = "ArtProPlus";
	} else {
		ctx.hostApp = window.navigator.userAgent;
	}
	ctx.view = new View();
	ctx.host = new Host();	
	log("checkHostApp(): hostApp=" + ctx.hostApp);

	// init host app implementations
	if (ctx.hostApp == "Adobe")
	{
		initHost(ctx.host);
		//ctx.host = hostAI;
		ctx.host.init();
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

