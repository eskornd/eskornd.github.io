function isCEP()
{
	if (window.cep)
	{
		var cs = new CSInterface();
		var hostEnv = cs.getHostEnvironment();
	}
	return ( typeof window.cep != "undefined" );
}

function isIllustrator()
{
	if (!isCEP())
		return false;
	var cs = new CSInterface();
	return "ILST" == cs.getHostEnvironment().appId;
}

function isPhotoshop()
{
	if (!isCEP())
		return false;
	var cs = new CSInterface();
	return "PHXS" == cs.getHostEnvironment().appId;
}

function isArtProPlus()
{
	// TODO: check if host app is AP+
	return false;
}

function isBrowser()
{
	return window.isBrowser;
}

function getHostApp()
{
	if ( isCEP() )
	{
		if (isIllustrator())
			return "AdobeIllustrator";
		if (isPhotoshop())
			return "AdobePhotoshop";
		return "CEP";
	} else if ( isArtProPlus() ) {
		return "ArtProPlus";
	} else if ( isBrowser() ) {
		return "Browser";
	} else {
		return window.navigator.userAgent;
	}
}

export {getHostApp};
