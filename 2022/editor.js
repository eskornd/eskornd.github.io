import {downloadAs} from './js/downloadAs.js';
import {NDL} from './NDL/NDL.js';

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

// context of current document
let ctx = {
	settings : {
		devicePixelRatio : 1.5
		, dpi : 72.0
		, useGoogleFonts : true
		, useSystemFonts : false
		, systemFontsBaseURL : 'http://localhost:19999'
	}
};

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

function checkSystemFontsService()
{
	return new Promise( (resolve, reject) =>{
		var oReq = new XMLHttpRequest();
		oReq.onload = function(e) {
			resolve();
		}
		oReq.onerror = function (e){
			reject();
		}
		oReq.open("HEAD", ctx.settings.systemFontsBaseURL);
		oReq.responseType = "arraybuffer";
		oReq.send();	
	});
}

function installDropHandler(id, handler)
{
	const ele = document.getElementById(id);
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
			handler(e);
			});
}

function UI()
{
	installDropHandler('dropzone', dropHandler);	
	installDropHandler('fontDrop', dropHandlerFont);	
	
	//Hotkeys
	//$('.optional').css('display', 'none');
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
			let filename = await mountFile(files.item(i));
			ProcessFile(filename);
			// we only process one PDF
			if (isFileNamePDF(filename))
				break;
		}
		console.log(files);
	});

	$('#dropzone').click(()=>{
		$('#browseInput').click();	
	});

	$('#save').click(()=>{
		let array = viewer().saveAs();
		let fileName = $('#documentFileName').text();
		if ( undefined == fileName || '' == fileName )
		{
			fileName = 'Untitled.pdf';
		}

		// add suffix
		let pos = fileName.lastIndexOf('.');
		let stem = fileName.substr(0, pos);
		let ext = fileName.substr(pos);
		const suffix = '_edited'
		let downloadFileName = stem + suffix + ext;
		downloadAs(array, downloadFileName);
	});

	let changeTextJustification = async (justification) => {
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


	$('#rgbColorSpace').on('click', ()=>{
		toastMessage('Image in RGB color space');
	});

	$('#lowResolution').on('click', ()=>{
		toastMessage('Image Resolution is low');
	});

	let applyTextChanges = async () => {
		let curText = $('#currentText').val();
		if ( curText !== ctx.lastSetText )
		{
			viewer().setTextText(getTextIndex(), curText);
			ctx.lastSetText = curText;
			loadCtx();
			Repaint();
			toastMessage('Text content changed');
		}
	};
	let applyFontSizeChange = async()=> {
		let fontSize = $('#fontSize').val();
		fontSize = Math.max(0.99, fontSize);	
		viewer().setTextFontSize(getTextIndex(), fontSize);
		loadCtx();
		Repaint();
		toastMessage('Font size changed: ' + fontSize + ' pt');
	}

	// deprecated: hide edit 
	$('#editText').hide();
	$('#editText').click(async ()=>{
		applyTextChanges();
	});

	let editTimeoutID = 0;
	$('#currentText').on('change keyup paste', ()=>{
		clearTimeout(editTimeoutID);
		editTimeoutID = setTimeout(
			applyTextChanges
			, 300
		);
	});
	$('#currentText').on('focus', ()=>{
		ctx.isEditingText = true;
	});
	$('#currentText').on('blur', ()=>{
		ctx.isEditingText = false;
	});
	let editFontSizeTimeoutID = 0;
	$('#fontSize').change( ()=> {
		clearTimeout(editFontSizeTimeoutID);
		editFontSizeTimeoutID = setTimeout(
			applyFontSizeChange
			, 300
		);
	});
	$('#applyBarCode').click(async ()=>{
		let str = $('#currentBarCode').val();
		viewer().setBarCode(getBarCodeIndex(), str);
		loadCtx();
		Repaint();
		toastMessage('Barcode changed: ' + str );
	});

	let ratioToUIValue = (ratio) =>{
		if (ratio < 0.5001 )
		{
			return 1;
		} else if (ratio < 0.7501)
		{
			return 2;
		} else if (ratio < 1.0001)
		{
			return 3;
		} else if (ratio < 1.5001)
		{
			return 4;
		} else if (ratio < 2.0001){
			return 5;
		} else if (ratio < 4.0001){
			return 6;
		} else {
			return 7;
		}
	};
	let ratioFromUIValue = (val) =>{
		if ( val < 1.01 )
		{
			return 0.5;
		} else if ( val < 2.01)
		{
			return 0.75;
		} else if ( val < 3.01)
		{
			return 1.0;
		} else if ( val < 4.01)
		{
			return 1.5;
		} else if ( val < 5.01)
		{
			return 2.0;
		} else if ( val < 6.01) 
		{
			return 4.0;
		} else {
			return 8.0;
		}
	};
	
	let updateSpeedColor = ()=>{
		let val = parseInt($('#devicePixelRatioBar').val());
		let color = '#7AAE5A';
		if ( val <= 3)
		{
			color = '#69B34C';
		} else if (val <= 4)
		{
			color = '#ACB334';
		} else if (val <= 5)
		{
			color = '#FF8E15';
		} else if (val <= 6)
		{
			color = '#FF4E11';
		} else {
			color = '#FF0D0D';
		}
		$('#viewQualitySpeed').css('color', color);
	};
	$('#viewQualitySpeed').on('click', ()=>{
		toastMessage('Increasing quality reduces performance');
	});
	$('#devicePixelRatioBar').val(ratioToUIValue(ctx.settings.devicePixelRatio));
	updateSpeedColor();
	$('#devicePixelRatioBar').change( ()=>{
		let ratio = ratioFromUIValue($('#devicePixelRatioBar').val());
		updateSpeedColor();
		ctx.settings.devicePixelRatio = ratio;
		viewer().setDPI(ctx.settings.devicePixelRatio * ctx.settings.dpi);
		loadCtx_preview();
		ResizeCanvas(ctx.previewRasterSize);
		Repaint();
		toastMessage('Device pixel ratio changed: ' + ratio );
	});
	$('#useGoogleFonts').prop('checked', ctx.settings.useGoogleFonts);
	$('#useSystemFonts').prop('checked', ctx.settings.useSystemFonts);
	$('#useGoogleFonts').change(()=>{
		let checked = $('#useGoogleFonts').prop('checked');
		ctx.settings.useGoogleFonts = checked;
		UpdateTextContentUI();
	});
	$('#useSystemFonts').change(()=>{
		let checked = $('#useSystemFonts').prop('checked');
		ctx.settings.useSystemFonts = checked;
		UpdateTextContentUI();
		if (checked)
		{
			checkSystemFontsService().then(
				() => {
					toastMessage('System font service connected');
				}
				, () => {
					toastMessage('System font service is not running');
				}
			).catch(
				()=>{
					toastMessage('System font service is not running');
				}
			);
		}
	});

	$('#barCodeIndex').change( () => {
		Repaint();
	});

	$('#textIndex').change( () => {
		UpdateTextContentUI();
		Repaint();
	});

	$('#imageIndex').change( () => {
		UpdateImageContentUI();
		Repaint();
	});

	// toggles
	$('#textPanel').dialog({ width: 320 , height: 260 });
	$('#textToggle').click(()=>{
		setPanelVisible('#textPanel', !isPanelVisible('#textPanel'));
	});
	$('#barCodePanel').dialog({ width: 240, height: 160});
	$('#barCodeToggle').click(()=>{
		setPanelVisible('#barCodePanel', !isPanelVisible('#barCodePanel'));
	});
	$('#xmpPanel').dialog({width: 320, height: 400});
	$('#xmpToggle').click(()=>{
		setPanelVisible('#xmpPanel', !isPanelVisible('#xmpPanel'));
	});
	$('#imagePanel').dialog({width: 240, height: 160});
	$('#imageToggle').click(()=>{
		setPanelVisible('#imagePanel', !isPanelVisible('#imagePanel'));
	});
	$('#fontsPanel').dialog({width: 320, height: 400});
	$('#fontsToggle').click(()=>{
		setPanelVisible('#fontsPanel', !isPanelVisible('#fontsPanel'));
	});
	$('#settingsPanel').dialog({width: 480, height: 160});
	$('#settingsToggle').click(()=>{
		setPanelVisible('#settingsPanel', !isPanelVisible('#settingsPanel'));
	});

}
	

