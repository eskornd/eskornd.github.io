/** 
 * @deprecated DO NOT use this class anymore, instead please listen to the 'com.esko.editorconnector.ready' event for Editor initialization.  
 * @class 
 * @hideconstructor
 * @classdesc window.eskoConnector object. This object needs to be created by the web view and assign to the window on load of HTML. The on load of the page, host application will call 'window.eskoConnector.setEditor(editor)' so that the editor object can be injected to the web view.
 */
export class eskoConnector
{
	/**
	 * Inject editor instance to the web view
	 * @param editor {Editor} The editor object implemented by the host app editor
	 */ 
	setEditor( editor )
	{}
}
