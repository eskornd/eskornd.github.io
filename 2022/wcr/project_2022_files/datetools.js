// Date related JavaScript
// depends on element.js
//
window.getFormattedDate = function getFormattedDate(date) { 
  var months = new Array(12); 
  months[0]="Jan"; 
  months[1]="Feb"; 
  months[2]="Mar"; 
  months[3]="Apr"; 
  months[4]="May"; 
  months[5]="Jun"; 
  months[6]="Jul"; 
  months[7]="Aug"; 
  months[8]="Sep"; 
  months[9]="Oct"; 
  months[10]="Nov"; 
  months[11]="Dec"; 
/*  
  var days = new Array(7); 
  days[0]="Sunday"; 
  days[1]="Monday"; 
  days[2]="Tuesday"; 
  days[3]="Wednesday"; 
  days[4]="Thursday"; 
  days[5]="Friday"; 
  days[6]="Saturday"; 
*/
  if (date==null)
    date=new Date();
  var curDay=date.getDay(); 
  var curMonth=date.getMonth(); 
  var curDate=date.getDate(); 
  var curYear=date.getFullYear(); 
  
  return ""+months[curMonth]+" "+curDate+", "+curYear; 
}

window.getShortFormattedDate = function getShortFormattedDate(date) { 
	var day = date.getDate();
	var month = date.getMonth()+1;
	return ((month<10)?"0":"")+month+"/"+((day<10)?"0":"")+day+"/"+date.getFullYear();
}

window.getDate = function getDate(dateString) {
  if (dateString!=null) {
    // Make sure Date String is a String!
    if(typeof dateString == 'string')
      dateString = "" + convertDateForJSDateClass(dateString); 
    var date=new Date(dateString);
//alert('date1 ='+date+'; toLocaleDateString= '+date.toLocaleDateString());
    if ("NaN"!=date.toLocaleDateString() && "Invalid Date"!=date.toLocaleDateString()) {
      var returnedYear = date.getFullYear();
      if(returnedYear < 1970)
        date.setFullYear(returnedYear + 100);
      
      return date;
    }
  }
  return null;
}

window.convertDateForJSDateClass = function convertDateForJSDateClass(dateString) 
{
	var returnString;
  	var newDateString = new String(dateString);
  	
  	var index = dateString.indexOf("/");
  	if ( index >= 0 )
  	{
		// Check to see if in DD/MM/YYYY format first
		var dateArray = newDateString.split('/');
		if(dateArray.length == 3) 
		{
  			// Check to see if numbers are valid numbers
  			var day = parseInt(dateArray[0], 10);
	  		var month = parseInt(dateArray[1], 10);
  			var year = parseInt(dateArray[2], 10);
  		
	  		if(day == null || day <= 0 || day > 31)
	  		  return "";
	  		else if(month == null || month <= 0 || month > 12)
	  		  return "";
	  		else if(year == null || year < 0 || year > 9999)
	  		  return "";
	  		else
	  		  returnString = dateArray[1] + "/" + dateArray[0] + "/" + dateArray[2];
	  		
  			return returnString;
  		} 
  		else 
  		{
			// Check to see if in DD/MM, YYYY format
			dateArray = newDateString.split(",");
			if(dateArray.length == 2) 
			{
				// Valaidate days and months
				var year = parseInt(dateArray[1], 10);
				if(year == null || year < 0 || year > 9999)
					return "";
	  	    
				var secondDateArray = dateArray[0].split('/');
				if(secondDateArray.length == 2) {
	  	    		// Validate days and months
		  	    	var day = parseInt(secondDateArray[0], 10);
		  			var month = parseInt(secondDateArray[1], 10);
	  				if(day == null || day <= 0 || day > 31)
	  				  return "";
	  				else if(month == null || month <= 0 || month > 12)
		  			  return "";
	  		      
		  	    	returnString = secondDateArray[1] + "/" + secondDateArray[0] + "/" + dateArray[1];
	  	    	
	  		    	return returnString;
	  	    	}    	
	  		} // end dateArray.length == 2
	  	} // end eles
	}
	else // dateString does not contain /
  	{
  		// Check to see if in MMM DD, YYYY format like Mar 16, 2011
	  	index = dateString.indexOf(",");
	  	if ( index >= 0 )
	  	{
		  	dateArray = dateString.split(",");
			var secondDateArray = dateArray[0].split(' ');
		 	if(secondDateArray.length == 2) 
		 	{
		  	   	// Validate days and months
		  		var day = parseInt(secondDateArray[1], 10);
		  		if(day == null || day <= 0 || day > 31)
		  		  return "";
		  	    return dateString;  		
		    }
	  	}
	  	else 
			return dateString;
  	}

	return "" ;
}