function UpdateDocumentTitle(filePath)
{
	let isNormalized = false;
	if ( undefined != ctx.xmp && undefined != ctx.xmp.artwork && ctx.xmp.artwork.isNormalized)
	{
		isNormalized = ctx.xmp.artwork.isNormalized;	
	}
	let fileName = filePath.substr(filePath.lastIndexOf('/')+1);
	$('#documentFileName').text(fileName);

	if (isNormalized)
	{
		fileName += ' (Normalized)';
	}
	$('#documentTitle').text(fileName);
}

function UpdateIndexUI(num, indexSelector, totalSelector)
{
	$(indexSelector).prop('disabled', 0==num);
	$(totalSelector).text('/ ' + num);

	let max = num;
	let min = Math.min(max, 1);
	$(indexSelector).prop('min', min);
	$(indexSelector).prop('max', max);
	$(indexSelector).val(min);
}

function UpdateBarCodeIndexUI(numBarCodes)
{
	UpdateIndexUI(numBarCodes, '#barCodeIndex', '#barCodeTotal');
	return;
}

function UpdateTextIndexUI(numTexts)
{
	UpdateIndexUI(numTexts, '#textIndex', '#textTotal');
}

function getIndex(selector)
{
	let indexText = $(selector).val();
	let index = parseInt(indexText);
	--index;
	index = Math.max(0, index);
	return index;
}

