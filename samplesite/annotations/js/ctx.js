let ctx = {
	currentDocID : 0,
	currentPageSize : {width: 0, height: 0},
	currentAnnotations : [],
	controller :
	{
		onDocumentChanged : async ()=>{
			let doc = await ctx.editor.currentDocument();
			if ( doc !== undefined )
			{
				ctx.view.setCurrentDocumentTitle( await doc.title() );
				ctx.view.setCurrentDocumentFilePath( await doc.filePath());
				let docID = doc.id;
				ctx.currentDocID = docID;
				ctx.currentDoc = doc;
				let pageBoxes = await doc.pagesInfo();
				let dirtyText = '';
				try {
					 dirtyText += await doc.isDirty();
				} catch (err){
					console.error(err);
				}
				let clusterNodeIDText = '';
				try {
					 clusterNodeIDText += JSON.stringify(await doc.getClusterNodeID());
				} catch (err){
					console.error(err);
				}
				let pageSizeText = '';
				for (let i =0;i<pageBoxes.length; ++ i)
				{
					let w = pageBoxes[i].width;
					let h = pageBoxes[i].height;
					pageSizeText = '' + w + ' x ' + h;
					ctx.currentPageSize = {width : w , height : h};
					break;
				}
				ctx.view.setPageSizeText(pageSizeText);
				ctx.view.setIsDirtyText(dirtyText);
				ctx.view.setClusterNodeIDText(clusterNodeIDText);
			} else {
				ctx.view.setCurrentDocumentTitle('NO DOCUMENT OPENED');
				ctx.view.setCurrentDocumentFilePath('');
				ctx.view.setPageSizeText('');
				ctx.view.setIsDirtyText('');
				ctx.currentDoc = undefined;
			}
		} // on document changed

		, onAnnotationCreated : (annotation) => {
			ctx.currentAnnotations.push(annotation);
			ctx.currentDoc.setAnnotations(ctx.currentAnnotations);
			ctx.view.addAnnotation(annotation);
		} // onCreateAnnotationRequest
	}
};

export {ctx};

