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
}

