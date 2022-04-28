/***********************************************
 * AnyLink Drop Down Menu- © Dynamic Drive (www.dynamicdrive.com)
 * This notice MUST stay intact for legal use
 * Visit http://www.dynamicdrive.com/ for full source code
 ***********************************************/

window.menuwidth = ""; //default menu width
window.menubgcolor = "white"; //menu bgcolor
window.disappeardelay = 500; //menu disappear speed onMouseout (in miliseconds)
window.hidemenu_onclick = "yes"; //default for hide menu when user clicks within menu.
window.menuheight = "300px";
window.dropmenuobj;

/////No further editting needed

var ie4 = document.all;
var ns6 = document.getElementById && !document.all;

//alert('ie4=' + ie4 + ' ns6=' + ns6);

// typically called with showhide(dropmenuobj.style, e, "visible", "hidden")

window.showhide = function showhide(obj, e, visible, hidden, menuwidth) {
	// hadw: dropmenuobj is defined in dropdownmenu, the typical entry point of hover
	// This is the dropmenudiv object written above in the document

	var dropmenuobj = window.dropmenuobj;
	if (ie4 || ns6) {
		dropmenuobj.style.left = dropmenuobj.style.top = -500;
	}

	dropmenuobj.widthobj = dropmenuobj.style;
	if (menuwidth) {
		dropmenuobj.widthobj.width = menuwidth;
	}

	try {
		if (
			(e.type == "click" && obj.visibility == hidden) ||
			e.type == "mouseover" ||
			e.type == "keyup" ||
			e.type == "touchend" ||
			e.type == "pointerup" ||
			e.type == "focus"
		) {
			// so if you mouseover, the dropmenuobj becomes visible
			obj.visibility = visible;
			$(dropmenuobj).css("display", "block");
		} else if (e.type == "click") {
			if (hidemenu_onclick) {
				obj.visibility = hidden;
				$(dropmenuobj).css("display", "none");
			}
		}
	} catch (err) {
		// typically because the event is obsolete.  Suppose it's mouseover
		obj.visibility = visible;
		$(dropmenuobj).css("display", "block");
	}
};

window.iecompattest = function iecompattest() {
	return document.compatMode && document.compatMode != "BackCompat" ? document.documentElement : document.body;
};

window.clearbrowseredge = function clearbrowseredge(obj, whichedge) {
	var dropmenuobj = window.dropmenuobj;
	var edgeoffset = 0;
	if (whichedge == "rightedge") {
		var leftedge = ie4 && !window.opera ? iecompattest().scrollLeft : window.pageXOffset;
		var windowedge =
			ie4 && !window.opera ? iecompattest().scrollLeft + iecompattest().clientWidth - 15 : window.pageXOffset + window.innerWidth - 15;
		dropmenuobj.contentmeasure = dropmenuobj.offsetWidth;
		if (windowedge - dropmenuobj.x < dropmenuobj.contentmeasure) {
			// move left
			edgeoffset = dropmenuobj.contentmeasure - obj.offsetWidth;
			if (dropmenuobj.x - leftedge < dropmenuobj.contentmeasure)
				//left no good either?
				edgeoffset = dropmenuobj.x - obj.offsetWidth - leftedge;
		}
	} else {
		var topedge = ie4 && !window.opera ? iecompattest().scrollTop : window.pageYOffset;
		var windowedge =
			ie4 && !window.opera ? iecompattest().scrollTop + iecompattest().clientHeight - 15 : window.pageYOffset + window.innerHeight - 18;
		dropmenuobj.contentmeasure = dropmenuobj.offsetHeight;
		if (windowedge - dropmenuobj.y < dropmenuobj.contentmeasure) {
			//move up?
			edgeoffset = dropmenuobj.contentmeasure + obj.offsetHeight;
			if (dropmenuobj.y - topedge < dropmenuobj.contentmeasure)
				//up no good either?
				edgeoffset = dropmenuobj.y + obj.offsetHeight - topedge;
		}
	}
	return edgeoffset;
};

