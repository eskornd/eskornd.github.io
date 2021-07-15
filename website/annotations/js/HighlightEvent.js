import {Rect} from './Rect.js';
const HighlightType = 
{
	eRect : "rect",
	ePageBox : "pagebox",
	eNone : "none"
};

const PageBox = 
{
	eMediaBox : "mediabox",
	eTrimBox : "trimbox",
	eNone : ""
};

function HighlightEvent()
{
}

HighlightEvent.prototype = 
{
	rect : new Rect(),
	pageBox : PageBox.eNone,
	type : HighlightType.eNone
};

export {PageBox, HighlightType, HighlightEvent};
