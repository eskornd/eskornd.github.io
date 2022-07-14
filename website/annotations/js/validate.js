import {Editor} from './API/Editor.js'
import {Document} from './API/Document.js'
import {Annotation} from './API/Annotation.js'
import {PageBox} from './API/PageBox.js'
import {RGBColor} from './API/RGBColor.js'
import {Rect} from './API/Rect.js'

const editorPrototype = new Editor();	
const documentPrototype = new Document();	
const annotationPrototype = new Annotation();
const pageBoxPrototype = new PageBox();
const rgbColorPrototype = new RGBColor();
const rectPrototype = new Rect();
function validateEditor(inEditor)
{
	let allValid = true;
	
	var proto = Object.getPrototypeOf(editorPrototype);
	let keys = Object.getOwnPropertyNames(proto);
	for ( let i=0; i<keys.length; ++i)
	{
		let key = keys[i];
		let isValid = (key in inEditor) && (typeof inEditor[key]) == (typeof editorPrototype[key]);
		if ( !isValid)
		{
			console.warn("setEditor(): function " + key + " is " + typeof inEditor[key]);
		}
		allValid &= isValid;
	}	
	return allValid;	
}

export {validateEditor}
