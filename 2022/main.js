import {downloadAs} from './js/downloadAs.js';
import {NDL} from './NDL/NDL.js';

// context of current document
var ctx = { };

function getTextIndex () {
	let indexText = $('#textIndex').val();
	let index = parseInt(indexText);
	return index;
}

function getBarCodeIndex () {
	let indexText = $('#barCodeIndex').val();
	let index = parseInt(indexText);
	return index;
}

function getImageIndex () {
	let indexText = $('#imageIndex').val();
	let index = parseInt(indexText);
	return index;
}

function isPanelVisible(selector)
{
	return $(selector).dialog('isOpen');
}

function setPanelVisible(selector, visible)
{
	// text,barcodes triggers repaint
	$(selector).dialog(visible ? 'open' : 'close');
	if (visible)
	{
		$(selector).dialog({
			close: function( event, ui ) {
				Repaint();
			}
		});
		Repaint();
	}	
}

function UI()
{
	const ele = document.getElementById('dropzone');
	ele.addEventListener('dragover', function (e) {
			e.preventDefault();
			});

	ele.addEventListener('dragenter', function (e) {
			e.target.style.background = 'lightgrey';
			e.preventDefault();
			});
	ele.addEventListener('dragleave', function (e) {
			e.preventDefault();
			e.target.style.background = '';
			});

	ele.addEventListener('drop', function (e) {
			e.preventDefault();
			e.target.style.background = '';
			dropHandler(e);
			});
	
	//Hotkeys
	$('.optional').css('display', 'none');
	$(document).keypress((e)=>{
		if ( e.ctrlKey && e.code == 'KeyD')
		{
			let cur = $('.optional').css('display');
			if ( 'none' === cur )
			{
				$('.optional').css('display', 'inline');
			} else {
				$('.optional').css('display', 'none');
			}
			return true;
		}
	});


	let browseElem = document.getElementById('browseInput');
	browseElem.addEventListener('change', async (e) => {
		const files = e.target.files;
		for (let i=0; i<files.length; ++i)
		{
			let filename = await mountFile(files.item(i), '');
			ProcessPDF(filename);
		}
		console.log(files);
	});

	$('#browse').click(()=>{
		$('#browseInput').click();	
	});

	$('#save').click(()=>{
		let array = viewer().saveAs();
		downloadAs(array, 'saved.pdf');
	});

	let changeTextJustification = async (justification) => {
		//let curText = $('#currentText').val();
		viewer().setTextJustification(getTextIndex(), justification);
		loadCtx();
		Repaint();
	};
	$('#alignLeft').click(async ()=>{changeTextJustification(0)});
	$('#alignCenter').click(async ()=>{changeTextJustification(1)});
	$('#alignRight').click(async ()=>{changeTextJustification(2)});
	$('#justifyLeft').click(async ()=>{changeTextJustification(3)});
	$('#justifyCenter').click(async ()=>{changeTextJustification(4)});
	$('#justifyRight').click(async ()=>{changeTextJustification(5)});
	$('#justifyAll').click(async ()=>{changeTextJustification(6)});

	let applyTextChanges = async () => {
		let curText = $('#currentText').val();
		viewer().editText(getTextIndex(), curText);
		loadCtx();
		Repaint();
	};

	// hide edit 
	$('#editText').hide();
	$('#editText').click(async ()=>{
		applyTextChanges();
	});

	let editTimeoutID = 0;
	$('#currentText').on('change keyup paste', ()=>{
		clearTimeout(editTimeoutID);
		editTimeoutID = setTimeout(
			applyTextChanges
			, 200
		);
	});
	$('#applyBarCode').click(async ()=>{
		let str = $('#currentBarCode').val();
		viewer().setBarCode(getBarCodeIndex(), str);
		loadCtx();
		Repaint();
	});

	$('#barCodeIndex').change( () => {
		Repaint();
	});

	$('#textIndex').change( () => {
		UpdateTextContentUI();
		Repaint();
	});

	$('#imageIndex').change( () => {
		Repaint();
	});

	// toggles
	$('#textPanel').dialog({ width: 440 , height: 260 });
	$('#textToggle').click(()=>{
		setPanelVisible('#textPanel', !isPanelVisible('#textPanel'));
	});
	$('#barCodeToggle').click(()=>{
		setPanelVisible('#barCodePanel', !isPanelVisible('#barCodePanel'));
	});
	$('#xmpPanel').dialog({width: 380, height: 440});
	$('#xmpToggle').click(()=>{
		setPanelVisible('#xmpPanel', !isPanelVisible('#xmpPanel'));
	});
	$('#imageToggle').click(()=>{
		setPanelVisible('#imagePanel', !isPanelVisible('#imagePanel'));
	});
}
	

