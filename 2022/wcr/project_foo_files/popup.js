var defaultMenuWidth = "350px" //set default menu width.


window.ie5 = document.all && !window.opera
var ns6 = document.getElementById

if (ie5 || ns6)
	$(function () {
		if ($("#popitmenu").length == 0) {
			$(document.body).append($("<div>").attr("id", "popitmenu").on("mouseover", clearhidepopup).on("mouseout", dynamichidepopup));
		}
	});

function iecompattestpopup() {
	return (document.compatMode && document.compatMode.indexOf("CSS") != -1) ? document.documentElement : document.body
}

window.showmenu = function showmenu(e, which, optWidth) {
	if (!document.all && !document.getElementById) {
		return;
	}
	clearhidepopup();
	window.menuobject = ie5 ? document.all.popitmenu : document.getElementById("popitmenu");
	menuobject.style.display = "block";
	menuobject.innerHTML = $("<div>").text(which).html();
	menuobject.style.width = (typeof optWidth != "undefined") ? optWidth : defaultMenuWidth;
	menuobject.contentwidth = menuobject.offsetWidth;
	menuobject.contentheight = menuobject.offsetHeight;
	window.eventX = ie5 ? event.clientX : e.clientX;
	window.eventY = ie5 ? event.clientY : e.clientY;
	//Find out how close the mouse is to the corner of the window
	var rightedge = ie5 ? iecompattestpopup().clientWidth - eventX : window.innerWidth - eventX;
	var bottomedge = ie5 ? iecompattestpopup().clientHeight - eventY : window.innerHeight - eventY;
	//if the horizontal distance isn't enough to accommodate the width of the context menu
	if (rightedge < menuobject.contentwidth){
		//move the horizontal position of the menu to the left by it's width
		menuobject.style.left = ie5 ? iecompattestpopup().scrollLeft + eventX - menuobject.contentwidth + "px" : window.pageXOffset + eventX - menuobject.contentwidth + "px";
	} else {
		//position the horizontal position of the menu where the mouse was clicked
		menuobject.style.left = ie5 ? iecompattestpopup().scrollLeft + eventX + "px" : window.pageXOffset + eventX + "px";
	}

	//same concept with the vertical position
	if (bottomedge < menuobject.contentheight) {
		menuobject.style.top = ie5 ? iecompattestpopup().scrollTop + eventY - menuobject.contentheight + "px" : window.pageYOffset + eventY - menuobject.contentheight + "px";
	} else {
		menuobject.style.top = ie5 ? iecompattestpopup().scrollTop + event.clientY + "px" : window.pageYOffset + eventY + "px";
	}	
	return false
}

function contains_ns6popup(a, b) {
	//Determines if 1 element in contained in another- by Brainjar.com
	if (b) {
		while (b.parentNode)
			if ((b = b.parentNode) == a)
				return true;
	}
	return false;
}

window.hidemenupopup = function hidemenupopup() {
	if (window.menuobject) {
		menuobject.style.display = "none";
		// Make sure there is no leftover scrollbar when hiding the popup...
		menuobject.style.left = "-1000px";
		menuobject.style.top = "-1000px";
	}
}

function dynamichidepopup(e) {
	if (ie5 && !menuobject.contains(e.toElement))
		hidemenupopup()
	else if (ns6 && e.currentTarget != e.relatedTarget && !contains_ns6popup(e.currentTarget, e.relatedTarget))
		hidemenupopup()
}

window.delayhidepopup = function delayhidepopup() {
	window.delayhidepop = setTimeout("hidemenupopup()", 500)
}

window.clearhidepopup = function clearhidepopup() {
	if (window.delayhidepop)
		clearTimeout(window.delayhidepop)
}

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return [curleft, curtop];
}

function findPosY(obj) {
	return findPos(obj)[1];
}

function findPosX(obj) {
	return findPos(obj)[0];
}

if (ie5 || ns6)
	document.onclick = hidemenupopup