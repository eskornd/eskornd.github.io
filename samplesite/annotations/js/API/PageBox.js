import {Rect} from './Rect.js'

/** 
 * @class
 * @hideconstructor
 * @classdesc PageBox info of a page
 */
export class PageBox
{
	constructor()
	{
		/**
		 * Page box type
		 * in [ 'MediaBox' | 'TrimBox' | 'CropBox' | 'BleedBox' | 'ArtBox' ]
		 * @type {string}
		 */
		this.type = '';

		/**
		 * Page box rect
		 * @type {Rect}
		 */
		this.rect = new Rect();
	}
}
