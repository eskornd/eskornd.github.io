import {ctx} from './ctx.js';
import {randomID} from './utils.js';
import {HighlightEvent, HighlightType} from './HighlightEvent.js';
import {log} from './log.js';

function makeRect2(x0, y0, x1, y1)
{
	return {x0: x0, y0: y0, x1: x1, y1: y1};
}

function makeRandomRect2(box)
{
	let randomDir = ()=>{
		return Math.random() > 0.5 ? 1 : -1;
	}
	let w = 200;
	let h = 50;
	let x0 = box.x + Math.random() * (box.width - w);
	let y0 = box.y + Math.random() * (box.height - h);
	let x1 = x0 + randomDir() * w;
	let y1 = y0 + randomDir() * h;
	return makeRect2(x0, y0, x1, y1);
}

function getRandomColor()
{
	let random255 = ()=>{
		return Math.floor(Math.random()*255);
	};
	return { r: random255(), g: random255(), b: random255()};
}

function getRandomStroke()
{
	return Math.random() * 5;
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

function makeID()
{
	return randomID();
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
		await ctx.currentDoc.setAnnotations(annos);
	}
}

async function highlightRects(rects)
{
	console.assert(Array.isArray(rects));
	let annos = [];
	for (const i in rects)
	{
		annos.push({id: `${makeID()}`, title: i, longTitle: `${i} This is the #${i} annotation in the list`, type: "Rectangle", rect: rects[i]});
	}
	if (ctx.currentDoc !== undefined)
	{
		await ctx.currentDoc.setAnnotations(annos);
	}
}

