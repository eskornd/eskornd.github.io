// <!-- Code for Check All/Clear All -->
// <!--

// function called when a input checkbox in a row is checked
// var elem - the input element
function Toggle(elem)
{
	Highlight(elem, elem.checked);
}
  
// function to (un)highlight a elment
// var elem - the input element
// var on - if true will highlight the row else will unhighlight
function Highlight(elem, on)
{
  // find the table row (this should be rewritten to be more foolproof)
  /*var r = null;
	if (elem.parentNode && elem.parentNode.parentNode)
    r = elem.parentNode.parentNode;
	else if (elem.parentElement && elem.parentElement.parentElement)
    r = elem.parentElement.parentElement;
    
	if (r)
	{
	  if (on)
	    r.className = "highlight_row";
	  else
      r.className = "unhighlight_row";
  }*/
}

// function to (un)highlight a elment.
// In case of unhilighiting it makes a background grey for Even rows
// var elem - the input element
// var on - if true will highlight the row else will unhighlight
// var position - 0/1 number of row in the table
function HighlightElem(elem, on, position)
{
  // find the table row (this should be rewritten to be more foolproof)
  /*var r = null;
	if (elem.parentNode && elem.parentNode.parentNode)
	r = elem.parentNode.parentNode;
	else if (elem.parentElement && elem.parentElement.parentElement)
	r = elem.parentElement.parentElement;
	
	if (r)
	{
	  if (on)
		r.className = "highlight_row";
	  else
	  {
	    if (position == 0)
		 r.className = "grey";
		else
		 r.className = "unhighlight_row";
	  }
  }*/
}

// function when the (un)select all checkbox is hit
// var selectAllElem - the select all input element
// var tableForm - the form elment which contains the rows to act upon
// var inputElemName - the name of the row input check element 
function ToggleAll(selectAllElem, tableForm, inputElemName)
{
  // walk each of the element in the table
  var len = tableForm.elements.length;
  for (var i = 0; i < len; i++)
  {
    var inputElem = tableForm.elements[i];
    if (inputElem.name == inputElemName)
    {
      if (inputElem.disabled == false)
      {
	      if (selectAllElem.checked)
	        inputElem.checked = true;
	      else
	        inputElem.checked = false;
	
	      Highlight(inputElem, selectAllElem.checked)
      }
    }
  }
}

function CheckToggle(seleclAllElem, rowCount, elem, form)
{
	//alert(' elem=' + elem + 'elemname=' + elem.name + ' length=' + elem.lenght + ' value=' + elem.value  + ' checked=' + elem.checked);

    var checkedCount = 0;
    for (var i = 0; i < form.elements.length; i++)
    if (form.elements[i].name == elem.name)
    {
    	if (form.elements[i].checked == true)
    	{
    		checkedCount++;
    	}
    }

	//alert('selectall=' + seleclAllElem.checked + ' count=' + checkedCount + ' total=' + rowCount);
	if (checkedCount >= rowCount)
	{
		seleclAllElem.checked = true;
	}
	else if (checkedCount == 0)
	{
		seleclAllElem.checked = false;
	}
	else if (checkedCount < rowCount)
	{	
		seleclAllElem.checked = false;
	}
}

// function when the (un)select all checkbox is hit
// var selectAllElem - the select all input element
// var tableForm - the form elment which contains the rows to act upon
// var inputElemName - the name of the row input check element 
function ToggleAllNoHighlight(selectAllElem, tableForm, inputElemName)
{
  // walk each of the element in the table
  var len = tableForm.elements.length;
  for (var i = 0; i < len; i++)
  {
    var inputElem = tableForm.elements[i];
    if ((inputElem.name == inputElemName)  && !inputElem.disabled)
    {
      if (selectAllElem.checked)
        inputElem.checked = true;
      else
        inputElem.checked = false;

    }
  }
}

// function when the (un)select all checkbox is hit
// var selectAllElem - the select all input element
// var tableForm - the form elment which contains the rows to act upon
// var inputElemName - the name of the row input check element 
function ToggleAllRow(selectAllElem, tableForm, inputElemName)
{
  // walk each of the element in the table
  var len = tableForm.elements.length;
  for (var i = 0; i < len; i++)
  {
    var inputElem = tableForm.elements[i];
    var mod = i%2;
    if (inputElem.name == inputElemName)
    {
      if (selectAllElem.checked)
        inputElem.checked = true;
      else
        inputElem.checked = false;

      //Highlight(inputElem, selectAllElem.checked)
      HighlightElem(inputElem, selectAllElem.checked, mod);
    }
  }
}
function FindElemByValue(tableForm, inputElemName, value)
{
  var returnElem = null;
  var len = tableForm.elements.length;
  for (var i = 0; i < len; i++)
  {
    var inputElem  = tableForm.elements[i];
    if (inputElem.name == inputElemName)
    {
      if (inputElem.value == value )
      {
        returnElem = inputElem;
        break;
      }
    }
  }
  return returnElem;
}

