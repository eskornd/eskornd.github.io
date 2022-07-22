import {ctx} from './ctx.js';
import {PageBox, HighlightEvent, HighlightType} from './HighlightEvent.js';
import {log} from './log.js';

function makeRect(x, y, width, height)
{
	return {x:x , y: y, width: width, height: height};
}

async function highlight(annos)
{
	console.assert(Array.isArray(annos), 'annos must be array of Annotations');
	for ( const i in annos)
	{
		console.assert(annos[i].hasOwnProperty('boundingBox'), 'boundingBox is mandatory for Annotation object: ' + i);
	}
	if (ctx.currentDoc !== undefined )
	{
		await ctx.currentDoc.setAnnotations(annos);
	}
}

async function highlightRectOrRects(rects)
{
	let annos = [];
	if (Array.isArray(rects))
	{
		for ( const i in rects)
		{
			annos.push({boundingBox : rects[i]});
		}
	} else {
		let rect = rects;
		annos = [{ boundingBox : rect}];
	}
	if (ctx.currentDoc !== undefined )
	{
		await ctx.currentDoc.setAnnotations(annos);
	}
}

var gCount = 0;
export default class PageView
{
	constructor()
	{}
	
	setHostAppText(hostAppText)
	{
		$('#hostApp').text(hostAppText);
	}

	setPageUrlText(urlText)
	{
		$('#pageUrl').text(urlText);
	}

	setOpenUrlDisabled()
	{
		var str = $("#openURL").text();
		$("#openURL").text(str + ' (disabled)');
	}
	
	setCurrentDocumentTitle(docText)
	{
		$('#currentDocument').text(docText);
	}

	setCurrentDocumentFilePath(text)
	{
		$('#filePath').text(text);
	}

