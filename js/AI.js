var cs={};

function doEvalScript(script)
{
	log("cs.evalScript(): " + script );
	cs.evalScript(script);
}

_lastDocumentName : "",

hostAI = {
	init: () => {
		cs = new CSInterface();
		//Flyout menu
		var menu = "<Menu> <MenuItem Id=\"refresh\" Label=\"Refresh Page\" Enabled=\"true\" /></Menu>";
		cs.setPanelFlyoutMenu(menu);
		cs.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", (event)=>{
			switch (event.data.menuId)
			{
				case "refresh":
				{
					// reload page
					var url = window.location.href;
					window.location.href = url;
				}
					break;
			}
		});

		cs.addEventListener("documentAfterActivate", ()=>{
			// event sent from native AI
			log("Event documentAfterActivate Received");
		});

		cs.addEventListener("com.esko.cloudannotations.documentChanged", (event)=>{
			_lastDocumentName = event.data;
			ctx.view.onDocumentChanged();
		});
	},
	hello : ()=>{
		doEvalScript("hostHello();");
	},
	highlight : (rect)=>{ 
		var rectStr = JSON.stringify(rect);
		var script = ("highlight(" + rectStr + ");");
		doEvalScript(script);
	},
	highlightPage : ()=> {
		var script = ("highlightPage();");
		doEvalScript(script);
	},
	getCurrentDocumentName : () => {
		//TODO: Get document  properly via scripting call
		return _lastDocumentName;
	}
};

function initHost(host)
{
	host.init = hostAI.init;
	host.hello = hostAI.hello;
	host.highlight = hostAI.highlight;
	host.highligntPage = hostAI.highlightPage;
	host.getCurrentDocumentName = hostAI.getCurrentDocumentName;
}