// function when the (un)select all checkbox is hit
// var selectAllElem - the select all input element
// var tableForm - the form elment which contains the rows to act upon
// var inputElemName - the name of the row input check element 
function ClearAll(selectAllElem, tableForm, inputElemName)
{
	if (selectAllElem) {
  		selectAllElem.checked = false;
	}
  	ToggleAll(selectAllElem, tableForm, inputElemName);
}

function GetCheckedCount(rowCount, inputElem)
{
  var selCount = 0;
  if (rowCount == 1)
  {
    if (inputElem.checked == true)
    {
      selCount++;
    }              
  }
  else if (rowCount > 0)
  {
    for (var i = 0; i < inputElem.length; i++)
    {
      if (inputElem[i].checked == true)
      {
        selCount++;
      }
    }            
  }
  
  return selCount;
}



// This function is an extension of the 'GetCheckedCount' function
// it counts the number of checked items which have a certain attribute set 
// (the value of the attribute is not checked, only the appearance of the attribute is checked)
function GetCheckedCountWithAttribute(rowCount, inputElem, attributeName)
{
  var selCount = 0;
  if (rowCount == 1)
  {
    if ((inputElem.checked == true) && (inputElem.getAttribute( attributeName) !=null))
    		selCount++;
  }
  else if (rowCount > 0)
  {
    for (var i = 0; i < inputElem.length; i++)
    {
      if ((inputElem[i].checked == true) && (  inputElem[i].getAttribute(attributeName) != null)  )
    		selCount++;
    }            
  }
  
  return selCount;
}	

function GetRadioValue(rowCount, inputElem)
{
  var value = '';
  if (rowCount == 1)
  {
    if (inputElem.checked == true)
    {
      value = inputElem.value;
    }              
  }
  else if (rowCount > 0)
  {
    for (var i = 0; i < inputElem.length; i++)
    {
      if (inputElem[i].checked == true)
      {
      	value = inputElem[i].value;
      	break;
      }
    }            
  }
  
  return value;
}

function ClearAllChecked(rowCount, inputElem)
{
  var selCount = 0;
  if (rowCount == 1)
  {
    inputElem.checked = false;
    Highlight(inputElem, false)
  }
  else if (rowCount > 0)
  {
    for (var i = 0; i < inputElem.length; i++)
    {
      inputElem[i].checked = false;
      Highlight(inputElem[i], false)
    }            
  }
}

function CheckTextInput(curText, defText, rowElemName)
{
  var theElement = document.getElementById(rowElemName);
  if (theElement != null)
  {
    var oldValue = theElement.className;
    var newValue = null;
    if (curText == defText)
      newValue = "unhighlight_row";
    else
      newValue = "highlight_row";
    if (oldValue == null || oldValue.length==0)
      theElement.className = newValue;
    else {
      if (oldValue.indexOf("highlight_row") == -1)
        theElement.className = newValue + ' ' + oldValue;
      else {
        if (oldValue.indexOf("unhighlight_row") != -1) {
          if (curText != defText)
            theElement.className = oldValue.replace("unhighlight_row", "highlight_row");
        }
        else {
         if (curText == defText)
           theElement.className = oldValue.replace("highlight_row", "unhighlight_row");
        }
      }
    }
  }
}

//JANH added
function FindCompanyByID(compID)
{
	var comps = document.actionform.selectmembercomp;
	if (comps != null)
	{
		if (comps.length == undefined)
		{
			// not an array
	    if (compID == comps.value) return comps;
		}
		else
		{		
		  for (var i = 0; i < comps.length; i++)
		  {
		    if (compID == comps[i].value) return comps[i];
		  }
		}
	}
	return null;
}

//JANH added
function FindAllCompanyLocations(compID)
{
	var comps = new Array();

	var locs = document.actionform.selectmember;
	if (locs != null)
	{
		if (locs.length == undefined)
		{
			// not an array
	    if (compID == locs.getAttribute("CompanyID")) comps.push(locs);
		}
		else
		{		
			for (var i = 0; i < locs.length; i++)
			{
				if (compID == locs[i].getAttribute("CompanyID")) comps.push(locs[i]);
			}
		}
	}

	return comps;
}


//JANH added
function IsAllMembersSelected(tableForm, memberName)
{
	var memberFound = false;
	for (var i = 0; i < tableForm.elements.length; i++)
	{
		var elem = tableForm.elements[i];
		if (elem.name == memberName)
		{
			if (!elem.disabled)
			{
				memberFound = true;
				if (!elem.checked) return false;
			}
		}
	}
	return memberFound;
}


//-->
