/*
 * Show a popup with details from the document approval page
 * Relies on the dropdownmenu JS function to be included also
 * Uses sectionID=simplePage to indicate that the page is to be show without standard decoration
 */
window.showapprovaldetails = function showapprovaldetails(src, event, docVerId, header) {
	try {
		require(["approval/ApprovalPopup"], function(ApprovalPopup){
			new ApprovalPopup({
				title: header,
				docVersionId: docVerId
			});
		});
	} catch (err) {
		alert('Problem in showapprovaldetails: ' +  err);  // should never happen --> not localized
	}
 }    
	 