var gViewer = undefined;
var gNDL = undefined;
function viewer()
{
	if ( gViewer === undefined )
	{
		gViewer = gNDL.viewer();
	}
	return gViewer;
}

function UpdateBarCodeIndexUI(numBarCodes)
{
	$('#barCodeIndex').prop('disabled', 0==numBarCodes);
	let max = numBarCodes - 1;
	if (max<0) max = 0;
	$('#barCodeIndex').prop('min', 0);
	$('#barCodeIndex').prop('max', max);
	$('#barCodeIndex').val(0);
}

function UpdateTextIndexUI(numTexts)
{
	$('#textIndex').prop('disabled', 0==numTexts);

	let max = numTexts - 1;
	if (max<0) max = 0;
	$('#textIndex').prop('min', 0);
	$('#textIndex').prop('max', max);
	$('#textIndex').val(0);
}

function UpdateImageIndexUI(numImages)
{
	$('#imageIndex').prop('disabled', 0==numImages);
	let max = numImages - 1;
	if (max<0) max = 0;
	$('#imageIndex').prop('min', 0);
	$('#imageIndex').prop('max', max);
	$('#imageIndex').val(0);
}

function UpdateTextContentUI()
{
	let index = getTextIndex();
	if ( index < ctx.texts.length)
	{
		let t = ctx.texts[index];
		$('#currentText').val(t.text);
	} else {
		$('#currentText').val('');
	}
}

function UpdateXMPUI(xmp)
{
	$('#xmpText').text(JSON.stringify(xmp, null, 4));
}

function ArrayToImageData(array, rasterSize)
{
	// create ImageData instance
	let clamped = new Uint8ClampedArray(array.buffer, array.byteOffset, array.byteLength);
	let imageData = new ImageData(clamped, rasterSize.width, rasterSize.height);
	return imageData;
}

function resizeCanvas(rasterSize)
{
	let canvas = document.getElementById('canvas');
	canvas.width = rasterSize.width;
	canvas.height = rasterSize.height;
}

