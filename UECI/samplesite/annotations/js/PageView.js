import {ctx} from './ctx.js';
import {PageBox, HighlightEvent, HighlightType} from './HighlightEvent.js';
import {log} from './log.js';

function makeRect(x, y, width, height)
{
	return {x: x, y: y, width: width, height: height};
}

function makeRect2(x0, y0, x1, y1)
{
	return {x0: x0, y0: y0, x1: x1, y1: y1};
}

function makeRandomRect(box)
{
	let w = 200;
	let h = 50;
	let x = box.x + Math.random() * (ctx.currentPageSize.width - w);
	let y = box.y + Math.random() * (ctx.currentPageSize.height - h);
	return makeRect(x, y, w, h);
}

function makeRandomRect2(box)
{
	let rect = makeRandomRect(box);
	let randomDir = ()=>{
		return Math.random() > 0.5 ? 1 : -1;
	}
	return makeRect2(rect.x, rect.y, rect.x + randomDir() * rect.width, rect.y + randomDir() * rect.height);
}

function getRandomColor()
{
	let random255 = ()=>{
		return Math.floor(Math.random()*255);
	};
	return { r: random255(), g: random255(), b: random255()};
}

function calculateHash(stream)
{
	// Process MD5 in tiles to avoid memory overflow
	let md5 = CryptoJS.algo.MD5.create();
	let processed = 0;
	const total = stream.length;
	const kTileSize = 512*1024;
	while (processed < total)
	{
		let remaining = total - processed;
		let len = remaining < kTileSize ? remaining : kTileSize;
		let tile = new Uint8Array(stream.buffer, processed, len); 
		let wa = CryptoJS.lib.WordArray.create(tile);
		md5.update(wa);
		processed += len;
		console.log('    crypto-js md5: ' + processed + '/' + total + ' processed');
	}

	let hash = md5.finalize();
	return hash;
}

async function highlight(annos)
{
	console.assert(Array.isArray(annos), 'annos must be array of Annotations');
	for ( const i in annos)
	{
		console.assert(annos[i].hasOwnProperty('id'), 'id is mandatory for Annotation object: ' + i);
		console.assert(annos[i].hasOwnProperty('type'), 'type is mandatory for Annotation object: ' + i);
	}
	if (ctx.currentDoc !== undefined )
	{
		ctx.currentAnnotations = annos;
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
			annos.push({id: "id" + i, title: i, boundingBox : rects[i]});
		}
	} else {
		let rect = rects;
		annos = [{id: "id0", title: "0", boundingBox : rect}];
	}
	if (ctx.currentDoc !== undefined )
	{
		ctx.currentAnnotations = annos;
		await ctx.currentDoc.setAnnotations(annos);
	}
}

