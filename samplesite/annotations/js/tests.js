function TRUE(isTrue)
{
	if (!isTrue)
	{
		throw new Error();
	}
}

function ASSERT(fn, message)
{
	try {
		fn();
	} catch (error) {
		console.log('ASSERT FAIL: ' + message);
		console.error(error.stack);
		throw error;
	}
}

var tests = [];
class Testcase
{
	constructor(name, testFn)
	{
		this.name = name;
		this.run = testFn;
	}

}

class Tester
{
	constructor()
	{
		this._tests = [];
	}

	tests() {
		return this._tests;
	}

	addTest(name, fn) {
		this._tests.push(new Testcase(name, fn));
	}
}

let tester = new Tester();
let editor = null;

tester.addTest('Editor.appName', async ()=> {
	const appName = await editor.appName();
	ASSERT(()=>TRUE( appName === 'AdobeIllustrator' || appName == 'ArtPro+' ), 'Application name must be \'AdobeIllustrator\' or \'ArtPro+\'');
});

tester.addTest('Editor.versionString', async ()=>{
	const verStr = await editor.versionString();
	ASSERT(()=>{TRUE( undefined != verStr )}, 'versionString is empty');
	ASSERT(()=>{TRUE( '' != verStr )}, 'versionString is empty');
});

tester.addTest('Editor.version', async ()=>{
	let ver;
	try {
		ver = await editor.version();
	} catch (error){}
	ASSERT(()=>{TRUE( 'object' == typeof ver)}, 'version is not object');
	ASSERT(()=>{TRUE( ver.hasOwnProperty('major'))}, 'version.major must exists');
	ASSERT(()=>{TRUE( ver.hasOwnProperty('minor'))}, 'version.minor must exists');
	ASSERT(()=>{TRUE( ver.hasOwnProperty('build'))}, 'version.build must exists');
});

tester.addTest('Document.ArtProPlusCheck', async ()=>{
	if ( 'ArtPro+' != await editor.appName() )
	{
		return;
	}

	let title = undefined;
	try{
		let doc = await editor.currentDocument();	
		title = await doc.title();
	} catch (error) {}	

	const kTitle = 'Letter_UECI.pdf';
	if ( title != kTitle )
	{
		let href = window.location.href;
		let url = href.replace('tests.html', kTitle);
		alert('Please run test with ' + kTitle + '.\nYou can download it from: ' + url );
	}
});


tester.addTest('Document.basicInfo', async ()=>{
	
	let title = undefined;
	let filePath = undefined;
	let pagesInfo = undefined;
	try{
		let doc = await editor.currentDocument();	
		title = await doc.title();
		filePath = await doc.filePath();
		pagesInfo = await doc.pagesInfo();
	} catch (error) {}	

	ASSERT(()=>{TRUE( undefined != title && 'string' == typeof title);}, 'has title');

	ASSERT(()=>{TRUE( undefined != filePath && 'string' == typeof filePath );}, 'has filePath');

	ASSERT(()=>{TRUE( undefined != pagesInfo && 'object' == typeof pagesInfo);}, 'has pagesInfo');
});

tester.addTest('Document.pagesInfo', async ()=>{
	
	let pagesInfo = undefined;
	const width = 612.0;
	const height = 792.0;
	try{
		let doc = await editor.currentDocument();
		pagesInfo = await doc.pagesInfo();
	} catch (error) {}	

	ASSERT(()=>{TRUE( undefined != pagesInfo && 'object' == typeof pagesInfo && 1== pagesInfo.length);}, 'has pagesInfo');
	let pageInfo = pagesInfo[0];
	ASSERT(()=>{TRUE( pageInfo.hasOwnProperty('width') && pageInfo.width == width )}, 'page width matches');
	ASSERT(()=>{TRUE( pageInfo.hasOwnProperty('height') && pageInfo.height == height)}, 'page height matches');
	ASSERT(()=>{TRUE( pageInfo.hasOwnProperty('pageBoxes') )}, 'has pageBoxes');

});

tester.addTest('Document.pagesInfo.pageBoxes', async ()=>{
	
	let pagesInfo = undefined;
	const width = 612.0;
	const height = 792.0;
	try{
		let doc = await editor.currentDocument();
		pagesInfo = await doc.pagesInfo();
	} catch (error) {}	

	ASSERT(()=>{TRUE( undefined != pagesInfo && 'object' == typeof pagesInfo && 1== pagesInfo.length);}, 'has pagesInfo');
	let pageInfo = pagesInfo[0];
	ASSERT(()=>{TRUE( pageInfo.hasOwnProperty('pageBoxes') )}, 'has pageBoxes');

	let trimBox = undefined;
	let mediaBox = undefined;
	let artBox = undefined;
	try {
		for ( let i =0; i<pageInfo.pageBoxes.length; ++i)
		{
			let pageBox = pageInfo.pageBoxes[i];
			
			if ( pageBox.type == 'MediaBox')
			{
				mediaBox = pageBox;	
			}
			if ( pageBox.type == 'TrimBox')
			{
				trimBox = pageBox;	
			}
			if ( pageBox.type == 'ArtBox')
			{
				artBox = pageBox;	
			}
		}
	} catch(error) {
	}
	
	ASSERT(()=>{TRUE( undefined != trimBox );}, 'has trimBox');
	ASSERT(()=>{TRUE( undefined != mediaBox );}, 'has mediaBox');
	ASSERT(()=>{TRUE( mediaBox.rect.width == 612.0 && mediaBox.rect.height == 792.0 );}, 'mediaBox size matches');
	ASSERT(()=>{TRUE( 
		trimBox.rect.width == 300.0 
		&& trimBox.rect.height == 480.0 
	);}, 'trimBox size matches');
	ASSERT(()=>{TRUE( 
		mediaBox.rect.x == 0.0 
		&& mediaBox.rect.y == -792.0 
	);}, 'mediaBox pos matches');
	ASSERT(()=>{TRUE( 
		trimBox.rect.x == 100.0 
		&& trimBox.rect.y == -692.0 
	);}, 'trimBox pos matches');
});

