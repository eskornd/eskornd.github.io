function isCEP()
{
	return ( typeof window.cep != "undefined" );
}

function getHostEnvironment()
{
    return JSON.parse(window.__adobe_cep__.getHostEnvironment());
}

function isIllustrator()
{
	if (!isCEP())
		return false;
	return 'ILST' === getHostEnvironment().appId;
}

function isPhotoshop()
{
	if (!isCEP())
		return false;
	return 'PHXS' === getHostEnvironment().appId;
}

function isQtWebEngine()
{
	// TODO: check if host app is AP+
	return ('webChannel' in window);
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
	} else if ( isQtWebEngine() ) {
		return "QtWebEngine";
	} else if ( isBrowser() ) {
		return "Browser";
	} else {
		return window.navigator.userAgent;
	}
}

function randomID()
{
	const length = 6;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

export {getHostApp, randomID};