async function userInputClusterNodeID()
{
	let currentClusterNodeID = {};
	let doc = await ctx.editor.currentDocument();	
	try { 
		currentClusterNodeID = await doc.getClusterNodeID(); 
	} catch (err) {}

	let cluster = prompt('Please enter cluster', currentClusterNodeID.cluster );
	let nodeID = prompt('Please enter node ID', currentClusterNodeID.nodeID );
	return {cluster: cluster, nodeID: nodeID};
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

	setLanguageText(languageText)
	{
		$('#language').text(languageText);
	}

	setCustomerID(customerID)
	{
		$('#customerID').text(customerID);
	}

	setOpenUrlDisabled()
	{
		var str = $("#showModalDialog").text();
		$("#showModalDialog").text(str + ' (disabled)');
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

	setIsDirtyText(dirtyText)
	{
		$('#isDirty').text(dirtyText);
	}

	setClusterNodeIDText(nodeIDText)
	{
		$('#clusterNodeID').text(nodeIDText);
	}

	addAnnotation (annotation)
	{
		// add html
		var displayText = "annotation" + gCount + ' @ x:' + annotation.boundingBox.x + ', y:' + annotation.boundingBox.y; 
		var id = 'annotation' + gCount;
		++gCount;
		var obj = new HighlightEvent();
		obj.type = HighlightType.eRect;
		obj.rect = annotation.boundingBox;
		var data = JSON.stringify(obj);
		$("#highlight_section").append('<div class="clickable rectAnnotation" id="' + id +'">' + displayText + '</div>').ready(()=>{
			var obj = new HighlightEvent();
			obj.type = HighlightType.eRect;
			obj.rect = annotation.boundingBox;
			$('#' + id).attr('data', JSON.stringify(obj.rect));
		});
	}

	init()
	{
		this.setPageUrlText(window.location.href);
		$('#hello').on('click', async ()=>{
			ctx.editor.hello();
		});
		let getCurrentDocumentPageBox = async (boxName) => 
		{
			let theBox = undefined;
			try {
				let pages = await ctx.currentDoc.pagesInfo();
				let pageInfo = pages[0];
				for ( let j=0; j<pageInfo.pageBoxes.length; ++j)
				{
					const pageBox = pageInfo.pageBoxes[j];
					if ( pageBox.type == boxName )
					{
						theBox = pageBox.rect;	
						break;
					}
				}
			} catch (err) {
			}
			return theBox;
		};
		$("#highlight_trimbox").on("click", async ()=>{
			let box = await getCurrentDocumentPageBox('TrimBox');
			highlightRectOrRects(makeRect(box.x, box.y, box.width, box.height));
		});
		$("#highlight_mediabox").on("click", async ()=>{
			let box = await getCurrentDocumentPageBox('MediaBox');
			highlightRectOrRects(makeRect(box.x, box.y, box.width, box.height));
		});

		$("#highlight_oval").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let color = getRandomColor();
			highlight([{id: "id0", title: "hello oval", highlightColor : color, type: "Oval", rect: rect}]);
		});
		$("#highlight_highlight").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let color = getRandomColor();
			highlight([{id: "id0", title: "hello highlight", highlightColor : color, type: "Highlight", rect: rect}]);
		});
		$("#highlight_line").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let color = getRandomColor();
			highlight([{id: "id0", title: "hello line", highlightColor : color, type: "Line", rect: rect}]);
		});
		$("#highlight_arrow").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let color = getRandomColor();
			highlight([{id: "id0", title: "hello arrow", highlightColor : color, type: "Arrow", rect: rect}]);
		});
		$("#highlight_freehand").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let points = [];
			for (let i = 0; i < 200; i++) {
				let x = i;
				let y = 32 * Math.sin(x / 8);
				x += rect.x0;
				y += rect.y0;
				points.push({x: x, y: y});
			}
			let color = getRandomColor();
			highlight([{id: "id0", title: "hello freehand", highlightColor : color, type: "Freehand", points: points}]);
		});
		$("#highlight_note").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			rect.x1 = rect.x0;
			rect.y1 = rect.y0;
			let color = getRandomColor();
			highlight([{id: "id0", title: "hello note", highlightColor : color, type: "Note", rect: rect}]);
		});

		$("#highlight_greenHanger").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let annots = [];
			let rect = makeRect2(box.x + 73, box.y + 79, box.x + 125, box.y + 131);
			let color = {r: 255, g: 0, b: 0};
			let annot = {id: "id0", title: "Recycle", highlightColor: color, type: "Rectangle", rect: rect};
			annots.push(annot);
			rect = makeRect2(box.x + 237, box.y + 85, box.x + 287, box.y + 135);
			color = {r: 255, g: 127, b: 0};
			annot = {id: "id1", title: "Sun", highlightColor: color, type: "Oval", rect: rect};
			annots.push(annot);
			rect = makeRect2(box.x + 82, box.y + 167, box.x + 274, box.y + 351);
			color = {r: 0, g: 0, b: 255};
			annot = {id: "id2", title: "Paragraph", highlightColor: color, type: "Highlight", rect: rect};
			annots.push(annot);
			rect = makeRect2(box.x + 73, box.y + 399, box.x + 244, box.y + 399);
			color = {r: 0, g: 255, b: 0};
			annot = {id: "id3", title: "Green", highlightColor: color, type: "Line", rect: rect};
			annots.push(annot);
			rect = makeRect2(box.x + 324, box.y + 529, box.x + 179, box.y + 569);
			color = {r: 0, g: 255, b: 255};
			annot = {id: "id4", title: "Hang", highlightColor: color, type: "Arrow", rect: rect};
			annots.push(annot);
			let points = [];
			for (let i = 0; i < 80; i += 2) {
				let x = i;
				let y = 3.2 * Math.sin(x / 5);
				x += box.x + 144;
				y += box.y + 88;
				points.push({x: x, y: y});
			}
			color = {r: 200, g: 200, b: 200};
			annot = {id: "id5", title: "Wave", highlightColor: color, type: "Freehand", points: points};
			annots.push(annot);
			rect = makeRect2(box.x + 275, box.y + 410, box.x + 275, box.y + 410);
			color = {r: 255, g: 0, b: 255};
			annot = {id: "id6", title: "Leaf", highlightColor: color, type: "Note", rect: rect};
			annots.push(annot);
			highlight(annots);
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
		$("#highlight_random").on('click', async ()=>{
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect(box);
			$("#highlight_random").attr('data', JSON.stringify(rect));
			let color = getRandomColor();
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
		$('#activateAnnotationTool').on('click', async () => {
			ctx.editor.activateAnnotationTool();
		});
		$('#setNodeID').on('click', async () => {
			try {
				let doc = await ctx.editor.currentDocument();	
				let clusterNodeID = await userInputClusterNodeID()
				await doc.setClusterNodeID(clusterNodeID);
				let newClusterNodeID = await doc.getClusterNodeID();
				alert('New cluster Node ID: ' + JSON.stringify(newClusterNodeID));
			} catch (err) {
				alert(' Unable to set NodeID: ' + JSON.stringify(err));
			}
		});
		$('#getNodeID').on('click', async () => {
			try {
				let doc = await ctx.editor.currentDocument();	
				let clusterNodeID = await doc.getClusterNodeID();
				alert('Cluster: ' + clusterNodeID.cluster + ', Node ID: ' + clusterNodeID.nodeID);
			} catch (err) {
				alert(' Unable to get NodeID: ' + JSON.stringify(err));
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

			str += '\n';
			str += 'ctx.editor.currentWindow().isModal(): ';
			try {
				let win = await ctx.editor.currentWindow();
				str += JSON.stringify(await win.isModal());
			} catch (err) {
				alert('error: ' + JSON.stringify(err));
			}

			alert(str);
		});
		$("#runTests").on("click", ()=>{
			let url = window.location.href;
			url += '/tests.html';
			window.location.href = url;
		});
		$("#showModalDialog").on("click", ()=>{
			// random width in 200 ... 500
			let width = 100 * Math.floor((Math.random() * 3) + 2);
			// random width in 200 ... 500
			let height = 100 * Math.floor((Math.random() * 3) + 2);
			let title = 'DIALOG TITLE ' + width + 'x' + height;
			ctx.editor.showModal( {url:'https://eskornd.github.io/samplesite/boot/', title : title, dialogSize: {width: width, height:height} });
		});
		$("#openInBrowser").on("click", ()=>{
			ctx.editor.openInBrowser( 'https://eskornd.github.io/samplesite/boot/');
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

		$('#saveDocument').on('click', async ()=>
		{
			let isSaved = false;
			try{
				isSaved = await ctx.currentDoc.saveDocument( { silent : false });
		
			} catch (err) {
				alert('Unable to save document: ' + JSON.stringify(err));
			}
			let isDirty = true;
			try {
				isDirty = await ctx.currentDoc.isDirty();
			} catch (err) {
				alert('unable to get is dirty' + JSON.stringify(err));
			}
			alert('Document saved: ' + isSaved + ', isDirty: ' + isDirty);
		});
		$('#uploadFile').on('click', async ()=>
		{
			// For uploading, we'll now allow setting a cluster node ID for the temp exported file
			// ask whether to set a cluster node id for the exported file
			const shouldSetID = confirm('Set Cluster Node ID for temp file?');
			let clusterNodeID = undefined;
			if (shouldSetID)
			{
				clusterNodeID = await userInputClusterNodeID();	
			}	
			try{
				let params = {};
				if ( undefined != clusterNodeID )
				{
					params.clusterNodeID = clusterNodeID;
				}
				let ret = await ctx.currentDoc.readFileBinary(
					params
					, (current, total)=>{ console.log('' + current + '/' + total + ' transfered.');}
				);
				
				console.log('Received Uint8Array ' + ret.length + ' now calculating hash...');
				let hash = calculateHash(ret);
				alert('Received Uint8Array ' + ret.length + ' bytes\nMD5: ' + hash);
				
			} catch (err) {
				alert('Unable to read file binary: ' + JSON.stringify(err));
				console.error(err);
			}
		});

		$('#uploadSDFile').on('click', async ()=>
		{
			try {
				let filePaths = await ctx.currentDoc.getPlacedSDFilePaths();
				console.assert(Array.isArray(filePaths));
				for (const i in filePaths)
				{
					let filePath = filePaths[i];
					alert('Reading structural design file: ' + filePath);
					let ret = await ctx.currentDoc.readPlacedSDFileBinary(filePath);

					console.log('Received Uint8Array ' + ret.length + ' now calculating hash...');
					let hash = calculateHash(ret);
					alert('Received Uint8Array ' + ret.length + ' bytes\nMD5: ' + hash);
				}
			} catch (err) {
				alert('Unable to read SD file binary: ' + JSON.stringify(err));
				console.error(err);
			}
		});

		$('#resizeDialog').on('click', async ()=> 
		{
			try {
				let win = await ctx.editor.currentWindow();
				let isModal = await win.isModal();
				await win.resize({width: 256, height:256 });
			} catch (err) {
				console.error(err);
				alert('Failed to resize dialog' + JSON.stringify(err));
			}
			
		});

		$('#closeDialog').on('click', async ()=>
		{
			try {
				let win = await ctx.editor.currentWindow();
				await win.close();
			} catch (err) {
				console.error(err);
				alert('Failed to resize dialog' + JSON.stringify(err));
			}
			
		});

		// use event delegate rather than direct bind, so that we can handle dynamic items
		$('#highlight_section').on('click', '.rectAnnotation', (e)=>{ 
			log(".rectAnnotation clicked");
			var data = $("#" + e.target.id).attr('data');
			var highlightColor = $("#" + e.target.id).attr('highlightColor');
			if ( undefined != highlightColor)
			{
				highlight([{id: "id0", title: "0", boundingBox : JSON.parse(data), highlightColor : JSON.parse(highlightColor)}]);
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

