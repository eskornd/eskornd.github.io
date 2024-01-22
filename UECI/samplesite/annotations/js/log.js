class Logger
{
	constructor()
	{}
	log() {
		console.log();
	}
}

var logger = new Logger;

function log(text)
{
	console.log(text);
}

function logErr(err)
{
	console.error(err);
}

export {log, logErr};
