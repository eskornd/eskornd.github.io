/*
 * projectdetailsdocbom.js
 * 
 * Shared between docs and BOM page
 */

function SubmitSingleDocumentAction(actionVal, docVerID, docID) {
	document.actionform.actionVal.value = actionVal;
	document.actionform.actionDocVerID.value = docVerID;
	document.actionform.actionDocID.value = docID;

	// make sure only the selected document's checkbox is checked
	var checkedValue = docVerID + "," + docID;
	var selectedDocList = document.getElementsByName("selectedDocs");
	var documents = new Array();

	for ( var i = 0; i < selectedDocList.length; i++) {
		// starts with
		if (selectedDocList[i].value.substring(0, checkedValue.length) == checkedValue) {
			if (documents[checkedValue]) { // already exists
				continue;
			}
			else { // not yet exists, mark it as exists
				documents[checkedValue] = true;
			}
			selectedDocList[i].checked = true;
		} else {
			selectedDocList[i].checked = false;
		}
	}

	// if action is delete, more actions happen (confirm, check for approval)
	// reuse actions from multi doc action
	if (actionVal == "DeleteDocument") {
		SubmitDocumentAction(3);
	} else {
		// post the request
		document.actionform.submit();
	}
}

function SubmitDownloadDocAction(docVerID, docID) {
	var actionVal = 'DownloadDoc';

	if (confirm(i18n['CHECKED_OUT_DOWNLOAD_WARNING'])) {
		SubmitSingleDocumentAction(actionVal, docVerID, docID);
	}
}

function ShowTaskDetails(projectTaskID) {
	// build location string
	var loc = "wctaskexecutionpage.jsp?menu_file="
			+ document.actionform.menu_file.value;
	var location = loc + "&projectID="
			+ document.actionform.projectID.value + "&curProjTaskID="
			+ projectTaskID + "&sourcePage=" + gPagingLoc;
	if (gPagingFolderID.length > 0)
		location = location + "&curFolderID="
				+ gPagingFolderID;

	// alert(location);
	window.location.href = location;
	return;
}

// this function checks whether there is a pagelist document selected
function pagelistSelected() {
	var documents = document.getElementsByName("selectedDocs");
	if (documents != null) {
		for ( var i = 0; i < documents.length; i++) {
			if (documents[i].checked
					&& documents[i].attributes.pagelistdocument.value == '1')
				return true;
		}
	}
	return false;
}

// this function checks whethere there is at least one selected doc with ongoing
// approval cycle
function approvalOngoing(rowCount, inputElem) {
	if (rowCount == 1) {
		if (inputElem.checked == true) {
			// check whether the attribute approved is on
			if (inputElem.attributes.approvalongoing != null)
				if (inputElem.attributes.approvalongoing.value == '1')
					return '1';
		}
	} else if (rowCount > 0) {
		for ( var i = 0; i < inputElem.length; i++) {
			if (inputElem[i].checked == true) {
				if (inputElem[i].attributes.approvalongoing != null)
					if (inputElem[i].attributes.approvalongoing.value == '1')
						return '1';
			}
		}
	}
	return '0';
}

