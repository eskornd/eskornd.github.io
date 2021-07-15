class Logger
{
	constructor()
	{}
	log() {
		console.log();
	}
	assert(arg0, arg1)
	{
		console.assert(arg0, arg1);
	}
}

var logger = new Logger;

function log(text)
{
	console.log(text);
}

export {log};
