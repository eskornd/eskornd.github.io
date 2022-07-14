var isImageInitialized = false;
var image = new Image();
function drawSVG()
{
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	if (!isImageInitialized)
	{
		image.onload = function(){
			context.drawImage(this, 0,0);
			isImageInitialized = true;
		}
		image.src = "images/greenhanger.svg";
	} else {
		context.drawImage(image, 0,0);
	}
}
