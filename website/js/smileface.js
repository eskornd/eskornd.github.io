var smile_center = {
	"x" : 0,
	"y" : 0
};
function drawSmileFace()
{
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var centerX = canvas.width * 0.5;
	var centerY = canvas.height * 0.5;
	var radius = 70;
	var eyeRadius = 10;
	var eyeXOffset = 25;
	var eyeYOffset = 20;
	var linewidth = 5;
	centerX = canvas.width - radius - linewidth * 2;
	centerY = radius + linewidth * 2;
	smile_center.x = centerX;
	smile_center.y = centerY;

	// draw the yellow circle
	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = 'yellow';
	context.fill();
	context.lineWidth = linewidth;
	context.strokeStyle = 'black';
	context.stroke();

	// draw the eyes
	context.beginPath();
	var eyeX = centerX - eyeXOffset;
	var eyeY = centerY - eyeXOffset;
	context.arc(eyeX, eyeY, eyeRadius, 0, 2 * Math.PI, false);
	var eyeX = centerX + eyeXOffset;
	context.arc(eyeX, eyeY, eyeRadius, 0, 2 * Math.PI, false);
	context.fillStyle = 'black';
	context.fill();

	// draw the mouth
	context.beginPath();
	context.arc(centerX, centerY, 50, 0, Math.PI, false);
	context.stroke();
}
