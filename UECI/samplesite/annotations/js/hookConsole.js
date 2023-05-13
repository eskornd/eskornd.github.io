//# sourceURL=hookConsole.js

const showDebugMessage = false;
if (typeof console  != "undefined") 
{
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};

    if (typeof console.error != 'undefined')
        console.oerror = console.error;
    else
        console.oerror = function() {};

    if (typeof console.warn != 'undefined')
        console.owarn = console.warn;
    else
        console.owarn = function() {};

	if (showDebugMessage)
	{
		if (typeof console.debug != 'undefined')
			console.odebug = console.debug;
		else
			console.odebug = function() {};
	}
}

console.log = function(message) {
    console.olog(message);
	let output = document.getElementById('output');
    output.innerHTML += message + '<br/>';
};
console.error = function(message) {
    console.oerror(message);
	let output = document.getElementById('output');
    output.innerHTML += message + '<br/>';
};
console.warn = function(message) {
    console.owarn(message);
	let output = document.getElementById('output');
    output.innerHTML += message + '<br/>';
};
if (showDebugMessage)
{
	console.debug = function(message) {
		console.odebug(message);
		let output = document.getElementById('output');
		output.innerHTML += message + '<br/>';
	};
}


