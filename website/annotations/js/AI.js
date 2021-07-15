function getJavascriptContent()
{
	// TODO:
	// Get JS path or raw data from AI API
	var cs = new CSInterface();
	var cepDir = cs.getSystemPath(SystemPath.APPLICATION);
	var jsPath = cepDir + "/js/editor_AI.js";
	var jsFile = window.cep.fs.readFile(jsPath);
	return jsFile.data;
}

function injectEditor_AI(selector)
{
	var js = getJavascriptContent();
	$(selector).html("<script type=\"module\">" + js + "</script>");
}

export {injectEditor_AI};