function PerformPagingAction(selElem, fieldName, oldVal, oldString) {
	var projectID = document.actionform.projectID.value;
	// gPagingFolderID defined in XSL
	var folderID = gPagingFolderID;

	// gPagingLoc defined in XSL
	var location = gPagingLoc + "?menu_file=" + document.actionform.menu_file.value + "&projectID=" + projectID + "&curFolderID=";
	if (folderID != null && folderID.length > 0)
		location = location + folderID;

	if (selElem == 0) {
		return false;
	} else if (selElem == 1) {
		// show/Hide thumbnails
		var curPage = parseInt(document.actionform.curPage.value);
		location = location + "&curPage=" + curPage;
		var showThumb = parseInt(document.actionform.showThumbnails.value);
		var showGrid = parseInt(document.actionform.showGrid.value);
		if (showThumb == 1)
			location = location + "&showThumbnails=0&showGrid="
					+ showGrid;
		else
			location = location + "&showThumbnails=1&showGrid="
					+ showGrid;
	} else if (selElem == 11) {
		// show grid/list
		var curPage = parseInt(document.actionform.curPage.value);
		location = location + "&curPage=" + curPage;
		var showThumb = parseInt(document.actionform.showThumbnails.value);
		var showGrid = parseInt(document.actionform.showGrid.value);
		if (showGrid == 1)
			location = location + "&showGrid=0&showThumbnails="
					+ showThumb;
		else
			location = location + "&showGrid=1&showThumbnails="
					+ showThumb;
	} else if (selElem == 2) {
		// previous page
		var prevPage = parseInt(document.actionform.curPage.value) - 1;
		location = location + "&curPage=" + prevPage;
		var showThumb = parseInt(document.actionform.showThumbnails.value);
		var showGrid = parseInt(document.actionform.showGrid.value);
		location = location + "&showThumbnails=" + showThumb
				+ "&showGrid=" + showGrid;
	} else if (selElem == 3) {
		// Next page
		var nextPage = parseInt(document.actionform.curPage.value) + 1;
		location = location + "&curPage=" + nextPage;
		var showThumb = parseInt(document.actionform.showThumbnails.value);
		var showGrid = parseInt(document.actionform.showGrid.value);
		location = location + "&showThumbnails=" + showThumb
				+ "&showGrid=" + showGrid;
	} else if (selElem == 4) {
		// First page
		location = location + "&curPage=1";
		var showThumb = parseInt(document.actionform.showThumbnails.value);
		var showGrid = parseInt(document.actionform.showGrid.value);
		location = location + "&showThumbnails=" + showThumb
				+ "&showGrid=" + showGrid;
	} else if (selElem == 5) {
		// Last page
		var lastPageNum = document.getElementById("OfPages");
		location = location + "&curPage=" + lastPageNum.value;
		var showThumb = parseInt(document.actionform.showThumbnails.value);
		var showGrid = parseInt(document.actionform.showGrid.value);
		location = location + "&showThumbnails=" + showThumb
				+ "&showGrid=" + showGrid;
	} else if (selElem == 6) {
		// Typed page number
		if (fieldName && oldVal && oldString) {
			var newVal = document.getElementById(fieldName).value;
			if (newVal == '' || ValidatePaging(newVal) != true
					|| parseInt(newVal) == oldVal) {
				document.getElementById(fieldName).value = oldString;
				return false;
			}
			location = location + "&curPage=" + parseInt(newVal);
			var showThumb = parseInt(document.actionform.showThumbnails.value);
			var showGrid = parseInt(document.actionform.showGrid.value);
			location = location + "&showThumbnails=" + showThumb
					+ "&showGrid=" + showGrid;
		}
	} else {
		return;
	}
	window.location.href = location;
	return;
}

// function to get the document count
function GetDocCount() {
	var length = 0;
	try {
		length = document.actionform.selectedDocs.length;
		if (length == null)
			length = 1;
	} catch (er) {
	}
	return length;
}

function SetInitialFocus(errorOccured) {
	if (errorOccured) {
		require(["jquery", "jqueryUI"], function($){
			$("#errorFeedBack").dialog({
				autoOpen : false,
				modal : true,
				closeText: "",
				buttons : {
					"OK" : function() {
						$(this).dialog("close");
					}
				}
			});
			$("#errorFeedBack").dialog("open");
		});
	} else {
		$("#errorFeedBack").hide(); // Hides the div at start
	}
}

/**
 * Used to handle Selected Multiple Documents Action execution from the Project Details Documents/BOM pages 
 * 
 * @param choice
 * @param isBomDocsPage; [OPTIONAL; can be null] if true > the source page was Project Details - BOM; otherwise Project Details - Document was the source page
 */
