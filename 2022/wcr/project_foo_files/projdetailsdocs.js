/*
 * projectdocs.js
 */

// Selects a folder based on the following
//   - if you just created a folder and got redirected here, it is the new folder
//   - if you back buttoned to here, it is the last folder you had selected based on a hidden field
//   - otherwise if you just came to this page, it is the last folder you selected based on a cookie
// Note that on Netscape, the hidden fields get reinitialized onLoad. So for Netscape, the back
// button goes to the last newly created folder (since refresh) instead of the last selected.
function OpenDefFolder(folderID) {
	// initialize hidden field
	document.actionform.folderID.value = folderID;

	ShowFolder(folderID);
}

function CheckErrors(errorCode) {
	if(errorCode){
		alert(i18n[errorCode]);
	}
}

function SubmitFolderAction(choice) {
	// Add Folder
	if (choice == 1) {
		document.actionform.actionVal.value = "AddFolder";
	} else if (choice == 6) {
		// go to the project setup
		document.actionform.action = "projdetailsapprovers.jsp?projectID=" + document.actionform.projectID.value;
	} else {
		// for all other options make sure the root folder is not selected
		if (document.actionform.folderID.value == "") {
			alert(i18n["PROJFOLDERBADACTION"]);
			return;
		}

		if (choice == 2) {
			// Delete Folder
			if (!confirm(i18n["CONFIRMDELFOLDER"])) {
				return;
			}
			document.actionform.actionVal.value = "DeleteFolder";
		} else if (choice == 3) {
			// Rename Folder
			document.actionform.actionVal.value = "RenameFolder";
		} else if (choice == 4) {
			// Change Thumbnail
			document.actionform.actionVal.value = "ChangeFolderThumb";
		} else if (choice == 5) {
			// Edit folder Properties
			document.actionform.actionVal.value = "EditFolderProperties";
			document.actionform.action = "projdetailsfoldereditproperties.jsp";
		} else if (choice == 6) {
			// go to the folder approval setup
			document.actionform.action = "projdetailsapprovers.jsp?folderID=" + document.actionform.folderID.value;
		}
	}

	var baseURL = document.actionform.action;
	if (baseURL.indexOf("?") == -1) baseURL = baseURL + "?";

	// gMenuURL in XSL
	document.actionform.action = baseURL + "&" + gMenuURL;

	// post the request
	document.actionform.submit();
}

// save off the cookie
function SaveFolderCookie() {
	SetCookie(window.location.pathname, document.actionform.folderID.value);
}
window.onunload = SaveFolderCookie;

function GetFolder(val) {
	document.actionform.curFolderID.value = val;

	// build location string
	var loc = "projdetailsdocs.jsp?menu_file=" + document.actionform.menu_file.value;
	var location = loc + "&projectID=" + document.actionform.projectID.value + "&curFolderID=";
	if (document.actionform.curFolderID.value.length > 0) location = location + document.actionform.curFolderID.value;

	location =
		location +
		"&showThumbnails=" +
		parseInt(document.actionform.showThumbnails.value) +
		"&showGrid=" +
		parseInt(document.actionform.showGrid.value);

	// alert(location);
	window.location.href = location;
	return;
}

//Opens dialog for entering XLIFF source and destination languages
function openXLIFFExportDialog() {
	require(["jquery", "jqueryUI"], function($) {
		if (validateDocSelections() == 0) return;

		$("#xliff_source_lang").empty();
		$("#xliff_target_lang").empty();
		loadLangOptionsExportXLIFF("#XLIFFExportDialog", function() {
			$("#XLIFFExportDialog").dialog("open");
		});
		var buttonObj = new Object();
		var validateMsg = $(".validateMsg");
		validateMsg.text("");
		$(".ui-state-highlight").removeClass("ui-state-highlight");
		$(".ui-state-error").removeClass("ui-state-error");

		buttonObj[i18n["XLIFF_CANCEL"]] = function() {
			$("#XLIFFExportDialog").dialog("close");
		};

		buttonObj[i18n["XLIFF_DOWNLOAD"]] = function() {
			var validationsuccess = true;
			$(".ui-state-highlight").removeClass("ui-state-highlight");
			$(".ui-state-error").removeClass("ui-state-error");

			var sourceLang = document.getElementById("xliff_source_lang").value;
			var targetLang = document.getElementById("xliff_target_lang").value;
			var masterSignedoff = $("#master_signedoff").prop("checked") ? "true" : "false";
			var tgtLangSpecified = $("#tgt_lang").prop("checked") ? "true" : "false";
			var tgtLangNotSignedoff = $("#tgt_not_signedoff").prop("checked") ? "true" : "false";
			
			if (sourceLang == "") {
				validationsuccess = false;
				validateMsg.text(i18n["XLIFF_SRC_LANG_ERROR"]).addClass("ui-state-highlight");
				return;
			}

			if (targetLang == "") {
				validationsuccess = false;
				validateMsg.text(i18n["XLIFF_DEST_LANG_ERROR"]).addClass("ui-state-highlight");
				return;
			}

			if (validationsuccess) {
				document.getElementById("source_lang").value = sourceLang;
				document.getElementById("target_lang").value = targetLang;
				document.getElementById("masterSignedoff").value = masterSignedoff;
				document.getElementById("tgtLangSpecified").value = tgtLangSpecified;
				document.getElementById("tgtLangNotSignedoff").value = tgtLangNotSignedoff;
				$("#XLIFFExportDialog").dialog("close");
				document.actionform.actionVal.value = "DoTextXLIFFExport";
				document.actionform.submit();
			}
		};

		$("#XLIFFExportDialog").dialog({
			autoOpen: false,
			draggable: true,
			height: "auto",
			resizable: true,
			width: "auto",
			buttons: buttonObj,
			modal: true,
			closeText: ""
		});

		// bind the enter key to the dialog
		$("#XLIFFExportDialog").on("keypress", function(event) {
			$(".ui-state-error").removeClass("ui-state-error");
			if (event.keyCode == $.ui.keyCode.ENTER) {
				$(this)
					.parent()
					.find(".ui-dialog-buttonpane button:first")
					.trigger("click");
			}
		});
	});
}