window.populatemenu = function populatemenu(what) {
	var dropmenuobj = window.dropmenuobj;
	if (ie4 || ns6)
		// 'what' is an array and join just hangs all elements after each other in a string. The argument of join is a separator, in this case none.
		dropmenuobj.innerHTML = what.join("");
};

window.doNothing = function doNothing(e) {};

window.doNothingInElem = function doNothingInElem(e) {
	if (window.event && (!e || !e.stopPropagation)) {
		event.cancelBubble = true;
	} else if (e.stopPropagation) {
		e.stopPropagation();
	}
};

/**
 * shows a popup window
 * @param obj: object on which the event e occurred, typically the anchor where you hover to get the dropdown
 * @param e: event which occured (for exmaple click mouseover etc
 * @param menucontents: array with html code which will be shown in the popup
 * @param width (optional): new menu width. If "null", will use default. If -1, stretches to the content
 * @param height (optional): height of the menu.  If more content, a vertical scrollbar will appear. If -1, stretches to the content
 * @param scrollhor (optional): if true, a horizontal scrollbar will be added providing for content expanding larger than menuwidth (if it's necessary).
 * @param nohide: if true, menu will not hide on mouseout, else it will
 * @param bgcolor: if given, the popup will get this background color. Expected in the form "#rrggbb"
 * @param nohideonclick: if true, menu will not hide on click in the menu, else it will
 * @param offsety: The number of pixels the menu will be offsetted in the vertical direction.
 * @param maxheight {number} (optional): The maximum height of the menu.
 */

window.dropdownmenu = function dropdownmenu(
	obj,
	e,
	menucontents,
	width,
	height,
	scrollhor,
	nohide,
	bgcolor,
	nohideonclick,
	offsety,
	maxheight
) {
	if (!height || height.length > 0) {
		height = "350";
	}

	if (!width) {
		width = menuwidth;
	}

	return dropdown(obj, e, menucontents, height, width, nohide, bgcolor, nohideonclick, offsety, null, maxheight);
};

