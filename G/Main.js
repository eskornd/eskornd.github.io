import {GlyphRender} from './GlyphRender.js'

var gGlyphModule;
var gRender;

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

function InitFontFace(fontFile, faceIndex)
{
	let gi = MakeGIWrapper(fontFile, faceIndex);
	let render = new GlyphRender(gi);
	gRender = render;
	render.setGridSize(128.0);
	
	//Font Info	
	const short_info = `${gi.faceInfo().postscriptName} of ${fontFile}.`;
	//$('#font_filename').html(fontFile);
	$('#font_short_info').html(short_info);
    $('#font_info').html(FaceInfoToHTML(gi.faceInfo()));
    $('#font_props').html(FacePropertiesToHTML(gi.faceProperties()));

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
}

function PickupFace(fontFile)
{
	var __face_index = 0;
	let num_faces = 0;
	let faces = [];
	try {
		faces = gGlyphModule.GIWrapper.faces(fontFile);
		num_faces = faces.size();
	} catch (err) {
		alert('Unable to load font from: ' + fontFile + ' ' + JSON.stringify(err));
	}
	if (num_faces >1 )
	{
		let items = '';
		for ( let i=0; i< num_faces; ++i)
		{
			items += `<div class="face_item" onclick="InitFontFace('${fontFile}', ${i});$('#choose_face_dialog').dialog('close');">${faces.get(i)}</div>`;
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

		//let str = `${from}->${to} ${from_diagram}->${to_diagram} ${subst.tagString} ${subst.lookupTypeString} Substitution from lookup#${subst.lookupIndex} ${subst.isContextual ? 'contextual' : ''}`;
		let str = `${from_diagram} -> ${to_diagram} ${subst.tagString} ${subst.lookupTypeString} Substitution from lookup#${subst.lookupIndex} ${subst.isContextual ? 'contextual' : ''}`;
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
		buttons: { Ok: function() { $( this ).dialog( "close" );}}
	});

}

function clearUI()
{
	$('#all_glyphs').html('');
}
 
$(()=>{
	main();
});