function SubmitDocumentAction(choice, isBomDocsPage) {
	// Add Doc
	if (choice == 1) {
		document.actionform.actionVal.value = "AddDocument";
	} else {
		
		// Make sure a document is uniquely selected
		if (choice != 41) { // not for delete from BOM
			var selectedDocList = document.getElementsByName("selectedDocs");
			var documents = new Array();

			for ( var i = 0; i < selectedDocList.length; i++) {
				// If checked
				if (selectedDocList[i].checked == true) {
					var ids = selectedDocList[i].value.split(",");
					var docVerId = ids[0];

					if (documents[docVerId]) { // already exists
						selectedDocList[i].checked = false; // uncheck
						continue;
					} else { // not yet exists, mark it as exists
						documents[docVerId] = true;
					}
					selectedDocList[i].checked = true;
				} else {
					selectedDocList[i].checked = false;
				}
			}
		}
	
		var selCnt = GetCheckedCount(GetDocCount(),
				document.actionform.selectedDocs);

		// these options need at lease one document selected
		if ((choice == 2) || (choice == 3) || (choice == 7) || (choice == 8)
				|| (choice == 9) || (choice == 10) || (choice == 11)
				|| (choice == 12) || (choice == 13) || (choice == 14)
				|| (choice == 15) || (choice == 16) || (choice == 17) || (choice == 20)
				|| (choice == 30) || (choice == 40) || (choice == 41) || (choice == 42) || (choice == 50)) {
			if (selCnt < 1) {
				alert(i18n['SELECTDOC']);
				return;
			}
		} else {
			// these options require exactly one document selected
			if (selCnt != 1) {
				alert(i18n['SELECTONEDOC']);
				return;
			}
		}

		// oK we got the right amount of documents - let it rip
		if (choice == 2) {
			document.actionform.actionVal.value = "MoveDocument";
		} else if (choice == 3) {

			// check whether there is a document selected with approval cycle
			// ongoing
			var confMessage = i18n['CONFIRMDELDOCS'];
			var nrApprove = approvalOngoing(GetDocCount(),
					document.actionform.selectedDocs);
			if (nrApprove == '1') {
				confMessage = i18n['CONFIRMDELAPPONGDOCS'] + ' ' + confMessage;
			}

			// Delete Document
			if (!confirm(confMessage)) {
				return;
			}
			document.actionform.actionVal.value = "DeleteDocument";
		} else if (choice == 7) {
			document.actionform.actionVal.value = "UpdateDocument";
		} else if (choice == 8) {
			document.actionform.actionVal.value = "AddDocumentToCart";
		} else if (choice == 9) {
			document.actionform.actionVal.value = "OpenAnnotator";
		} else if (choice == 10) {
			document.actionform.actionVal.value = "CheckoutDocuments";
		} else if (choice == 11) {
			document.actionform.actionVal.value = "ApproveDocuments";
		} else if (choice == 12) {
			document.actionform.actionVal.value = "StartCycle";
		} else if (choice == 13) {
			document.actionform.actionVal.value = "StopCycle";
		} else if (choice == 14) {
			// check whether there are no PL documents that are selected
			if (pagelistSelected()) {
				alert(i18n['PAGE_LIST_CANNOT_COPY']);
				return;
			} else
				document.actionform.actionVal.value = "CopyDocument";
		} else if (choice == 15) {
			document.actionform.actionVal.value = "CompareViewer";
		} else if (choice == 16) {
			//need to check whether the User selected any locked documents > if so, show a warning/info message
			var continueDL = true;
            $('input:checkbox[name=selectedDocs][is_locked=1]:checked').each(function() {           	
            	//at least one locked document was found amongst the selected ones
            	continueDL = confirm(i18n['CHECKED_OUT_DOWNLOAD_WARNING_MULTIDOC']);
            	//decision was made > end the iterator
            	return false;
            });
            
            //bail out if the user chose to not DL after all
            if(!continueDL) {
            	return;
            }
            
			document.actionform.actionVal.value = "DownloadDocuments";
		} else if (choice == 17) {
			document.actionform.actionVal.value = "SetupApprovalCycleMultipleDocs";
		} else if (choice == 20) {
			// check that there are tasks to associate with
			if (gExistingTasks == "0") {
				if (!confirm(i18n['ASSOCIATEWITHTASKS_NOTASKS_TAG'])) {
					return;
				}
				// gMenuURL in XSL
				var createTaskUrl = 'doprojectwctask.jsp?actionVal=CreateNewTask&projectID='
						+ document.actionform.projectID.value + '&' + gMenuURL;

				// alert('createURL=' + createTaskUrl);
				window.location = createTaskUrl;
				return;

			} else {
				document.actionform.actionVal.value = "AddDocToTasks";
			}
		}
		// push files to destination - only valid when the folder is a push
		// through folder
		else if (choice == 30) {
			document.actionform.actionVal.value = "CopyFileToPushThroughDestination";
		}
		else if (choice == 40) {
			document.actionform.actionVal.value = "AddDocumentsToBOM";
		}
		else if (choice == 41) {
			if (!confirm(i18n['DELETE_DOCUMENTS_FROM_BOM_WARN'])) {
				return;
			}
			document.actionform.actionVal.value = "DeleteDocumentsFromBOM";
		}
		else if (choice == 42) { //SEND MULTIPLE DOCUMENT DL LINK
			//NOTE: Requires >
			// 1. javascript/SendDocDownloadLink.js to be imported by the parent XSL file
			// 2. dlLinkLangStrings language labels array to be initialized
			// for example see : projdetailsdocs.xsl > lines 703-715 and 682
            //prepare the list of Document Version IDs
            var docVersionIDs = [];
            var docVersionNameMap = [];
            
            $('input:checkbox[name=selectedDocs]:checked').each(function() { 
            	var selDocVersionVals = $(this).val().split(",");
            	var docVersionID = selDocVersionVals[0];
            	
            	var docName = $(this).attr('documentName');
            	
            	//add to the lists
            	docVersionIDs.push(docVersionID);
            	docVersionNameMap.push({id: docVersionID, name: docName});
            });
            
            //execute the UC itself
            var sendDlLinkMgr = new downloadDocLinkMailGenerator(dlLinkLangStrings);
    		  sendDlLinkMgr.generateDocumentBatchDLLinkMail(docVersionIDs, docVersionNameMap);
    		
    		return;
		}
	}
	// post the request
	document.actionform.submit();
};