//Opens dialog for entering GS1 destination language
function openGS1ExportDialog() {
	require(["jquery", "jqueryUI"], function($) {
		if (validateDocSelections() == 0) return;
		require(["jquery", "pcm/gs1/GS1ExportPanel"], function($, GS1ExportPanel) {
			let projectId = document.getElementsByName("projectID")[0].value;
			var selectedDocList = document.getElementsByName("selectedDocs");
			var selectedDocIDs = [];

			for (var i = 0; i < selectedDocList.length; i++) {
				if (selectedDocList[i].checked) {
					selectedDocIDs.push($(selectedDocList[i]).attr("docversionid"));
				}
			}

			new GS1ExportPanel(projectId, selectedDocIDs);
		});
	});
}

//Loading language options for Export XLIFF

function loadLangOptionsExportXLIFF(dialog, callbackFunc) {
	var deferred = $.Deferred();

	var projectid = document.getElementsByName("projectID")[0].value;
	$.ajax({
		type: "POST",
		dataType: "xml",
		url: "GetProjectLanguageAttr.jsp",
		data: "projectid=" + projectid,
		success: function(xml) {
			var srcLength = $(xml)
				.find("selected_source_language")
				.find("language").length;
			var targetLength = $(xml)
				.find("selected_translation_language")
				.find("language").length;
			addOption(document.getElementById("xliff_source_lang"), "--select language--", "");
			addOption(document.getElementById("xliff_target_lang"), "--select language--", "");
			if (srcLength != 0) {
				createLangList(xml, "selected_source_language", document.getElementById("xliff_source_lang"));
			} else {
				createLangList(xml, "complete_source_language", document.getElementById("xliff_source_lang"));
			}
			if (targetLength != 0) {
				createLangList(xml, "selected_translation_language", document.getElementById("xliff_target_lang"));
			} else {
				createLangList(xml, "complete_translation_language", document.getElementById("xliff_target_lang"));
			}
			if ($("#xliff_source_lang").children("option").length == 2) {
				$("#xliff_source_lang option[value='']").remove();
			}
			if ($("#xliff_target_lang").children("option").length == 2) {
				$("#xliff_target_lang option[value='']").remove();
			}
			document.getElementById("xliff_source_lang").selectedIndex = 0;
			document.getElementById("xliff_target_lang").selectedIndex = 0;
			callbackFunc();
		},
		error: function() {
			alert("An error occurred while loading language dropdown");
		}
	});
	return deferred.promise();
}

function createLangList(xml, langNode, selectbox) {
	$(xml)
		.find(langNode)
		.find("language")
		.each(function() {
			var langCode = $(this)
				.find("language_code")
				.text();
			var langDesc = $(this)
				.find("descriptor")
				.text();
			addOption(selectbox, langDesc, langCode);
		});
}

function createLangArrayList(xml, langNode, langList) {
	$(xml)
		.find(langNode)
		.find("language")
		.each(function() {
			var langCode = $(this)
				.find("language_code")
				.text();
			var langDesc = $(this)
				.find("descriptor")
				.text();
			var index = getObjIndexByKey(langList, langCode);
			if (index === -1) {
				langList.push({ key: langCode, value: langDesc });
			}
		});
}

function getObjIndexByKey(array, key) {
	var i = -1;
	jQuery.each(array, function(index, value) {
		if (value.key === key) {
			i = index;
			return false;
		}
	});
	return i;
}

function addOption(selectbox, text, value) {
	var optn = document.createElement("option");
	optn.text = text;
	optn.value = value;
	selectbox.options.add(optn);
}