function getTextIndex () 
{
	return getIndex('#textIndex');
}

function getBarCodeIndex () {
	return getIndex('#barCodeIndex');
}

function getImageIndex () {
	return getIndex('#imageIndex');
}

function UpdateImageIndexUI(numImages)
{
	UpdateIndexUI(numImages, '#imageIndex', '#imageTotal');
}

function UpdateTextContentUI()
{
	$('#fontReady').css('display', 'none');
	$('#missingFont').css('display', 'none');
	$('#activateFont').css('display', 'none');
	let checkFontAvailability = async (text) => {
		let pm = gNDL.getFontURL(text.fontName, ctx.settings.useGoogleFonts, ctx.settings.useSystemFonts);
		pm.then((rawURL) => {
			if ( undefined == rawURL )
			{
				$('#fontReady').css('display', text.hasSystemFont ? 'inline-block' : 'none');
				$('#missingFont').css('display', text.hasSystemFont ? 'none' : 'inline-block');
				$('#activateFont').css('display', 'none');
				// missing font handler
				$('#fontReady').off('click').on('click', ()=>{
					toastMessage( text.fontName + ' is a system font');
				});
				$('#missingFont').off('click').on('click', ()=>{
					toastMessage( 'Missing font: ' + text.fontName + ' is a subset font');
				});
			} else {
				let isSystemFont = rawURL.startsWith('file://');
				
				let activatedIcon = isSystemFont ? 'images/logo_sysfont_activated.png' : 'images/logo_googlefont_activated.png';
				let deactivatedIcon = isSystemFont ? 'images/logo_sysfont_deactivated.png' : 'images/logo_googlefont_deactivated.png';
				let icon = text.hasSystemFont ? activatedIcon : deactivatedIcon;
				$('#activateFont').attr('src', icon);
				$('#activateFont').css('display', 'inline-block');
				// google font handler
				let clickHandler = text.hasSystemFont ? 
					()=>{ 
						toastMessage( text.fontName + ' is already activated');
					} 
					: ()=>{
						let url = rawURL;
						let fontSourceType = isSystemFont ? "System" : "Google";
						// preprocess URL
						if ( isSystemFont )
						{
							// system font
							url = rawURL.replace('file://', ctx.settings.systemFontsBaseURL);	
						} else {
							// handle google font protocol
							if ( location.protocol == 'https:') 
							{
								url = rawURL.replace('http', 'https');
							}
						}
						toastMessage('Downloading ' + fontSourceType + ' font ' + text.fontName);
						let fetch = fetchBinaryAsU8Array(url);
						fetch
						.then( (u8Array) =>{
							let fileName = url.substr(url.lastIndexOf('/')+1);
							let fullPath = '/' + fileName;
							writeU8ArrayAsFile(u8Array, fullPath);
							ProcessFont(fullPath);
							toastMessage( fontSourceType + ' font ' + text.fontName + ' activated');
						}
						, (error) => {
							toastMessage('Unable to download ' + fontSourceType + ' font ' + text.fontName );
							console.log(error);	
						})
						.catch( (error) => {
							toastMessage('Unable to download ' + fontSourceType + ' font ' + text.fontName);
							console.log(error);	
						});
						
					};
				$('#activateFont').off('click').on('click', clickHandler );
				
			}	
		})
		.catch((error)=>{
			toastMessage('Error downloading font: ' + text.fontName);
		});
	};
	let index = getTextIndex();
	if ( index < ctx.texts.length)
	{
		let t = ctx.texts[index];
		$('#currentText').val(t.text);
		ctx.lastSetText = t.text;
		$('#fontName').text(t.fontName);
		$('#fontName').attr('postscriptName', t.fontName);
		$('#fontName').attr('fontFamily', t.fontFamilyName);
		$('#fontName').attr('fontStyle', t.fontStyleName);
		$('#fontSize').val(t.fontSize.toFixed(3));
		$('#fixReflow').css('display', t.hasRecognitionError ? 'block' : 'none');
		$('#currentText').prop('disabled', !t.hasSystemFont);
		checkFontAvailability(t);
	} else {
		$('#currentText').val('');
		$('#fontName').text('');
		$('#fontName').attr('fontFamily', '');
		$('#fontName').attr('fontStyle', '');
		$('#fontSize').val(0);
		$('#fixReflow').css('display', 'none');
		$('#missingFont').css('display', 'none');
		$('#activateFont').css('display', 'none');
	}
}

