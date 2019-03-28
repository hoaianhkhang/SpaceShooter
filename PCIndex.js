const electron = require('electron');
const ipc = electron.ipcMain;

const fileSystem = require('fs');

const channels = require('./Constants');

function DBMessage(sender, locator)
{

	this.sender = sender;
	this.locator = locator;

	this.Process = this.Process.bind(this);

}

DBMessage.prototype.Process = function(error, data)
{

	var args = {};

	if(error)
	{

		args.error = error;

		electronWindow.webContent.sendSync(channels.DBReceiveChannel, args);

		throw error;

	}

	args.locator = this.locator;
	args.json = JSON.parse(data);

	this.sender.send(channels.DBReceiveChannel, args);

}

function ImageMessage(sender, locator)
{

	this.sender = sender;
	this.locator = locator;

}

ImageMessage.prototype.Process = function(source)
{

	args = {};

	args.locator = this.locator;
	args.json = {};
	args.json.src = source;

	this.sender.send(channels.DBReceiveChannel, args);

}

function Startup()
{

	electronWindow = new electron.BrowserWindow({width: 1600, height: 600});
	electronWindow.loadFile('index.html');

	electronWindow.webContents.openDevTools();

	electronWindow.on('closed', function()
	{

		electronWindow = null;

	});

	ipc.on(channels.DBSendChannel, function(event, args)
	{

		var message = new DBMessage(event.sender, args);

		fileSystem.readFile("DB/" + args + ".json", message.Process);

	});

	ipc.on(channels.ImageSendChannel, function(event, args))
	{

		var message = new ImageMessage(event.sender, args);
		message.Process("DB/Images/" + args);

	});

}

electron.app.on('ready', Startup);
