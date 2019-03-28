CONST_SPAWN_ACTIVATION_FLAGPOLE = new FlagPole();

const CONST_SPAWN_ACTIVATION_RULE_EMPTY = 0; //Only used to initialize the value
const CONST_SPAWN_ACTIVATION_RULE_INBOUNDS = CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFlag();
const CONST_SPAWN_ACTIVATION_RULE_TIMER = CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFlag();
const CONST_SPAWN_ACTIVATION_RULE_LIMITED = CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFlag();

const CONST_SPAWN_ACTIVATION_PROCESS_KEY = "Process";
const CONST_SPAWN_ACTIVATION_HANDLE_KEY = "Handle";
const CONST_SPAWN_ACTIVATION_UPDATE_KEY = "Update";

function Spawner(stage, x, y, spawns, data)
{

	this.stage = stage;

	this.position = new Vector2(x, y);

	this.spawns = spawns;
	this.currentSpawn = 0;

	this.rules = CONST_SPAWN_ACTIVATION_RULE_EMPTY; //Computed when data is processed
	this.ProcessRuleData(data);

}

Spawner.ProcessInBounds = function(data)
{

	var returnData = {};

	returnData.position = new Vector2(data.x, data.y);

	return returnData;

}

Spawner.ProcessTimer = function(data)
{

	var returnData = {};

	returnData.interval = data.interval;
	returnData.last_spawn = Timer.RunningMilliseconds();

	return returnData;

}

Spawner.ProcessLimited = function(data)
{

	var returnData = {};

	returnData.count = data.count;

	return returnData;

}

CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFunction(CONST_SPAWN_ACTIVATION_PROCESS_KEY, CONST_SPAWN_ACTIVATION_RULE_INBOUNDS, Spawner.ProcessInBounds);
CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFunction(CONST_SPAWN_ACTIVATION_PROCESS_KEY, CONST_SPAWN_ACTIVATION_RULE_TIMER, Spawner.ProcessTimer);
CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFunction(CONST_SPAWN_ACTIVATION_PROCESS_KEY, CONST_SPAWN_ACTIVATION_RULE_LIMITED, Spawner.ProcessLimited);

Spawner.prototype.ProcessRuleData = function(ruleData)
{

	this.ruleData = {};

	for(var i = 0 ; i < ruleData.length; i++)
	{

		this.rules = CONST_SPAWN_ACTIVATION_FLAGPOLE.Combine(this.rules, ruleData[i].rule);

		this.ruleData[ruleData[i].rule] = CONST_SPAWN_ACTIVATION_FLAGPOLE.KeyFlagFunction(CONST_SPAWN_ACTIVATION_PROCESS_KEY, ruleData[i].rule)(ruleData[i]);

	}

}

Spawner.HandleInBounds = function(spawner)
{

	return spawner.stage.InBounds().ContainsPoint(spawner.ruleData[CONST_SPAWN_ACTIVATION_RULE_INBOUNDS].position);

}

Spawner.HandleTimer = function(spawner)
{

	return (Timer.RunningMilliseconds() - spawner.ruleData[CONST_SPAWN_ACTIVATION_RULE_TIMER].last_spawn) >= spawner.ruleData[CONST_SPAWN_ACTIVATION_RULE_TIMER].interval;

}

Spawner.HandleLimited = function(spawner)
{

	return spawner.ruleData[CONST_SPAWN_ACTIVATION_RULE_LIMITED].count > 0;

}

CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFunction(CONST_SPAWN_ACTIVATION_HANDLE_KEY, CONST_SPAWN_ACTIVATION_RULE_INBOUNDS, Spawner.HandleInBounds);
CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFunction(CONST_SPAWN_ACTIVATION_HANDLE_KEY, CONST_SPAWN_ACTIVATION_RULE_TIMER, Spawner.HandleTimer);
CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFunction(CONST_SPAWN_ACTIVATION_HANDLE_KEY, CONST_SPAWN_ACTIVATION_RULE_LIMITED, Spawner.HandleLimited);

Spawner.UpdateInBounds = function(spawner)
{
}

Spawner.UpdateTimer = function(spawner)
{

	spawner.ruleData[CONST_SPAWN_ACTIVATION_RULE_TIMER].last_spawn = Timer.RunningMilliseconds();

}

Spawner.UpdateLimited = function(spawner)
{

	spawner.ruleData[CONST_SPAWN_ACTIVATION_RULE_LIMITED].count -= 1;

}

CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFunction(CONST_SPAWN_ACTIVATION_UPDATE_KEY, CONST_SPAWN_ACTIVATION_RULE_INBOUNDS, Spawner.UpdateInBounds);
CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFunction(CONST_SPAWN_ACTIVATION_UPDATE_KEY, CONST_SPAWN_ACTIVATION_RULE_TIMER, Spawner.UpdateTimer);
CONST_SPAWN_ACTIVATION_FLAGPOLE.RegisterFunction(CONST_SPAWN_ACTIVATION_UPDATE_KEY, CONST_SPAWN_ACTIVATION_RULE_LIMITED, Spawner.UpdateLimited);

Spawner.prototype.Spawn = function(delta)
{

	if(!CONST_SPAWN_ACTIVATION_FLAGPOLE.CanSlide(CONST_SPAWN_ACTIVATION_HANDLE_KEY, this.rules, this))
	{

		return;

	}

	Logger.LogInfo("Spawned new " + this.spawns[this.currentSpawn]);

	Messenger.PostMessage(new SpawnMessage(this.spawns[this.currentSpawn], this.position));

	this.currentSpawn = (this.currentSpawn + 1) % this.spawns.length;

	CONST_SPAWN_ACTIVATION_FLAGPOLE.Slide(CONST_SPAWN_ACTIVATION_UPDATE_KEY, this.rules, this);

}
