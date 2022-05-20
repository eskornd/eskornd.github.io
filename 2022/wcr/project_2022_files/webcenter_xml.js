// !!! DEPRECATED: make use of wcr-static webcenter_xml.js

/*******************************************************
* Encoding and decoding tools for JavaScript
* Created by Hans Dewitte 
* UTF8 part based on code downloaded from 
* http://www.webtoolkit.info/javascript-utf8.html
********************************************************/

/* Error handling approach:
  All methods have try-catch blocks which return the original in case of a problem
  Given that most strings don't need encoding at all, returning the original is better
  than any other approach like returning nothing, alerting without a solution etc.
*/
/* Testing approach:
  This class has a SelfTest method which needs to be run each time the code is changed
  Easiest way to run is to call from firebug console but it can also be integrated in a go-nogo script for example in sahi
*/

var keyStr = "ABCDEFGHIJKLMNOP" + 
               "QRSTUVWXYZabcdef" + 
               "ghijklmnopqrstuv" + 
               "wxyz0123456789+/" + 
               "="; 

var WCXML = {
    // properties
    maxattrlength: null,  // no maximum attribute length
    cutstring: "[...]", // when cutting off attributes, this cutstring is added at the end, to have together maxattrlength

    ////////////////////////////////////////////////////////
    // public method for url encoding
    Utf8encode : function (string) {
      // replaces the combination \r\n with \n only
      // check the syntax of string.replace --> /g is needed to make sure ALL occurences of \r\n are replaced, not just the first
      try {
        string = string.replace(/\r\n/g,"\n");
        
        var n = 0;
        var utftext = "";
        var c;
        
        while (n < string.length) {
          var oldn=n;
          while (n < string.length && string.charCodeAt(n) < 128) n++;
          utftext += string.substr(oldn,n-oldn);
          if (n < string.length) { // then there is a special character at position n
            var c = string.charCodeAt(n);

            if(c < 2048) {
              utftext += String.fromCharCode((c >> 6) | 192);
              utftext += String.fromCharCode((c & 63) | 128);
            } else {
              utftext += String.fromCharCode((c >> 12) | 224);
              utftext += String.fromCharCode(((c >> 6) & 63) | 128);
              utftext += String.fromCharCode((c & 63) | 128);
            }
            n++;

          }
        }
        
        return utftext;
      } catch (err) {  // when it goes wrong, just return the non-encoded. 
        return string;
      }
    },
    Utf8encodeSlow : function (string) {
        // replaces the combination \r\n with \n only
        // check the syntax of string.replace --> /g is needed to make sure ALL occurences of \r\n are replaced, not just the first
        string = string.replace(/\r\n/g,"\n");  
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    
    ////////////////////////////////////////////////////////////////////
    // public method for utf8 decoding.  Optimized for Western input
    Utf8decode : function (utftext) {
      try {
        var string = "";
        var n = 0;
        var c = c1 = c2 = c3 = 0;
        
        while (n < utftext.length) {
          var oldn=n;
          while (n < utftext.length && utftext.charCodeAt(n) < 128) n++;
          string += utftext.substr(oldn,n-oldn);
          if (n < utftext.length) { // then there is a special character at position n
            var c = utftext.charCodeAt(n);
            if((c > 191) && (c < 224)) {
              c2 = utftext.charCodeAt(n+1);
              string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
              n += 2;
            } else {
              c2 = utftext.charCodeAt(n+1);
              c3 = utftext.charCodeAt(n+2);
              string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
              n += 3;
            }

          }
        }
        
        return string;
      } catch(err) {
        return utftext;
      }
    },
    ////////////////////////////////////////////////////////////////////////////////////////
    // public method for utf8 decoding - original code, which is slower when most of the
    // incoming text is Western (characters under ascii 128
    Utf8decodeSlow : function (utftext) {
      try {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
      } catch(err) {
        return utftext;
      }
    },
    
    ////////////////////////////////////////////////////////
    // url encoding
    urlencode : function (text) {  
      try {  
        if (text==null || text=='') return '';
        var urlString=encodeURIComponent(text);
        var re= /\x27/g;  // single quote (') sign is not encoded by encodeURIComponent() function
        urlString=urlString.replace(re, "%27");
        return urlString;
      } catch (err) {
        return text;
      }  
    },

    ////////////////////////////////////////////////////////
    // url decoding
    urldecode : function (text) {   
      try { 
        if (text==null || text=='') return '';
        var urlString=decodeURIComponent(text);  // no need for the special replacements
        return urlString;
      } catch(err) {
        return text;
      }
    },
  
    //////////////////////////////////////////////////////////////////
    // xml encoding: gets rid of characters which break xml parsing
    // to be applied to the content of xml nodes.  
    // Don't put entire blocks of xml 
    // into xmlencode because it will no longer be xml
    xmlencode : function (text) {  
      try {  
        if (text==null || text=='') return '';
        //if (text.substring(0,1) == '<') return text;  // why? -> to avoid that you mess up entire xml
        // make sure that no exceptions are throws when a number or boolean is passed along (where replace doesn't exist)
		var XmlString = text+""; 
        var re = /&/g;
        XmlString = XmlString.replace(re,"&amp;");
        re = /</g;
        XmlString = XmlString.replace(re,"&lt;");
        re = />/g;
        XmlString = XmlString.replace(re,"&gt;");
        re = /"/g;
        XmlString = XmlString.replace(re,"&quot;");
        re = /'/g;
        //XmlString = XmlString.replace(re,"&apos;");  // &apos is not a standard encoding, and IE has trouble with it. Therefore we use &#39; from now on
		XmlString = XmlString.replace(re,"&#39;");
        //XmlString = this.Utf8encode(XmlString);
        return XmlString;
      } catch (err) {
        return text;
      }
    },
    //////////////////////////////////////////////////////////////////
    // xml decoding: the opposite of xmlencode
    xmldecode : function (text) {
      try {
        if (text==null || text=='') return '';
        //if (text.substring(0,1) == '<') return text;  //  to avoid that you mess up entire xml
        var XmlString = "";
        //XmlString = this.Utf8decode(text);
        XmlString = text;
        XmlString = XmlString.replace(/&lt;/g,"<");
        XmlString = XmlString.replace(/&gt;/g,">");
        XmlString = XmlString.replace(/&quot;/g,"\"");
        XmlString = XmlString.replace(/&apos;/g,"'");
        XmlString = XmlString.replace(/&#39;/g,"'"); // xmlencode now uses &#39; for apos (but we still want to support the &apos;)
        XmlString = XmlString.replace(/&amp;/g,"&");

        return XmlString;
      } catch (err) {
        return text;
      } 
    },
    
    //////////////////////////////////////////////////////////////////
    // Base64 encoding
    //////////////////////////////////////////////////////////////////
    encode64 : function (input) 
    { 
     //JAMI: do not escape the input as it would change the value for 'special characters'
     //input = escape(input); 
     var output = ""; 
     var chr1, chr2, chr3 = ""; 
     var enc1, enc2, enc3, enc4 = ""; 
     var i = 0; 
  
     do { 
        chr1 = input.charCodeAt(i++); 
        chr2 = input.charCodeAt(i++); 
        chr3 = input.charCodeAt(i++); 
  
        enc1 = chr1 >> 2; 
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4); 
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6); 
        enc4 = chr3 & 63; 
  
        if (isNaN(chr2)) { 
           enc3 = enc4 = 64; 
        } else if (isNaN(chr3)) { 
           enc4 = 64; 
        } 
  
        output = output + 
           keyStr.charAt(enc1) + 
           keyStr.charAt(enc2) + 
           keyStr.charAt(enc3) + 
           keyStr.charAt(enc4); 
        chr1 = chr2 = chr3 = ""; 
        enc1 = enc2 = enc3 = enc4 = ""; 
     } while (i < input.length); 
  
    	 return output; 
	 } ,
    
    //////////////////////////////////////////////////////////////////
    // writes an xml node with content
    ElementEncode : function(tag,value) {
      try {
        if (value != null) {          
          if (value.constructor == Boolean) {
            if (value==true) value='true'; else value='false';
          }          
          var encodedvalue=this.xmlencode(value);
          var xmlcode='<'+tag+'>'+encodedvalue+'</'+tag+'>';
          return xmlcode;
        } else {
          return '';
        } 
      } catch (err) {
        return ''; // better return nothing than illegal xml which will break the entire xml this part is put in
      } 
    },
    //////////////////////////////////////////////////////////////////
    // writes an xml node with content
    ElementEncodeBoolean : function(tag,value) {
      try {
        if (value != null) {
          if (value==true) value='true';
          if (value==false) value='false';
          var encodedvalue=this.xmlencode(value);
          var xmlcode='<'+tag+'>'+encodedvalue+'</'+tag+'>';
          return xmlcode;
        } else {
          return '';
        } 
      } catch (err) {
        return ''; // better return nothing than illegal xml which will break the entire xml this part is put in
      } 
    },
    
    
    //////////////////////////////////////////////////////////////////    
    // QuoteEncode encodes " in &quot; and ' in &apos; but doesn't do anything else
    // Typically needed to do dynamic UI in javascript such as htmlcode = 'value="123' + text + '"'
    // A quote in text will stop the value string too early unless the quote is converted to &quot;
	// noApos: if set, only " will be converted.  This is used to overcome an anomaly of IE which accepts &quot; in an input string value but not &apos;
	// This can probably be circumvented by using &#39; instead of &apos;
    QuoteEncode : function(text,noApos) {
      try {
        if (text == null || text == '') return '';
        text = this.QuoteDecode(text);  // to get rid of &quot; which would get encoded to &amp;quot;
        text = text.replace(/"/g,"&quot;");
        if (!noApos) text = text.replace(/'/g,"&apos;");
        return text;
      } catch (err) {
        return text;
      }
    },
    //////////////////////////////////////////////////////////////////  
    // The opposite of QuoteEncode  
    QuoteDecode : function(text) {
      try {
        if (text == null || text == '') return '';
        text = text.replace(/&quot;/g,"\"");
        text = text.replace(/&apos;/g,"'");
        return text;
      } catch (err) {
        return text;
      }
    },
    
    ////////////////////////////////////////////////////////
    // creates a string like:
    // <att>
    //   <an>name</an>
    //   <at>type</at>
    //   <av>value</av>
    //   <ap>property</ap>   --> if name and property are equal, property is omitted
    // </att>
    WcrAttributeEncode : function (name,type,_value,property) {
      try {
        var xmlcode;
        xmlcode ='<att>';
        var value = '' + _value;  // forces value to be a string and if _value is null, you get an empty string

        if (name==null) return;  // don't write attributes without a name
        xmlcode += this.ElementEncode('an',name);
        if (type!=null) {
          xmlcode += this.ElementEncode('at',type);
        } else {
          xmlcode += this.ElementEncode('at','Text');
        }
        
        if (value) {
          // limit the size
          if (this.maxattrlength && value.length > this.maxattrlength) value = value.slice(0, this.maxattrlength - this.cutstring.length) + this.cutstring;
          xmlcode += this.ElementEncode('av',value);  
        } else {
          xmlcode += this.ElementEncode('av','');
        }
        if (property && property!=name) xmlcode += this.ElementEncode('ap',property);  // attribute without property is allowed
        xmlcode += '</att>';
        return xmlcode;
      } catch (err) {
        // just drop the attribute, better than completely stop the xml creation which blocks the entire workflow
        return ''
      }  
    },
    ////////////////////////////////////////////////////////
    // creates a string like:
    // <attribute>
    //   <attribute_name>name</attribute_name>
    //   <attribute_type>type</attribute_type>
    //   <attribute_value>value</attribute_value>
    //   <attribute_property>property</attribute_property>
    // </attribute>
    WcrAttributeEncodeLong : function (name,type,_value,property) {
      try {
        var xmlcode;
        xmlcode ='<attribute>';
        var value = '' + _value;  // forces value to be a string and if _value is null, you get an empty string

        if (name==null) return;  // don't write attributes without a name
        xmlcode += this.ElementEncode('attribute_name',name);
        if (type!=null) {
          xmlcode += this.ElementEncode('attribute_type',type);
        } else {
          xmlcode += this.ElementEncode('attribute_type','Text');
        }
        
        if (value) {
          // limit the size
          if (this.maxattrlength && value.length > this.maxattrlength) value = value.slice(0, this.maxattrlength - this.cutstring.length) + this.cutstring;
          xmlcode += this.ElementEncode('attribute_value',value);  
        } else {
          xmlcode += this.ElementEncode('attribute_value','');
        }
        if (property) xmlcode += this.ElementEncode('attribute_property',property);  // attribute without property is allowed
        xmlcode += '</attribute>';
        return xmlcode;
      } catch (err) {
        // just drop the attribute, better than completely stop the xml creation which blocks the entire workflow
        return ''
      }  
    },
    /////////////////////////////////////////////////////////////////////////////////
    // gets decoded attribute attributeName out of node
    GetElementAttribute: function(node,attributeName) {
      try {
        if (!node) return(''); 
   		  var value=node.getAttribute(attributeName);
        if (value) {
   		  	//value = this.xmldecode(value); // value is already decoded, doing this will decode it twice
        	return value; 
     		
   		  } else {
   			  return (''); 
   		  }
   		} catch (err) {  // typically means that node is not an xml node
   		  return ('parser error'); 
   		}
   	},
    /////////////////////////////////////////////////////////////////////////////////
    //gets text of the passed element itself(not the child)
    GetElementSelfTextContent: function(element) {
    	try {
    		var value;
    		if (element) {
				if (typeof(element.textContent) != "undefined") {
					value =  element.textContent;
				} else {
					if (element.firstChild) {
						value = element.firstChild.nodeValue;
					} else {
						value = '';  // DT121832: on IE, if element is just empty, typof will be undefined and firstChild will be null --> went to catch unless you check on firstChild
					}
				}    			
    			return value;
    		}
    	} catch (err) {  // typically means that node is not an xml node			
     		  return ('parser error'); 
     	}
    },
    /////////////////////////////////////////////////////////////////////////////////
    // gets text from the first element with a certain tag name within a node
    // if deep is true, allows reading deeper into the structure than the immediate childs 
    // if nullable is true, it will return null when the node is not found and '' if the node is empty
    GetElementText: function(node,elementtag,deep,nullable) {
		try {
			
			if (!node) return(nullable?null:''); 
			var elem=node.getElementsByTagName(elementtag);  // does a deep search, so can find too much in case deep is not true
			var value;
			if (elem && elem.length>0) {
				// element exists; in here, if it has no value, return '', not null
				  
				// search for the first one having the right parent node (getElementsByTagName does a deep search!)
				var i = 0;
				if ( deep == null ) {		    	
					while (i < elem.length && elem[i].parentNode != node ) i++;
				}
				  
				if (i < elem.length ) {	
					if (elem[i].firstChild) {
						value = (typeof(elem[i].textContent) != "undefined")? elem[i].textContent: elem[i].firstChild.nodeValue; 
						if (value == null && nullable) value = '';			
						return(value);
					} else {
						// the right element was found (on the right level) but it has no content, so return empty String
						return '';
					}
				} else {
					// the right element was not found
					return (nullable?null:'');  // only items on the wrong level were found
				}

			} else {
				return (nullable?null:''); // put distinguishNull=true if you want to make a difference between no entry (null) and empty value('')
			}
   		} catch (err) {  // typically means that node is not an xml node
   		  return ('parser error'); 
   		}
   	},
    /////////////////////////////////////////////////////////////////////////////////
    // gets boolean (true or false) from the first element with a certain tag name within a node
    // if deep is true, allows reading deeper into the structure than the immediate childs 
    GetElementBoolean: function(node,elementtag,deep) {
      try {
        var value = this.GetElementText(node,elementtag,deep);
        if (value.toLowerCase()=='true' || value==1) return true; 
        if (value.toLowerCase()=='false' || value==0) return false;
        return value;
   		} catch (err) {  // typically means that node is not an xml node
   		  return ('parser error'); 
   		}
   	},
   	/////////////////////////////////////////////////////////////////////////////////
    // gets Integer value from the first element with a certain tag name within a node
    // if deep is true, allows reading deeper into the structure than the immediate childs 
    GetElementInt: function(node,elementtag,deep) {
      try {
        var value = this.GetElementText(node,elementtag,deep);
        if (value == null)
        	 return null ; 
		var checkNum = parseInt(value);
		if(isNaN(checkNum))
		{	
     		 // They did not enter an integer...
      		return null ;
  		}
		if(checkNum != value)
		{
			// They entered something with a number at the front - e.g. 12Y
			return null ;
   		}
   		if(value.indexOf(".") != - 1)
   		{
      		// They entered something with a decimal point.
		      // JavaScript thinks 100.0 is an int but Java
		      // on the server disagrees.
      		alert(errorMsg);
      		//element.value=checkNum;
      		return null ;
   		}
		   return checkNum;
   		} catch (err) {  // typically means that node is not an xml node
   		  return null ; 
   		}
   	},
   	////////////////////////////////////////////////////////////////
   	// returns an array only the first level childs with tag elementtag
   	// @return javascript array with the first level childs, can be an empty array.
    // @return returns null in case of error, an empty array
    GetFirstLevelChilds: function(node,elementtag) {
      try {
        if (!node) return(null); 
   		  var elem=node.getElementsByTagName(elementtag);
   		  var elem2 = new Array();
   		  if (elem && elem.length>0) {   		    
   		    for (var i=0; i < elem.length; i++) {
   		      if (elem[i].parentNode != node) continue;  // only first level childs allowed
   		      elem2.push(elem[i]);
   		    }
        }
        return elem2;
   		} catch (err) {  // typically means that node is not an xml node
   		  alert("Problem in WCXML.GetFirstLevelChilds: " + err);
        return (null); 
   		}
   	},
   	////////////////////////////////////////////////////////////////
   	// returns the first occuring first level child with tag elementtag
    GetFirstFirstLevelChild: function(node,elementtag) {
      try {
        if (!node) return(null); 
   		  var elem=node.getElementsByTagName(elementtag);   		  
   		  if (elem && elem.length>0) { 
 		      var i=0;
          while (i < elem.length && elem[i].parentNode != node ) i++;  		    
   		    if (i < elem.length) return elem[i];
        }
        return null;  // if you get here, it means you didn't find a first level child with this tag
                

   		} catch (err) {  // typically means that node is not an xml node
   		  alert("Problem in WCXML.GetFirstFirstLevelChild: " + err);
        return (null); 
   		}
   	},
   	////////////////////////////////////////////////////////////////////////////////
   	// Converts a string with xml content into a javascript xml object you can parse
   	xmlTextToObj: function (XMLtext) {
      try {
	      var xmlobj=null;
	      XMLtext = XMLtext && XMLtext.trim();
	      if (typeof DOMParser != "undefined") {   
			      // Mozilla, Firefox, and related browsers   
			      xmlobj= (new DOMParser()).parseFromString(XMLtext, "application/xml");   
	      } else if (typeof ActiveXObject != "undefined") {   
			      // Internet Explorer.   
			      //var doc = XML.newDocument();  // Create an empty document  
			      var doc = new ActiveXObject("MSXML2.DOMDocument");   
			      doc.loadXML(XMLtext);            // Parse text into it   
			      xmlobj=doc;                   
	      } else {   
			      // As a last resort, try loading the document from a data: URL   
			      // This is supposed to work in Safari.  
			      var url = "data:text/xml;charset=utf-8," + encodeURIComponent(XMLtext);   
			      var request = new XMLHttpRequest();   
			      request.open("GET", url, false);   
			      request.send(null);   
			      xmlobj=request.responseXML;   
	      } // end if  - now xmlobj can be parsed with xml functions
	    } catch (err) {
	 	    alert("Cannot do XML parsing on this browser. Problem in xmlTextToObj: "+err);
	 	    return null;
	    } 
	    return xmlobj;
    },
    
   	
   	/////////////////////////////////////////////////////////////////////////////////
   	// SelfTest tests functions in WCXML and can be seen as a unit test for WCXML
   	SelfTest: function() {
   	  try {
   	    var alertmsg = "";
   	    var teststring = "123\"45€6\"789'012'345+<>@#$%^&*(){}/[]\\ç10.5µG";

   	    // Test xmlencode and xmldecode
   	    var forbiddenchar = new Array("<",">","\"","'"); 
   	    var encoded = this.xmlencode(teststring);
   	    // check if all forbidden characters are gone
   	    for (var i=0; i< forbiddenchar.length; i++) {
   	      if (encoded.indexOf( forbiddenchar[i] )!=-1) alertmsg += "\nxmlencode forbidden character " + forbiddenchar[i] + " appears at position " + encoded.indexOf(forbiddenchar[i]) ; 
        }
        var decoded = this.xmldecode(encoded)
        if (decoded != teststring) alertmsg += "\nxmldecode(xmlencode(" + teststring + ") is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;
        
   	    // Test QuoteEncode and QuoteDecode
   	    forbiddenchar = new Array("\"","'"); 
   	    var encoded = this.QuoteEncode(teststring);
   	    // check if all forbidden characters are gone
   	    for (var i=0; i< forbiddenchar.length; i++) {
   	      if (encoded.indexOf( forbiddenchar[i] )!=-1) alertmsg += "\nQuoteEncode forbidden character " + forbiddenchar[i] + " appears at position " + encoded.indexOf(forbiddenchar[i]) ; 
        }
        var decoded = this.QuoteDecode(encoded)
        if (decoded != teststring) alertmsg += "\nQuoteDecode(QuoteEncode(" + teststring + ") is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;

   	    // Test urlencode and urldecode
   	    forbiddenchar = new Array("+","/"," "); 
   	    var encoded = this.urlencode(teststring);
   	    // check if all forbidden characters are gone
   	    for (var i=0; i< forbiddenchar.length; i++) {
   	      if (encoded.indexOf( forbiddenchar[i] )!=-1) alertmsg += "\nurlencode forbidden character " + forbiddenchar[i] + " appears at position " + encoded.indexOf(forbiddenchar[i]) ; 
        }
        var decoded = this.urldecode(encoded)
        if (decoded != teststring) alertmsg += "\nurldecode(urlencode(" + teststring + ") is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;

   	    // Test Utf8encode
   	    forbiddenchar = new Array(); 
   	    var encoded = this.Utf8encode(teststring);
   	    // check if all forbidden characters are gone
   	    for (var i=0; i< forbiddenchar.length; i++) {
   	      if (encoded.indexOf( forbiddenchar[i] )!=-1) alertmsg += "\nurlencode forbidden character " + forbiddenchar[i] + " appears at position " + encoded.indexOf(forbiddenchar[i]) + "\n"; 
        }
        var decoded = this.Utf8decode(encoded)
        if (decoded != teststring) alertmsg += "\nUtf8decode(Utf8encode(" + teststring + ") is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;

        // Attribute encode and getElementText and xmlTextToObj test each other
        encoded = this.WcrAttributeEncodeLong(teststring,teststring,teststring,teststring);
        var attrobj = this.xmlTextToObj(encoded);
        decoded = this.GetElementText(this.xmlTextToObj(encoded),"attribute_name",1); 
        if (decoded != teststring) alertmsg += "\nGetElementText on WcrAttributeEncode on name " + teststring + " is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;
        decoded = this.GetElementText(this.xmlTextToObj(encoded),"attribute_value",1); 
        if (decoded != teststring) alertmsg += "\nGetElementText on WcrAttributeEncode on value " + teststring + " is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;
        decoded = this.GetElementText(this.xmlTextToObj(encoded),"attribute_type",1); 
        if (decoded != teststring) alertmsg += "\nGetElementText on WcrAttributeEncode on type " + teststring + " is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;
        decoded = this.GetElementText(this.xmlTextToObj(encoded),"attribute_property",1); 
        if (decoded != teststring) alertmsg += "\nGetElementText on WcrAttributeEncode on property " + teststring + " is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;
        // Attribute encode and getElementText and xmlTextToObj test each other
        encoded = this.WcrAttributeEncode(teststring,teststring,teststring,teststring+"prop");
        var attrobj = this.xmlTextToObj(encoded);
        decoded = this.GetElementText(this.xmlTextToObj(encoded),"an",1); 
        if (decoded != teststring) alertmsg += "\nGetElementText on WcrAttributeEncode on name " + teststring + " is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;
        decoded = this.GetElementText(this.xmlTextToObj(encoded),"av",1); 
        if (decoded != teststring) alertmsg += "\nGetElementText on WcrAttributeEncode on value " + teststring + " is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;
        decoded = this.GetElementText(this.xmlTextToObj(encoded),"at",1); 
        if (decoded != teststring) alertmsg += "\nGetElementText on WcrAttributeEncode on type " + teststring + " is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;
        decoded = this.GetElementText(this.xmlTextToObj(encoded),"ap",1); 
        if (decoded != teststring+"prop") alertmsg += "\nGetElementText on WcrAttributeEncode on property " + teststring + " is different from original.\noriginal: " + teststring + "\nencoded: " + encoded + "\ndecoded: " + decoded;

   	    // Test attribute encode maxlength
   	    var oldlength = this.maxattrlength;
   	    this.maxattrlength = 20; 
   	    teststring =      "1234567890123456789012345";  
   	    expected_result = "123456789012345[...]";
   	    encoded = this.WcrAttributeEncode("Test","text",teststring,"Test");
        decoded = this.GetElementText(this.xmlTextToObj(encoded),"av",1);
        if (decoded != expected_result) alertmsg += "\nAttribute cutting on WcrAttributeEncode not correct.  Found: " + decoded + "\nshould be: " + expected_result; 
   	    this.maxattrlength = oldlength;  // put back on default 
   	    
   	    // Speed test Utf8encode
   	    var teststring2 = "ja029jf023fj 0jf23 0rjr f2j20 9f"
   	    teststring = "123\"456\"789'012'µ345+<>@#$%^&*(){}/[]\\10.5µG" + String.fromCharCode(1000) + "1000";
   	    var starttime = new Date();
   	    var encoded1,encoded2,encoded3,encoded4;
   	    var decoded1,decoded2,decoded3,decoded4;
   	    for (var repeat=0; repeat<100; repeat++) {
   	      encoded1 = this.Utf8encode(teststring);
   	      decoded1 = this.Utf8decode(encoded1);
   	    }
   	    for (var repeat=0; repeat<10000; repeat++) {
   	      encoded2 = this.Utf8encode(teststring2);
   	      decoded2 = this.Utf8decode(encoded2);
   	    }
   	    var midtime = new Date();
   	    for (var repeat=0; repeat<100; repeat++) {
   	      encoded3 = this.Utf8encodeSlow(teststring);
   	      decoded3 = this.Utf8decodeSlow(encoded3);
   	    }
   	    for (var repeat=0; repeat<10000; repeat++) {
   	      encoded4 = this.Utf8encodeSlow(teststring2);
   	      decoded4 = this.Utf8decodeSlow(encoded4);
   	    }
   	    var usedtime1 = midtime - starttime;
   	    var usedtime2 = new Date() - midtime;

   	    alert("time used for Utf8encoding: \n  Fast: " + usedtime1 + " ms\n"+"  Slow: " + usedtime2 + " ms");
   	    if (encoded1 != encoded3) alertmsg += "\nDifference between encoding algorithms: \n  Fast: "+ encoded1 + "\n  Slow: " + encoded3;
   	    if (encoded2 != encoded4) alertmsg += "\nDifference between encoding algorithms: \n  Fast: "+ encoded2 + "\n  Slow: " + encoded4;

 
   	    
   	    if (alertmsg) alert(alertmsg); else alert ("WCXML.SelfTest OK"); 
   	  } catch (err) {
   	    alert("SelfTest internal error: " + err);
   	  }
   	},
   	/**
   	 * Convert XML object to javascript object, making the data more easily accessible.
   	 * @param node
   	 * @returns {___obj0}
   	 */
   	xml2obj : function(node){
		var obj = new Object();
		var nodes = node.childNodes;
		
		for(var i = 0; i<nodes.length; i++){
			var childnode = nodes[i];
			var name = childnode.nodeName;
			if(name=="#text")continue;
			
			var nrOfChildren = this.numberOfChildren(childnode);
			if(nrOfChildren>0){
				if(obj[name]){
					if(Object.prototype.toString.call( obj[name] ) !== '[object Array]' ){
						var o = obj[name];
						obj[name] = new Array();
						obj[name].push(o);
					}
					
					obj[name].push(this.xml2obj(childnode));
				}else{
					obj[name] = this.xml2obj(childnode);				
				}
			}else{
				if(obj[name]){
					if(Object.prototype.toString.call( obj[name] ) !== '[object Array]' ){
						var o = obj[name];
						obj[name] = new Array();
						obj[name].push(o);
					}
					
					obj[name].push(this.textContent(childnode));
				}else{
					obj[name] = this.textContent(childnode);
				}

			}
			
			if(childnode.attributes.length>0){
				var attributes = {};
				for(var a=0; a<childnode.attributes.length; a++){
					attributes[childnode.attributes[a].name] = childnode.attributes[a].value;
				}
				obj.attributes = attributes;
			}
			
		}
		return obj;
	},
	/**
	 * Get nomber of children of a node
	 * @param node
	 * @returns {Number}
	 */
	numberOfChildren : function (node){
		var number = 0;
		if(node.childNodes && node.childNodes.length>0){
			for(var i = 0; i<node.childNodes.length; i++){
				if(node.childNodes[i].nodeType==1){
					number++;
				}
			}		
			return number;
		}else{
			return number;
		}
	},
	/**
	 * get Text content of a node
	 * @param node
	 * @returns
	 */
	textContent : function(node){
		var content = node.textContent; 
		if(!content)content = node.nodeTypedValue;
		return content;			
	}
   	
   
}
