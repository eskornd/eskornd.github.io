/** 
 * @class
 * @hideconstructor
 * @classdesc Document object, represents an opened document in the editor
 */
export class Document
{ 
	constructor()
	{
		/** 
		 * Document ID
		 * @type {number}
		 */
		this.id = 0;
	}

	/**
	 * Get local file path of the document, in utf8
	 * @return {string} local file path
	 * @throws If document is not valid
	 */
	async filePath(){return '';}

	/**
	 * Get pages info for the current document
	 * @return {PageInfo[]}
	 */
	async pagesInfo(){}
	
	/**
     * Set Annotations that should be shown for current document
	 * @param annotations {Annotation[]}
	 * @return {undefined}
	 */
	async setAnnotations(annotations){}

	/**
	  * Get Annotations that is shown for current document
	 * Only the annotation set by your web-component will be returned. 
	 * @return {Annotation[]}
	 */
	async getAnnotations(){}

	/**
	 * Get Title of the document, in utf8
	 * @return {string}
	 * @throws if document is not valid
	 */
	async title(){return '';}
	
	/**
	 * Zoom the page to given rect
	 * @param rect {Rect} in current document page coordinates
	 */
	async zoomTo(rect){}
}

