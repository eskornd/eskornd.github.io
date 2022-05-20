import {NDL} from './NDL/NDL.js';

// color for highlight
const kOrange = '#ff8c00';

var gNDL;
function mountBlob(fileObject, inFileName, onFileMounted) 
{
	console.assert(fileObject instanceof Blob )
    var reader = new FileReader();
    reader.onload = function () {
		let filePath = '/' + inFileName;

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

async function blobToUint8Array(blob)
{
	return new Promise((resolve, reject) => {
		console.assert(blob instanceof Blob )
		var reader = new FileReader();
		reader.onload = () =>{
			let data = new Uint8Array(reader.result);
			resolve(data);
		}
		reader.readAsArrayBuffer(blob);
	});
}

function getDroppedFile(ev)
{
	let file = undefined;
	ev.preventDefault();
	if (ev.dataTransfer.items) {
		for (var i = 0; i < ev.dataTransfer.items.length; i++) 
		{
			if (ev.dataTransfer.items[i].kind === 'file') 
			{
				let files = ev.dataTransfer.files;
				file = files.item(i);
				break; // handle one only
			}
		}
	} 
	return file;
}
async function onFileDropped(ev)
{
	let file = getDroppedFile(ev);
	console.assert( undefined != file, 'must have dropped file');

	let data = await blobToUint8Array(file);
	let filePath = '/' + file.name;
	gNDL.writeToFile(data, filePath);

	// restart animation
	$('#mp_output').css('display', 'none');
	setTimeout(()=>{
		$('#mp_output').css('display', 'block');
	}, 100);

	InspectPDF(filePath);

	// restart animation
	$('#mp_progressContainer').css('display', 'none');
	setTimeout(()=>{
		$('#mp_progressContainer').css('display', 'block');
	}, 500);
}

function toastMessage(msg)
{
	$('#toast').text(msg).addClass('show');
	setTimeout(()=>{
		$('#toast').removeClass('show');
	}, 2000);
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
	return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function RenderPreview(viewer)
{
	$('#previewImage').attr('src', '');	
	$('#previewImage').css('display', 'none');	
	let render = async () => {
		let base64 = viewer.getPreviewPNGBase64();
		let src = 'data:image/png;base64,' + base64;
		$('#previewImage').attr('src', src);	
		$('#previewImage').css('display', 'inline-block');	
	};

	setTimeout(()=>{
		render();	
	}, 200);
}

function RenderDocInfo(artwork)
{
	$('#mp_docinfo').empty();

	const tag = '<div></div>';
	let header = $(tag).addClass('mp_header').text('Document Info');
	let wrapper = $(tag).attr('id', 'mp_docinfo_wrapper');
	$('#mp_docinfo').append(header).append(wrapper);
	let title = $(tag).text(artwork.title);
	let numPages = $(tag).text(artwork.numPages);
	const toSizeString = (width, height) => {
		return width.toFixed(2) + ' x ' + height.toFixed(2);
	};
	let wxh = toSizeString(artwork.pageSize.width, artwork.pageSize.height);
	let pageSize = $(tag).text(wxh + ' pt');
	// Page boxes
	let trimBox = artwork.pageBoxes['trimBox'];
	let pageBoxTypes = ['mediaBox', 'trimBox', 'cropBox', 'bleedBox', 'artBox'];
	let pageBoxDisplayName = {
		'mediaBox' : 'Media Box'
		, 'trimBox' : 'Trim Box'
		, 'cropBox' : 'Crop Box'
		, 'bleedBox' : 'Bleed Box'
		, 'artBox' : 'Art Box'
	};
	const kMinBleed = 9; // .125 inch or 9pt
	let pageBoxGrids = [];
	pageBoxTypes.forEach((type)=>
	{
		let box = artwork.pageBoxes[type];
		if ( undefined != box )
		{
			// bleed check
			let notEnoughBleed = false;
			if ( 'bleedBox' == type )
			{
				let bleedBox = artwork.pageBoxes[type];
				notEnoughBleed = ( bleedBox.x > (trimBox.x - kMinBleed)
					|| (bleedBox.x + bleedBox.width ) < (trimBox.x + trimBox.width + kMinBleed)
					|| bleedBox.y > (trimBox.y - kMinBleed)
					|| (bleedBox.y + bleedBox.height) < (trimBox.y + trimBox.height + kMinBleed) );
			}

			pageBoxGrids.push($(tag).text(pageBoxDisplayName[type] +':'));
			if ( notEnoughBleed )
			{
				const id = type + '_value';
				pageBoxGrids.push($(tag).text(toSizeString(box.width, box.height) + ' pt').css('color', kOrange).attr('title', 'Not enough bleed').attr('id', id).css('cursor', 'pointer'));
				setTimeout(()=>{
					$('#'+id).on('click', ()=>{
						toastMessage('Not enough bleed');});
				}, 0);
			} else {
				pageBoxGrids.push($(tag).text(toSizeString(box.width, box.height) + ' pt'));
			}
			pageBoxGrids.push($(tag));
		}
	});
	

	let isNormalized = $(tag).text('' + artwork.isNormalized);
	let isTrapped = $(tag).text(artwork.isTrapped);
	let distortion = $(tag).text('H: ' + (artwork.distortion.horizontal*100.0).toFixed(2) + '%' + ', V: ' + (artwork.distortion.vertical* 100.0).toFixed(2));
	let profileName = $(tag).text(artwork.profileName);
	let creator = $(tag).text(artwork.creator);
	let producer = $(tag).text(artwork.producer);
	
	let spacer = $(tag);
	
	let w = $('#mp_docinfo_wrapper');
	w
		.append('Title:').append(title).append($(tag))
		.append('Number of Pages:').append(numPages).append($(tag))
		.append('Page Size:').append(pageSize).append($(tag));
	
	pageBoxGrids.forEach((grid)=>{ w.append(grid);});
	w	
		.append('Is Normalized:').append(isNormalized).append($(tag))
		.append('Is Trapped:').append(isTrapped).append($(tag))
		.append('Distortion:').append(distortion).append($(tag))
		.append('Profile:').append(profileName).append($(tag))
		.append('Creator:').append(creator).append($(tag))
		.append('Producer:').append(producer).append($(tag));
	
}

function RenderInks(inks)
{
	$('#mp_inks').empty();
	const tag = '<div></div>';

	let toHexColor = (rgb) => {
		return rgbToHex(
			parseInt(255*rgb[0])
			, parseInt(255*rgb[1])
			, parseInt(255*rgb[2])
		);
	};

	let header = $(tag).addClass('mp_header').text('Inks');
	let wrapper = $(tag).attr('id', 'mp_inks_wrapper');
	$('#mp_inks').append(header).append(wrapper);
	for ( let i=0; i<inks.length; ++i)
	{
		let ink = inks[i];
		let inkID = 'mp_ink_' + i;
		let colorPatch = $(tag).css('background-color', toHexColor(ink.previewColor)).css('width', '16px').css('height', '16px').addClass('colorPatch');
	
		let inkName = $(tag).addClass('mp_ink_grid').text(ink.name);
		let inkBook = $(tag).addClass('mp_ink_grid').text(ink.inkBookName);
		let inkType = $(tag).addClass('mp_ink_grid').text(ink.type);
		let spacer = $(tag).addClass('mp_ink_grid');
		$('#mp_inks_wrapper').append(colorPatch).append(inkName).append(inkBook).append(inkType).append(spacer);
		
	}		
}

function RenderImages(images)
{
	$('#mp_images').empty();

	const tag = '<div></div>';
	let header = $(tag).addClass('mp_header').text('Images');
	let wrapper = $(tag).attr('id', 'mp_images_wrapper');
	$('#mp_images').append(header).append(wrapper);
	
	let hasLowRes = false;
	let hasRGB = false;
	for ( let i=0; i<images.length; ++i)
	{
		let image = images[i];
		let name = $(tag).text('Image ' + (1+i));
		let size = $(tag).text('' + image.width + ' x ' + image.height);
		let xppi = Math.floor(image.width * 72.0 / image.boundingBox.width);
		let yppi = Math.floor(image.height * 72.0 / image.boundingBox.height);
		let minppi = Math.min(xppi, yppi);
		let ppi = $(tag).text(minppi + ' ppi');	
		if (minppi<300)
		{
			const id = 'image_ppi_' + i;
			ppi.css('color', kOrange).attr('title', 'Image resolution less than 300 ppi').attr('id', id).css('cursor', 'pointer');
			hasLowRes = true;
			setTimeout( () => {
				$('#'+id).on('click', ()=>{
					toastMessage('Image resolution less than 300 ppi');
				});
			}, 0);
		}
		let colorSpace = $(tag).text(image.colorSpace);
		if (image.colorSpace == 'RGB' )
		{
			const id = 'image_colorSpace_' + i;
			colorSpace.css('color', kOrange).attr('title', 'Image in RGB').attr('id', id).css('cursor', 'pointer');
			setTimeout( () => {
				$('#'+id).on('click', ()=>{
					toastMessage('Image in RGB');
				});
			}, 0);
			hasRGB = true;
		}
	
		//let channels = $(tag).text('' + image.numChannels + ' ch');
		let spacer = $(tag);
		$('#mp_images_wrapper').append(name).append(size).append(ppi).append(colorSpace).append(spacer);
	}
	
	if ( hasLowRes || hasRGB )
	{
		let tooltip = '';
		if (hasLowRes)
		{
			tooltip += 'Image resolution less than 300ppi';
		}
		if (hasRGB)
		{
			tooltip += '\nImage in RGB';
		}
		let warn = $('<img/>').attr('src', 'images/logo_warning.png').css('width', '14px').css('height', '14px').attr('title', tooltip);

		header.append(warn);
	}
}

function RenderBarcodes(barcodes)
{
	$('#mp_barcodes').empty();

	const tag = '<div></div>';
	let header = $(tag).addClass('mp_header').text('Barcodes');
	let wrapper = $(tag).attr('id', 'mp_barcodes_wrapper');
	$('#mp_barcodes').append(header).append(wrapper);

	for ( let i=0; i<barcodes.length; ++i)
	{
		let barcode = barcodes[i];
		let type = $(tag).text(barcode.type);
		let code = $(tag).text(barcode.code);
		let spacer = $(tag);
		$('#mp_barcodes_wrapper').append(type).append(code).append(spacer);	
	}
}

function RenderFonts(fonts)
{
	$('#mp_fonts').empty();

	const tag = '<div></div>';
	let header = $(tag).addClass('mp_header').text('Fonts');
	let wrapper = $(tag).attr('id', 'mp_fonts_wrapper');
	$('#mp_fonts').append(header).append(wrapper);
	for ( let i=0; i<fonts.length; ++i)
	{
		let font = fonts[i];
		let fontName = $(tag).text(font.postscriptName);
		let spacer = $(tag);
		$('#mp_fonts_wrapper').append(fontName).append(spacer);
	}
}

function RenderLayers(layers)
{
	$('#mp_layers').empty();

	const tag = '<div></div>';
	let header = $(tag).addClass('mp_header').text('Layers');
	let wrapper = $(tag).attr('id', 'mp_layers_wrapper');
	$('#mp_layers').append(header).append(wrapper);
	for ( let i=0; i<layers.length; ++i)
	{
		let layer = layers[i];
		let layerName = $(tag).text(layer.name);
		let processingStepGroup = $(tag).text(layer.processingStepGroup);
		let processingStepType = $(tag).text(layer.processingStepType);
		let spacer = $(tag);
		$('#mp_layers_wrapper').append(layerName).append(processingStepGroup).append(processingStepType).append(spacer);
	}
}

function InspectPDF(filePath)
{
	let ndl = gNDL;
	let viewer = gNDL.viewer();
	let loaded = viewer.loadPDF(filePath);
	viewer.setDPI(2.0*72.0);
	let jsonStr = viewer.getMetadata();
	let xmp = undefined;
	try {
		xmp = JSON.parse(jsonStr);
	} catch (err) {
	}

	console.log(JSON.stringify(xmp, null, 4));
	RenderDocInfo(xmp.artwork);
	RenderInks(xmp.inks);
	RenderImages(xmp.images);
	RenderBarcodes(xmp.barcodes);
	RenderFonts(xmp.fonts);
	RenderLayers(xmp.layers);
	RenderPreview(viewer);

}

function initDropzone(id, dropHandler)
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
			dropHandler(e);
			});
}

async function init()
{
	console.log('Creating NDL');
	let ndl = new NDL();
	const initParams = {
		resources : 'NDL/Resources.zip'
		, fonts : []
	};
	await ndl.initialize(initParams);
	gNDL = ndl;
	let viewer = ndl.viewer();
	console.log( 'about(): ' + viewer.about());
	
	initDropzone('mp_dropzone', onFileDropped);
	$('#previewImage').on('click', ()=>{
		$('#largePreview').attr('src', '');	
		$('#largePreview').css('display', 'none');	
		let render = async () => {
			let base64 = viewer.getPreviewPNGBase64();
			let src = 'data:image/png;base64,' + base64;
			$('#largePreview').attr('src', src);	
			$('#largePreview').css('display', 'inline-block');	
		};

		setTimeout(()=>{
			render();	
		}, 200);
		let dlg = document.getElementById('previewDialog');
		dlg.showModal();
	});
}

$(()=>{ 
	init();
});
