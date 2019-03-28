function State()
{

	this.running = false;

	this.loadOrder = {};

}

State.prototype.Running = function(r)
{

	if(r === undefined)
	{

		return r;

	}

	this.running = (r ? true: false);

	return;

}

State.prototype.Loaded = function()
{

	for(var loaded in this.loadOrder)
	{

		if(!this.loadOrder[loaded].Loaded())
		{

			return false;

		}

	}

	this.loadOrder = {};

	this.Start();

	return true;

}

State.prototype.Initialize = function(json)
{

	Logger.LogError("Attempting to call virtual State::Initialize method.");

}

State.prototype.Load = function(json)
{

	Logger.LogError("Attempting to call virtual State::Load method.");

}

State.prototype.Start = function()
{

	Logger.LogError("Attempting to call virtual State::Start method.");

}

State.prototype.Update = function(delta)
{

	Logger.LogError("Attempting to call virtual State::Update method.");

}

State.prototype.Render = function(delta)
{

	Logger.LogError("Attempting to call virtual State::Render method.");

}

State.prototype.Pause = function()
{

	Logger.LogError("Attempting to call virtual State::Pause method.");

}

State.prototype.Unpause = function()
{

	Logger.LogError("Attempting to call virtual State::Unpause method.");

}

State.prototype.UnpauseCondition = function()
{

	Logger.LogError("Attempting to call virtual State::UnpauseCondition method.");

}

State.prototype.Resize = function(width, height)
{

	Logger.LogError("Attempting to call virtual State::Resize method.");

}
