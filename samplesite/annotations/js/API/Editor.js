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
	 * Show a Modal dialog
	 * which content will be filled by a given URL
	 * @param modalParams {ModalParams}
	 */ 
	async showModal(modalParams) {}

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
	
	/**
	 * Get the storage of editor
	 * @return {Storage} 
	 */
	async storage(){}
}