function GetPPI(image)
{
	const dpi = 72.0;
	let xppi = image.width * dpi / image.boundingBox.width;
	let yppi = image.height * dpi / image.boundingBox.height;
	let ppi = Math.floor(Math.min(xppi, yppi));
	return ppi;
}

function UpdateImageContentUI()
{
	let index = getImageIndex();
	let pxInfo = '';
	let ptInfo = '';
	let ppiInfo = '';
	let colorSpaceInfo = '';
	if ( index < ctx.images.length )
	{
		let image = ctx.images[index];
		
		pxInfo = '' + image.width + ' x ' + image.height + ' pixels';
		ptInfo = '' + image.boundingBox.width.toFixed(2) + ' x ' + image.boundingBox.height.toFixed(2) + ' pt';
		let ppi = GetPPI(image);
		$('#lowResolution').css('display', ppi<300 ? 'inline-block' : 'none');	
		ppiInfo = ppi + ' ppi';
		colorSpaceInfo = image.colorSpace;
		$('#rgbColorSpace').css('display', 'RGB'===image.colorSpace ? 'inline-block' : 'none');	
	}
	$('#imagePxInfo').text(pxInfo);
	$('#imagePtInfo').text(ptInfo);
	$('#imagePPI').text(ppiInfo);
	$('#imageColorSpace').text(colorSpaceInfo);
}

function UpdateXMPUI(xmp)
{
	$('#xmpText').text(JSON.stringify(xmp, null, 4));
}

