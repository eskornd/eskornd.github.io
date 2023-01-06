/** 
 * @class
 * @hideconstructor
 * @classdesc Document object, represents an opened document in the editor
 */
export class Window
{ 
	constructor()
	{}

	/**
	 * Whether window is modal
	 * @return {bool}
	 * @since 22.11
	 */
	async isModal()
	{}
	
	/**
	 * Resize current window
	 * Only work for modal dialog
	 * @param size {Size} size of the modal dialog
	 * @since 22.11
	 */
	async resize(size)
	{}

	/**
	 * Close the current modal dialog
	 * Only works for modal dialog
	 * @since 22.11
	 */
	async close() 
	{}

	/**
	 * End the current Modal, returning endModalParams
	 *
	 * The endModalParams should be a seralizable object. By default the UECI doesn't make use of this endModal params directly. 
	 * Editor will need to override the default endModal function  to pickup the return value from web modal dialog, and specialization implementation is needed on each Editor to handle the return data.  E.g. for ShapesCloud, the native plugin will override the endModal() function and pass the stringifyed json object to native plugin, then the native plugin will parse the structural files from it and then place/open the .ard or .zae file.
	 *
	 * @param endModalParams The customized parameters to be returned to the native plugin
	 * @since 23.03
	 * @throws if current view is not on modal dialog
	 */
	async endModal(endModalParams)
	{}
}

