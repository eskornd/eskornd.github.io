/** 
 * @class
 * @hideconstructor
 * @classdesc ModalParams parameter of showModal()
 */
export class ModalParams
{
	constructor()
	{
		/**
		 * The URL to be opened
		 * Mandatory
		 * @type {string}
		 */
		this.url = '';

		/**
		 * The popup dialog size
		 * optional
		 * @type {Size}
		 */
		this.dialogSize;

		/**
		 * Title of the modal dialog, utf8
		 * @type {String}
		 */
		this.title;
	}
}


