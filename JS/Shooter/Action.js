function Action()
{

	Resource.call(this);

	this.parentId = null;
	this.lastFired = Timer.RunningMilliseconds();
	this.rateOfFire = 0;
	this.duration = 0;
	this.block = false;
	this.patternIds = [];

	this.flag = 0;

}

Action.prototype = Object.create(Resource.prototype);
Action.prototype.constructor = Action;

Action.prototype.LinkParent = function(id, flag)
{

	this.parentId = id;

	this.flag = flag;

}

Action.prototype.Populate = function(json, proceed)
{

	this.SetRateOfFire(json.rof);
	this.duration = json.duration;
	this.block = json.block;
	this.patternIds = json.patternIds;

	this.FinishPopulation(proceed);

}

Action.prototype.SetRateOfFire = function(rof)
{

	this.rateOfFire = rof;
	this.lastFired = Timer.RunningMilliseconds() - rof;

}

Action.prototype.Ready = function()
{

	return (Timer.RunningMilliseconds() - this.lastFired) >= this.rateOfFire;

}

Action.prototype.Blocking = function()
{

	return this.block && ((Timer.RunningMilliseconds() - this.lastFired) < this.duration);

}

Action.prototype.Fire = function()
{

	if(this.Ready())
	{

		for(var i = 0; i < this.patternIds.length; i++)
		{

			Messenger.PostMessage(new PatternMessage(this.parentId, this.patternIds[i], this.flag));

		}

		this.lastFired = Timer.RunningMilliseconds();

	}

}

Action.prototype.Clone = function()
{

	var clone = new Action();

	clone.lastFired = Timer.RunningMilliseconds() - this.duration;
	clone.rateOfFire = this.rateOfFire;
	clone.duration = this.duration;
	clone.block = this.block;
	clone.patternIds = this.patternIds.slice(0);

	return clone;

}
