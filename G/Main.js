import {GlyphRender} from './GlyphRender.js'

var gGlyphModule;

function ToLinkHtml(text, url)
{
    str = '<a href="' + url + '">'
    if (text==="")
    {
        str += url;
    } else {
        str += text;
    }
    str +='</a>';
    return str;
}

function validateGlyphModule(glyphModule)
{
	const fontFile = 'MacondoSwashCaps-Regular.ttf';
	try{
		console.log('GlyphModule Version: ', glyphModule.version());
		let faces = glyphModule.GIWrapper.faces(fontFile);
		for (let i = 0; i < faces.size(); i++) {
			console.log('['+i+']', faces.get(i));
		}
		let gi = new glyphModule.GIWrapper();
		let ret = gi.loadFace(fontFile, 0);
		
		let faceInfo = gi.faceInfo();
		console.log('FaceInfo ' + JSON.stringify(faceInfo));

	} catch (err) {
		console.error(err);
		return false;
	}

	return true;
}

async function LoadModule()
{
	console.log('LoadModule: initializing...');
	try
	{
		let module = await GlyphModule();
		console.log('GlyphModule initialized');
		return module;
	} catch ( err ) {
		console.error('Unable to initialize Module: ' + err );
	}
	return undefined;
}

function FaceInfoToHTML(info)
{
	let rowText = (label, text)=>{
		let row = '<tr><td nowrap>' + label + '</td><td>' + text + '</td></tr>';
		return row;
	};
    let str = '<table id="font_info_table">';
	str += rowText('Number of Glyphs:' , info.numGlyphs);
	str += rowText('Postscript Name: ', info.postscriptName);
	str += rowText('Family Name: ', info.familyName);
	str += rowText('Style Name: ', info.styleName);
	str += rowText('Full Name: ', info.fullName);
	str += rowText('Version: ', info.version);
	str += rowText('Copyright: ', info.copyright);
	str += rowText('Trademark: ', info.trademark);
	str += rowText('Manufacturer: ', info.manufacturer);
	str += rowText('Designer: ', info.designer);
	str += rowText('Description: ', info.description);
	str += rowText('Designer URL: ', info.designerURL);
	str += rowText('Vendor URL: ', info.vendorURL);
	str += rowText('License: ', info.license);
	str += rowText('License URL: ', info.licenseURL);
    str += '</table>';
    return str;
}

function FacePropertiesToHTML(props)
{
	let rowText = (label, text)=>{
		let row = '<tr><td nowrap>' + label + '</td><td>' + text + '</td></tr>';
		return row;
	};
    let str = '<table id="font_info_table">';
	str += rowText('Units per EM:', props.units_per_EM);
	str += rowText('Ascender:', props.ascender);
	str += rowText('Descender:', props.descender);
	str += rowText('Height:', props.height);
	str += rowText('Max advance width:', props.max_advance_width);
	str += rowText('Max advance height:', props.max_advance_height);
	str += rowText('Underline position:', props.underline_position);
	str += rowText('Underline thickness:', props.underline_thickness);
    str += '</table>';
    return str;
}

function MakeGIWrapper(fontFile, index)
{
	let gi = new gGlyphModule.GIWrapper();
	let isLoaded = gi.loadFace(fontFile, index);
	return isLoaded ? gi : undefined;
}

function LoadFont()
{
	const fontFile = 'MacondoSwashCaps-Regular.ttf';
	let gi = MakeGIWrapper(fontFile, 0);
	let render = new GlyphRender(gi);
	render.setGridSize(144.0);
	
	//Font Info	
	$('#short_info').html(gi.faceInfo().postscriptName);
    $('#font_info').html(FaceInfoToHTML(gi.faceInfo()));
    $('#font_props').html(FacePropertiesToHTML(gi.faceProperties()));

	//let loaded = render.loadGlyphs();
	let elems = render.glyphElements();
	console.log('render loaded: ' + elems.length);
	// fill GLyphs
    let glyphs_div = $('#all_glyphs');
    glyphs_div.html('');
	let html = '';
	for ( let i=10; i<elems.length; ++i)
	{
		html += elems[i];
		const elem = elems[i];
		glyphs_div.append(elem);
	}
		
}

async function main()
{
	gGlyphModule = await LoadModule();
	//validateGlyphModule(gGlyphModule);	
	LoadFont();
}

$(()=>{
	main();
});