tester.addTest('Document.setAnnotations', async ()=>{
	const rectInput = {x: 10, y:20, width:100, height:50};
	const rgbInput = { r: 64, g: 64, b:32};
	const annotsInput = [ {boundingBox: rectInput, highlightColor:rgbInput} ];
	try{
		
		let doc = await editor.currentDocument();	
		
		await doc.setAnnotations(annotsInput);
	} catch (error) {
		ASSERT(()=>{TRUE(false);}, 'setAnnotations failed: ' + error);
	}	
});

tester.addTest('Document.getAnnotations', async ()=>{
	const rectInput = {x: 10, y:20, width:100, height:50};
	const rgbInput = { r: 64, g: 64, b:32};
	const annotsInput = [ {boundingBox: rectInput, highlightColor:rgbInput} ];
	let annotsOutput = [];
	try{
		let doc = await editor.currentDocument();	
		
		await doc.setAnnotations(annotsInput);
		annotsOutput = await doc.getAnnotations();
	} catch (error) {
	}	
	ASSERT(()=>{TRUE( annotsInput.length == annotsOutput.length );}, 'nums of annotations matches');
	
	let rectOutput = annotsOutput[0].boundingBox;
	let rgbOutput = annotsOutput[0].highlightColor;
	
	let boundingBoxEqual = (a, b)=>{
		return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
	};
	let rgbEqual = (a, b)=>{
		return a.r === b.r && a.g === b.g && a.b === b.b;
	};
	ASSERT(()=>{TRUE( boundingBoxEqual(rectInput, rectOutput) );}, 'boundingBox matches');
	ASSERT(()=>{TRUE( rgbEqual(rgbInput, rgbOutput) );}, 'rgb matches');
});

tester.addTest('Document.readFileBinary', async ()=>{
	let hash = '';
	let isDirty = undefined;
	let arr = undefined;
	try {
		let doc = await editor.currentDocument();
		isDirty = await doc.isDirty();
		arr = await doc.readFileBinary({});	
	} catch (err) {
		throw err;
	}
	
	ASSERT(()=>{TRUE( !isDirty)}, 'Document should not be dirty');
	ASSERT(()=>{TRUE( arr.length == 1834200)}, 'Document size matches');
});
	
tester.addTest('Document.setNodeID', async ()=>{
	const nodeID = 'NODEID';
	try{
		
		let doc = await editor.currentDocument();	
		await doc.setNodeID(nodeID);
	} catch (error) {
		ASSERT(()=>{TRUE(false);}, 'setNodeID failed: ' + error);
	}	
});

/* TODO: Enable once setNodeID is fully implemented (document becomes dirty)
tester.addTest('Document.setNodeID_Dirty', async ()=>{
	
	const nodeID = 'ANY NODEID';
	let isDirty = false;
	try{
		
		let doc = await editor.currentDocument();	
		await doc.setNodeID(nodeID);
		
		isDirty = await doc.isDirty();
	} catch (error) {
	}	
	ASSERT(()=>{TRUE( isDirty);}, 'Document should be dirty after setNodeID');
});
*/

/* TODO: Enable once getNodeID is implemented
tester.addTest('Document.getNodeID', async ()=>{
	const nodeIDIn = 'ANOTHER NODE ID';
	let nodeIDOut = '';
	try{
		
		let doc = await editor.currentDocument();	
		
		await doc.setNodeID(nodeIDIn);
		nodeIDOut = await doc.getNodeID();
			
	} catch (error) {
		ASSERT(()=>{TRUE(false);}, 'setAnnotations failed: ' + error);
	}	

	ASSERT(()=>{TRUE( nodeIDIn == nodeIDOut );}, 'node ID set/get matches');
});
*/


async function testMain()
{
	try {
		editor = await InitEditor();
	} catch (err) {

	}

	ASSERT(()=>{TRUE( null!= editor)}, ' editor is initialized');
	console.log('Starting tests ...');
	let tests = tester.tests();
	const total = tests.length;
	let passed = 0;
	for (let i=0; i< tests.length; ++i)
	{
		let test = tests[i];
		try {
			await test.run();	
			++passed;
			console.log('[ OK    ] ' + test.name);
		} catch (error) {
			console.log('[ FAIL  ] ' + test.name);
			//throw error;
		}
	}

	console.log('Finished, passed/total: ' + passed + '/' + total);
}

testMain();
