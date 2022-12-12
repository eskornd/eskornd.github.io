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
			const url1 = 'https://eskornd.github.io/shapes/assets/Can%2012%20oz.zae';
			const url2 = 'https://eskornd.github.io/shapes/assets/Paint%20bucket_5L.zae';
			const url3 = 'https://gist.githubusercontent.com/khaykov/a6105154becce4c0530da38e723c2330/raw/41ab415ac41c93a198f7da5b47d604956157c5c3/gistfile1.txt';
			
			let win = await editor.currentWindow();
			let ret = await win.endModal({assets: [url1, url2, url3]});
		} catch (err) {
			alert('Exception: ' + err );
		}
	});
}

go();
