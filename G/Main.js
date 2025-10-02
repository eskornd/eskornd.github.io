import {GlyphRender} from './GlyphRender.js'

var gGlyphModule;
var gRender;
var gWrapper;

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
	$('#font_curve_type').html(CurveTypeHTML(gi.bezierCurveTypeName()));
    $('#font_flags').html(FaceFlagsToHTML(gi.faceFlags()));
    $('#font_props').html(FacePropertiesToHTML(gi.faceProperties()));
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

	//let loaded = render.loadGlyphs();
	let elems = render.glyphElements();
	console.log('render loaded: ' + elems.length);
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
