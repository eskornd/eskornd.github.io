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
		const ratio = 0.5;
		const glyph_size = grid_size * ratio;
		this._glyph_size = glyph_size;
		const double_margin = grid_size * (1 - ratio);
		const shift_x = 0.6 * double_margin;
		const shift_y = 0.9 * double_margin;
		const baseline_y = grid_size - shift_y;
		// to view matrix
		// gi.svg_d is 0,0 based right-down positive
		const a = glyph_size;
		const b = 0;
		const c = 0;
		const d = glyph_size;
		const tx = 0 + shift_x;
		const ty = -grid_size + shift_y;
		this._matrix=[a, b, c, d, tx, ty];

		// update element template
		const class_name = 'my_glyph';
		this._elem_prefix = '';
		this._elem_prefix += '<span>';
		this._elem_prefix += `<svg class=\'${class_name}\' width=${grid_size} height=${grid_size} >`;
		this._elem_suffix = '';

		this._fence_attr = ' stroke=#E0E0E0 stroke-width=1.5 ';
		this._fence_x1 = shift_x;
		this._fence_y1 = baseline_y;
		this._fence_y2 = baseline_y - (this._font_props.ascender/this._font_props.units_per_EM) * glyph_size;
		this._elem_suffix += `<line x1=0 y1=${baseline_y} x2=${grid_size} y2=${baseline_y} ${this._fence_attr} />`;
		this._elem_suffix += `<line x1=${shift_x} y1=${this._fence_y1} x2=${shift_x} y2=${this._fence_y2} ${this._fence_attr} />`;
		this._elem_suffix += '</svg>';
		this._elem_suffix += '</span>';
		const text_size = 12.0;
		const text_x = 0.25 * double_margin;
		const line_height = 1.2 * text_size;
		let text_y = baseline_y ;
		text_y += line_height;
		text_y += line_height;
		this._gid_prefix = `<text class="svg_text" x=${text_x} y=${text_y}>`
		text_y += line_height;
		this._glyph_name_prefix = `<text class="svg_text" x=${text_x} y=${text_y}>`
		text_y += line_height;
		this._unicode_prefix = `<text class="svg_text" x=${text_x} y=${text_y}>`
		this._gid_suffix = '</text>';
		this._glyph_name_suffix = '</text>';
		this._unicode_suffix = '</text>';
	}

	toElement(gid, grid_size, path_d)
	{
		const glyph_info = this._glyph_infos[gid];
		let elem = this._elem_prefix;
		elem += `${this._gid_prefix}GID: ${gid}${this._gid_suffix}`;
		elem += `${this._glyph_name_prefix}Name: ${glyph_info.name}${this._glyph_name_suffix}`;
		elem += `${this._unicode_prefix}Unicode: ${glyph_info.unicodeLiteral}${this._unicode_suffix}`;
		elem += `<path d="${path_d}" />`;
		const right_fence_x = this._fence_x1 + glyph_info.advanceX * this._glyph_size; 
		elem += `<line x1=${right_fence_x} y1=${this._fence_y1} x2=${right_fence_x} y2=${this._fence_y2} ${this._fence_attr} />`;
		elem += this._elem_suffix;
		return elem;
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
		for ( let gid=0; gid<num_glyphs; ++gid)
		{
			this._path_ds[gid] = gi.svg_d(gid, this._matrix);	
			this._glyph_infos[gid] = gi.glyphInfo(gid);
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
				console.log(path_d);
				this._html_elements[gid] = this.toElement(gid, this._grid_size, path_d);
			}
		}
		return this._html_elements;
	}

}

