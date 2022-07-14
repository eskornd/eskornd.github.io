import {log} from './log.js';
import {ctx} from './ctx.js';

function Model()
{
}

Model.prototype = 
{
	createAnnotation : (annotation) => {
		ctx.editor.onAnnotationsChanged();
		ctx.view.addAnnotation(annotation);
	},
};

export {Model};
