if(!window.extpopup_initialized){
	window.extpopup_initialized = true;
	
	window.thumbdisappeardelay = 250; //thumb disappear delay onMouseout (in milliseconds)
	window.thumbshowdelay = 1000; //thumb show delay onMouseover (in milliseconds)
	window.thumboffsetx = 20; // thumb horizontal offset from mouse position
	window.thumboffsety = 0; // thumb vertical offset from mouse position
	window.alwayszoom = 0;
	window.currentDocName;
	
	window.eventX = 0;
	window.eventY = 0;
	
	window.showthumbscanclose = {
		standard: false
	}
	window.showthumbsclosetooltip = {
		standard: null
	}
	window.showthumbsenabled = {
		standard: true
	}
	window.showthumbsalwayszoom = {
		standard: false
	}
	
	window.showthumboffset = function(e, which, optWidth, offsetx, offsety) {
		if (!document.all && !document.getElementById)
			return;
		clearhidepopup();
		menuobject = ie5 ? document.all.popitmenu : document.getElementById("popitmenu");
		menuobject.style.display = "block";
		menuobject.innerHTML = which;
		menuobject.contentwidth = menuobject.offsetWidth + 20; // 20px margins
		menuobject.contentheight = menuobject.offsetHeight + 20;
		menuobject.style.width = (typeof optWidth != "undefined") ? optWidth : defaultMenuWidth;
		//Find out how close the mouse is to the corner of the window
		var rightedge = (ie5 ? iecompattestpopup().clientWidth : window.innerWidth) - eventX - offsetx;
		var bottomedge = (ie5 ? iecompattestpopup().clientHeight : window.innerHeight) - eventY - offsety;
		//if the horizontal distance isn't enough to accommodate the width of the context menu
		if (rightedge < menuobject.contentwidth) {
			var newleft = (ie5 ? iecompattestpopup().scrollLeft + iecompattestpopup().clientWidth : window.pageXOffset + window.innerWidth) - menuobject.contentwidth - offsetx;
			menuobject.style.left = newleft + "px";
		} else {
			//position the horizontal position of the menu where the mouse was clicked
			menuobject.style.left = ie5 ? iecompattestpopup().scrollLeft + eventX + offsetx + "px" : window.pageXOffset + eventX + offsetx + "px";
		}
		//same concept with the vertical position
		if (bottomedge < menuobject.contentheight) {
			//alert("move");
			var newtop = (ie5 ? iecompattestpopup().scrollTop + iecompattestpopup().clientHeight : window.pageYOffset + window.innerHeight) - menuobject.contentheight - offsety;
			menuobject.style.top = newtop + "px";
		} else {
			menuobject.style.top = ie5 ? iecompattestpopup().scrollTop + eventY + offsety + "px" : window.pageYOffset + eventY + offsety + "px";
		}	
		return false;
	}
	
	window.popupcontent = 0;
	window.popupwidth = 0;
	window.popupevent = null;
	
	window.showthumbdelayed = function showthumbdelayed(xOffset, yOffset) {
		if (xOffset == null || yOffset == null) {
			showthumboffset(popupevent, popupcontent, popupwidth, thumboffsetx, thumboffsety);
		} else {
			showthumboffset(popupevent, popupcontent, popupwidth, xOffset, yOffset);
		}
	}
	
	window.zoom = function zoom(docname, zoomurl, zoomsize, tmpimagesrc, section, instant) {
		section = section || "standard";
		window.showthumbsalwayszoom[section] = true;
		require(["underscore"], function (_) {
			var tmpimage;
			if (tmpimagesrc == null) tmpimage = "<img src='images/loader.gif' alt='' border='0' height='10' />";
			else {
				tmpimage = "<img src='" + tmpimagesrc + "' alt='' border='0' height='" + zoomsize + "' style='max-width: 500px; max-height: 500px;' />";
			}
			
			var which = "<table width='" + zoomsize + "' cellspacing='0' cellpadding='0'><tr height='20'><td class='table_title'>&nbsp;" + $('<div/>').text(docname).html() + getCloseButtonHtml(section, _.escape(section)) + "</td></tr><tr align='center' valign='center'><td class='white_background' height='" + zoomsize + "'>" + tmpimage + "</td></tr></table>";
	
			popupwidth = zoomsize;
			popupcontent = which; // the parameter is a string that has to be evaluated into a value
	
			menuobject = document.getElementById("popitmenu");
			showdelay = instant?0:menuobject.style.display == "none" ? 0 : thumbshowdelay;
			delayshowpop = setTimeout(showthumbdelayed.bind(this), showdelay);
			
			var image = loadImage(zoomurl, docname, section, _.escape(section), tmpimagesrc);
			return;
		});
		return;
	}
	
	window.loadImage = function(imgscr, docname, section, escapedSectionName, tmpimage) {
		var image = new Image();
		image.name = docname;
		image.onload = function () {
			imagesLoaded(image, section, escapedSectionName);
		};
		image.onerror = function() {
			if (tmpimage !== null) {
				imagesLoaded({
					width: 500,
					height: 500,
					name: docname, 
					src: $('<div/>').text(tmpimage).html()
				}, section, escapedSectionName);
			}
		}
		image.src = imgscr;
		return image;
	}
	
	// function invoked on image load
	window.imagesLoaded = function(image, section, escapedSectionName) {
		if (window.delayshowpop)
			clearTimeout(delayshowpop);
	
		if (currentDocName == image.name) {
			var zoomsize = Math.max(image.width, image.height);
			var which = "<table height='" + zoomsize + "' width='" + zoomsize + "' cellspacing='0' cellpadding='0'><tr height='20'><td class='table_title'>&nbsp;" + $('<div/>').text(image.name).html() + getCloseButtonHtml(section, escapedSectionName) + "</td></tr><tr align='center' valign='center'><td class='white_background' height='" + zoomsize + "'><img src='" + image.src + "' alt='' border='0' style='max-width: 500px; max-height: 500px;' />"+"</td></tr></table>";
	
			popupwidth = zoomsize;
			popupcontent = which;
	
			menuobject = ie5 ? document.all.popitmenu : document.getElementById("popitmenu");
			if(menuobject.style.display !== "none") {
				showthumbdelayed();
			} else {
				delayshowpop = setTimeout(showthumbdelayed.bind(this), 0);
			}
		}
		return;
	}
	
	window.getCloseButtonHtml = function(section, escapedSectionName) {
		if(window.showthumbscanclose[section]) {
			return '<div class="imagehoverclosebtn" onclick="thumbactivationsetvalue(\''+escapedSectionName+'\', false);hidemenupopup();"'+(window.showthumbsclosetooltip[section]?' title="'+$("<div>").text(window.showthumbsclosetooltip[section]).html()+'"':'')+' style="cursor:pointer;"><i class="icon icon-WCR_Close"></i></div>';
		} else if(window.showthumbsalwayszoom[section]) {
			return '<div class="imagehoverclosebtn" onclick="window.showthumbsalwayszoom[\''+escapedSectionName+'\'] = false;hidemenupopup();"'+(window.showthumbsclosetooltip[section]?' title="'+$("<div>").text(window.showthumbsclosetooltip[section]).html()+'"':'')+' style="cursor:pointer;"><i class="icon icon-WCR_Close"></i></div>';
		} else {
			return '';
		}
	}
	
	window.endsWithNoCase = function endsWithNoCase(s, check) {
		if (s != null && check != null && s.length > check.length)
			return s.toLowerCase().indexOf(check.toLowerCase()) == s.length - check.length;
		return false;
	}
	
	window.showthumb = function showthumb(e, thumburl, docname, pw, imgheight, zoomurl, zoomsize, section, instant) {
		section = section || "standard";
		if(!window.showthumbsenabled[section]) {
			return;
		}
		require(["underscore"], function (_) {
			popupwidth = pw;
			if (window.delayshowpop)
				clearTimeout(delayshowpop);
			popupevent = e;
			eventX = ie5 ? event.clientX : e.clientX;
			eventY = ie5 ? event.clientY : e.clientY;
			currentDocName = docname;
			var zoomcontent = "";
			if (zoomurl != null && !endsWithNoCase(docname, ".ard") && !endsWithNoCase(docname, ".mfg") && !endsWithNoCase(docname, ".acd") && !endsWithNoCase(docname, ".a3d") && !endsWithNoCase(docname, ".wtc") && !endsWithNoCase(docname, ".wcc")) {
				if (!zoomsize) zoomsize = 500;
				if (window.showthumbsalwayszoom[section]) {
					zoom(docname, zoomurl, zoomsize, thumburl, section, instant);
					return;
				}
				
				zoomcontent = "<div style='cursor:pointer;' onclick=\"zoom('" + _.escape(docname) + "','" + zoomurl + "'," + zoomsize + ", '" + thumburl + "', '"+_.escape(section)+"', "+instant+");\"><i class='icon icon-WCR_ZoomIn'></i></div>";
			}
			if (imgheight) {
				popupcontent = "<table width='" + popupwidth + "' cellspacing='0' cellpadding='0'><tr height='20'><td class='table_title'>" + $('<div/>').text(docname).html() + "</td><td width='12' valign='top'>" + zoomcontent + getCloseButtonHtml(section, _.escape(section)) + "</td></tr><tr align='center' valign='center'><td class='white_background' style='position:relative' colspan='2'><div><img src='" + thumburl + "' alt='' border='0' height='" + imgheight + "' style='max-width: 200px; max-height: 200px;' /></div>" + "</td></tr></table>";
			} else {
				popupcontent = "<table width='" + popupwidth + "' cellspacing='0' cellpadding='0'><tr height='20'><td class='table_title'>" + $('<div/>').text(docname).html() + "</td><td width='12' valign='top'>" + zoomcontent + getCloseButtonHtml(section, _.escape(section)) + "</td></tr><tr width='200' height='200' align='center' valign='center'><td class='white_background' style='position:relative' colspan='2'><div><img src='" + thumburl + "' alt='' border='0' style='max-width: 200px; max-height: 200px;' /></div>" + "</td></tr></table>";
			}
	
			window.menuobject = document.getElementById("popitmenu");
			window.showdelay = instant?0:(menuobject && menuobject.style.display == "none") ? 0 : thumbshowdelay;
			window.delayshowpop = setTimeout(showthumbdelayed.bind(this), showdelay);
		});
	}
	
	window.clearshowpopup = function() {
		if (window.delayshowpop)
			clearTimeout(delayshowpop);
	}
	
	window.delayhidethumb = function delayhidethumb() {
		clearshowpopup();
		window.delayhidepop = setTimeout("hidemenupopup()", thumbdisappeardelay);
	}
	
	window.delayshowpopup = function(e, popuphtml, pw, xOffset, yOffset) {
		popupwidth = pw;
		popupcontent = popuphtml; // the parameter is a string that has to be evaluated into a value
		popupevent = e;
		eventX = ie5 ? event.clientX : e.clientX;
		eventY = ie5 ? event.clientY : e.clientY;
		menuobject = ie5 ? document.all.popitmenu : document.getElementById("popitmenu");
		showdelay = menuobject.style.display == "none" ? 0 : thumbshowdelay;
		if (xOffset == null || yOffset == null) {
			delayshowpop = setTimeout(window.showthumbdelayed.bind(this), showdelay);
		} else {
			delayshowpop = setTimeout(window.showthumbdelayed.bind(this, xOffset, yOffset), showdelay);
		}
		return
	}
	
	window.delayshowpopupbyid = function(e, popupid, pw) {
		delayshowpopup(e, document.getElementById(popupid).innerHTML, pw, 10, 0);
	}
	
	window.showpopupbyid = function(e, popupid, pw) {
		var temp = thumbshowdelay;
		thumbshowdelay = 0;
		delayshowpopup(e, document.getElementById(popupid).innerHTML, pw, 10, 0);
		thumbshowdelay = temp;
	}
	
	window.delayshowpopupind = function(e, spopuphtml, pw) {
		delayshowpopup(e, eval(spopuphtml), pw); // the parameter is a string that has to be evaluated into a value
	}
	
	//
	// Disable/enable thumb popup for some parts of the page
	//
	window.thumbactivationpushdefault = function thumbactivationpushdefault(section, defaultVal) {
		if(window.showthumbsenabled[section] === undefined) {
			window.showthumbsenabled[section] = defaultVal;
		}
	}
	window.thumbactivationcanclose = function thumbactivationcanclose(section, val, tooltip) {
		window.showthumbscanclose[section] = val;
		window.showthumbsclosetooltip[section] = tooltip;
	}
	
	window.thumbactivationsetvalue = function thumbactivationsetvalue(section, val) {
		window.showthumbsenabled[section] = val;
		// Delete all the popout buttons on the page (for this "section")
		$(".wcrthumbtoggle." + section).toggleClass("hiddenElement", val);
	}
	window.thumbactivationsetalwayszoom = function thumbactivationsetalwayszoom(section, alwaysZoom) {
		if(window.showthumbsalwayszoom[section] === undefined) {
			window.showthumbsalwayszoom[section] = alwaysZoom;
		}
	}
}