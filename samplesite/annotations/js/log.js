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

export {log};
