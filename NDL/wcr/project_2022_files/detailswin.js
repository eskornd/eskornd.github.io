// DEPRECATED, USE wcr-static/src/main/javascript/utils/detailswin

window.ShowUserDetails = function ShowUserDetails(userID, projectID)
{
	// show the details for this item
	// create the URL based on the item index
	var url = "showuserdetails.jsp?userID="+userID;
	
	if (projectID && projectID.length > 0) {
		url = url + "&projectID=" + projectID;
	}
	var newWindow = window.open(url,'WebCenterUserDetails','scrollbars=yes,resizable=yes,width=450,height=350');
	if (newWindow != null)
		newWindow.focus();
}

function ShowApprovalDetails(docVersionID, page)
{
	// show the details for this item
	// create the URL based on the item index
	var url = "showapprovaldetails.jsp?docVerID="+docVersionID + "&pageNumber="+page;
	var newWindow = window.open(url,'WebCenterApprovalDetails','scrollbars=yes,resizable=yes,width=700,height=350');
	if (newWindow != null)
		newWindow.focus();
}

function ShowViewGenerationTaskDetails(docVersionID)
{
	// show the details for this item
	// create the URL based on the item index
	var url = "showviewtaskdetails.jsp?docVersionID="+docVersionID;
	var newWindow = window.open(url,'WebCenterTaskDetails','scrollbars=yes,resizable=yes,width=450,height=350');
	if (newWindow != null)
		newWindow.focus();
}

	
window.ShowGroupDetails = function ShowGroupDetails(groupID, projectID, isRole)
{
	// show the details for this item
	// create the URL based on the item index
	var url = "showgroupdetails.jsp?groupID="+groupID;
	var windowTitle = "WebCenterGroupDetails";
	
	if (projectID && projectID.length > 0) {
		//add a parameter to the URL
		url = url + "&projectID=" + projectID;
		if (isRole && isRole == 1) {
			url = url + "&isRole=1";
			//change the window title
			windowTitle = "WebCenterRoleDetails";
		}
	}
	var newWindow = window.open(url, windowTitle,'scrollbars=yes,resizable=yes,width=450,height=350');
	if (newWindow != null)
		newWindow.focus();
}
	
window.ShowLocationDetails = function ShowLocationDetails(locationID)
{
	// show the details for this item
	// create the URL based on the item index
	var url = "showlocationdetails.jsp?locationID="+locationID;
	var newWindow = window.open(url,'WebCenterLocationDetails','scrollbars=yes,resizable=yes,width=450,height=320');
	if (newWindow != null)
		newWindow.focus();
}

function ShowRestrictedSetDetails(rsetID)
{
	// show the details for this item
	// create the URL based on the item index
	var url = "showrestrictedsetdetails.jsp?rsetID="+rsetID;
	var newWindow = window.open(url,'WebCenterRestrictedSetDetails','scrollbars=yes,resizable=yes,width=450,height=320');
	if (newWindow != null)
		newWindow.focus();
}
	
window.ShowProjectDetails = function ShowProjectDetails(projectID)
{
	// show the details for this item
	// create the URL based on the item index
	var url = "showprojectdetails.jsp?projectID="+projectID;
	var newWindow = window.open(url,'WebCenterProjectDetails','scrollbars=yes,resizable=yes,width=450,height=350');
	if (newWindow != null)
		newWindow.focus();
}

function ShowFullDocumentDetails(docVerID, menuFile)
{
	// open details page of given project document
	// create the URL based on the provided parameters
	var url = "docdetails.jsp?docVerID="+docVerID+"&menu_file="+menuFile;
	var newWindow = window.open(url,'WebCenterDocumentDetails','scrollbars=yes,resizable=yes,width=1024,height=600');
	if (newWindow != null)
		newWindow.focus();
}
