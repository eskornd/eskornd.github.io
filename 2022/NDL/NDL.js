
// anonyous
async function fetchBinaryAsU8Array(url) 
{
	return new Promise((resolve, reject) => 
	{
		var xhr = new XMLHttpRequest();
		xhr.responseType = "arraybuffer";
		xhr.open("GET", url, true);
		xhr.onload = function (xhrEvent) 
		{
			let arrayBuffer = xhr.response; 
			// if you want to access the bytes:
			let byteArray = new Uint8Array(arrayBuffer);
			resolve(byteArray);
		};
		xhr.send();
	});
}

// NDL Class
export class NDL
{
	constructor()
	{
	}

	viewer()
	{
		if ( undefined === this._viewer )
		{
			this._viewer = new this._simplePDFModule.Viewer();
		}
		return this._viewer;
	}

	fs()
	{
		return this._simplePDFModule.FS;
	}

	async initialize(initParams)
	{
		if ( undefined == initParams)
		{
			initParmas = { };
		}
		if ( initParams.resources == undefined )
		{
			initParams.resources = 'NDL/Resources.zip';
		}
		if ( initParams.fonts == undefined )
		{
			initParams.fonts = [];
		}
		this._unzipModule = await UnzipModule();
		this._simplePDFModule = await SimplePDFModule();
		this._unzipModule.u8ArrayToPtr = (array) =>
		{
			const nByte = 1;
			let ptr = this._unzipModule._malloc(array.length * nByte);
			this._unzipModule.HEAPU8.set(array, ptr / nByte);
			return ptr;
		};
		this._unzipModule.ptrToU8Array = (ptr, length) => 
		{
			const nByte = 1;
			let array = new Uint8Array(length);
			const pos = ptr / nByte;
			array.set(this._unzipModule.HEAPU8.subarray(pos, pos + length));
			return array;
		};
		let u8Array = await fetchBinaryAsU8Array(initParams.resources);
		await this.onZipFetched(u8Array);

		this._simplePDFModule.Initialize('/Resources');
		await this.loadFonts(initParams.fonts);	
		console.log('NDL initialized!');
	}

	async onZipFetched(u8array) 
	{
		let unzipModule = this._unzipModule;
		let simplePDFModule = this._simplePDFModule;
		let ptr = unzipModule.u8ArrayToPtr(u8array);
		let uz = new unzipModule.Unzipper(ptr, u8array.length);
		unzipModule._free(ptr);
		let numEntries = uz.numEntries();
		for (let i=0; i<numEntries; ++i)
		{
			let name = uz.nthName(i);
			let len = uz.nthFileLength(i);
			if (len>0)
			{
				let p = unzipModule._malloc(len);	
				uz.nthFileData(i, p);
				let fileArray = unzipModule.ptrToU8Array(p, len);
				unzipModule._free(p);

				let pp = simplePDFModule._malloc(fileArray.length);
				simplePDFModule.HEAPU8.set(fileArray, pp);
				simplePDFModule.WriteFile('', name, pp, len);
				simplePDFModule._free(pp);
			}
		}
		console.log('NDL.js: ' + numEntries + ' Files extracted.');
	}

	/**
	 * @param in ['url1.woff', 'url2.tff']
	 */ 
	async loadFonts(urls)
	{
		for ( let i=0; i<urls.length; ++i)
		{
			const url = urls[i];
			const fileName = url.substring(url.lastIndexOf('/')+1);
			let u8Array = await fetchBinaryAsU8Array(url);
			await this.onFontFetched(u8Array, fileName);
		}
	}

	onFontFetched(u8array, fileName) 
	{
		let simplePDFModule = this._simplePDFModule;
		let pp = simplePDFModule._malloc(u8array.length);
		simplePDFModule.HEAPU8.set(u8array, pp);
		simplePDFModule.WriteFile('', fileName, pp, u8array.length);
		simplePDFModule._free(pp);
		let fontFullPath = '/' + fileName;
		console.log('before addFontFolderOrFont ' + fontFullPath);
		this.viewer().addFontFolderOrFont(fontFullPath);
		console.log('font loaded: ' + fontFullPath);
	}

	// write Uint8Array to file
	writeToFile(data, filePath)
	{
		let fs = this.fs();
		try {
			let stream = fs.open(filePath, 'w+');
			fs.write(stream, data, 0, data.length, 0);
			fs.close(stream);

			console.log('File written: ' + filePath);
			let stat = fs.stat(filePath);
			console.log(stat);
		} catch (err) {
			console.warn('Exception in writeUint8ArrayAsFile: ' + filePath + ' ' + err.message);
		}
	}
}