window.dropdown = function dropdown(obj, e, menucontents, height, width, nohide, bgcolor, nohideonclick, offsety, offsetx, maxheight) {
	// this is the typical entry point
	// obj is the object on which the event e occurred, typically the anchor where you hover to get the dropdown

	if (window.event && (!e || !e.stopPropagation)) {
		event.cancelBubble = true;
	} else if (e.stopPropagation) {
		e.stopPropagation();
	}
	if (e && e.preventDefault) {
		e.preventDefault();
	}
	clearhidemenu();

	var dropmenuobj = document.getElementById ? document.getElementById("dropmenudiv") : dropmenudiv;

	// Following line fixes DT125459 and DT12460 (duplicate). When you are about to open a new dropdownmenu and there is still one open, you must first hide it, to give it a chance to run its onchange method
	if (dropmenuobj && dropmenuobj.onchange && dropmenuobj.style.visibility != "hidden") hidemenu();

	if (nohide == true) {
		dropmenuobj.onmouseover = doNothing;
		dropmenuobj.onmouseout = doNothing;
		//dropmenuobj.addEventListener("mouseover", function() {}, false);
		//dropmenuobj.addEventListener("mouseover", function() {}, false);
	} else {
		dropmenuobj.onmouseover = clearhidemenu;
		dropmenuobj.onmouseout = function(event2) {
			if (window.event) dynamichide(window.event);
			else dynamichide(event2);
		}; // firefox gives an event argument while in IE you must pick it up from window.event
		//dropmenuobj.onmouseout = function() {dynamichide(event)};  // event global variable seems to work in all browsers
	}

	if (nohideonclick == true) {
		dropmenuobj.onclick = doNothingInElem;
		document.onclick = hidemenu;
		hidemenu_onclick = "no";
	} else {
		dropmenuobj.onclick = hidemenu;
		document.onclick = hidemenu;
		hidemenu_onclick = "yes";
	}

	if (bgcolor) {
		dropmenuobj.style.backgroundColor = bgcolor;
	} else {
		dropmenuobj.style.backgroundColor = menubgcolor;
	}
	dropmenuobj.style.whiteSpace = "nowrap";

	// Set the properties of the vertical scroll bars.
	dropmenuobj.style.overflowY = "auto";
	dropmenuobj.style.height = "auto";

	if (maxheight && maxheight > 0) {
		dropmenuobj.style.maxHeight = maxheight + "px";
	}

	// Set the properties of the horizontal scroll bars.
	dropmenuobj.style.overflowX = "auto";
	dropmenuobj.style.width = "auto";

	populatemenu(menucontents); // at this moment, the dropdown is created but not yet visible

	// trigger an event so that components can do something with the contents of the menu
	if (obj) {
		$(obj).trigger("popupmenupopulated", dropmenuobj);
	}

	// Check if the maxHeight and maxWidth apply.
	if (height > 0 && $(dropmenuobj).height() > height) {
		// height = -1 never fixes the height
		$(dropmenuobj).height(height);
	}
	if (width === "auto" || (width > 0 && $(dropmenuobj).width() > width)) {
		// width = -1 never fixes the height
		$(dropmenuobj).width(width);
	}

	var overlay = null;

	if ($("body.mobile").length > 0) {
		// we need a fix for mobile when showing the menu above the link that opened the dropdown...
		// if we don't use this overlay, the click event will still occur on the links of the menu (which we don't want)
		overlay = $("<div>")
			.css({
				opacity: 0.01,
				background: "#fff",
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				"z-index": 5000
			})
			.on("click", function(e) {
				e.stopPropagation();
				e.preventDefault();
			});
		$(document.body).append(overlay);
	}

	// makes it visible on current position
	if (ie4 || ns6) {
		// this is probably always true
		showhide(dropmenuobj.style, e, "visible", "hidden");
		updateHoverPosition(obj, offsetx, offsety);
	}

	if (overlay) {
		// we are on mobile
		setTimeout(function() {
			// lower the overlay
			overlay.css("z-index", 10);
			// if the overlay is clicked, hide the menu and remove the overlay
			$(overlay).on("mouseover click", function hoverHideOnTouch(e) {
				hidemenu();
				overlay.remove();
			});
		}, 400);
	}

	return clickreturnvalue();
};

/**
 * Sets the dropdownmenu to a heuristical position including following features
 * Puts it under obj if there is sufficient room
 * Puts it above obj if there is not sufficient room
 * @author HADW (split off the function to call it not only from internally but also from AttributeCategory.js to update the position without repainting the hover)
 * @param {DOMObj} obj - object to which the dropdown needs to be positioned, typically the triggering object (f.e. a button or an action hyperlink)
 * @param {Number} offsetx: The number of pixels the menu will be offsetted in the horizontal direction.
 * @param {Number} offsety: The number of pixels the menu will be offsetted in the vertical direction.
 */
window.updateHoverPosition = function updateHoverPosition(obj, offsetx, offsety) {
	var offset = $(obj).offset();
	var dropmenuobj = window.dropmenuobj;
	dropmenuobj.x = offset.left;
	dropmenuobj.y = offset.top;

	// Apply the offsets.
	if (offsetx == null) {
		offsetx = 0;
	}
	dropmenuobj.style.left = dropmenuobj.x - clearbrowseredge(obj, "rightedge") + offsetx + "px";
	if (offsety == null) {
		offsety = 0;
	}
	var clearBottom = clearbrowseredge(obj, "bottomedge");
	var top = dropmenuobj.y - clearBottom + obj.offsetHeight + offsety;
	
	dropmenuobj.style.top = top + "px";
	
	var diff = (top - window.pageYOffset) -($(".navbar-sticky").height() || 0);
	if(diff < 0){
		// oops, the dropdown menu comes too high, let's resize and shift to fit
		dropmenuobj.style.top = window.pageYOffset + ($(".navbar-sticky").height() || 0) + "px";
		dropmenuobj.style.height = obj.getBoundingClientRect().y - dropmenuobj.getBoundingClientRect().y + "px";
	}
	
};

