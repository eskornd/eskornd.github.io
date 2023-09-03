export function downloadAs(arr, fileName)
{
	let blob = new Blob([arr]);
	let a = document.createElement('a');
	a.download = fileName;
	a.href = window.URL.createObjectURL(blob);
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
