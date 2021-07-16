function getJavascriptContent(jsSubPath)
{
	// TODO:
	// Get JS path or raw data from AI API
	var cs = new CSInterface();
	var cepDir = cs.getSystemPath(SystemPath.APPLICATION);
	var jsPath = cepDir +  jsSubPath;
	var jsFile = window.cep.fs.readFile(jsPath);
	return jsFile.data;
}

function injectEditor_AI(selector)
{
	var js = getJavascriptContent("/js/editor_AI.js");
	$(selector).html("<script type=\"module\">" + js + "</script>");
}

function injectEditor_PS(selector)
{
	var js = getJavascriptContent("/js/editor_PS.js");
	$(selector).html("<script type=\"module\">" + js + "</script>");
}
export {injectEditor_AI, injectEditor_PS};
