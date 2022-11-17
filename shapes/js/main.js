async function go()
{
	let editor = null;
	try {
		editor= await InitEditor();
	} catch (err) {
		alert('main.js: Unable to InitEditor(): ' + JSON.stringify(err));
	}

	if ( null != editor )
	{
		let verStr = await editor.versionString();
		console.log('UECI Editor initialized: ' + verStr);
	}

	let elem = document.getElementById('Download');
	let listener = elem.addEventListener('click',async ()=>{ 
		try {
			let win = await editor.currentWindow();
			let ret = await win.endModal({ assets : ['/Users/nexu/Desktop/Can 12 oz.zae', '/Users/nexu/Desktop/Paint bucket_5L.zae']});
		} catch (err) {
			alert('Exception: ' + err );
		}
	});
}

go();
