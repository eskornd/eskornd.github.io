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
				let w = pageBoxes[0].width;
				let h = pageBoxes[0].height;
				let pageSizeText = '' + w + ' x ' + h;
				ctx.currentPageSize = {width : w , height : h};
				let pageNumber = await doc.pageNumber();
				ctx.view.setPageNumberText(pageNumber + 1);
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

		, onDocumentPageBoxesChanged : async () => {
			let doc = await ctx.editor.currentDocument();
			let pageBoxes = await doc.pagesInfo();
			let w = pageBoxes[0].width;
			let h = pageBoxes[0].height;
			let pageSizeText = '' + w + ' x ' + h;
			ctx.currentPageSize = {width : w , height : h};
			ctx.view.setPageSizeText(pageSizeText);
		} // on document page boxes changed

		, onDocumentPageNumberChanged : async () => {
			let doc = await ctx.editor.currentDocument();
			let pageNumber = await doc.pageNumber();
			ctx.view.setPageNumberText(pageNumber + 1);
		} // on document page number changed

		, onAnnotationCreated2 : (annotation, params) => {
			let pageNumber = params.pageNumber;
			let count = ctx.currentAnnotations.length;
			annotation.id = "id" + count;
			annotation.title = count + " (Page " + (pageNumber + 1) + ")";
			ctx.currentAnnotations.push(annotation);
			ctx.currentDoc.setAnnotations(ctx.currentAnnotations);
			ctx.view.addAnnotation(annotation);
		} // on annotation created
	}
};

export {ctx};

