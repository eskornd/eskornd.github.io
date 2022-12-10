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
			//download
			// let utils = await editor.utils();
			//let filePath = await utils.downloadAs({url:url});
			const url1 = 'https://eskornd.github.io/shapes/assets/Can%2012%20oz.zae';
			const url2 = 'https://eskornd.github.io/shapes/assets/Paint%20bucket_5L.zae';
			// const url3 = 'https://speedtest-ca.turnkeyinternet.net/1000mb.bin'; // testing only
			
			let win = await editor.currentWindow();
			let ret = await win.endModal({assets: [url1, url2]});
		} catch (err) {
			alert('Exception: ' + err );
		}
	});
}

go();
