import {GlyphRender} from './GlyphRender.js'

var gGlyphModule;
var gRender;
var gWrapper;

function tagToNumber(char1, char2, char3, char4) 
{
    const b1 = char1.charCodeAt(0);
    const b2 = char2.charCodeAt(0);
    const b3 = char3.charCodeAt(0);
    const b4 = char4.charCodeAt(0);

    return (b1 << 24) | (b2 << 16) | (b3 << 8) | b4;
}

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
	str += rowText('Sample Text: ', info.sampleText);
	str += rowText('Designed For Languages (raw): ', info.designedLanguagesRaw);
	str += rowText('Supported Languages (raw): ', info.supportedLanguagesRaw);
	str += rowText('Driver Clazz Name: ', info.driverClazzName);
	str += rowText('Possible Main Language(experimental): ', info.possibleMainLanguage);
    str += '</table>';
    return str;
}


function SfntTablesHTML(gi)
{
	let rowText = (label, text)=>{
		let row = '<tr><td nowrap>' + label + '</td><td>' + text + '</td></tr>';
		return row;
	};
    let str = '<table id="sfnt_table_list">';
	str += rowText('Required Tables:' , '');
	str += rowText('cmap' , gi.hasSfntTable(tagToNumber('c', 'm', 'a', 'p')));
	str += rowText('glyf' , gi.hasSfntTable(tagToNumber('g', 'l', 'y', 'f')));
	str += rowText('head' , gi.hasSfntTable(tagToNumber('h', 'e', 'a', 'd')));
	str += rowText('hhea' , gi.hasSfntTable(tagToNumber('h', 'h', 'e', 'a')));
	str += rowText('hmtx' , gi.hasSfntTable(tagToNumber('h', 'm', 't', 'x')));
	str += rowText('loca' , gi.hasSfntTable(tagToNumber('l', 'o', 'c', 'a')));
	str += rowText('maxp' , gi.hasSfntTable(tagToNumber('m', 'a', 'x', 'p')));
	str += rowText('name' , gi.hasSfntTable(tagToNumber('n', 'a', 'm', 'e')));
	str += rowText('post' , gi.hasSfntTable(tagToNumber('p', 'o', 's', 't')));
	str += rowText('Optional Tables:' , '');
	str += rowText('kern' , gi.hasSfntTable(tagToNumber('k', 'e', 'r', 'n')));
	str += rowText('GPOS' , gi.hasSfntTable(tagToNumber('G', 'P', 'O', 'S')));
	str += rowText('GSUB' , gi.hasSfntTable(tagToNumber('G', 'S', 'U', 'B')));
	str += rowText('FOND' , gi.hasSfntTable(tagToNumber('F', 'O', 'N', 'D')));
	str += rowText('sbix' , gi.hasSfntTable(tagToNumber('s', 'b', 'i', 'x')));
	str += rowText('CBLC' , gi.hasSfntTable(tagToNumber('C', 'B', 'L', 'C')));
	str += rowText('CBDT' , gi.hasSfntTable(tagToNumber('C', 'B', 'D', 'T')));
	str += rowText('CPAL' , gi.hasSfntTable(tagToNumber('C', 'P', 'A', 'L')));
	str += rowText('SVG ' , gi.hasSfntTable(tagToNumber('S', 'V', 'G', ' ')));
	str += rowText('COLR' , gi.hasSfntTable(tagToNumber('C', 'O', 'L', 'R')));
	str += rowText('meta' , gi.hasSfntTable(tagToNumber('m', 'e', 't', 'a')));
	str += rowText('PCLT' , gi.hasSfntTable(tagToNumber('P', 'C', 'L', 'T')));
	str += rowText('OS/2' , gi.hasSfntTable(tagToNumber('O', 'S', '/', '2')));
	str += rowText('Hinting Tables:' , '');
	str += rowText('glyf' , gi.hasSfntTable(tagToNumber('g', 'l', 'y', 'f')));
	str += rowText('fpgm' , gi.hasSfntTable(tagToNumber('f', 'p', 'g', 'm')));
	str += rowText('prep' , gi.hasSfntTable(tagToNumber('p', 'r', 'e', 'p')));
	str += rowText('cvt ' , gi.hasSfntTable(tagToNumber('c', 'v', 't', ' ')));
	str += rowText('Variable Tables:' , '');
	str += rowText('gvar' , gi.hasSfntTable(tagToNumber('g', 'v', 'a', 'r')));
	str += rowText('CFF ' , gi.hasSfntTable(tagToNumber('C', 'F', 'F', ' ')));
	str += rowText('CFF2' , gi.hasSfntTable(tagToNumber('C', 'F', 'F', '2')));
	str += rowText('MMFX' , gi.hasSfntTable(tagToNumber('M', 'M', 'F', 'X')));
	str += rowText('MMSD' , gi.hasSfntTable(tagToNumber('M', 'M', 'S', 'D')));
    str += '</table>';
    return str;
}

