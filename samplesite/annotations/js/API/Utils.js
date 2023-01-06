/** 
 * @class
 * @hideconstructor
 * @classdesc Document object, represents an opened document in the editor
 */
export class Utils
{ 
	constructor()
	{ }

	/**
	 * Download the given request (url) to a local file
	 * Will pop out Save As dialog to ask user choose the download location
	 * @request {object} mandatory download request object
	 * @param request.url {String} http(s) request url
	 * @return The downloaded local file path {String}
	 * @since 23.03
	 */
	async download(request){return '';}
}
