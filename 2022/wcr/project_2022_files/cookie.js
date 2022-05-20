

function GetCookie(name)
{
  var search = name + "=";
  var returnVal = "";
  if (document.cookie.length > 0)
  {
    var offset = document.cookie.indexOf(search);
    if (offset != -1)
    {
      offset += search.length;
      end = document.cookie.indexOf(";", offset);
      if (end == -1) end = document.cookie.length;
      returnVal = unescape(document.cookie.substring(offset, end));
    }
  }
  return returnVal;
}

function SetCookie(name, value)
{
  document.cookie=name+"="+value;
}