function validateDocSelections() {
	var selectedDocList = document.getElementsByName("selectedDocs");
	var documents = new Array();
	var textDocTypeCount = 0;
	var docTypeCount = 0;
	var docNotSelected = 0;

	for (var i = 0; i < selectedDocList.length; i++) {
		if (selectedDocList[i].checked == true) {
			var ids = selectedDocList[i].value.split(",");
			var docVerId = ids[0];
			if ($("input[name=curDocVerID_" + docVerId + "]").val() == "00001_0000000019") {
				textDocTypeCount++;
				document.getElementById("isdoc").value = "false";
			} else {
				docTypeCount++;
				document.getElementById("isdoc").value = "true";
			}

			if (documents[docVerId]) {
				// already exists, uncheck it
				selectedDocList[i].checked = false;
				continue;
			} else {
				// not yet exists, mark it as exists
				documents[docVerId] = true;
			}
		} else {
			docNotSelected++;
		}
	}

	if (selectedDocList.length == docNotSelected) {
		alert(i18n["SELECTDOC"]);
		return 0;
	} else if (textDocTypeCount >= 1 && docTypeCount >= 1) {
		alert(i18n["SELECT_DOC_CONFLICT"]);
		return 0;
	} else if (textDocTypeCount < 1 && docTypeCount > 1) {
		alert(i18n["SELECT_DOC_MORE_POA_ERROR"]);
		return 0;
	}
}

function openXLIFFImportDialog() {
	require(["jquery", "jqueryUI"], function($) {
		$(".ui-state-highlight").removeClass("ui-state-highlight");
		$(".ui-state-error").removeClass("ui-state-error");
		$("#filePath_import_xliff").val("");
		$("#docFileInput").val("");
		$("#approveTranslation").prop("checked", false);
		$("#createTranslation").prop("checked", true);

		$("#XLIFFImportDialog").dialog({
			autoOpen: false,
			closeText: "",
			draggable: true,
			height: "auto",
			resizable: true,
			width: "auto",
			minWidth: 350,
			modal: true,
			buttons: {
				CancelButton: {
					text: i18n["XLIFF_CANCEL"],
					id: "ImportXLIFFCancelId",
					click: function() {
						$("#xliff_fileStream").val("");
						$("#docFileInput")
							.next()
							.next()
							.text(""); // There is a span element that stores the name of previous selection, clear that off
						$("#XLIFFImportDialog").dialog("close");
					}
				},
				ImportButton: {
					text: i18n["XLIFF_OK_CONFIRM"],
					id: "ImportXLIFFID",
					toggle: false,
					click: function() {
						$(".ui-state-highlight").removeClass("ui-state-highlight");
						$(".ui-state-error").removeClass("ui-state-error");

						var files = document.getElementById("docFileInput").files;

						if (!files.length) {
							alert(i18n["SELECT_FILE"]);
							return;
						}

						var file = files[0];
						var fileName = file.name;
						var fileExt = fileName.split(".").pop();

						if (fileExt != "xlf" && fileExt != "xliff") {
							alert(i18n["SELECT_XLIFF_FILE_EXT"]);
							document.getElementById("docFileInput").value = "";
							document.getElementById("filePath_import_xliff").value = "";
							return;
						}

						readFile(file, function(blob_string) {
							document.getElementById("xliff_fileStream").value = blob_string;
							document.actionform.actionVal.value = "DoTextXLIFFImport";
							document.actionform.submit();
						});
						$("#XLIFFImportDialog").dialog("close");
					}
				}
			}
		});

		$("#XLIFFImportDialog").dialog("open");

		// bind the enter key to the dialog
		$("#XLIFFImportDialog").on("keypress", function(event) {
			$(".ui-state-error").removeClass("ui-state-error");
			if (event.keyCode == $.ui.keyCode.ENTER) {
				$(this)
					.parent()
					.find(".ui-dialog-buttonpane button:first")
					.trigger("click");
			}
		});

		//onClick event for Approve Translation checkbox option
		$(function() {
			$("#approveTranslation").on("click", function() {
				document.getElementById("approve_translation").value = !!this.checked;
			});
		});

		//onClick event for Create Translation checkbox option
		$(function() {
			$("#createTranslation").on("click", function() {
				document.getElementById("create_translation").value = !!this.checked;
			});
		});
	});
}

function getInputFileName(docFileInput) {
	var fileInputElementVal = docFileInput.value;
	if (fileInputElementVal.lastIndexOf("\\") != -1) {
		fileInputElementVal = fileInputElementVal.substring(fileInputElementVal.lastIndexOf("\\") + 1);
	} else if (fileInputElementVal.lastIndexOf(":") != -1) {
		fileInputElementVal = fileInputElementVal.substring(fileInputElementVal.lastIndexOf(":") + 1);
	} else if (fileInputElementVal.lastIndexOf("/") != -1) {
		fileInputElementVal = fileInputElementVal.substring(fileInputElementVal.lastIndexOf("/") + 1);
	}
	document.getElementById("xliff_fileStream").value = fileInputElementVal;
	document.getElementById("filePath_import_xliff").value = fileInputElementVal;
	$("#ImportXLIFFID").toggle(true);
	$("#approvalDiv").show();
	$("#CreateTranslationDiv").show();
}

function readFile(file, callback) {
	var reader = new FileReader();
	reader.onload = function() {
		callback(reader.result);
	};
	reader.readAsText(file);
}