window.getNumber = function getNumber(numberString) {
//alert('numberString ='+numberString);
  if (numberString!=null) { // && numberString.length()>0) {
    var number=new Number(numberString);
//alert('number ='+number);
    if ("NaN"!=number)
      return number;
  }
  return null;
}

window.getDateString = function getDateString(dateString) {
  // if(dateString.constructor == String) dateString = parseInt(dateString);
  if (dateString!=null) { // && dateString.length()>0) {
//alert('dateString ='+dateString);
  var date=getDate(dateString);
//alert('date1 ='+date+'; toLocaleDateString= '+date.toLocaleDateString());
    if (date!=null)
      return getFormattedDate(date);
  }
  return null;
}

window.checkDate = function checkDate(id) {
  var dateString=getDateString(getElementValue(id));
//  alert('checkDate: '+id);
  if (dateString!=null) {
    setElementValue(id, dateString);
    updateImplementationDates();
  }
  else {
    if (getElementValue(id)!=null && getElementValue(id)!='')
      alert('Enter date formatted as: "16 January, 2008", "16/1/2008" "16/1/08" or "16/1, 2008"');
    updateImplementationDates();
    setFocus(id);
  }
}

window.dateAddMonths = function dateAddMonths(date, addMonths) {
  var days=date.getDate();
  var months=date.getMonth();
  var years=date.getFullYear();
//alert('months1 ='+months);
  months+=addMonths;
  if (months>11) {
    years+=months/12;
    months=months%12;
  }
//  alternative day of month overflow correction
//  var maxdays=new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
//  if ((years%4)==0 && (years%400)!=0) // check!!
//    maxdays[1]=29;
//  if (days>maxdays[months])
//    days=maxdays[month];

//alert('months2 ='+months);
  var newdate=new Date(years, months, days);
  if (newdate.getMonth()!=months) // day of month overflow
    return new Date(years, months, days-newdate.getDate());
  else
    return newdate;
}

window.dateAddDays = function dateAddDays(date, addDays) {
  var ms=date.valueOf();
//alert('ms1 ='+ms);
//alert('addDays ='+addDays);
  ms+=new Number(addDays)*24*60*60*1000;
//alert('ms2 ='+ms);
  return new Date(ms);
}

window.minDate = function minDate(date1, date2) {
  if (date1==null)
    return date2;
  if (date2==null)
    return date1;
  if (date1.valueOf()<date2.valueOf())
    return date1;
  else
    return date2;
}

window.dateAddWorkDays = function dateAddWorkDays(date, addDays) {
	if (!date) return null;
	// Date.getDay() returns days with following indices: 0..Sunday; 1..Monday; ...
	var daysLeft = [0,5,4,3,2,1,0];
	var curDay = date.getDay();   // day within a week
	var newDay = date.getDate();   // day within a month
	
	if (addDays < 0) addDays = 0;
	if (curDay == 0) {   // sunday
		newDay += 1;   // skip sunday and...
		curDay = 1;   // ...set cur day to monday
	}
	else if (curDay == 6) {   // saturday
		newDay += 2;   // skip weekend and...
		curDay = 1;   // ...set cur day to monday
	}
	while (addDays >= daysLeft[curDay]) {
		newDay += daysLeft[curDay] + 2;   // 2 days more to skip weekend
		addDays -= daysLeft[curDay];
		curDay = 1;   // when increasing date the first day after weekend is monday
	}
	newDay += addDays;
	
	var newDate = new Date(date);
	newDate.setDate(newDay);   // month overlap should be handled by Date object implementation

	return newDate;
}

