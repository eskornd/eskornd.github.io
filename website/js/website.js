function drawBackground()
{
	drawSmileFace();
	drawSVG();
}

// pop up an auto dismiss message
function message(msg,duration)
{
	var el = document.createElement("div");
	el.setAttribute("style","font-family: American Typewriter;position:absolute;top:5%;left:5%;background-color:gold;");
	el.innerHTML = msg;
	setTimeout(function(){
			el.parentNode.removeChild(el);
			},duration);
	document.body.appendChild(el);
}

function sayHello()
{
	var msg = "Hello Cloud Annotations!";
	var duration = 2000;
	var el = document.createElement("div");
	el.setAttribute("style","font-family: American Typewriter;font-size:4em;position:absolute;top:5%;left:8%;color:darkorange;background-color:transparent;");
	el.innerHTML = msg;
	setTimeout(function(){
			el.parentNode.removeChild(el);
			},duration);
	document.body.appendChild(el);
}

var frameWin = document.getElementById("annotationsFrame").contentWindow;
frameWin.isBrowser = true;

function ToDocumentRect(rect)
{
	var canvas = document.getElementById('canvas');
	var r = rect;
	r.y = canvas.height - r.height - r.y; 
	return r;
}

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
	canvas.addEventListener('click', function(e) {
		var canvasLeft = canvas.offsetLeft + canvas.clientLeft;
		var canvasTop = canvas.offsetTop + canvas.clientTop;
		var x = e.pageX - canvasLeft;
		var y = e.pageY - canvasTop;
		console.log('canvas clicked: ' + JSON.stringify(e) + " x:" + x + ", y: " + y);
		var centerX = smile_center.x;
		var centerY = smile_center.y;

		var radiusSquare = 70*70;
		var xx = x - centerX;
		var yy = y - centerY;
		var dd = (xx * xx ) + (yy*yy);
		if (dd<=radiusSquare)
		{
			console.log('smileface clicked: ');
			console.assert(typeof frameWin.eskoConnector.model.createAnnotation === "function");
			var rect = { x: (x - 70/2), y: (y - 70/2), width: 70, height: 70};
			rect = ToDocumentRect(rect);
			var annotation = {
				name : "Smileface",
				rect : rect,
			};
			frameWin.eskoConnector.model.createAnnotation(annotation);
		} else {
			message("Click on smile face to create annotation", 2000);
		}
	}, false);

	var editor = 
	{
		init: () => {},
		hello: () => {
			sayHello();
		},
		setDocumentAnnotations : async (docID, annotations) => {
			ctx2d.clearRect(0, 0, canvas.width, canvas.height);
			drawBackground();
			for ( const anno of annotations)
			{
				var r = ToCanvasRect(anno.boundingBox);
				ctx2d.strokeStyle = "red";
				ctx2d.strokeRect(r.x, r.y, r.width, r.height);
			}
		},
		documentPagesInfo : async (docID) => {
			var canvas = document.getElementById('canvas');
			let info = [
				{ type: "MediaBox", width: canvas.width, height: canvas.height},
				{ type: "TrimBox", width: canvas.width, height: canvas.height}
			];
			return info;
		},
		currentDocument : () =>
		{
			var doc = {
				title : () => { return 'index.html'; }
			};
			return doc;
		},
		getCurrentDocumentName : () => { return 'current canvas document name'; },
		onAnnotationsChanged : (inOptData) => {
			message("Annotations has changed! Please check annotations panel.", 2000);
		},
		openURL : (url)=> { window.open(url); },
		documents : () => { },
		appName : ()=>{ return "GenericBrowser";},
		versionString :  ()=>{ return "unknown version";}
	};

	frameWin.eskoConnector.setEditor(editor);
}

drawBackground();