function Repaint()
{
	let drawOnCanvas = (array, rasterSize) =>{
		let canvas = document.getElementById("canvas");
		let twoD = canvas.getContext("2d");
		twoD.putImageData(ctx.imageData, 0, 0);
		
	};
	let setPNG = (base64)=>{
		document.getElementById('preview').src = 'data:image/png;base64,' + base64;
		
		let img = new Image();
		img.onload= ()=>
		{
			let canvas = document.getElementById("canvas");
			let twoD = canvas.getContext("2d");
			twoD.scale(0.5, 0.5);
			twoD.drawImage(img, 0, 0);
		};
		img.src = 'data:image/png;base64,' + base64;
	};

	let makeToViewRect = (pageBox, viewSize)=> {
		let sX = viewSize.width/pageBox.width;
		let sY = viewSize.height/pageBox.height;
		let toViewRectFunc = (rect) => {
			let x = rect.x - pageBox.x;
			let y = pageBox.y + pageBox.height - ( rect.y + rect.height);
			x *= sX;
			y *= sY;
			let viewRect = {
				'x' : x
				,'y' : y
				, 'width' : (sX * rect.width)
				, 'height' : (sY * rect.height)
			};
			return viewRect;
		};
		return toViewRectFunc;
	};

	let toViewRect;
	let drawTexts = (texts) => {
		if (texts === undefined)
			return;

		let canvas = document.getElementById("canvas");
		let ctx = canvas.getContext("2d");
		let textIndex = getTextIndex();
		for ( let i =0; i< texts.length; ++i)
		{
			if (textIndex != i)
				continue;

			let t = texts[i];
			//$('#currentText').text(t.text);
			ctx.beginPath();
			let r = toViewRect(t.box);
			ctx.strokeStyle = '#444B53';
			ctx.lineWidth = 2;
			ctx.rect(r.x, r.y, r.width, r.height);
			ctx.stroke();
		}
	};

	let drawBarCodes = (barCodes) => {
		if (barCodes === undefined)
			return;

		let canvas = document.getElementById("canvas");
		let ctx = canvas.getContext("2d");
		let barCodeIndex = getBarCodeIndex();
		for ( let i =0; i< barCodes.length; ++i)
		{
			if (barCodeIndex != i)
				continue;
			
			let b = barCodes[i];
			$('#currentBarCode').val(b.code);
			$('#barCodeType').text(b.type.replace(/^(k)/,''));
			ctx.beginPath();
			let r = toViewRect(b.boundingBox);
			ctx.strokeStyle = '#444B53';
			ctx.lineWidth = 2;
			ctx.rect(r.x, r.y, r.width, r.height);
			ctx.stroke();
		}

	};
	
	let drawImages = (images) => {
		if (images === undefined)
			return;

		let canvas = document.getElementById("canvas");
		let ctx = canvas.getContext("2d");
		let imageIndex = getImageIndex();
		for ( let i =0; i< images.length; ++i)
		{
			if (imageIndex != i)
				continue;
			
			let image = images[i];
			ctx.beginPath();
			let r = toViewRect(image.boundingBox);
			ctx.strokeStyle = '#444B53';
			ctx.lineWidth = 2;
			ctx.rect(r.x, r.y, r.width, r.height);
			ctx.stroke();
		}


	}
	// preview
	let useCanvas = true;
	if (useCanvas)
	{
		drawOnCanvas(ctx.previewByteArray, ctx.previewRasterSize);

	} else{
		let base64 = viewer().getPreviewPNGBase64();
		setPNG(base64);	
	}
	
	let pageBox = viewer().getPageBox();
	let viewSize = viewer().getPreviewSize();
	toViewRect = makeToViewRect(pageBox, viewSize);
	if ( isPanelVisible('#textPanel'))
	{
		drawTexts(ctx.texts);	
	}
	if ( isPanelVisible('#barCodePanel'))
	{
		drawBarCodes(ctx.barCodes);	
	}
	if ( isPanelVisible('#imagePanel'))
	{
		drawImages(ctx.images);
	}
}

function loadCtx_preview()
{
	// load preview
	ctx.previewByteArray = viewer().getPreviewByteArray();
	ctx.previewRasterSize = viewer().getPreviewSize();
	resizeCanvas(ctx.previewRasterSize);
	ctx.imageData = ArrayToImageData(ctx.previewByteArray, ctx.previewRasterSize);
}

function loadCtx_xmp()
{
	ctx.xmp = {};
	let jsonStr = viewer().getMetadata();
	try {
		ctx.xmp = JSON.parse(jsonStr);
	} catch (err) {
	}
}

function loadCtx_texts()
{
	//load text
	let textsJsonStr = viewer().getTextObjectsAsJson();
	let texts = JSON.parse(textsJsonStr);
	if ( texts === null || texts === undefined)
		texts = [];

	ctx.texts = texts;
}

function loadCtx_barCodes()
{
	//load text
	let barCodesJsonStr = viewer().getBarCodeObjectsAsJson();
	let barCodes = JSON.parse(barCodesJsonStr);
	if ( barCodes === null || barCodes === undefined)
		barCodes = [];

	ctx.barCodes = barCodes;
}

function loadCtx_images()
{
	if ( undefined == ctx.xmp )
	{
		loadCtx_xmp();
	}
	if ( undefined != ctx.xmp )
	{
		ctx.images = ctx.xmp.images;	
	}
}

function loadCtx()
{
	loadCtx_preview();
	loadCtx_xmp();
	loadCtx_texts();
	loadCtx_barCodes();
	loadCtx_images();
}

function showBusy()
{
	let dlg = document.getElementById('spinnerDialog');
	if (!dlg.open)
	{
		dlg.showModal();
	}
}

function hideBusy()
{
	document.getElementById('spinnerDialog').close();
}

function ProcessPDF(filePath)
{
	console.log('Begin ProcessPDF');
	let loaded = viewer().loadPDF(filePath);
	viewer().setDPI(96);
	console.assert(loaded);
	let json = viewer().getMetadata();
	console.log(json);
	
	loadCtx();
	// update UI
	resizeCanvas(ctx.previewRasterSize);
	UpdateBarCodeIndexUI(ctx.barCodes.length);
	UpdateTextIndexUI(ctx.texts.length);
	UpdateImageIndexUI(ctx.images.length);
	UpdateTextContentUI();
	UpdateXMPUI(ctx.xmp);
	
	// repaint
	Repaint();
	console.log('End ProcessPDF');
}

