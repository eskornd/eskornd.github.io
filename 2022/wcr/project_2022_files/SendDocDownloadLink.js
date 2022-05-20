/**
 * @author JAMI
 * @since 12.3.2015
 * 
 * This JavaScript file is used to handle actions for "Send External Document Download Link via E-Mail" functionality.
 * 
 * Such an action is available from the following places:
 * - My Cart
 * - Document Search Results
 * - Document Details (any tab; only single-Document Link generation)
 * - Project Details (Documents + BOM tabs only)
 */

window.downloadDocLinkMailGenerator = function downloadDocLinkMailGenerator (i18n) {
	
	this._i18n = i18n;
	this._AJAXWorkerJSP = 'tempdownload.wcr';
	var self = this;
	
	/*
	 * OVERSIZED MESSAGE CONTENT >>>>
	 * PLATFORM + BROWSER LIMITS
	 * for more details see Appendix : 6.1	Mailto URI Size limitation in Numbers section in UDD-Download_Link_03.doc
	 * 
	 * WINDOWS OS
	 * IE 7 until 11: 360 characters
	 * IE12+: 1535 characters (not confirmed as this version is not yet released officially)
	 * FireFox; Chrome; Safari:  1530 characters
	 * 
	 * MACOSX OS
	 * All browsers: 17000 characters
	 */
	
	var WIN_IE_OLD_CHAR_LIMIT = 360;
	var WIN_IE_11PLUS_FF_CHROME_CHAR_LIMIT = 1530;
	var MACOS_ALL_BROWSERS_CHAR_LIMIT = 17000;
	
	/**
	 * Used to generate a Doc DL Link for a list of Documents 
	 * Available at: Document Details action; My Cart; Document Search Results - Single and Batch Document Operations; Project Details - Documents)
	 * 
	 * @param documentVersionIDs - Array of Document Version IDs > there are the Documents that were selected for DL Link generation
	 * @param docVersionsNameMap - a map of Document Version IDs and the corresponding Document Names; keys: id; name
	 */	
	this.generateDocumentBatchDLLinkMail = function (documentVersionIDs, docVersionsNameMap) { 
		//prepare the URL for the AJAX call
		var linkGenerationURLData = 'action=batch_generate';
		
		//also paste all the supplied Document Version IDs (all under the same parameter name> )
		if (documentVersionIDs && documentVersionIDs.length > 0) {
            for (var i = 0; i < documentVersionIDs.length; i++) {
            	linkGenerationURLData = linkGenerationURLData+'&docVersionID='+documentVersionIDs[i];
              };
		} else {
			alert(self._i18n.GENERATE_DLLINKFAILED);
			return;
		}
		
		//NOTE: use JQuery AJAX call so to be able to pass the URL parameter is the request body
		$.ajax({
			url: self._AJAXWorkerJSP,
			type: "POST",
			data: linkGenerationURLData,
			dataType: 'xml',
			timeout: 120000,
			success:function(data){
                //check for error state first
                var errCodeNode = data.getElementsByTagName("error_code");
                if (errCodeNode[0]) {
                	var errorCodeVal = $(errCodeNode[0]).text();
                	
                	if (errorCodeVal === "NONE_DOCS_SUPPLIED") {
                       	alert(self._i18n.GENERATE_DLLINKFAILED_INVALID_PARAMS);
                    } else if (errorCodeVal === "NONE_DOCS_ALLOWED") {
                    	alert(self._i18n.GENERATE_DLLINKFAILED_NONE_DOCS_ALLOWED);
                    } else if (errorCodeVal === "GENERATION_ERROR") {
                       	alert(self._i18n.GENERATE_DLLINKFAILED);
                    }
                	
                	return;
                }
                
                //check if a valid DocVersion > Name map was supplied
                if (!(docVersionsNameMap && docVersionsNameMap.length > 0)) {
                	alert(self._i18n.GENERATE_DLLINKFAILED_INVALID_NAMEMAP_PARAM);
                	return;
                }
                             
                //process the resulting XML
                var resultXMLRootNode = data.getElementsByTagName("download_link_URL_batch");
                if (resultXMLRootNode[0]) {
                  	//first check whether any of the processed documents failed to have their DL link generated for (permission denied most likely)
                  	var deniedDocsFeedbackRootNode = data.getElementsByTagName("denied_document_version_IDs");
                   	if (deniedDocsFeedbackRootNode[0]) {
                   		//retrieve all the Document Version IDs
                   		var allDeniedDocuments = data.getElementsByTagName("docVersionID");
                   		if (allDeniedDocuments[0]) {
                   			//prepare the feedback message
                   			var deniedMsg = self._i18n.DOCS_DENIED_FEEDBACK_MESSAGE_START+'\n';
                   			
                   			for(var i=0; i<allDeniedDocuments.length; i++) {
                   				var curDeniedDocVersionID = $(allDeniedDocuments[i]).text();
                   				//get Document Name for the current Doc. Version ID
                   				var docVersionIDNameElement = self._findDocumentVersionNameMapElement(docVersionsNameMap, curDeniedDocVersionID);
                   				if (docVersionIDNameElement && docVersionIDNameElement.length > 0) {
                   					//add the current Document Name to the feedback message
                   					deniedMsg = deniedMsg + docVersionIDNameElement[0].name + '\n';
                   				};
                   			}
                   			
                   			//close the feedback message
               				deniedMsg = deniedMsg + '\n' + self._i18n.DOCS_DENIED_FEEDBACK_MESSAGE_END;
               				
               				//show the feedback message
               				alert(deniedMsg);
                   		};
                   	} //DENIED DOCS FEEDBACK END
                   	
               		//now generate the Download Link mail itself
               		var downloadLinkURLNodes = data.getElementsByTagName("downloadLinkURL");
               		if (downloadLinkURLNodes[0]) {
               			//some document DL link URLs found > start preparing the mail
               			var to = "";
               			var subject = self._i18n.MAILTOSUBJECTDOCSDOWNLOAD;
               			
               			var bodyContent = "";
               			//add individual Document DL Links (URL + Document Name)
               			for(var i=0; i<downloadLinkURLNodes.length; i++) {
               				var curDLLinkElem = $(downloadLinkURLNodes[i]);
               				
               				var curDocDLLinkURL = curDLLinkElem.text();
               				var curDocVerID = curDLLinkElem.attr("docVersionID");
               				var curDocVersionIDNameElement = self._findDocumentVersionNameMapElement(docVersionsNameMap, curDocVerID);
               				if (curDocVersionIDNameElement && curDocVersionIDNameElement.length > 0) {
               					//add the current Document Name to the feedback message
               					var curDocName = curDocVersionIDNameElement[0].name;
               					
               					//NOTE: using '\r\n' as a newline character
               					bodyContent = bodyContent + curDocName + '\r\n' + curDocDLLinkURL + '\r\n \r\n';
               				}
               			
               			}
               			
               			//now create the final e-mail message to be sent
               			var mailtoURIVal = "mailto:" + to + "?subject=" + encodeURIComponent(subject)  +  "&body=" + encodeURIComponent(bodyContent);
               			
               			if (!self._isTargetMailToURIOverSizeLimit(mailtoURIVal)) {
               				//URI size is OK -> just pop up the email message
            				window.location = mailtoURIVal;	
               			} else {
               				//uh oh! the URI is too long to be handled properly on the current client setup > need to use the 'popup scenario'
             				self._openOverSizeMailPopup(subject, bodyContent);	            				
               			}
        				
        				         
               		} // DL LINKS MAIL HANDLING END
               		
                } else {
                   	alert(self._i18n.GENERATE_DLLINKFAILED); 
                }
                
                return;
            },
			error:function(jqXHR, textStatus, errorThrown){
				alert(self._i18n.GENERATE_DLLINKFAILED);
		  	}
		});	      		
		
		return;
	};
	
	/**
	 * Used to generate a 'Send to' Document Link for a list of Documents (My Cart; Document Details - actions)
	 * 
	 * @param docVersionsNameMap - a map of Document Version IDs and the corresponding Document Names; keys: id; name
	 * @param hostURLVal - URL value of the current client host
	 */	
	this.generateDocumentBatchLinkToMail = function (docVersionsNameMap, hostURLVal) {
		
		if (!docVersionsNameMap) {
			return;
		}
		
        // prepare message subject and body values
        var to = "";
        
        //choose between a single and multi document context Subject value
        var subject = docVersionsNameMap.length === 1?self._i18n.MAILTOSUBJECTDOC:self._i18n.MAILTOSUBJECTDOCS;
   			
   		var bodyContent = "";
   		//add individual Document Links (URL + Document Name)
   		for(var i=0; i<docVersionsNameMap.length; i++) {
   			var curDocVerId = docVersionsNameMap[i].id;
   			var curDocName = docVersionsNameMap[i].name;
   			
   			if (curDocVerId && curDocVerId.length > 0 && curDocName && curDocName.length > 0) {
   				var curDocDetailsURL = hostURLVal + '/docdetails.jsp?menu_file=cartmgr&docVerID='+curDocVerId;
   				bodyContent = bodyContent + curDocName + '\r\n' + curDocDetailsURL + '\r\n \r\n';	
   			}   			
   		}
   			
   		//now create the final e-mail message to be sent
   		var mailtoURIVal = "mailto:" + to + "?subject=" + encodeURIComponent(subject)  +  "&body=" + encodeURIComponent(bodyContent);
   			
   		//try to open the new E-Mail Message
   		if (!self._isTargetMailToURIOverSizeLimit(mailtoURIVal)) {
   			//URI size is OK -> just pop up the email message
			window.location = mailtoURIVal;
   		} else {
   			//uh oh! the URI is too long to be handled properly on the current client setup > need to use the 'popup scenario'
 			self._openOverSizeMailPopup(subject, bodyContent);	            				
   		}
   		
		return;
	};
	
	/**
	 * Checks whether the specified target mailto: URI does not exceed the safe limit for the client's OS+Broser setup 
	 * 
	 * NOTE: REQUIRES webcenter_html.js to be accessible in order to make a call to this function properly
	 */
	this._isTargetMailToURIOverSizeLimit = function (targetMailToURI) {
		
		var sizeLimitVal = 0;
		
		//check the OS platform first
		var OSName="Unknown OS";
		if (window.navigator.appVersion.indexOf("Win") !== -1) OSName="Windows";
		if (window.navigator.appVersion.indexOf("Mac") !== -1) OSName="MacOS";
		
		if (OSName == "MacOS") {
			//handle limit for a MacOS client setup
			//the limit is the same for all browsers on MacOS platform
			sizeLimitVal = MACOS_ALL_BROWSERS_CHAR_LIMIT;
		} else {
			//handle limit for a Windows client setup (in case the OS is 'unknown' we fall back to the most strict limit - which is Windows OS)
			//for windows we need to distinguish between various browser types
			
			//checking for IE version (false if different browser)
			//NOTE: this call REQUIRES webcenter_html.js to be accessible
			var IEVersion = false;
			try {
				IEVersion = detectIE();	
			} catch (e) {
				// Something went wrong when detecting IE version
				alert("detectIE function could not be executed properly. Make sure webcenter_html.js is imported on the current page.");
				//fallback to the lowest limit
				sizeLimitVal = WIN_IE_OLD_CHAR_LIMIT;
			}
			
			if (!IEVersion) {
				//non-IE browser
				sizeLimitVal = WIN_IE_11PLUS_FF_CHROME_CHAR_LIMIT;
			} else if (IEVersion <= 11) {
				//IE up to version 11
				sizeLimitVal = WIN_IE_OLD_CHAR_LIMIT;
			} else {
				//IE12+
				sizeLimitVal = WIN_IE_11PLUS_FF_CHROME_CHAR_LIMIT;
			};
		};
		
		//the limit value is now known > compare the actual URI size
		return targetMailToURI.length > sizeLimitVal;
	};
	
	/**
	 * Opens a dedicated Popup window and displays the target e-mail message body content. It has to be copied manually by the user. A button is provided to open a new blank e-mail message.
	 * 
	 * @param mailSubjectVal - String; the target e-mail message "subject" property value
	 * @param mailBodyContentVal - String; the target e-mail message "body" property value; preformatted for inclusion in an HTML textarea content
	 * 
	 */
	this._openOverSizeMailPopup = function (mailSubjectVal, mailBodyContentVal) {
		
		require(["@esko/modal/Modal"], function(Modal) {
			// Sometimes this file is built with webpack (newer "require" api) and sometimes it is used in a script tag (older "require" api) 
			if(Modal.default) {Modal = Modal.default;}
        	
			var popupContent = $("<div>").addClass("OverSizeMailPopup-wrapper add-padding");
			//add padding to move content a bit to the right
			
			//initialize Popup reference
            var popup = new Modal(popupContent, {});
            
            // WORKAROUND for setTimeout in Modal.js#fixZIndex()
        	// We need our onShown code to be executed after the one in Modal.js#fixZIndex().
        	// The code in fixZIndex() calls "focus()" which messes up our selection...
        	// How to execute after Modal.js#fixZIndex()? Well:
        	// Once the onShown event is triggered, wait a frame so we are sure the shown event bubbled to the document.body and Modal.js#fixZIndex() executes.
        	// Then, we use the same setTimeout of "5 millis" here as in Modal.js#fixZIndex()
            var modalCallsFocusWorkaround = function(callback) {
            	setTimeout(function() {
            		setTimeout(function() {
	            		// Ok, now we are sure Modal.js#fixZIndex() has executed. Call our own code now.
            			callback();
            		}, 5);
            	}, 0);
            };
            
            // Wait till the textarea is in the DOM before we try to select it...
            // Note: The textarea is NOT yet put in the DOM after calling popup.open(), we have to use the onShown event.
            popup.onShown(function() {
            	// Ok, our textarea is in the DOM, we could select the content now. But first, workaround an issue...
            	modalCallsFocusWorkaround(function() {
	            	// Make sure the text content is selected when the popup opens
            		textArea.trigger("select");
            	});
            });
            
            popup.setTitle(self._i18n.OVERSIZE_DOC_DL_MESSAGE_POPUP_TITLE);
            
            //initialize the "information message"
            var infoMsgDiv = $("<div>").addClass("help-block").text(self._i18n.OVERSIZE_DOC_DL_MESSAGE_CONFRIM);
            popupContent.append(infoMsgDiv);
            		
			//initialize the text content
			var textContentDiv = $("<div>");
			var textArea = $("<textarea>").attr({"name": "emaillinksfield"}).addClass("form-control").attr("rows", 25).text(mailBodyContentVal);
			textContentDiv.append(textArea);
			popupContent.append(textContentDiv);
		
			//initialize the buttons bar
			var buttonsBarDiv = $("<div>").addClass("add-spacing-top");
			
			var openNewEMailMessageWindowButton = $("<input>").attr("type", "button").prop("value", self._i18n.OPEN_NEW_EMAIL_MESSAGE)
			.addClass("btn btn-primary")
			.on('click', function() {window.location = 'mailto: ?subject=' + encodeURIComponent(mailSubjectVal);});
			buttonsBarDiv.append(openNewEMailMessageWindowButton);
		
			var closePopupButton = $("<input>").attr("type", "button").addClass("btn btn-default").prop("value", self._i18n.CLOSE);
			closePopupButton.on('click', function() {popup.close();});
			buttonsBarDiv.append($("<span>").addClass("add-spacing-left").append(closePopupButton));
		
			popupContent.append(buttonsBarDiv);
            
			//now show the popup
            popup.open();
        });
	};
	
	/**
	 * Inspect an array of DocVersionID+Name and locate the element that represents the target Document Version ID
	 */
	this._findDocumentVersionNameMapElement = function (docVersionNameMap, targetDocVersionID) {
		return $.grep(docVersionNameMap, function(item){
		      return item.id == targetDocVersionID;
		    });
	};
};