	setPageSizeText(pageSizeText)
	{
		$('#pageSize').text(pageSizeText);
	}
	addAnnotation (annotation)
	{
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
			$('#' + id).attr('data', JSON.stringify(obj.rect));
			highlightRectOrRects(obj.rect);
		});
	}

	init()
	{
		this.setPageUrlText(window.location.href);
		$('#hello').on('click', async ()=>{
			ctx.editor.hello();
		});
		$("#highlight_mediabox").on("click", async ()=>{
			let mediaBox = undefined;
			try {
				let pagesInfo = await ctx.currentDoc.pagesInfo();	
				let pageInfo = pagesInfo[0];
				for ( let j=0; j<pageInfo.pageBoxes.length; ++j)
				{
					const pageBox = pageInfo.pageBoxes[j];
					if ( pageBox.type == 'MediaBox' )
					{
						mediaBox = pageBox.rect;	
					}
				}
			} catch (err) {
			}
			highlightRectOrRects(makeRect(mediaBox.x, mediaBox.y, mediaBox.width, mediaBox.height));
		});

		$("#highlight_100").attr('data', JSON.stringify({x:0, y:0, width: 100, height:100}));
		$("#highlight_multi").attr('data', JSON.stringify([
			{x: 0, y:0, width: 20, height: 20}
			,{x: 50, y:50, width: 20, height: 20}
			,{x: 100, y:100, width: 20, height: 20}
			,{x: 100, y:50, width: 20, height: 20}
			,{x: 50, y:0, width: 20, height: 20}
			,{x: 100, y:0, width: 20, height: 20}
		]));
		$("#highlight_random").attr('data', JSON.stringify({x:50, y:50, width: 200, height:50}));
		$("#highlight_random").on('click', ()=>{
			let w = 200;
			let h = 50;
			let x = Math.random() * (ctx.currentPageSize.width - w);
			let y = Math.random() * ( ctx.currentPageSize.height - h);
			let rect = {x:x, y:y, width: w, height:h};
			$("#highlight_random").attr('data', JSON.stringify(rect));
			let random255 = ()=>{
				return Math.floor(Math.random()*255);
			};
			let color = { r: random255(), g: random255(), b: random255()};
			$("#highlight_random").attr('highlightColor', JSON.stringify(color));
		});
		$("#highlight_clearAll").attr('data', JSON.stringify([]));
		$('#getAnnotations').on('click' , async () => {
			if (ctx.currentDoc !== undefined )
			{
				let annots = await ctx.currentDoc.getAnnotations();
				alert(JSON.stringify(annots, null, 4));
			}
		});
		$('#showPageBoxes').on('click', async () => {
			if (ctx.currentDoc == undefined )
			{
				alert('No document opened');
				return;
			} 
			try {
				let pagesInfo = await ctx.currentDoc.pagesInfo();	
				let str = '';
				for ( let i=0; i<pagesInfo.length; ++i)
				{
					const pageInfo = pagesInfo[i];
					str += 'PageSize: ' + pageInfo.width + ' x ' + pageInfo.height; 
					if ( undefined != pageInfo.pageBoxes )
					{
						for ( let j=0; j<pageInfo.pageBoxes.length; ++j)
						{
							const pageBox = pageInfo.pageBoxes[j];
							str += '\n'
							str += pageBox.type + ' [' + pageBox.rect.x + ', ' + pageBox.rect.y + ', ' + pageBox.rect.width + ', ' + pageBox.rect.height + ']';
						}
					}
					str += '\n';
				}
				alert(str);
			} catch (err) {
				console.error(err);
				alert('Unable to show Page boxes Info: ' + err);
			}
		
		});
		$('#validate').on('click', async () => {
			let str = '';
			str += 'editor.appName(): ';
			try {
				str += await ctx.editor.appName();
			} catch (err) {}	
			str += '\n';
			str += 'editor.version(): ';
			try {
				str += JSON.stringify(await ctx.editor.version());
			} catch (err) {}	
			str += '\n';
			str += 'editor.versionString(): ';
			try {
				str += await ctx.editor.versionString();
			} catch (err) {}	
			str += '\n';
			str += 'editor.currentDocument(): ';
			try {
				str += JSON.stringify(await ctx.editor.currentDocument());
			} catch (err) {}

			alert(str);
		});
		$("#openURL").on("click", ()=>{
			ctx.editor.showModal( {url:'https://www.esko.com/'});
		});
		$("#documents").on("click", async ()=>{
			let docs = [];
			try{
				docs = await ctx.editor.documents();
			} catch (err) {
				console.warn(err);
			}
			for ( const i in docs )
			{
				let title = 'Unknown';
				try {
					title = await docs[i].title();
				} catch (err) {
					console.warn('Unable to get title(): ' + err.message);
				}
				console.log('Doc: {id : ' + docs[i].id + ', title() : ' + title + '}');
			}
			
		});
		$('#storage').on('click', async ()=>
		{
			const kKey = 'STORAGE_KEY';
			let value = Math.floor((Math.random() * 100) + 1).toString();
			let storage = await ctx.editor.storage()	
			let prevValue = await storage.getValue(kKey);
			let dummy = await storage.setValue(kKey, value);
			let currValue = await storage.getValue(kKey);
			let str = 'Prev Value of key ' + kKey + ': ' + prevValue;
			str += '\n';
			str += 'storage.setValue: ' + value;
			str += '\n';
			str += 'Curr Value of key ' + kKey + ': ' + currValue;
			str += '\n';
			alert(str);
		});

		$('#uploadFile').on('click', async ()=>
		{
			try{
				let ret = await ctx.currentDoc.getFileByteArray();
				alert('typeof ret: ' + typeof ret);
				alert('ret.length: ' + ret.length);
			} catch (err) {
				console.error(err);
			}
		});

		// use event delegate rather than direct bind, so that we can handle dynamic items
		$('#highlight_section').on('click', '.rectAnnotation', (e)=>{ 
			log(".rectAnnotation clicked");
			var data = $("#" + e.target.id).attr('data');
			var highlightColor = $("#" + e.target.id).attr('highlightColor');
			if ( undefined != highlightColor)
			{
				highlight([{boundingBox : JSON.parse(data), highlightColor : JSON.parse(highlightColor)}]);
				return;
			}
			var obj = JSON.parse(data);
			highlightRectOrRects(obj);
		});
		$("#refresh").on("click", ()=>{
			location.reload();
		});
	}

	updateDocumentTitle()
	{
	}
}

