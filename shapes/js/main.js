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
	let listener = elem.addEventListener('click',async ()=>{ alert ('clicked');});
}

go();
