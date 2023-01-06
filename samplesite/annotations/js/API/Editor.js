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
	 * @since 22.07
	 */
	async appName(){}

	/**
	 * Get current document
	 * @return {Document} The current active document. If no document opened, return null.
	 * @since 22.07
	 */
	async currentDocument(){}

	/**
	 * Show a Modal dialog
	 * which content will be filled by a given URL
	 * @param modalParams {ModalParams}
	 * @since 22.11
	 */ 
	async showModal(modalParams) {}

	/**
	 * open a URL in browser
	 *
	 * @param url {String}
	 * @since 22.11
	 */ 
	async openInBrowser(url) {}

	/**
	 * Notified when document is opened/closed/switched in host application
	 * web view can override this function
	 * @since 22.07
	 */
	async onDocumentChanged(){}

	/**
	 * Notified when document page boxes changed
	 * web view can override this function
	 * @since 22.11
	 */
	async onDocumentPageBoxesChanged(){}

	/**
	 * Notified when annotation created
	 * web view can override this function
	 * @param annotation {Annotation}
	 * @since 22.11
	 */
	async onAnnotationCreated(annotation){}

	/**
	 * Activate Annotation Tool
	 * @return undefined
	 * @since 22.11
	 */
	async activateAnnotationTool(){}

	/**
	 * Get current version string of editor
	 * 
	 * @return {Version}
	 * @since 22.11
	 */
	async version(){}
	
	/**
	 * Get current version string of editor
	 * Typically this is Esko DeskPack product version, e.g. '22.07.103'
	 * @return {string}
	 * @since 22.11
	 */
	async versionString(){}
	
	/**
	 * Get application info, including language
	 * @return {AppInfo}
	 * @since 22.11
	 */
	async appInfo(){}
	
	/**
	 * Get the storage of editor
	 * @return {Storage} 
	 * @since 22.11
	 */
	async storage(){}
	
	/**
	 * Get current container window object
	 * @return {Window}
	 * @since 22.11
	 */
	async currentWindow(){}

	/**
	 * Get utilitis object
	 *
	 * @return {Utils}
	 */
	async utils(){}
}