function UpdateFontsUI()
{
	const tag = '<div></div>';
	$('#fontList').text(JSON.stringify(ctx.fonts));

	$('#fontList').empty();
	let wrapper = $(tag).attr('id', 'fontList_wrapper');
	$('#fontList').append(wrapper);
	for ( let i=0; i<ctx.fonts.length; ++i)
	{
		let font = ctx.fonts[i];
		let fontName = $(tag).text(font.postscriptName);
		let fontStatus = $(tag).text('loaded');
		let spacer = $(tag);
		$('#fontList_wrapper').append(fontName).append(fontStatus).append(spacer);
	}
}

function ArrayToImageData(array, rasterSize)
{
	// create ImageData instance
	let clamped = new Uint8ClampedArray(array.buffer, array.byteOffset, array.byteLength);
	let imageData = new ImageData(clamped, rasterSize.width, rasterSize.height);
	return imageData;
}

function UpdateCanvasPixelRatio()
{
	let canvas = document.getElementById('canvas');
	canvas.style.width = canvas.width / ctx.settings.devicePixelRatio;
	canvas.style.height = canvas.height / ctx.settings.devicePixelRatio;
}

function ResizeCanvas(rasterSize)
{
	let canvas = document.getElementById('canvas');
	canvas.width = rasterSize.width;
	canvas.height = rasterSize.height;
	UpdateCanvasPixelRatio();
}

