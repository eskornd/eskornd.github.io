/**
 * @class 
 * @hideconstructor
 * @classdesc The UECI Editor Interface, root object of the host editor
 */
export class Editor
{
	/**
	 * Get application name
	 * @return {string} e.g. 'ArtPro+', 'AdobeIllustrator'
	 */
	async appName(){}

	/**
	 * Get current document
	 * @return {Document} The current active document. If no document opened, return null.
	 */
	async currentDocument(){}

	/**
	 * @deprecated Get all opened documents
	 * @return {Document[]} All opened documents. If no document opened, return empty Array 
	 */
	async documents(){}

	/**
	 * Notified when document is opened/closed/switched in host application
	 * web view can override this function
	 */
	async onDocumentChanged(){}

	/**
	 * Get current version string of editor
	 * 
	 * @return {Version}
	 */
	async version(){}
	
	/**
	 * Get current version string of editor
	 * Typically this is Esko DeskPack product version, e.g. '22.07.103'
	 * @return {string}
	 */
	async versionString(){}
	
}


