const CONST_STAGE_MODE_SCROLL = 0;
const CONST_STAGE_MODE_FREE = 1;

const CONST_STAGE_VICTORY_FLAGPOLE = new FlagPole();

const CONST_STAGE_VICTORY_REACH = CONST_STAGE_VICTORY_FLAGPOLE.RegisterFlag();
const CONST_STAGE_VICTORY_DEFEAT = CONST_STAGE_VICTORY_FLAGPOLE.RegisterFlag();
const CONST_STAGE_VICTORY_SURVIVE = CONST_STAGE_VICTORY_FLAGPOLE.RegisterFlag();

const CONST_STAGE_VICTORY_PROCESS_KEY = "Process";
const CONST_STAGE_VICTORY_CHECK_KEY = "Check";
const CONST_STAGE_VICTORY_UPDATE_KEY = "Update";

function Stage(parent)
{

	Resource.call(this);

	this.bounds = new Box();
	this.player_area = new Box();
	this.in_bounds = new Box();

	this.parent = parent;

	this.camera = new Camera2D();
	this.startTime = 0;

	this.spawners = [];

	this.victory_conditions = 0;
	this.victory_data = {};

}

Stage.prototype = Object.create(Resource.prototype);
Stage.prototype.constructor = Stage;

Stage.ProcessReach = function(data)
{

	var returnData = {};

	returnData.position = new Vector2(data.x, data.y);

	return returnData;

}

Stage.ProcessDefeat = function(data)
{

	var returnData = {};

	returnData.count = data.count;
	returnData.tally = 0;

	return returnData;

}

Stage.ProcessSurvive = function(data)
{

	var returnData = {};

	returnData.duration = data.duration;

	return returnData;

}

CONST_STAGE_VICTORY_FLAGPOLE.RegisterFunction(CONST_STAGE_VICTORY_PROCESS_KEY, CONST_STAGE_VICTORY_REACH, Stage.ProcessReach);
CONST_STAGE_VICTORY_FLAGPOLE.RegisterFunction(CONST_STAGE_VICTORY_PROCESS_KEY, CONST_STAGE_VICTORY_DEFEAT, Stage.ProcessDefeat);
CONST_STAGE_VICTORY_FLAGPOLE.RegisterFunction(CONST_STAGE_VICTORY_PROCESS_KEY, CONST_STAGE_VICTORY_SURVIVE, Stage.ProcessSurvive);

Stage.prototype.Populate = function(json, proceed)
{

	this.bounds = new Box(json.bounds.x, json.bounds.y, json.bounds.width, json.bounds.height);
	this.player_area = new Box(json.player_area.x, json.player_area.y, json.player_area.width, json.player_area.height);
	this.in_bounds = new Box(json.in_bounds.x, json.in_bounds.y, json.in_bounds.width, json.in_bounds.height);

	this.ProcessMode(json.mode);

	for(var i = 0; i < json.spawners.length; i++)
	{

		this.spawners[i] = new Spawner(this, json.spawners[i].x, json.spawners[i].y, json.spawners[i].spawns, json.spawners[i].data);

	}

	for(var i = 0; i < json.victory_data.length; i++)
	{

		this.victory_conditions = CONST_STAGE_VICTORY_FLAGPOLE.Combine(this.victory_conditions, json.victory_data[i].condition);

		this.victory_data[json.victory_data[i].condition] = CONST_STAGE_VICTORY_FLAGPOLE.KeyFlagFunction(CONST_STAGE_VICTORY_PROCESS_KEY, json.victory_data[i].condition)( json.victory_data[i]);

	}

	this.debug = json.debug;

	this.camera = new Camera2D(this.bounds, this.player_area);

    	this.FinishPopulation(proceed);

}

Stage.prototype.ProcessMode = function(json)
{

	this.mode = json.mode;
		
	if(this.mode == CONST_STAGE_MODE_SCROLL)
	{

		this.scroll = {};
		this.scroll.x = Helpers.CreateParametrization(json.scroll.x);
		this.scroll.y = Helpers.CreateParametrization(json.scroll.y);

	}

}

Stage.prototype.Start = function()
{

	this.startTime = Timer.RunningMilliseconds();

}

Stage.prototype.Move = function(delta)
{

	var t = Timer.RunningMilliseconds() - this.startTime;
	var movement = new Vector2();

	if(this.mode == CONST_STAGE_MODE_SCROLL)
	{

		movement = new Vector2(this.scroll.x(t) * delta, this.scroll.y(t) * delta);

		var oldCamera = new Vector2(this.camera.X(), this.camera.Y());
		this.camera.Move(movement);

		movement = new Vector2(this.camera.X() - oldCamera.X(), this.camera.Y() - oldCamera.Y());

	}

	return movement;

}

