//# sourceURL=ArtProPlusInitializer.js

class ArtProPlusInitializer
{
	constructor ()
	{}

	async initEditor()
	{
		// Initialize the editor object
		return window.__esko_bootloader__.initEditor();
	}
}

window.ArtProPlusInitializer = ArtProPlusInitializer;
