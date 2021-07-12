var cs={};

function doEvalScript(script)
{
	log("cs.evalScript(): " + script );
	cs.evalScript(script);
}

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
			alert("event documentAfterActivate");
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
	}
};