window.clickreturnvalue = function clickreturnvalue(event) {
	if (event) {
		// if an event is provided prevent the event from propagating
		if (event.stopPropagation) {
			event.stopPropagation();
		}
		if (event.preventDefault) {
			event.preventDefault();
		}
	}
	return false;
};

window.contains_ns6 = function contains_ns6(a, b) {
	// runs over the parent nodes of b and figures out whether it bounces on a
	// if so, returns true.  So returns true if element a contains element b.
	// problem 1: If b is null --> check on b added by HADW to avoid the crash on b.parentNode when b==null
	// problem 2: checking on parentnode can give an exception when no access to the parent HTMLDivElement.parentNode exception --> added a try
	try {
		while (b && b.parentNode) {
			if ((b = b.parentNode) == a) return true;
		}
		return false;
	} catch (err) {
		return false;
	}
};

window.dynamichide = function dynamichide(e) {
	// figure out whether to hide the menu or not
	// Important is to understand that onmouseout is happening all the time while moving WITHIN the dropdown
	// since every element in the dropdown inherits the onmouseout from the div (probably unless you specifically overrule it)
	try {
		// < ie11
		if (ie4) {
			var target = e.relatedTarget || e.toElement;
			// sometimes IE gives no target element yet
			if (target && !dropmenuobj.contains(target)) {
				delayhidemenu();
			}
		}
		// ie11 and rest
		else if (ns6 && e.relatedTarget && e.currentTarget != e.relatedTarget && !contains_ns6(e.currentTarget, e.relatedTarget)) {
			delayhidemenu();
		}
	} catch (err) {
		// do nothing. typically means that e doesn't have a toElement
	}
};

window.hidemenu = function hidemenu(e) {
	var dropmenuobj = window.dropmenuobj;
	if (dropmenuobj) {
		if (ie4 || ns6) {
			dropmenuobj.style.visibility = "hidden";
			$(dropmenuobj).css("display", "none");
			if (dropmenuobj.onchange) dropmenuobj.onchange();
		}
	}
	document.onclick = doNothing;
};

var delayhide;
window.delayhidemenu = function delayhidemenu() {
	if (ie4 || (ns6 && $("body.mobile").length == 0)) {
		// do not delayhide if on mobile
		delayhide = setTimeout(hidemenu, disappeardelay);
	}
	// hidemenu() will be run after disappeardelay miliseconds
	// delayhide is the timeout ID to track the timeout
	// so after disappeardelay - here on 250 milliseconds, the menu will hide, unless, clearhidemenu() is called
	// this happens if you go again over the dropdown
	// net effect is that you don't loose the dropdown if you go quickly a little bit out of the borders and back in.
	// a luxury !
};

window.clearhidemenu = function clearhidemenu() {
	if (typeof delayhide != "undefined") clearTimeout(delayhide);
};

if (window.hidemenu_onclick == "yes") document.onclick = hidemenu;

//Here we write the dropdownmenu on the document but we keep it hidden.
var installDropmenuDiv = function() {
	if (!document.getElementById("dropmenudiv")) {
		var dropMenuDiv = document.createElement("div");

		dropMenuDiv.id = "dropmenudiv";
		dropMenuDiv.style.visibility = "hidden";
		dropMenuDiv.style.display = "none";
		dropMenuDiv.style.backgroundColor = window.menubgcolor;
		dropMenuDiv.style.position = "absolute";
		dropMenuDiv.onmouseover = window.clearhidemenu;
		dropMenuDiv.onmouseout = window.dynamichide;

		if (menuwidth > 0) {
			dropMenuDiv.style.width = window.menuwidth;
		}

		document.body.appendChild(dropMenuDiv);
		window.dropmenuobj = dropMenuDiv;
	} else {
		window.dropmenuobj = document.getElementById("dropmenudiv");
	}
};

if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
	installDropmenuDiv();
} else {
	document.addEventListener("DOMContentLoaded", installDropmenuDiv);
}
