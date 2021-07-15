
var frameWin = document.getElementById("annotationsFrame").contentWindow;
frameWin.isBrowser = true;

function ToCanvasRect(rect)
{
	var canvas = document.getElementById('canvas');
	var r = rect;
	r.y = canvas.height - r.height - r.y; 
	return r;
}

var canvas = document.getElementById('canvas');
console.assert(canvas.getContext);
var ctx2d = canvas.getContext('2d');


function onFrameLoaded()
{
	var editor = 
	{
		init: () => {},
		hello: () => {
			ctx2d.font = "64px American Typewriter";
			ctx2d.fillText("Hello!", 100, 100);
		},
		highlight : (event) => {
			switch (event.type)
			{
				case "rect":

					var r = ToCanvasRect(event.rect);
					ctx2d.strokeStyle = "red";
					ctx2d.strokeRect(r.x, r.y, r.width, r.height);
				break;
				case "pagebox":
					ctx2d.strokeStyle = "red";
					ctx2d.strokeRect(0, 0, canvas.width, canvas.height);
				break;
			}
		},
		getCurrentDocumentName : () => { return "current canvas document name"; },
		name : "GenericBrowser"
	};

	frameWin.eskoAnnotator.setEditor(editor);
}

