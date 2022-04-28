// A generic function for performming AJAX requests
// It takes one argument, which is an object that contains a set of options
// All of which are outline in the comments, below
window.ajax = function ajax( options ) {
	console.warn("Using Deprecated global ajax()");

	// we tag the url with an indication that the call we make is an ajax call. 
	// This allows the logincheck.jsp to put an error code on the response in case an error occured. (session expired/other error)
	if (options.url!=null && options.url != '' ) 
	{
		if (options.url.indexOf("?") == -1) 
			options.url = options.url + '?' ;
		else 
			options.url = options.url + '&' ;
		options.url = options.url + 'ajax=1';
	}

    // Load the options object with defaults, if no
    // values were provided by the user
    options = {
        // The type of HTTP Request
        type: options.type || "POST",

        // The URL the request will be made to
        url: options.url || "",

        // How long to wait before considering the request to be a timeout
        timeout: options.timeout || 30000,

        // Functions to call when the request fails, succeeds,
        // or completes (either fail or succeed)
        onComplete: options.onComplete || function(){},
        onError: options.onError || function(){},
        onSuccess: options.onSuccess || function(){},

        // The data type that'll be returned from the server
        // the default is simply to determine what data was returned from the
        // and act accordingly.
        data: options.data || "",
        debug: options.debug || 0,
        synchronous: options.synchronous,
        objHdl: options.objHdl , // handle to the object calling
        content: options.content, 
        contentType: options.contentType || "text/xml",
        cache: (options.cache === undefined) ? true : options.cache // by default, caching is possible, depending on the behavior of the browser
    };
    if (options.debug) alert("before creating request object, typeof XMLHttpRequest: " + typeof XMLHttpRequest);
    
    if (!options.cache) {
    	if (options.url != null && options.url != ''){
    		// the url is defined
    		if (options.url.indexOf("?") == -1) {
    			options.url += '?' ;
    		} else {  
    			options.url += '&' ;
    		}
    		options.url += "preventAjaxCaching="+(new Date()).getTime();
    	}
    }
    // Create the request object
    if (typeof XMLHttpRequest == "undefined") {  // old versions IE
			XMLHttpRequest = function(){
					// Use ActiveXObject, see Pro JavaScript Techniques p 217
        return new ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >= 0 ? "Microsoft.XMLHTTP" : "MSxml2.XMLHTTP");
		  };
    };  // end if IE

    if (options.debug) alert("before new Xmlhttprequest");
    var xml = new XMLHttpRequest();

    if (options.synchronous) {
      xml.open(options.type, options.url, false);
    } else {
      // Open the asynchronous POST request
      xml.open(options.type, options.url, true);
    }
    
    if (options.type == "POST") {   	
      // this code is copied from Pro Javascript Techniques page 221
      xml.setRequestHeader("Content-type", options.contentType); 
      //xml.setRequestHeader("Content-length", options.content.length); 
      //if (xml.overrideMimeType) xml.setRequestHeader("Connection", "close");   
    }
    
    // Keep track of when the request has been succesfully completed
    var requestDone = false;

    // Initalize a callback which will fire options.timeout miliseconds from now, cancelling
    // the request (if it has not already occurred).
    if (options.timeout>0) {
      var timeoutID=setTimeout(function(){
          requestDone = true;
          options.onError("Ajax call timed out after " + options.timeout + "miliseconds");
          options.onComplete();

      }, options.timeout);
    }
    // Watch for when the state of the document gets updated
    xml.onreadystatechange = function(){
      // Wait until the data is fully loaded,
      // and make sure that the request hasn't already timed out
      if ( xml.readyState == 4  ) {
        if (!requestDone) {
          if (timeoutID) clearTimeout(timeoutID);
        	var ct=xml.getResponseHeader("content-type");
					if (options.debug) {
						var alerttxt = xml.responseText;
						if (alerttxt.length > 1000) {
							var alerttxtfront = alerttxt.substr(0,500);
							var alerttxtback = alerttxt.substr(alerttxt.length-1-500,500);
							alerttxt = alerttxtfront + "\n...\n" + alerttxtback;
						}
						alert("readyState:" + xml.readyState+"  server status:"+xml.status+"header:  "+ct+"  response: "+ alerttxt)
					}

          // Check to see if the request was successful
          if ( httpSuccess( xml ) ) {
          // Execute the success callback with the data returned from the server
              options.onSuccess( httpData( xml, options.data), options.objHdl );

          // Otherwise, an error occurred, so execute the error callback
          } else {
            options.onError(xml.status, options.objHdl, xml.statusText);

          }
          // Call the completion callback
          options.onComplete(options.objHdl);

        } else {
          //servlet returned after timeout... and onError and onComplete are already called
        }


        // Clean up after ourselves, to avoid memory leaks
        xml = null;
        
      }
    };

    // Establish the connection to the server
    if (options.debug) alert("before xml.send");
    
    if (options.type == "POST" && options.content!=null) {
      xml.send(options.content);
    } else {
      xml.send(null);
    }
    if (options.debug) alert("after xml.send");

    // Determine the success of the HTTP response
    function httpSuccess(r) {
        try {
            // If no server status is provided, and we're actually 
            // requesting a local file, then it was successful
            return !r.status && location.protocol == "file:" ||

                // Any status in the 200 range is good
                ( r.status >= 200 && r.status < 300 ) ||

                // Successful if the document has not been modified
                r.status == 304 ||

                // Safari returns an empty status if the file has not been modified
                navigator.userAgent.indexOf("Safari") >= 0 && typeof r.status == "undefined";
        } catch(e){}

        // If checking the status failed, then assume that the request failed too
        return false;
    }

    // Extract the correct data from the HTTP response
    function httpData(r,type) {
    	var data;
        if ((r.status == 201) && (type == "text")) { // SC_CREATED is used to indicate error page
            var message = r.getResponseHeader("WebCenterErrorMessage");
            if (message != null) {
                // the message is uft8 encoded, and already XML encoded (note: '\n' is not handled)
                return "<span class=\"wcr_ajax_error\">" + WCXML.Utf8decode(message) + "</span>";
            }
        }
           
        // Get the content-type header
        var ct = r.getResponseHeader("content-type");
        var returnedxml=ct&&ct.indexOf("xml") >= 0;

        // Get the XML Document object if requested by type or of type was not requested
        // and XML was returned from the server, 
        // otherwise return the text contents returned by the server
        
        if (type == "xml" || (type==null && returnedxml==true)) {
            if (typeof ActiveXObject != "undefined") {   
                // Internet Explorer.  Try using Microsoft XML DOM.
                // On 6 Aug 2010, I figured out that you can disable Microsoft XML DOM in Internet Explorer
                // If you do, new ActiveXObject seems to fail, while not really returning null (not clear what exactly it returns)
                // Code was adapted to return r.responseXML, so meaning you fall back on standard XML DOM.
                // This is known not to work on older IE, but it's not clear whether you can ever disable MS XML DOM on older IE than IE7
                // anyway, if you can, you should not if you want to use Ajax...
                if (options.debug) alert("converting text to xml")
                try {		          
                    xmlDoc=new ActiveXObject("Microsoft.XMLDOM");						  
                    if (xmlDoc == null) throw("Cannot create ActiveXObject"); 
						  
                    xmlDoc.async="false";
                    var responseText = r.responseText;
                    if (r.status == 201) { // handle HTML error page
		               var message = r.getResponseHeader("WebCenterErrorMessage");
		               if (message != null) {
                         responseText = "<error><errorMessage>"+message+"</errorMessage></error>";
                         alert(responseText);
		               }
                    }
                    xmlDoc.loadXML(responseText);
						  
                    if (xmlDoc.parseError && xmlDoc.parseError.errorCode != 0) {
                        var myErr = xmlDoc.parseError;						    
                        alert("xml parser error " + myErr.reason); 						  
                    } else {
                        //alert("no parser errors");
                    }			  
                    data=xmlDoc;						  
                } catch (err) {
                    if (options.debug) alert("failed converting using Microsoft XMLDOM" + err  +  "\nresponse content dump:\n" + r.responseText);
                    //data = r.responseText;
                    if (r.responseXML) {
                        data = r.responseXML;
                    } else {
                        data = r.responseText;
                    }
                }					  
            } else {
                if (options.debug) alert("using responseXML");
                var responseXML = r.responseXML;
                if (r.status == 201) { // handle HTML error page
	               var message = r.getResponseHeader("WebCenterErrorMessage");
	               if (message != null) {
                     var xmlText = "<error><errorMessage>"+message+"</errorMessage></error>";
                     parser=new DOMParser();
                     responseXML=parser.parseFromString(xmlText,"text/xml");
                   }
                }
                data = responseXML;
            }
        } else {
            if (options.debug) alert("using responseText");                           
            data = r.responseText;        
        }
        
        // If the specified type is "script", execute the returned text
        // response as if it was JavaScript
        if ( type == "script" )
            eval.call( window, data );

        // Return the response data (either an XML Document or a text string)
        return data;
    }
}

