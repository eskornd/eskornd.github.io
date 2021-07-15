function isCEP()
{
	return ( typeof window.cep != "undefined" );
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
		return "Adobe";
	} else if ( isArtProPlus() ) {
		return "ArtProPlus";
	} else if ( isBrowser() ) {
		return "Browser";
	} else {
		return window.navigator.userAgent;
	}
}

export {getHostApp};