var Initializer = 
{
	isModuleReady : false,
	isSampleReady : false,
	isResourceReady : false,
	sampleFile : '',
	isInitialized : false,
	tryInit : () => {
		if (Initializer.isModuleReady && Initializer.isSampleReady && Initializer.isResourceReady && !Initializer.isInitialized)
		{
			Initializer.isInitialized = true;
			ProcessPDF(Initializer.sampleFile);
			hideBusy();
		}
	}
};

// mount the file object into the folder
function mountBlob(fileObject, inFileName, folder, onFileMounted) {
	console.assert(fileObject instanceof Blob )
    var reader = new FileReader();
    reader.onload = function () {
		let filePath = folder + '/' + inFileName;

        var data = new Uint8Array(reader.result);
        try {
			let dummy = filePath;
			let fs = gNDL.fs();
			let stream = fs.open(dummy, 'w+');
			fs.write(stream, data, 0, data.length, 0);
			fs.close(stream);

			let stat = fs.stat(dummy);
			console.log(stat);
			if (stat.size == 0) {
				alert('Empty file: ' + filePath + ' ' + stat.size + ' bytes?');
			}
        } catch (err) {
            console.warn('Exception in mountBlob: ' + filePath + ' ' + err.message);
        }

        onFileMounted(filePath);
    }
    reader.readAsArrayBuffer(fileObject);
}

function mountFile(fileObject, folder) {
	console.assert(fileObject instanceof File )
	var filename = fileObject.name;
	if (folder != null)
		filename = folder + '/' + filename;

	return new Promise((resolve, reject) => {
		mountBlob(fileObject, filename, folder, resolve);
	});
}

async function dropHandler(ev) {
	console.log('File(s) dropped');

	// Prevent default behavior (Prevent file from being opened)
	ev.preventDefault();

	if (ev.dataTransfer.items) {
		// Use DataTransferItemList interface to access the file(s)
		for (var i = 0; i < ev.dataTransfer.items.length; i++) {
			// If dropped items aren't files, reject them
			if (ev.dataTransfer.items[i].kind === 'file') 
			{
				var files = ev.dataTransfer.files;
				var file = files.item(i);
				let filename = await mountFile(file, '');
				ProcessPDF(filename);
			}
		}
	} else {
		// Use DataTransfer interface to access the file(s)
		for (var i = 0; i < ev.dataTransfer.files.length; i++) {
			console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
		}
	}
}

function dragOverHandler(ev) {
	console.log('File(s) in drop zone');

	// Prevent default behavior (Prevent file from being opened)
	ev.preventDefault();
}

let loadSamplePDF = async () =>
{
	console.log('loadSamplePDF()');	
	//let pdfURL = 'resources/GETSET_POUCH_GEL.pdf';
	//let pdfURL = 'resources/sample_file.pdf';
	let pdfURL = 'resources/TextCyanMagenta.pdf';
	//let pdfURL = 'resources/nPDF.pdf';
	//let pdfURL = 'resources/Nexu_GreenHanger_pdf+.pdf';
	var response = await fetch(pdfURL);
	var blob = await response.blob();
	mountBlob(blob, 'Mounted.pdf', '', (filename)=>{
		console.log('mounted as ' + filename);
		Initializer.sampleFile = filename;
		Initializer.isSampleReady = true;
	});
}

async function start()
{
	let ndl = new NDL();
	const initParams = {
		resources : 'NDL/Resources.zip'
		, fonts : ['resources/myfonts/Alice-Regular.woff', 'resources/myfonts/Glory-Regular.woff']
	};
	await ndl.initialize(initParams);
	gNDL = ndl;
	await loadSamplePDF();
	Initializer.isModuleReady = true;
	Initializer.isResourceReady = true;
	await loadSamplePDF();
	Initializer.tryInit();
}

var gUnzipModule;
var gSimplePDFModule;


$(()=> {
	showBusy();
	UI();
	start();
	let panelIDs = ['#textPanel', '#barCodePanel', '#xmpPanel', '#imagePanel'];
	for ( let i=0; i<panelIDs.length; ++i)
	{
		let selector=panelIDs[i];
		$(selector).dialog();
		$(selector).css("visibility", "visible");
		$(selector).dialog('close');
	}

});
