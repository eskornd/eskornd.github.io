import {log} from './log.js';
import {ctx} from './ctx.js';

function Model()
{
}

Model.prototype = 
{
	createAnnotation : (event) => {
		alert("Model: TODO: createAnnotation(): " + JSON.stringify(event));
		ctx.editor.onAnnotationsChanged();
	},
	notifyDocumentChange : () => {
		log("model.notifyDocumentChange()");
		ctx.view.onDocumentChanged();
	}
};

export {Model};
