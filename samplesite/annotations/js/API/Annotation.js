import {Rect} from './Rect.js'

/** 
 * @class
 * @hideconstructor
 * @classdesc Annotation object, instructs editor where and how to draw highlight
 */
export class Annotation
{
	constructor()
	{
		/** 
		 * The annotation's unique ID. Provided by web-view
		 * Should exists so that editor can idendify 
		 * @since 22.11
		 * @type {String}
		 */
		this.id = '';

		/**
		 * The annotation's title that will be drawn on the editor document view. Provided by web-view
		 * @since 22.11
		 * @type {String}
		 */
		this.title = '';

		/** 
		 * The bounding box of the highlight area
		 * Must exists
		 * @since 22.07
		 * @type {Rect}
		 */
		this.boundingBox = new Rect();

		/**
		 * The pen color to be used by the highlight
		 * @since 22.07
		 * @type {RGBColor}
		 */
		this.highlightColor = {};

		/**
		 * Pen stroke width of the highlight
		 * @since 22.07
		 * @type {number} 
		 */
		this.highlightWeight = 1.0;

	}
}