function FlushCanvas()
{
	ResizeCanvas({width:595, height:842});
	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function Repaint()
{
	//const kHighlightColor = '#444B53';
	const kHighlightColor = '#A6C044';
	let kHighlightWidth = 2.0 * ctx.settings.devicePixelRatio;
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

	let makeToViewPoint = (pageBox, viewSize)=> {
		let sX = viewSize.width/pageBox.width;
		let sY = viewSize.height/pageBox.height;
		let toViewPointFunc = (point) => {
			let x = point.x - pageBox.x;
			let y = pageBox.y + pageBox.height - ( point.y );
			x *= sX;
			y *= sY;
			let viewPoint = {
				'x' : x
				,'y' : y
			};
			return viewPoint;
		};
		return toViewPointFunc;
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

	let toViewRect; // will be created later
	let toViewPoint; // will be created later
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

			// draw boundingBox
			const drawBox = false;
			const drawShape = true;
			if (drawBox)
			{
				ctx.beginPath();
				let r = toViewRect(t.box);
				ctx.strokeStyle = kHighlightColor;
				ctx.lineWidth = kHighlightWidth;
				ctx.rect(r.x, r.y, r.width, r.height);
				ctx.stroke();
			}

			// draw shape
			if (drawShape)
			{
				ctx.strokeStyle = kHighlightColor;
				ctx.lineWidth = kHighlightWidth;
				ctx.beginPath();
				for ( let j = 0; j<t.shape.length; ++j)
				{
					let path = t.shape[j];
					for ( let k = 0; k<path.length; ++k)
					{
						let cmd = path[k];
						if ( cmd.cmd === 'm' )
						{
							let p3 = toViewPoint(cmd.p3);	
							ctx.moveTo(p3.x, p3.y);
						} else if ( cmd.cmd === 'c' )
						{
							let p1 = toViewPoint(cmd.p1);
							let p2 = toViewPoint(cmd.p2);
							let p3 = toViewPoint(cmd.p3);
							ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
						} else if ( cmd.cmd === 'l' )
						{
							let p3 = toViewPoint(cmd.p3);
							ctx.lineTo(p3.x, p3.y);
						}
					}
					ctx.stroke();
				}
			}
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
			ctx.strokeStyle = kHighlightColor;
			ctx.lineWidth = kHighlightWidth;
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
			ctx.strokeStyle = kHighlightColor;
			ctx.lineWidth = kHighlightWidth;
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
	toViewPoint = makeToViewPoint(pageBox, viewSize);
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
	ResizeCanvas(ctx.previewRasterSize);
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

function loadCtx_fonts()
{
	let jsonStr = viewer().getSystemFontsAsJson();
	try {
		ctx.fonts = JSON.parse( jsonStr );
	} catch (err) {}
}

function loadCtx()
{
	loadCtx_preview();
	loadCtx_texts();
	// optimization: for intensive text editing, no need to reload otherthings
	if ( undefined == ctx.isEditingText || !ctx.isEditingText )
	{
		loadCtx_xmp();
		loadCtx_barCodes();
		loadCtx_images();
		loadCtx_fonts();
	}
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

function toastMessage(msg)
{
	$('#toast').text(msg).addClass('show');
	setTimeout(()=>{
		$('#toast').removeClass('show');
	}, 3000);
}

function ProcessPDF(filePath)
{
	console.log('Begin ProcessPDF ' + filePath);
	let loaded = viewer().loadPDF(filePath);
	viewer().setDPI( ctx.settings.devicePixelRatio * ctx.settings.dpi);
	console.assert(loaded);
	let json = viewer().getMetadata();
	console.log(json);
	
	loadCtx();
	// update UI
	ResizeCanvas(ctx.previewRasterSize);
	UpdateDocumentTitle(filePath);
	UpdateBarCodeIndexUI(ctx.barCodes.length);
	UpdateTextIndexUI(ctx.texts.length);
	UpdateImageIndexUI(ctx.images.length);
	UpdateTextContentUI();
	UpdateImageContentUI();
	UpdateXMPUI(ctx.xmp);
	UpdateFontsUI();
	
	// repaint
	Repaint();
	console.log('End ProcessPDF');

	hideBusy();
}

function ProcessFont(filePath)
{
	viewer().loadFont(filePath);
	loadCtx();
	UpdateTextContentUI();
	UpdateFontsUI();
	Repaint();
}

function isFileNamePDF(filePath)
{
	return filePath.endsWith('.pdf') || filePath.endsWith('.ai');
}

function isFileNameFont(filePath)
{
	return ( filePath.endsWith('.woff') || filePath.endsWith('.woff2') || filePath.endsWith('.ttf') || filePath.endsWith('.otf') || filePath.endsWith('.eot') || filePath.endsWith('.ttc') );
}

function ProcessFile(filePath)
{
	if (isFileNamePDF(filePath))
	{
		FlushCanvas();
		showBusy();
		setTimeout(()=>{ProcessPDF(filePath);}, 100);
	} else {
		toastMessage('Unsupported file format: ' + filePath);
	}
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
			ProcessFile(Initializer.sampleFile);
		}
	}
};

function writeU8ArrayAsFile(u8Array, filePath)
{
	let fs = gNDL.fs();
	let stream = fs.open(filePath, 'w+');
	fs.write(stream, u8Array, 0, u8Array.length, 0);
	fs.close(stream);

	console.log('written file: ' + filePath);
	let stat = fs.stat(filePath);
	console.log(stat);
	if (stat.size == 0) {
		console.warn('Empty file: ' + filePath + ' ' + stat.size + ' bytes?');
	}
}

// mount the file object into the folder
function mountBlob(fileObject, inFileName, onFileMounted) {
	console.assert(fileObject instanceof Blob )
    let reader = new FileReader();
    reader.onload = function () {
		let filePath = '/' + inFileName;

        let data = new Uint8Array(reader.result);
        try {
			writeU8ArrayAsFile(data, filePath);
			/*
			let dummy = filePath;
			let fs = gNDL.fs();
			let stream = fs.open(dummy, 'w+');
			fs.write(stream, data, 0, data.length, 0);
			fs.close(stream);
			*/

        } catch (err) {
            console.warn('Exception in mountBlob: ' + filePath + ' ' + err.message);
        }

        onFileMounted(filePath);
    }
    reader.readAsArrayBuffer(fileObject);
}

function mountFile(fileObject) {
	console.assert(fileObject instanceof File )
	let filename = fileObject.name;
	return new Promise((resolve, reject) => {
		mountBlob(fileObject, filename, resolve);
	});
}

async function fetchBinaryAsU8Array(url) 
{
	return new Promise((resolve, reject) => 
	{
		var xhr = new XMLHttpRequest();
		xhr.responseType = "arraybuffer";
		xhr.open("GET", url, true);
		xhr.onload = function (xhrEvent) 
		{
			if (this.status === 404) {
				reject(xhrEvent);
			}
			let arrayBuffer = xhr.response; 
			// if you want to access the bytes:
			let byteArray = new Uint8Array(arrayBuffer);
			resolve(byteArray);
		};
		xhr.onerror = (error) => {
			reject(error);
		};
		xhr.send();
	});
}

async function dropHandlerFont(ev) {
	console.log('File(s) dropped');

	// Prevent default behavior (Prevent file from being opened)
	ev.preventDefault();

	let files = ev.dataTransfer.files;
	let count = 0;
	let installedFontName = '';
	for (let i = 0; i < files.length; ++i) 
	{
		let file = files[i];
		let filePath = await mountFile(file);
		if (isFileNameFont(filePath))
		{
			ProcessFont(filePath);
			installedFontName = filePath;
			++count;
		} else {
			toastMessage('Unsupported file format: ' + filePath);
		}
	}
	if (count == 1 )
	{
		toastMessage('Font installed: ' + installedFontName);
	} else if (count >1)
	{
		toastMessage(count + ' fonts installed');
	}
}

async function dropHandler(ev) {
	console.log('File(s) dropped');

	// Prevent default behavior (Prevent file from being opened)
	ev.preventDefault();

	let files = ev.dataTransfer.files;
	for (let i = 0; i < files.length; ++i) 
	{
		let file = files[i];
		let filename = await mountFile(file);
		ProcessFile(filename);
		// we only process one PDF
		if (isFileNamePDF(filename))
			break;
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
	let pdfURL = 'resources/TextCyanMagenta.pdf';
	let response = await fetch(pdfURL);
	let blob = await response.blob();
	
	let fileName = pdfURL.substr(pdfURL.lastIndexOf('/')+1);
	mountBlob(blob, fileName, (filename)=>{
		console.log('mounted as ' + filename);
		Initializer.sampleFile = filename;
		Initializer.isSampleReady = true;
	});
}

async function dumpSystemFonts()
{
	let jsonStr = viewer().getSystemFontsAsJson();
	try {
		let fontInfos = JSON.parse(jsonStr);
		console.log(JSON.stringify(fontInfos, null, 4));
	} catch (err)
	{
		console.warn('dumpSystemFonts(): Unable to parse JSON: ' + jsonStr);
	}
}
async function start()
{
	let ndl = new NDL();
	const initParams = {
		resources : 'NDL/Resources.zip'
		, fonts : [
			'resources/myfonts/Alice-Regular.woff'
			, 'resources/myfonts/Glory-Regular.woff'
		]
	};
	await ndl.initialize(initParams);
	await ndl.loadGoogleFonts('resources/googlefonts.json');
	await ndl.loadSystemFonts('resources/localfonts.json');
	// will not work due to CORS issue
	// await ndl.loadOtherFonts('resources/otherfonts.json');
	//await ndl.loadSystemFonts('resources/emptylocalfonts.json');
	gNDL = ndl;
	await dumpSystemFonts();
	await loadSamplePDF();
	Initializer.isModuleReady = true;
	Initializer.isResourceReady = true;
	await loadSamplePDF();
	Initializer.tryInit();
}

$(()=> {
	FlushCanvas();
	showBusy();
	UI();
	start();
	let panelIDs = ['#textPanel', '#barCodePanel', '#xmpPanel', '#imagePanel', '#fontsPanel', '#settingsPanel'];
	for ( let i=0; i<panelIDs.length; ++i)
	{
		let selector=panelIDs[i];
		$(selector).dialog();
		$(selector).css("visibility", "visible");
		$(selector).dialog('close');
	}

});
