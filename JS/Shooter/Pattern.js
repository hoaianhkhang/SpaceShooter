const CONST_MESSAGE_TYPE_PATTERN = "Pattern";

const CONST_PATTERN_TYPE_DELIMITER = "-";

const CONST_REMOVAL_RULE_FUNCTION_KEY = "Removal";
const CONST_REMOVAL_RULE_FLAGPOLE = new FlagPole();


const CONST_REMOVAL_RULE_OUTOFBOUNDS = CONST_REMOVAL_RULE_FLAGPOLE.RegisterFlag();
const CONST_REMOVAL_RULE_TIME = CONST_REMOVAL_RULE_FLAGPOLE.RegisterFlag();

//Pattern object, array of numbers
function OutOfBoundsRule(pattern, parameters)
{

	for(var i = 0; i < pattern.shapes.length; i++)
	{

		if(pattern.owner.Stage().InBounds().Intersects(pattern.shapes[i]))
		{

			return false;
		}

	}

	return false;

}

function TimeRule(pattern, parameters)
{

	return false;

}

CONST_REMOVAL_RULE_FLAGPOLE.RegisterFunction(CONST_REMOVAL_RULE_FUNCTION_KEY, CONST_REMOVAL_RULE_OUTOFBOUNDS, OutOfBoundsRule);
CONST_REMOVAL_RULE_FLAGPOLE.RegisterFunction(CONST_REMOVAL_RULE_FUNCTION_KEY, CONST_REMOVAL_RULE_TIME, TimeRule);

function Pattern(owner, parentId)
{

	GameObject.call(this);

	this.owner = owner;
	this.parentId = parentId;

	this.rule = -1;
	this.removal_parameters = {};

}

Pattern.PatternFactory = function(owner, id)
{

	var name = id.split(CONST_PATTERN_TYPE_DELIMITER)[0] + "Pattern";

	return new Pattern[name](owner, "");

}

Pattern.prototype = Object.create(GameObject.prototype);
Pattern.prototype.constructor = Pattern;

Pattern.prototype.Populate = function(json, proceed)
{

	GameObject.prototype.Populate.call(this, json.object, true);

	this.rule = json.rule;

	for(var i = 0; i < CONST_REMOVAL_RULE_FLAGPOLE.NumFlags(); i++)
	{

		var flag = CONST_REMOVAL_RULE_FLAGPOLE.FlagByIndex(i);
		if(CONST_REMOVAL_RULE_FLAGPOLE.CheckFlag(this.rule, flag))
		{

			this.removal_parameters[flag] = [];

		}

	}

	this.FinishPopulation(proceed);

}

Pattern.prototype.Update = function(delta)
{

	GameObject.prototype.Update.call(this, delta);

}

Pattern.prototype.RemovalRule = function()
{

	return this.rule;

}

Pattern.prototype.ShouldRemove = function()
{

	if(GameObject.prototype.ShouldRemove.call(this))
	{

		return true;

	}

	var removal = this.RemovalRule();

	for(var i = 0; i < CONST_REMOVAL_RULE_FLAGPOLE.NumFlags(); i++)
	{

		var rule = CONST_REMOVAL_RULE_FLAGPOLE.FlagByIndex(i);
		if(CONST_REMOVAL_RULE_FLAGPOLE.CheckFlag(removal, rule) && CONST_REMOVAL_RULE_FLAGPOLE.KeyFlagFunction(CONST_REMOVAL_RULE_FUNCTION_KEY, rule)(this, this.removal_parameters[rule]))
		{

			return true;

		}

	}

	return false;

}

Pattern.prototype.Clone = function(owner, id, parentId, flag, offset)
{

	var clone = Pattern.PatternFactory(owner, id);

	var start = this.owner.GetObjectById(parentId).Position();

	if(offset !== undefined)
	{

		start = Vector2.Sum(start, offset);

	}

	GameObject.prototype.Copy.call(this, clone, start);

	clone.owner = owner;
	clone.parentId = parentId;

	clone.flag = flag;

	return clone;

}

Pattern.BulletPattern = function(owner, parentId)
{

	Pattern.call(this, owner, parentId);

	this.startTime = Timer.RunningMilliseconds();

	this.xParametrization = Helpers.ConstantFunction(0);
	this.yParametrization = Helpers.ConstantFunction(0);

	this.angleParametrization = Helpers.ConstantFunction(0);

	this.start = new Vector2();
	this.angle = 0;

}

Pattern.BulletPattern.prototype = Object.create(Pattern.prototype);
Pattern.BulletPattern.prototype.constructor = Pattern.BulletPattern;

Pattern.BulletPattern.prototype.Populate = function(json, proceed)
{

	Pattern.prototype.Populate.call(this, json.pattern, true);

	this.xParametrization = Helpers.CreateParametrization(json.xParam);
	this.yParametrization = Helpers.CreateParametrization(json.yParam);

	this.angleParametrization = Helpers.CreateParametrization(json.angleParam);
	this.angle = this.angleParametrization(0);

	this.FinishPopulation(proceed);

}

Pattern.BulletPattern.prototype.Update = function(delta, currentTime)
{

	Pattern.prototype.Update.call(this, delta);

	var t = Timer.RunningMilliseconds() - this.startTime;
	var deltaX = this.xParametrization(t);
	var deltaY = this.yParametrization(t);

	this.Move(new Vector2(deltaX * delta, deltaY * delta));

	var oldAngle = this.angle;
	this.angle = this.angleParametrization(0);

	if(this.angle != oldAngle)
	{

		this.Direction(new Vector2(1, 0).Rotate(this.angle));

	}

}

Pattern.BulletPattern.prototype.Clone = function(owner, id, parentId, flag, start)
{

	var clone = Pattern.prototype.Clone.call(this, owner, id, parentId, CONST_TYPE_FLAGPOLE.Combine(flag, CONST_BULLET_FLAG), start);

	clone.start = new Vector2(this.X(), this.Y());
	clone.startTime = Timer.RunningMilliseconds();

	clone.xParametrization = this.xParametrization;
	clone.yParametrization = this.yParametrization;
	clone.angleParametrization = this.angleParametrization;

	clone.angle = clone.angleParametrization(0);

	return clone;

}

function PatternMessage(parentId, patternId, flag, offset)
{

	Message.call(this, CONST_MESSAGE_TYPE_PATTERN);

	this.parentId = parentId;
	this.patternId = patternId;

	this.flag = flag;

	this.offset = (offset ? offset : new Vector2());

}

PatternMessage.prototype = Object.create(Message.prototype);
PatternMessage.prototype.constructor = PatternMessage;

PatternMessage.prototype.Parent = function()
{

	return this.parentId;

}

PatternMessage.prototype.Pattern = function()
{

	return this.patternId;

}

PatternMessage.prototype.Flag = function()
{

	return this.flag;

}

PatternMessage.prototype.Offset = function()
{

	return this.offset;

}
