import {NDL} from './NDL/NDL.js';

var gNDL;
function mountBlob(fileObject, inFileName, onFileMounted) 
{
	console.assert(fileObject instanceof Blob )
    var reader = new FileReader();
    reader.onload = function () {
		let filePath = '/' + inFileName;

        var data = new Uint8Array(reader.result);
        try {
			let dummy = filePath;
			let fs = gNDL.fs();
			let stream = fs.open(dummy, 'w+');
			fs.write(stream, data, 0, data.length, 0);
			fs.close(stream);

			let stat = fs.stat(dummy);
			console.log(stat);
			if (stat.size == 0) {
				alert('Empty file: ' + filePath + ' ' + stat.size + ' bytes?');
			}
        } catch (err) {
            console.warn('Exception in mountBlob: ' + filePath + ' ' + err.message);
        }

        onFileMounted(filePath);
    }
    reader.readAsArrayBuffer(fileObject);
}

async function blobToUint8Array(blob)
{
	return new Promise((resolve, reject) => {
		console.assert(blob instanceof Blob )
		var reader = new FileReader();
		reader.onload = () =>{
			let data = new Uint8Array(reader.result);
			resolve(data);
		}
		reader.readAsArrayBuffer(blob);
	});
}

function getDroppedFile(ev)
{
	let file = undefined;
	ev.preventDefault();
	if (ev.dataTransfer.items) {
		for (var i = 0; i < ev.dataTransfer.items.length; i++) 
		{
			if (ev.dataTransfer.items[i].kind === 'file') 
			{
				let files = ev.dataTransfer.files;
				file = files.item(i);
				break; // handle one only
			}
		}
	} 
	return file;
}
async function onFileDropped(ev)
{
	let file = getDroppedFile(ev);
	console.assert( undefined != file, 'must have dropped file');

	let data = await blobToUint8Array(file);
	let filePath = '/' + file.name;
	gNDL.writeToFile(data, filePath);
	InspectPDF(filePath);
}


function InspectPDF(filePath)
{
	let ndl = gNDL;
	let viewer = gNDL.viewer();
	let loaded = viewer.loadPDF(filePath);
	let jsonStr = viewer.getMetadata();
	let xmp = undefined;
	try {
		xmp = JSON.parse(jsonStr);
	} catch (err) {
	}

	alert(JSON.stringify(xmp, null, 4));
	
}

function initDropzone(id, dropHandler)
{
	const ele = document.getElementById(id);
	ele.addEventListener('dragover', function (e) {
			e.preventDefault();
			});

	ele.addEventListener('dragenter', function (e) {
			e.target.style.background = 'lightgrey';
			e.preventDefault();
			});
	ele.addEventListener('dragleave', function (e) {
			e.preventDefault();
			e.target.style.background = '';
			});

	ele.addEventListener('drop', function (e) {
			e.preventDefault();
			e.target.style.background = '';
			dropHandler(e);
			});
}

async function init()
{
	console.log('Creating NDL');
	let ndl = new NDL();
	const initParams = {
		resources : 'NDL/Resources.zip'
		, fonts : []
	};
	await ndl.initialize(initParams);
	gNDL = ndl;
	let viewer = ndl.viewer();
	console.log( 'about(): ' + viewer.about());
	
	initDropzone('dropzone', onFileDropped);
	
}

$(()=>{ 
	init();
});