window.dateSubWorkDays = function dateSubWorkDays(date, subDays) {
	if (!date) return null;
	// Date.getDay() returns days with following indices: 0..sunday; 1..monday; ...
	var daysLeft = [0,1,2,3,4,5,0];
	var curDay = date.getDay();   // day within a week
	var newDay = date.getDate();   // day within a month
	
	if (subDays < 0) subDays = 0;
	if (curDay == 0) {   // sunday
		newDay -= 2;   // skip weekend and...
		curDay = 5;   // ...set cur day to friday
	}
	else if (curDay == 6) {   // saturday
		newDay -= 1;   // skip saturday and...
		curDay = 5;   // ...set cur day to friday
	}
	while (subDays >= daysLeft[curDay]) {
		newDay -= daysLeft[curDay] + 2;   // 2 days more to skip weekend
		subDays -= daysLeft[curDay];
		curDay = 5;   // when decreasing date the first day after weekend is friday
	}
	newDay -= subDays;
	
	var newDate = new Date(date);
	newDate.setDate(newDay);   // month overlap should be handled by Date object implementation

	return newDate;
}

window.dateAddWorkHoursMins = function dateAddWorkHoursMins(date, addHours, addMins) {
	if (!date) return null;
	
	var newDate = new Date(date);
	if (addHours < 0) addHours = 0;
	if (addMins < 0) addMins = 0;
	if ((addHours == 0) && (addMins == 0)) return newDate;
	
	newDate.setHours(date.getHours() + addHours);
	newDate.setMinutes(date.getMinutes() + addMins);

	var newDay = newDate.getDay();   // day within a week
	var newDayInMonth = newDate.getDate();
	// when ends in a weekend skip to the nearest work day
	if (newDay == 0) newDayInMonth += 1;   // sunday
	else if (newDay == 6) newDayInMonth += 2;   // saturday
	
	newDate.setDate(newDayInMonth);
	return newDate;
}

window.dateSubWorkHoursMins = function dateSubWorkHoursMins(date, subHours, subMins) {
	if (!date) return null;

	var newDate = new Date(date);
	if (subHours < 0) subHours = 0;
	if (subMins < 0) subMins = 0;
	if ((subHours == 0) && (subMins == 0)) return newDate;
	
	newDate.setHours(date.getHours() - subHours);
	newDate.setMinutes(date.getMinutes() - subMins);

	var newDay = newDate.getDay();   // day within a week
	var newDayInMonth = newDate.getDate();
	// when ends in a weekend skip to the nearest work day
	if (newDay == 0) newDayInMonth -= 2;   // sunday
	else if (newDay == 6) newDayInMonth -= 1;   // saturday
	
	newDate.setDate(newDayInMonth);
	return newDate;
}

// Returns summer time offset in minutes (Javascript works with minutes...)
window.getSummerTimeOffset = function getSummerTimeOffset()
{
	var d = new Date();
	d.setMonth(0);
	var jan = d.getTimezoneOffset();
	d.setMonth(6);
	var jul = d.getTimezoneOffset();

	return (jul - jan);
}

window.getSummerWinterTimeOffset = function getSummerWinterTimeOffset(date)
{
	var now = new Date();
	var nowOffset = now.getTimezoneOffset();
	var dateOffset = date.getTimezoneOffset();
	return (dateOffset-nowOffset);	//in minutes
}

window.isSummerTime = function isSummerTime(date)
{
	var d = new Date(date);
	var now = d.getTimezoneOffset();
	d.setMonth(0);
	var jan = d.getTimezoneOffset();
	d.setMonth(6);
	var jul = d.getTimezoneOffset();
	
  return ((jan != jul) && (now == Math.min(jan, jul)));
}

window.fixDateSummerWinterTime = function fixDateSummerWinterTime(date,fromNow)
{
	var d = null;
	if (date!=null) {
		var offset = getSummerWinterTimeOffset(date)*60000;	//to ms
		if (fromNow) {	//adapt the given date to store 'correctly' the time inputted now
			d = new Date(date.getTime() - offset);
		} else {	//adapt the given date to show it 'correctly' now
			d = new Date(date.getTime() + offset);
		}
	}	
	return d;
}

