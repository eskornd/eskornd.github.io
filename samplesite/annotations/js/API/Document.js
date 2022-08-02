/** 
 * @class
 * @hideconstructor
 * @classdesc Document object, represents an opened document in the editor
 */
export class Document
{ 
	constructor()
	{ }

	/**
	 * Get local file path of the document, in utf8
	 * @since 22.07
	 * @return {string} local file path
	 * @throws If document is not valid
	 */
	async filePath(){return '';}

	/**
	 * Get pages info for the current document
	 * @return {PageInfo[]}
	 * @since 22.11
	 */
	async pagesInfo(){}
	
	/**
     * Set Annotations that should be shown for current document
	 * @param annotations {Annotation[]}
	 * @return {undefined} 
	 * @since 22.07
	 */
	async setAnnotations(annotations){}

	/**
	  * Get Annotations that is shown for current document
	 * Only the annotation set by your web-component will be returned. 
	 * @return {Annotation[]}
	 * @since 22.11
	 */
	async getAnnotations(){}

	/**
	 * Get Title of the document, in utf8
	 * @return {string}
	 * @throws if document is not valid
	 * @since 22.11
	 */
	async title(){return '';}

	/**
	 * Get node ID of the document
	 * @return {string}
	 * @throws if document is not valid
	 * @since 22.11
	 */
	async getNodeID(){}

	/**
	 * Set node ID to the document
	 * (This will not trigger a file save operation)
	 * @param nodeID {string} the node ID
	 * @return {undefined}
	 * @throws if document is not valid
	 * @since 22.11
	 */
	async setNodeID(nodeID){}
	
	/**
	 * Return whether the current document is dirty or not
	 * 
	 * @return {bool}
	 * @since 22.11
	 */
	async isDirty(){}

	/**
	 * Get File as Binary 
	 * @param params {object} optional
	 * @param params.saveFile {bool} save the file if not yet saved, default true
	 * @param params.silent {bool} save file silently
	 * @throw Document is not saved, e.g. user cancelled
	 * @since 22.11
	 */
	async readFileBinary(params){}	

}

