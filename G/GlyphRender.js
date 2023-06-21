export class GlyphRender
{
	constructor( gi )
	{
		console.assert( undefined != gi );
		this._font_info = gi.faceInfo();
		this._font_props = gi.faceProperties();
		this._gi = gi;
		this._num_loaded = 0;
		this._path_ds = [];
		this._glyph_infos = [];
		this._html_elements = null;
		this._loaded = false;
		this._matrix = [1, 0, 0, 1, 0, 0];
		this._grid_size = 1.0;
		this._elem_prefix = '';
		this._elem_suffix = '';
		const default_size = 1.0;
		this.setGridSize(default_size);
	}

	setGridSize(grid_size)
	{
		this._grid_size = grid_size;
		this._glyph_size = grid_size * 0.5;

	}

	toElement(gid, grid_size, path_d)
	{
		return this.drawSVG(gid, this._gi, this._grid_size, this._glyph_size, this._font_props, this._glyph_infos[gid]);

	}

	drawSVG(gid, gi, grid_size, glyph_size, font_props, glyph_info)
	{
		const pen_x =  0.5 * ( grid_size - (glyph_info.advanceX * glyph_size) ); 
		const pen_adv_x =  pen_x + (glyph_info.advanceX * glyph_size) ; 
		//const pen_y = 0.5 * grid_size + 0.5*(font_props.ascender/font_props.units_per_EM * glyph_size);
		const pen_y = 0.5 * grid_size + 0.5*((font_props.ascender + font_props.descender)/font_props.units_per_EM * glyph_size);
		const ascender_y = pen_y - (font_props.ascender/font_props.units_per_EM * glyph_size);
		const descender_y = pen_y - (font_props.descender/font_props.units_per_EM * glyph_size);
		const mx = [glyph_size, 0, 0, glyph_size, pen_x, -pen_y];
		const path_d = gi.svg_d(gid, mx);
		const prefix = `<svg onclick="onGlyphClicked(${gid});" class=my_glyph gid=${gid} width=${grid_size} height=${grid_size}>`;
		const path = `<path d="${path_d}" />`;
		// lines
		const line_attr = ' stroke=#EFEFEF stroke-width=1 stroke-opacity=0.75 ';
		const pen_attr = ' stroke=#BFBFBF stroke-width=1.5 stroke-opacity=0.75 stroke-linecap=round ';
		const baseline = `<line x1=${0} y1=${pen_y} x2=${grid_size} y2=${pen_y} ${line_attr} />`;
		const ascender_line = `<line x1=${0} y1=${ascender_y} x2=${grid_size} y2=${ascender_y} ${line_attr} />`;
		const descender_line = `<line x1=${0} y1=${descender_y} x2=${grid_size} y2=${descender_y} ${line_attr} />`;
		// Pen
		const pen_y1 = pen_y +20;
		const pen_len = 0.1 * glyph_size;
		const info_em_size = 0.7; //em
		let info_attr=` style="fill:#7F7F7F; font-size: ${info_em_size}em;" `;
		let pen = '';
		pen += `<line x1=${pen_x} y1=${pen_y} x2=${pen_x} y2=${pen_y + pen_len} ${pen_attr} />`;
		pen += `<line x1=${pen_x} y1=${pen_y} x2=${pen_x - pen_len} y2=${pen_y} ${pen_attr} />`;
		pen += `<line x1=${pen_adv_x} y1=${pen_y} x2=${pen_adv_x} y2=${pen_y + pen_len} ${pen_attr} />`;
		pen += `<line x1=${pen_adv_x} y1=${pen_y} x2=${pen_adv_x + pen_len} y2=${pen_y} ${pen_attr} />`;
		pen += `<text x=${pen_adv_x} y=${pen_y + (2*pen_len)} ${info_attr}>${glyph_info.advanceX}</text>`;
		const lines = baseline + ascender_line + descender_line;
		// Info
		const line_height = (grid_size * 0.1) * 1.2 * info_em_size;
		const info_margin = 0.5 * line_height;
		const info_x = info_margin;
		let info_y = grid_size - info_margin;
		let info = '';
		info += `<text x=${info_x} y=${info_y} ${info_attr} >${glyph_info.unicodeLiteral}</text>`
		info_y -= line_height;
		info += `<text x=${info_x} y=${info_y} ${info_attr} >${glyph_info.name}</text>`
		info_y -= line_height;
		info += `<text x=${info_x} y=${info_y} ${info_attr} >#${gid}</text>`
		const suffix = `</svg>`;

		return prefix + path + lines + pen + info + suffix;
	}

	loadGlyphs()
	{
		if (this._loaded)
			return true;

		const gi = this._gi;
		const num_glyphs = this._font_info.numGlyphs;
		// reload
		this._num_loaded = 0;
		this._path_ds = new Array(num_glyphs);
		this._glyph_infos = new Array(num_glyphs);
		console.log('### grid size: ' + this._grid_size);
		console.log('### glyph size: ' + this._glyph_size);
		for ( let gid=0; gid<num_glyphs; ++gid)
		{
			const glyph_info = gi.glyphInfo(gid);
			this._glyph_infos[gid] = glyph_info;
			// let mx = this._matrix;
			// mx[4] = 0.5 * ( this._grid_size - (glyph_info.advanceX * this._glyph_size) );
			// this._path_ds[gid] = gi.svg_d(gid, mx);	
			++this._num_loaded;
		}
		console.assert(this._num_loaded == num_glyphs);
		this._loaded = true;
		return this._loaded;
	}

	glyphElements()
	{
		this.loadGlyphs();
		if ( this._html_elements == null )
		{
			const num_glyphs = this._font_info.numGlyphs;
			this._html_elements = new Array(num_glyphs);
			for ( let gid=0; gid<num_glyphs; ++gid)
			{
				const path_d = this._path_ds[gid];
				this._html_elements[gid] = this.toElement(gid, this._grid_size, path_d);
			}
		}
		return this._html_elements;
	}

	glyphSVG(gid, fontSize)
	{
		const gi = this._gi;
		let matrix = [fontSize, 0, 0, fontSize, 0, 0];
		let path_d = gi.svg_d(gid, matrix);
		return path_d;
	}
}