async function highlightRect(rect)
{
	highlightRects([rect]);
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

	setPageNumberText(pageNumberText)
	{
		$('#pageNumber').text(pageNumberText);
	}

	setHasAnnotationText(hasAnnotationText)
	{
		$('#hasAnnotation').text(hasAnnotationText);
	}

	addAnnotation (annotation)
	{
		// add html
		var displayText = "annotation" + gCount + ' @ x:' + annotation.rect.x0 + ', y:' + annotation.rect.y0; 
		var id = 'annotation' + gCount;
		++gCount;
		$("#highlight_section").append('<div class="clickable rectAnnotation" id="' + id +'">' + displayText + '</div>').ready(()=>{
			var obj = new HighlightEvent();
			obj.type = HighlightType.eRect;
			obj.rect = annotation.rect;
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
			highlightRect(makeRect2(box.x, box.y, box.x + box.width, box.y + box.height));
		});
		$("#highlight_mediabox").on("click", async ()=>{
			let box = await getCurrentDocumentPageBox('MediaBox');
			highlightRect(makeRect2(box.x, box.y, box.x + box.width, box.y + box.height));
		});

		$("#highlight_oval").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let color = getRandomColor();
			let stroke = getRandomStroke();
			highlight([{id: `${makeID()}`, title: "hello oval", longTitle: "This is an oval annotation. Author: noreply@esko.com", highlightColor : color, highlightWeight: stroke, type: "Oval", rect: rect}]);
		});
		$("#highlight_highlight").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let color = getRandomColor();
			let stroke = getRandomStroke();
			highlight([{id: `${makeID()}`, title: "hello highlight", longTitle: "This is a highlight annotation. Author: noreply@esko.com", highlightColor : color, highlightWeight: stroke, type: "Highlight", rect: rect}]);
		});
		$("#highlight_line").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let color = getRandomColor();
			let stroke = getRandomStroke();
			highlight([{id: `${makeID()}`, title: "hello line", longTitle: "This is a line annotation. Author: noreply@esko.com", highlightColor : color, highlightWeight: stroke, type: "Line", rect: rect}]);
		});
		$("#highlight_arrow").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let color = getRandomColor();
			let stroke = getRandomStroke();
			highlight([{id: `${makeID()}`, title: "hello arrow", longTitle: "This is an arrow annotation. Author: noreply@esko.com", highlightColor : color, highlightWeight: stroke, type: "Arrow", rect: rect}]);
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
			let stroke = getRandomStroke();
			highlight([{id: `${makeID()}`, title: "hello freehand", longTitle: "This is a freehand annotation. Author: noreply@esko.com", highlightColor : color, highlightWeight: stroke, type: "Freehand", points: points}]);
		});
		$("#highlight_freehand_no_long_title").on("click", async ()=> {
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
			let stroke = getRandomStroke();
			highlight([{id: `${makeID()}`, title: "hello freehand", highlightColor : color, highlightWeight: stroke, type: "Freehand", points: points}]);
		});
		$("#highlight_note").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let stroke = getRandomStroke();
			rect.x1 = rect.x0;
			rect.y1 = rect.y0;
			let color = getRandomColor();
			highlight([{id: `${makeID()}`, title: "hello note", longTitle: "This is a note annotation. Author: noreply@esko.com", highlightColor : color, highlightWeight: stroke, type: "Note", rect: rect}]);
		});

		$("#highlight_greenHanger").on("click", async ()=> {
			let box = await getCurrentDocumentPageBox('MediaBox');
			let annots = [];
			let rect = makeRect2(box.x + 73, box.y + 79, box.x + 125, box.y + 131);
			let color = {r: 255, g: 0, b: 0};
			let annot = {id: `${makeID()}`, title: "Recycle", longTitle: "Recycle annotation", highlightColor: color, type: "Rectangle", rect: rect};
			annots.push(annot);
			rect = makeRect2(box.x + 237, box.y + 85, box.x + 287, box.y + 135);
			color = {r: 255, g: 127, b: 0};
			annot = {id: `${makeID()}`, title: "Sun", longTitle: "Sun annotation", highlightColor: color, highlightWeight: 2.0, type: "Oval", rect: rect};
			annots.push(annot);
			rect = makeRect2(box.x + 82, box.y + 167, box.x + 274, box.y + 351);
			color = {r: 0, g: 0, b: 255};
			annot = {id: `${makeID()}`, title: "Paragraph", longTitle: "Paragraph annotation", highlightColor: color, type: "Highlight", rect: rect};
			annots.push(annot);
			rect = makeRect2(box.x + 73, box.y + 399, box.x + 244, box.y + 399);
			color = {r: 0, g: 255, b: 0};
			annot = {id: `${makeID()}`, title: "Green", longTitle: "Green annotation", highlightColor: color, highlightWeight: 4.0, type: "Line", rect: rect};
			annots.push(annot);
			rect = makeRect2(box.x + 324, box.y + 529, box.x + 179, box.y + 569);
			color = {r: 0, g: 255, b: 255};
			annot = {id: `${makeID()}`, title: "Hang", longTitle: "Hang annotation", highlightColor: color, type: "Arrow", rect: rect};
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
			annot = {id: `${makeID()}`, title: "Wave", longTitle: "Wave annotation", highlightColor: color, highlightWeight: 3.0, type: "Freehand", points: points};
			annots.push(annot);
			rect = makeRect2(box.x + 275, box.y + 410, box.x + 275, box.y + 410);
			color = {r: 255, g: 0, b: 255};
			annot = {id: `${makeID()}`, title: "Leaf", longTitle: "Leaf annotation", highlightColor: color, type: "Note", rect: rect};
			annots.push(annot);
			highlight(annots);
		});

		$("#highlight_100").attr('data', JSON.stringify({x0: 0, y0: 0, x1: 100, y1: 100}));
		$("#highlight_multi").attr('data', JSON.stringify([
			{x0: 0, y0: 0, x1: 20, y1: 20}
			,{x0: 50, y0: 50, x1: 70, y1: 70}
			,{x0: 100, y0: 100, x1: 120, y1: 120}
			,{x0: 100, y0: 50, x1: 120, y1: 70}
			,{x0: 50, y0: 0, x1: 70, y1: 20}
			,{x0: 100, y0: 0, x1: 120, y1: 20}
		]));
		$("#highlight_random").attr('data', JSON.stringify({x0: 50, y0: 50, x1: 250, y1: 100}));
		$("#highlight_random").on('click', async ()=>{
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rect = makeRandomRect2(box);
			let color = getRandomColor();
			let stroke = getRandomStroke();
			$("#highlight_random").attr({
				data: JSON.stringify(rect),
				highlightColor: JSON.stringify(color),
				highlightWeight: stroke
			});
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
		$('#activateAnnotationToolSelect').on('click', async () => {
			ctx.editor.activateAnnotationTool({ mode : "select" });
		});
		$('#activateAnnotationToolAdd').on('click', async () => {
			ctx.editor.activateAnnotationTool({ mode: "add" });
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

		$('#setUserToken').on('click', async ()=>
		{
			let keychain = await ctx.editor.keychain();
			let token = prompt('Please enter token');
			keychain.setUserToken(token);
		});
		$('#getUserToken').on('click', async ()=>
		{
			try
			{
				let keychain = await ctx.editor.keychain();
				let token = await keychain.getUserToken();
				alert(token);
			}
			catch (err)
			{
				alert('Unable to get token' + JSON.stringify(err));
			}
		});
		$('#deleteUserToken').on('click', async ()=>
		{
			let keychain = await ctx.editor.keychain();
			keychain.deleteUserToken();
		});
		const domain = 'next.dev.cloudi.city';
		$('#setUserToken_withDomain').on('click', async ()=>
		{
			let keychain = await ctx.editor.keychain(domain);
			let token = prompt('Please enter token');
			keychain.setUserToken(token);
		});
		$('#getUserToken_withDomain').on('click', async ()=>
		{
			try
			{
				let keychain = await ctx.editor.keychain(domain);
				let token = await keychain.getUserToken();
				alert(token);
			}
			catch (err)
			{
				alert('Unable to get token' + JSON.stringify(err));
			}
		});
		$('#deleteUserToken_withDomain').on('click', async ()=>
		{
			let keychain = await ctx.editor.keychain(domain);
			keychain.deleteUserToken();
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

		$('#downloadFile').on('click', async ()=>
		{
			try {
				const req = new XMLHttpRequest();
				req.open("GET", "./Letter_UECI.pdf", true);
				req.responseType = "arraybuffer";

				req.onload = (event) => {
					const arrayBuffer = req.response;
					if (arrayBuffer) {
						const u8Arr = new Uint8Array(arrayBuffer);
						ctx.editor.writeFileBinary(u8Arr, "Letter_UECI.pdf");
					}
				};

				req.send(null);
			} catch (err) {
				alert('Unable to download file: ' + JSON.stringify(err));
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

		$('#link_mailto').on('click', async () =>
		{
			window.location.href = 'mailto:noreply@esko.com';
		});
		$('#link_tel').on('click', async () =>
		{
			window.location.href = 'tel:008618600001234';
		});
		$('#link_download_1mb').on('click', async() =>
		{
			window.location.href = 'https://www.dundeecity.gov.uk/sites/default/files/publications/civic_renewal_forms.zip';
		});
		// use event delegate rather than direct bind, so that we can handle dynamic items
		$('#highlight_section').on('click', '.rectAnnotation', async (e)=>{ 
			log(".rectAnnotation clicked");
			var data = $("#" + e.target.id).attr('data');
			var highlightColor = $("#" + e.target.id).attr('highlightColor');
			var highlightWeight = $("#" + e.target.id).attr('highlightWeight');
			if (undefined != highlightColor && undefined != highlightWeight)
			{
				highlight([{id: `${makeID()}`, title: "0", type: "Rectangle", rect: JSON.parse(data), highlightColor: JSON.parse(highlightColor), highlightWeight: parseFloat(highlightWeight)}]);
				return;
			}
			var obj = JSON.parse(data);
			let box = await getCurrentDocumentPageBox('MediaBox');
			let rects = [];
			if (Array.isArray(obj))
			{
				rects = obj;
			}
			else
			{
				rects = [obj];
			}
			for (const i in rects)
			{
				let rect = rects[i];
				rect.x0 += box.x;
				rect.x1 += box.x;
				rect.y0 += box.y;
				rect.y1 += box.y;
			}
			highlightRects(rects);
		});
		$("#refresh").on("click", ()=>{
			location.reload();
		});
	}
}

