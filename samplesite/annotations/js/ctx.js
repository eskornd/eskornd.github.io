let ctx = {
	currentDocID : 0,
	currentPageSize : {width: 0, height: 0},
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
			} else {
				ctx.view.setCurrentDocumentTitle('NO DOCUMENT OPENED');
				ctx.view.setCurrentDocumentFilePath('');
				ctx.view.setPageSizeText('');
				ctx.view.setIsDirtyText('');
				ctx.currentDoc = undefined;
			}
		} // on document changed

		, onAnnotationCreated : (annotation) => {
			ctx.currentDoc.setAnnotations([annotation]);
			ctx.view.addAnnotation(annotation);
		} // onCreateAnnotationRequest
	}
};

export {ctx};