function CurveTypeHTML(curveTypeName)
{
	let rowText = (label, text)=>{
		let row = '<tr><td nowrap>' + label + '</td><td>' + text + '</td></tr>';
		return row;
	};
    let str = '<table id="curve_type_table">';
	str += rowText('Bezier Type:' , curveTypeName);
    str += '</table>';
    return str;
}

function FaceFlagsToHTML(named_flags)
{
	let rowText = (label, text)=>{
		let row = '<tr><td nowrap>' + label + '</td><td>' + text + '</td></tr>';
		return row;
	};
    let str = '<table id="font_info_table">';
	for ( let i=0; i<named_flags.size(); ++i )
	{
		let named_flag = named_flags.get(i);
		str += rowText(named_flag.name, named_flag.flag);
	}
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

function OS2TableToHTML(os2)
{
	let rowText = (label, text)=>{
		let row = '<tr><td nowrap>' + label + '</td><td>' + text + '</td></tr>';
		return row;
	};
    let str = '<table id="os2_table_internal">';
	str += rowText('OS/2:', '');
	str += rowText('version', os2.version);
	str += rowText('xAvgCharWidth', os2.xAvgCharWidth);
	str += rowText('usWeightClass', os2.usWeightClass);
	str += rowText('usWidthClass', os2.usWidthClass);
	str += rowText('fsType', os2.fsType);
	str += rowText('ySubscriptXSize', os2.ySubscriptXSize);
	str += rowText('ySubscriptYSize', os2.ySubscriptYSize);
	str += rowText('ySubscriptXOffset', os2.ySubscriptXOffset);
	str += rowText('ySubscriptYOffset', os2.ySubscriptYOffset);
	str += rowText('ySuperscriptXSize', os2.ySuperscriptXSize);
	str += rowText('ySuperscriptYSize', os2.ySuperscriptYSize);
	str += rowText('ySuperscriptXOffset', os2.ySuperscriptXOffset);
	str += rowText('ySuperscriptYOffset', os2.ySuperscriptYOffset);
	str += rowText('yStrikeoutSize', os2.yStrikeoutSize);
	str += rowText('yStrikeoutPosition', os2.yStrikeoutPosition);
	str += rowText('sFamilyClass', os2.sFamilyClass);
	str += rowText('panose', os2.panose);
	str += rowText('ulUnicodeRange1', os2.ulUnicodeRange1);
	str += rowText('ulUnicodeRange2', os2.ulUnicodeRange2);
	str += rowText('ulUnicodeRange3', os2.ulUnicodeRange3);
	str += rowText('ulUnicodeRange4', os2.ulUnicodeRange4);
	str += rowText('achVendID', os2.achVendID);
	str += rowText('fsSelection', os2.fsSelection);
	str += rowText('usFirstCharIndex', os2.usFirstCharIndex);
	str += rowText('usLastCharIndex', os2.usLastCharIndex);
	str += rowText('sTypoAscender', os2.sTypoAscender);
	str += rowText('sTypoDescender', os2.sTypoDescender);
	str += rowText('sTypoLineGap', os2.sTypoLineGap);
	str += rowText('sTypoLineGap', os2.sTypoLineGap);
	str += rowText('usWinAscent', os2.usWinAscent);
	str += rowText('usWinDescent', os2.usWinDescent);
	str += rowText('ulCodePageRange1', os2.ulCodePageRange1);
	str += rowText('ulCodePageRange2', os2.ulCodePageRange2);
	str += rowText('sxHeight', os2.sxHeight);
	str += rowText('sCapHeight', os2.sCapHeight);
	str += rowText('usDefaultChar', os2.usDefaultChar);
	str += rowText('usBreakChar', os2.usBreakChar);
	str += rowText('usMaxContext', os2.usMaxContext);
	str += rowText('usLowerOpticalPointSize', os2.usLowerOpticalPointSize);
	str += rowText('usUpperOpticalPointSize', os2.usUpperOpticalPointSize);
    str += '</table>';
    return str;
}

function CodePointToHex(codePoint)
{
	let hex = Number(codePoint).toString(16).toUpperCase();
	if (hex.length <= 4 )
	{
		hex = '0000'.substr(0, 4 - hex.length) + hex;
	}
	return 'U+' + hex;
}

function PaddedGID(gid)
{
	let dec = Number(gid).toString();
	if (dec.length <= 4 )
	{
		dec = '    '.substr(0, 4 - dec.length) + dec;
	}
	return dec;
}

function OpenTypeFeaturesToHTML(feats)
{
	let str = 'Supported OpenType features: ';
	for ( let i=0; i<feats.size(); ++i )
	{
		if ( i % 8 == 0 )
		{
			str += '\n    ';	
		}
		str += `${feats.get(i).code}, `;
	}
	return str;
}

function CmapToHTML(cmap)
{
	let text = `Charmap ${cmap.platformID}, ${cmap.encodingID} \nplatform: ${cmap.platformName}\nencoding: ${cmap.encodingName}`;
	const entries = cmap.entries;
	for ( let i=0; i<entries.size(); ++i )
	{
		if ( i%10 == 0 )
		{
			text += '\n';	
		}
		let entry = entries.get(i);
		text += `${CodePointToHex(entry.codePoint)} ->${PaddedGID(entry.gid)}, `;
	}
	text += '\n\n';
	return text;
}

function CmapsToHTML(cmaps)
{
	let text = '';
	for ( let i=0; i<cmaps.size(); ++i )
	{
		const cmap = cmaps.get(i);
		text += CmapToHTML(cmap);	
	}
	return text;
}

function AxisToHTML(axis)
{
	let text = '';
	text += `${axis.name}, range: (${axis.min}, ${axis.def}, ${axis.max})`
	text += '\n';
	return text;
}

function VarAxesToHTML(axes)
{
	let text = 'Var Axes:\n';
	for ( let i=0; i<axes.size(); ++i )
	{
		const axis = axes.get(i);
		text += AxisToHTML(axis);	
	}
	return text;
}

function NamedStyleToHTML(namedStyle)
{
	let text = '';
	text += `${namedStyle.name}`
	text += ', coords:(';
	for ( let i=0; i<namedStyle.coords.size(); ++i )
	{
		const coord = namedStyle.coords.get(i);
		text += coord;
		if ( i != (namedStyle.coords.size()-1) )
		{
			text += ', ';
		}
	}
	text += ')';
	text += '\n';
	return text;
}

function VarNamedStylesToHTML(namedStyles)
{
	let text = 'Var NamedStyles:\n';
	for ( let i=0; i<namedStyles.size(); ++i )
	{
		const namedStyle = namedStyles.get(i);
		text += NamedStyleToHTML(namedStyle);	
	}
	return text;
}

function NameToHTML(name)
{
	let text = '';
	text += `${name.nameIDName} (${name.languageCode}): ${name.string}`
	text += '\n';
	return text;
}

function NamesToHTML(names)
{
	let text = '';
	for ( let i=0; i<names.size(); ++i )
	{
		const name = names.get(i);
		text += NameToHTML(name);	
	}
	return text;
}

function AddOpenTypeFeatureToggles(feats)
{
	let elems = '';
	for ( let i=0;i<feats.size(); ++i)
	{
		let feat = feats.get(i);
		const toggle_id = `toggle_${feat.code}`;
		const checked = feat.isOn ? 'checked' : '';
		const elem = `<input type="checkbox" class='opentype_toggle' id="${toggle_id}" name="name${feat.code}" value="${feat.code}" ${checked} /><label for="${toggle_id}">${feat.code}</label>`;
		elems += elem;
	}
	$('#opentype_toggles').html(elems);
}

function GetOpenTypeFeatures_as_VectorString()
{
	let vstr = new gGlyphModule.VectorString();
	let arrOn = $('.opentype_toggle:checked').map( (index) => {
		return '+' + $('.opentype_toggle:checked').eq(index).val();
	}).get();
	for ( let i=0;i<arrOn.length;++i)
	{
		vstr.push_back(arrOn[i]);
	}

	// Add untoggled feature?
	let arrOff = $('.opentype_toggle:not(checked)').map( (index) => {
		return '-' + $('.opentype_toggle:not(:checked)').eq(index).val();
	}).get();
	for ( let i=0;i<arrOff.length;++i)
	{
		vstr.push_back(arrOff[i]);
	}
	return vstr;
}

function MakeGIWrapper(fontFile, index)
{
	let gi = new gGlyphModule.GIWrapper();
	let isLoaded = gi.loadFace(fontFile, index);
	return isLoaded ? gi : undefined;
}

function GeneratePreview()
{
	const fontSizeText = $('#preview_size').val();
	const text = $('#preview_source').val();
	
	// get opentype features
	let features = GetOpenTypeFeatures_as_VectorString();

	let gi = gWrapper;
	const props = gi.faceProperties();
	let asc = props.ascender / props.units_per_EM;
	let dsc = props.descender / props.units_per_EM;

	const fontSize = parseFloat(fontSizeText);
	// a/d, scale, ty:shift downward
	const mx = [fontSize, 0, 0, -fontSize, 0, fontSize];

	const svg_d = gi.previewTextSVG_d(text, mx, features);
	const max_x = 1920;
	const max_y = 1080;
	const prefix = `<svg width=${max_x} height=${max_y}>`;
	const path = `<path d="${svg_d}"/>`;
	let asc_y = fontSize * (1.0 - asc);
	let dsc_y = fontSize * (1.0 - dsc);
	let base_y = fontSize;
	let stroke_style = 'style="stroke:gray;stroke-width:0.5;" stroke-dasharray="4 1"';
	const asc_line = `<line x1="0" y1="${asc_y}" x2="${max_x}" y2="${asc_y}" ${stroke_style} />`;
	const dsc_line = `<line x1="0" y1="${dsc_y}" x2="${max_x}" y2="${dsc_y}" ${stroke_style} />`;
	const base_line = `<line x1="0" y1="${base_y}" x2="${max_x}" y2="${base_y}" ${stroke_style} />`;
	const suffix = `</svg>`;
	const elem = prefix + asc_line + dsc_line + base_line + path + suffix;
	$('#font_preview').html(elem);
}

function ReRenderGlyphs()
{
	let tagString = $('#glyph_category').val();
	let elems = gRender.glyphElements(tagString);
	// fill GLyphs
	let glyphs_div = $('#all_glyphs');
	glyphs_div.html('');
	let html = '';
	for ( let i=0; i<elems.length; ++i)
	{
		html += elems[i];
		const elem = elems[i];
		glyphs_div.append(elem);
	}
}

// The OpenTypeFeature ( member: string code, bool isOn) 
function feats_contains(inFeats, inVal)
{
	for ( let i=0; i<inFeats.size(); ++i)
	{
		const feat_code = inFeats.get(i).code;
		if ( inVal === feat_code )
		{
			return true;
		}
	}
	return false;
}

function InitFontFace(fontFile, faceIndex)
{
	let gi = MakeGIWrapper(fontFile, faceIndex);
	gWrapper = gi; 
	let render = new GlyphRender(gi);
	gRender = render;
	render.setGridSize(128.0);
	
	//Font Info	
	const short_info = `${gi.faceInfo().postscriptName} of ${fontFile}.`;
	//$('#font_filename').html(fontFile);
	$('#font_short_info').html(short_info);
	const faceInfo = gi.faceInfo()
    $('#font_info').html(FaceInfoToHTML(faceInfo));
    $('#sfnt_tables').html(SfntTablesHTML(gi));
	$('#font_curve_type').html(CurveTypeHTML(gi.bezierCurveTypeName()));
    $('#font_flags').html(FaceFlagsToHTML(gi.faceFlags()));
    $('#font_props').html(FacePropertiesToHTML(gi.faceProperties()));
    $('#os2_table').html(OS2TableToHTML(gi.getOS2Table()));
    $('#opentype_features').html(OpenTypeFeaturesToHTML(gi.getOpenTypeFeatures()));
    $('#cmaps').html(CmapsToHTML(gi.charmaps()));
    $('#font_names').html(NamesToHTML(gi.names()));
	if ( gi.isVariableFont() )
	{
		$('#li_var_info').show();
	} else {
		$('#li_var_info').hide();
	}
    $('#font_var_axes').html(VarAxesToHTML(gi.getVarAxes()));
    $('#font_var_namedstyles').html(VarNamedStylesToHTML(gi.getVarNamedStyles()));

	// 

	//let loaded = render.loadGlyphs();
	ReRenderGlyphs();
	
	// opentype features
	const feats = gi.getOpenTypeFeatures();
	AddOpenTypeFeatureToggles(feats);
	$('.opentype_toggle').change( function(){
		if ( $(this).is(':checked') )
		{
		} else {
		}
		GeneratePreview();
	});
	//
	// glyph category dropdown
    $('#glyph_category option').each(function() {
        let $option = $(this);
        let val = $option.val();  
        $option.prop('disabled', (val=='' || !feats_contains(feats, val)) );
    });
	// on change 
	$( "#glyph_category" ).selectmenu({
		change: function( event, ui ) {
			console.log( "Selected glyph category: " + ui.item.value );
			ReRenderGlyphs();
		}
	});
	if ( faceInfo.sampleText === '' )
	{
		$('#preview_source').val('The quick brown fox jumps over the lazy dog.');
	} else {
		$('#preview_source').val(faceInfo.sampleText);
	}

	$('#preview_size').on('input',function(e){
		GeneratePreview();
	});
	$('#preview_source').on('input',function(e){
		GeneratePreview();
	});
	GeneratePreview();
}

function PickupFace(fontFile)
{
	var __face_index = 0;
	let num_faces = 0;
	let faces = [];
	try {
		faces = gGlyphModule.GIWrapper.faceDescriptors(fontFile);
		num_faces = faces.size();
	} catch (err) {
		alert('Unable to load font from: ' + fontFile + ' ' + JSON.stringify(err));
	}
	if (num_faces >1 )
	{
		let items = '';
		for ( let i=0; i< num_faces; ++i)
		{
			let faceDesc = faces.get(i);
			items += `<div class="face_item" onclick="InitFontFace('${fontFile}', ${faceDesc.faceIndex});$('#choose_face_dialog').dialog('close');">${faceDesc.postscriptName}</div>`;
		}
		$('#face_list').html(items);
		// no escape, no close button
		$('#choose_face_dialog').dialog( {
			closeOnEscape: false,
			open: (ev, ui) => {
				$(".ui-dialog-titlebar-close").hide();
			}
		});
	} else {
		InitFontFace(fontFile, __face_index);
	}
}

function LoadFont(fontFile)
{
	PickupFace(fontFile, InitFontFace);	
}

function mountFile(fileObject, onFileMounted)
{
    var reader = new FileReader();
    reader.onload = function ()
    {
        let fileName = fileObject.name;
        let data = new Uint8Array(reader.result);
        try {
            gGlyphModule.FS.createDataFile('/', fileName, data, true /*read*/, false/*write*/, false/*own*/);
        }catch (err)
        {
            console.log('Exception in FS.createDataFile(): ' + err.message);
        }
        console.log('file onload(): ' + fileName);
        let stat = gGlyphModule.FS.stat(fileName);
        console.log(stat);
        if (stat.size == 0)
        {
            alert('Empty file: ' + fileName + ' ' + stat.size +' bytes?');
        }
        onFileMounted(fileName);
    }
    reader.readAsArrayBuffer(fileObject);
}


function InitDropZoneEvents()
{
    $("#drop_zone").on('dragenter', function(e)
		{
			e.preventDefault();
			$(this).css("background", "#3F8CDD");
		});
    $("#drop_zone").on('dragleave', function(e)
		{
			e.preventDefault();
			$(this).css("background", "#FFFFFF");
		});
    $("#drop_zone").on('dragover', function(e)
		{
			e.preventDefault();
			$(this).css("background", "#3F8CDD");
		});
    $("#drop_zone").on('drop', function(e)
		{
			e.preventDefault();
			if (e.originalEvent.dataTransfer.files.length)
			{
				console.log(toString(e.originalEvent));
				var files = e.originalEvent.dataTransfer.files;
				// console.log('File dropped ' + files.length + ' files.');
				var file = files.item(0);

				let onFileMounted = (fileName) =>
				{
					LoadFont(fileName);
				};

				clearUI();
				// Async, when file mounted -> onFileMouted
				mountFile(file, onFileMounted);
			}
			$(this).css("background", "#FFFFFF");
		});
}

async function main()
{
	gGlyphModule = await LoadModule();
	
	LoadFont('MacondoSwashCaps-Regular.ttf');
	
	//events
	InitDropZoneEvents();

	// export as global function
	window.onGlyphClicked = onGlyphClicked;
	window.InitFontFace = InitFontFace;
}

function onGlyphClicked(gid)
{
	let div = $("#glyph_info");
	console.log(`clicking glyph ${gid}`);
	let glyph_info = gRender._glyph_infos[gid];
	const detail_json = JSON.stringify(glyph_info, null, 4);
	console.log(detail_json);
	const svg_str = gRender.drawSVG(gid, 300, 192);

	let run_info = '';
	run_info += 'Shaping:\n'
	const text_runs = gRender._gi.deshape(gid);
	for ( let i=0; i<text_runs.size(); ++i)
	{
		const run = text_runs.get(i);
		const contextual = run.isContextual ? `<abbr title="Contextual Substitution">(*)</abbr>` : '';
		run_info += `\t${run.unicodeString} ${run.otString} ${contextual}\n`;
	}

	const VectorToArray = (v) => {
		let arr = [];
		for ( let i=0; i<v.size(); ++i)
		{
			arr.push(v.get(i));
		}
		return arr;
	};

	const SubstToString = (subst) => 
	{
		const from_gids = VectorToArray(subst.from);
		const to_gids = VectorToArray(subst.to);
		let from = JSON.stringify(from_gids);
		let to = JSON.stringify(to_gids);
		let to_diagram = '';
		let from_diagram ='';
		const diagram_size = 36;
		for ( let i = 0; i<from_gids.length; ++i)
		{
			let svg = gRender.drawSVG(from_gids[i], diagram_size, diagram_size * 0.75, { draw_line: false, draw_info:false, title: `#${from_gids[i]}`, draw_gid : true});
			from_diagram += svg;
		}

		for ( let i = 0; i<to_gids.length; ++i)
		{
			let svg = gRender.drawSVG(to_gids[i], diagram_size, diagram_size * 0.75, { draw_line: false, draw_info:false, title: `#${to_gids[i]}`, draw_gid : true});
			to_diagram += svg;
		}

		let str = `${from_diagram}<span id="subst_item" title=""> -> </span>${to_diagram} ${subst.tagString} ${subst.lookupTypeString} Substitution from lookup#${subst.lookupIndex} ${subst.isContextual ? 'contextual' : ''}`;
		return str;
	};

	let substitution_info = `Substitutions:\n`;
	const substs = gRender._gi.findSubstitutions(gid);
	for ( let i=0; i<substs.size(); ++i )
	{
		const subst = substs.get(i);
		if ( i>0 )
			substitution_info += '\n';
		substitution_info += SubstToString(subst);
	}

	let div_group = `<div class="grid-container">
		<div class="grid-item1">${svg_str}</div>
		<div class="grid-item2"><pre class="detail_info">${detail_json}</pre></div>
		<div class="grid-item3"><pre class="detail_info">${run_info}</pre></div></div>
		<div class="grid-item4"><pre class="detail_info">${substitution_info}</pre></div></div>`;
	div.html(div_group);
	div.dialog({
		modal: true,
		width: 600,
		height: 600,
		buttons: { Ok: function() { $( this ).dialog( "close" );}},
		open : (ev, ui) => { 
			$( "#subst_item" ).tooltip({ content: 'TODO: subst context' });
		}
	});

}

function clearUI()
{
	$('#all_glyphs').html('');
}
 
$(()=>{
	main();
});
