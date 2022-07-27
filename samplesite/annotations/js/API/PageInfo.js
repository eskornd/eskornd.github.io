/** 
 * @class
 * @hideconstructor
 * @classdesc PageInfo of a document
 */
export class PageInfo
{
	constructor ()
	{
		/**
		 * Page width
		 * @type {number}
		 */ 
		this.width = '0';

		/**
		 * Page height
		 * @type {number}
		 */ 
		this.height = '0';

		/**
		 * PageBoxes of current page optional
		 * @type {PageBox[]}
		 */
		this.pageBoxes;
	
	}
}
