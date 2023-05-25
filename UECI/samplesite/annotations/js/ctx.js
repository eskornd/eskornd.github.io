function getPageBox(pageBoxes, boxName)
{
	let rect = undefined;
	for (const i in pageBoxes)
	{
		if (pageBoxes[i].type == boxName)
		{
			rect = pageBoxes[i].rect;
			break;
		}
	}
	return rect;
}

let ctx = {
	currentDocID : 0,
	currentPageRect : {x: 0, y: 0, width: 0, height: 0},
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
				let pagesInfo = await doc.pagesInfo();
				let w = pagesInfo[0].width;
				let h = pagesInfo[0].height;
				let pageSizeText = '' + w + ' x ' + h;
				ctx.currentPageRect = getPageBox(pagesInfo[0].pageBoxes, "MediaBox");
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
			let pagesInfo = await doc.pagesInfo();
			let w = pagesInfo[0].width;
			let h = pagesInfo[0].height;
			let pageSizeText = '' + w + ' x ' + h;
			ctx.currentPageRect = getPageBox(pagesInfo[0].pageBoxes, "MediaBox");
			ctx.view.setPageSizeText(pageSizeText);
		} // on document page boxes changed

		, onDocumentPageNumberChanged : async () => {
			let doc = await ctx.editor.currentDocument();
			let pageNumber = await doc.pageNumber();
			ctx.view.setPageNumberText(pageNumber + 1);
		} // on document page number changed

		, onAnnotationCreated2 : async (annotation, params) => {
			let pageNumber = params.pageNumber;
			let annotations = await ctx.currentDoc.getAnnotations();
			let count = annotations.length;
			annotation.id = "id" + count;
			annotation.title = count + " (Page " + (pageNumber + 1) + ")";
			annotations.push(annotation);
			ctx.currentDoc.setAnnotations(annotations);
			let annotationLocal = {
				rect: {
					x0: annotation.rect.x0 - ctx.currentPageRect.x,
					x1: annotation.rect.x1 - ctx.currentPageRect.x,
					y0: annotation.rect.y0 - ctx.currentPageRect.y,
					y1: annotation.rect.y1 - ctx.currentPageRect.y,
				}
			};
			ctx.view.addAnnotation(annotationLocal);
		} // on annotation created
	}
};

export {ctx};