Stage.prototype.Update = function(character, delta)
{

	if(this.mode == CONST_STAGE_MODE_FREE)
	{

		this.camera.Center(character);

	}
	
	this.in_bounds.Position(new Vector2(this.player_area.X() - (this.in_bounds.Width() - this.player_area.Width()) / 2, this.player_area.Y() - (this.in_bounds.Height() - this.player_area.Height()) / 2));

	this.TrapCharacter(character);

	for(var i = 0; i < this.spawners.length; i++)
	{

		this.spawners[i].Spawn(delta);

	}

	var index = 0;
	var message = Messenger.ReadMessage(CONST_MESSAGE_TYPE_KILLED, false, index);
	while(!message.IsEmpty())
	{

		//Check killed object is enemy killed by player
		CONST_STAGE_VICTORY_FLAGPOLE.KeyFlagFunction(CONST_STAGE_VICTORY_UPDATE_KEY, CONST_STAGE_VICTORY_DEFEAT)(this);

		index += 1;
		message = Messenger.ReadMessage(CONST_MESSAGE_TYPE_KILLED, false, index);

	}

	if(CONST_STAGE_VICTORY_FLAGPOLE.CanSlide(CONST_STAGE_VICTORY_CHECK_KEY, this.victory_conditions, this))
	{

		//Win

	}

}

Stage.CheckReach = function(stage)
{

	return stage.player_area.ContainsPoint(stage.victory_data[CONST_STAGE_VICTORY_REACH].position);

}

Stage.CheckDefeat = function(stage)
{

	return stage.victory_data[CONST_STAGE_VICTORY_DEFEAT].tally >= stage.victory_data[CONST_STAGE_VICTORY_DEFEAT].count;

}

Stage.CheckSurvive = function(stage)
{

	return (Timer.RunningMilliseconds() - stage.startTime) >= stage.victory_data[CONST_STAGE_VICTORY_SURVIVE].duration;

}

CONST_STAGE_VICTORY_FLAGPOLE.RegisterFunction(CONST_STAGE_VICTORY_CHECK_KEY, CONST_STAGE_VICTORY_REACH, Stage.CheckReach);
CONST_STAGE_VICTORY_FLAGPOLE.RegisterFunction(CONST_STAGE_VICTORY_CHECK_KEY, CONST_STAGE_VICTORY_DEFEAT, Stage.CheckDefeat);
CONST_STAGE_VICTORY_FLAGPOLE.RegisterFunction(CONST_STAGE_VICTORY_CHECK_KEY, CONST_STAGE_VICTORY_SURVIVE, Stage.CheckSurvive);

Stage.UpdateReach = function(stage)
{
}

Stage.UpdateDefeat = function(stage)
{

	stage.victory_data[CONST_STAGE_VICTORY_DEFEAT].tally += 1;

}

Stage.UpdateSurvive = function(stage)
{
}

CONST_STAGE_VICTORY_FLAGPOLE.RegisterFunction(CONST_STAGE_VICTORY_UPDATE_KEY, CONST_STAGE_VICTORY_REACH, Stage.UpdateReach);
CONST_STAGE_VICTORY_FLAGPOLE.RegisterFunction(CONST_STAGE_VICTORY_UPDATE_KEY, CONST_STAGE_VICTORY_DEFEAT, Stage.UpdateDefeat);
CONST_STAGE_VICTORY_FLAGPOLE.RegisterFunction(CONST_STAGE_VICTORY_UPDATE_KEY, CONST_STAGE_VICTORY_SURVIVE, Stage.UpdateSurvive);

Stage.prototype.TrapCharacter = function(character)
{

	var move = new Vector2();

	var xMove = this.player_area.X() - character.MinX();
	if(xMove > 0)
	{

		move.X(xMove);

	}

	var yMove = this.player_area.Y() - character.MinY();
	if(yMove > 0)
	{

		move.Y(yMove);

	}

	xMove = this.player_area.X() + this.player_area.Width() - character.MaxX();
	if(xMove < 0)
	{

		move.X(xMove);

	}

	yMove = this.player_area.Y() + this.player_area.Height() - character.MaxY();
	if(yMove < 0)
	{

		move.Y(yMove);

	}

	character.WorldMove(move);

}

Stage.prototype.Bounds = function()
{

	return this.bounds;

}

Stage.prototype.InBounds = function()
{

	return this.in_bounds;

}

Stage.prototype.PlayerArea = function()
{

	return this.player_area;

}

Stage.prototype.World = function()
{

	return this.camera.Position();

}

Stage.prototype.DebugRender = function(context)
{

	if(this.debug)
	{

		if(this.debug.hasOwnProperty("bounds"))
		{

			this.bounds.Render(context, this.debug.bounds.fill_color, this.debug.bounds.line_width, this.debug.bounds.line_color);

		}

		if(this.debug.hasOwnProperty("in_bounds"))
		{

			this.in_bounds.Render(context, this.debug.in_bounds.fill_color, this.debug.in_bounds.line_width, this.debug.in_bounds.line_color);

		}

		if(this.debug.hasOwnProperty("player_area"))
		{

			this.player_area.Render(context,this.debug.player_area.fill_color, this.debug.player_area.line_width, this.debug.player_area.line_color);

		}

	}

}
