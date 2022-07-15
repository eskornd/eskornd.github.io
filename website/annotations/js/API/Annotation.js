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
		 * The bounding box the highlight area
		 * Must exists
		 * @type {Rect}
		 */
		this.boundingBox = new Rect();

		/**
		 * The pen color to be used ed by the highlight
		 * @type {RGBColor}
		 */
		this.highlightColor = {};

		/**
		 * Pen stroke width of the highlight
		 * @type {number} 
		 */
		this.highlightWeight = 1.0;

	}
}
