
// Editor prototype
function Editor()
{}

Editor.prototype = {
	init: ()=>{},
	hello : ()=>{ alert("TODO: Say Hello!");},
	clearHighlights : ()=> { alert("TODO: Clear highlights"); },
	highlight : (rect)=>{ 
		alert("TODO: Unhandled highlight rect:" + JSON.stringify(rect));
	},
	getCurrentDocumentName : () => { return ""; },
	name : "prototype"
};

function validateEditor(inEditor)
{
	//validate
	var editorPrototype = new Editor();	
	var isValid = true;
	for ( var v  in editorPrototype)
	{
		isValid = isValid && inEditor.hasOwnProperty(v) && typeof inEditor[v] == typeof editorPrototype[v];
		console.assert(isValid, "setEditor(): inEditor." + v + " is " + typeof inEditor[v]);
	}	
	return isValid;	
}

export {Editor, validateEditor};
