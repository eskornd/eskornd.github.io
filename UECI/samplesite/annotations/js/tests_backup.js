
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
		await doc.setClusterNodeID({cluster:'CLUSTER_ID', nodeID : 'NODE_ID'});
	} catch (error) {
		ASSERT(()=>{TRUE(false);}, 'setClusterNodeID failed: ' + error);
	}	
});

// TODO: Enable once setNodeID is fully implemented (document becomes dirty)
tester.addTest('Document.setClusterNodeID_Dirty', async ()=>{
	
	const nodeID = 'ANY NODEID';
	let isDirty = false;
	try{
		
		let doc = await editor.currentDocument();	
		await doc.setClusterNodeID({cluster:'CLUSTER_ID', nodeID : 'NODE_ID'});
		
		isDirty = await doc.isDirty();
	} catch (error) {
	}	
	ASSERT(()=>{TRUE( isDirty);}, 'Document should be dirty after setClusterNodeID');
});

// TODO: Enable once getNodeID is implemented
tester.addTest('Document.getClusterNodeID', async ()=>{
	let clusterNodeIDIn = {cluster : 'CLUSTER_001', nodeID: 'NODE_002'};
	let clusterNodeIDOut = {cluster : '', nodeID: ''};
	try{
		
		let doc = await editor.currentDocument();	
		
		await doc.setClusterNodeID(clusterNodeIDIn);
		clusterNodeIDOut  = await doc.getClusterNodeID();
			
	} catch (error) {
		ASSERT(()=>{TRUE(false);}, 'setAnnotations failed: ' + error);
	}	

	ASSERT(()=>{TRUE( clusterNodeIDIn.cluster == clusterNodeIDOut.cluster && clusterNodeIDIn.nodeID == clusterNodeIDOut.nodeID );}, 'cluster Node ID set/get matches');
});

tester.addTest('Annotation.title', async ()=>{
	const idIn = "ID_001";
	const titleIn = "TITLE_002";
	const rect = { x: 0, y: 0, width: 100, height: 100 };
	const rgb = { r: 255, g: 0, b: 0 };
	const annotsIn = [{ id: idIn, title: titleIn, boundingBox: rect, highlightColor: rgb }];
	let annotsOut = [];
	try{
		let doc = await editor.currentDocument();	

		await doc.setAnnotations(annotsIn);
		annotsOut = await doc.getAnnotations();
	} catch (error) {
	}	
	ASSERT(()=>{TRUE( annotsIn.length == annotsOut.length );}, 'nums of annotations matches');
	
	ASSERT(()=>{TRUE( annotsOut[0].id == idIn );}, 'id matches');
	ASSERT(()=>{TRUE( annotsOut[0].title = titleIn );}, 'title matches');
});