var gConnectionStatus = false;
window.displayTestStatus = function displayTestStatus(inProgress, passed) {   
	gConnectionStatus = false;
	$("#AjaxStatusInProgress").hide();
	$("#AjaxStatusPassed").hide();
	$("#AjaxStatusFailed").hide();
	$("#AjaxStatusFailedTxt").hide();
	$("#AjaxStatusPassedTxt").hide();
	    
	if(inProgress){
		//in progress
		$("#AjaxStatusInProgress").show();
	}else{
		if (passed){
			//passed
			$("#AjaxStatusPassed").show();
			$("#AjaxStatusPassedTxt").show();
			gConnectionStatus = true;
		}else{
		    //failed
		    $("#AjaxStatusFailed").show();
		    $("#AjaxStatusFailedTxt").show();
		}
	}
}

window.keepSessionAlive = function keepSessionAlive(errorHandler) {
	try {
		ajax({

			url: (webcenterConfig?webcenterConfig.jspBaseUrl:'') + "sessionalive.jsp",
			type: "GET",
			data: "xml",
			debug: false,
			synchronous: false,
			
			onError: errorHandler,

			onSuccess: function(xml) {
			} 

		});  // End Ajax code

	} catch (err) {
		// do nothing

	}
}

/**
 * Used to retrieve error message when using a non-SDK handler to perform an ajax call
 * > any error encountered will return as a HTML-based text response with <span>ERROR_MSG</span> format
 * 
 * @requires webcenter_xml.js to be imported
 * @param textResponse > text-type AJAX response data
 * @return String > error message text OR empty String if no error was encountered
 */
window.getNonSDKTextResponseErrorMsg = function getNonSDKTextResponseErrorMsg(textResponse) {
	var errorMessageString = "";
	
	try {
			var parser= new DOMParser();
			var responseXML = parser.parseFromString(textResponse,"text/xml");
			errorElem = WCXML.GetFirstFirstLevelChild(responseXML, "span");
		
			if (errorElem) {
				errorMessageString = WCXML.GetElementSelfTextContent(errorElem);
			}
		}	catch (err) {
			// do nothing (will return the empty string)
		}	
		
		return errorMessageString;
}