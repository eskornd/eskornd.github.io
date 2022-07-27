//# sourceURL=ArtProPlusInitializer.js

class ArtProPlusInitializer
{
	constructor ()
	{}

	async initEditor()
	{
		// add a 2000 ms timeout to wait for the editor connector javascript injectionw
		let timeout = 2000; //timeout
		let step = 100; //ms
		let intervalHandle = setInterval(()=>
		{
			timeout -= step;
			if ( undefined != window.__esko_bootloader__ )
			{
				clearInterval(intervalHandle);
				return window.__esko_bootloader__.initEditor();
			}
			if ( timeout <= 0 )
			{
				clearInterval(intervalHandle);
				return Promise.reject(new Error('initEditor timeout'));
			}
		}, step);

	}
}

window.ArtProPlusInitializer = ArtProPlusInitializer;
