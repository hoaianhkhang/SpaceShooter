const PLAYER_ID = "Player";

function Shooter()
{

 	State.call(this);

}

Shooter.prototype = Object.create(State.prototype);
Shooter.prototype.constructor = Shooter;

Shooter.prototype.Initialize = function(json)
{

	this.canvas = document.getElementById(CONST_CANVAS_ID);
	this.container = document.getElementById(CONST_CONTAINER_ID);
	this.context = this.canvas.getContext('2d');

	Timer.Reset();

 	Hooks.HookInput();

	this.loadOrder = {};
 	this.objects = {};
	this.patterns = {};

	this.actor_master = {};
	this.pattern_master = {};

	this.image_master = {};
	this.sheet_master = {};

}

Shooter.prototype.Load = function(json)
{

	this.stage = new Stage(this);
	this.stage.Load(json.stage_id);

	json.stage_id = Helpers.TrimLocator(json.stage_id);

	this.loadOrder[json.stage_id] = this.stage;

	this.player = new Character(this);
	this.player.Load(json.player_id);

	this.loadOrder[PLAYER_ID] = this.player;
	this.objects[PLAYER_ID] = this.player;

	this.patterns = {};

	this.LoadMaster("pattern_master", json.patterns, function(i, shooter){ return Pattern.PatternFactory(shooter, json.patterns[i]); });
	this.LoadMaster("actor_master", json.actors, function(i, shooter){ return new Actor(shooter); });
	this.LoadMaster("image_master", json.images, function(i, shooter){ return new ImageResource(); });
	this.LoadMaster("sheet_master", json.sheets, function(i, shooter){ return new Spritesheet(); });

	Prepped();
	GameLoaded();

}

Shooter.prototype.LoadMaster = function(master_name, json, factoryFunction)
{

	for(var i = 0; i < json.length; i++)
	{

		var locator = json[i];
		json[i] = Helpers.TrimLocator(locator);

		this[master_name][json[i]] = factoryFunction(i, this);
		this[master_name][json[i]].Load(locator);

		this.loadOrder[json[i]] = this[master_name][json[i]];

	}

}

Shooter.prototype.Start = function()
{

	this.player.LinkActions(PLAYER_ID);

	this.stage.Start();

    this.player.Hook();

    for(actor in this.actor_master)
    {

        this.actor_master[actor].Hook();

    }

    for(pattern in this.pattern_master)
    {

        this.pattern_master[pattern].Hook();

    }

    this.canvas.width = this.stage.PlayerArea().Width();
    this.canvas.height = this.stage.PlayerArea().Height();

}

Shooter.prototype.Stage = function()
{

	return this.stage;

}

Shooter.prototype.Update = function(delta)
{

	var worldMovement = this.stage.Move(delta);

    this.UpdateObjects(worldMovement, delta);

    this.UpdatePatterns(worldMovement, delta);

    //Read Spawn Messages
	message = Messenger.ReadMessage(CONST_MESSAGE_TYPE_SPAWN, true, 0);
    while(!message.IsEmpty())
    {

        var actor = this.actor_master[message.Actor()].Clone(message.Position());

    	var id = Helpers.GenerateID(message.Actor());

    	this.objects[id] = actor;
        this.objects[id].LinkActions(id);

        message = Messenger.ReadMessage(CONST_MESSAGE_TYPE_SPAWN, true, 0);

    }

	//Read Pattern Messages
	var message = Messenger.ReadMessage(CONST_MESSAGE_TYPE_PATTERN, true, 0);
	while(!message.IsEmpty())
	{

		var pattern = this.pattern_master[message.Pattern()].Clone(this, message.Pattern(), message.Parent(), message.Flag(), message.Offset());

		var id = Helpers.GenerateID(message.Pattern());

		this.patterns[id] = pattern;

		message = Messenger.ReadMessage(CONST_MESSAGE_TYPE_PATTERN, true, 0);

	}

        this.stage.Update(this.player, delta);

	//Read Killed Messages
	var message = Messenger.ReadMessage(CONST_MESSAGE_TYPE_KILLED, true, 0);
	while(!message.IsEmpty())
	{

		//Process killed objects

		message = Messenger.ReadMessage(CONST_MESSAGE_TYPE_KILLED, true, 0);

	}

}

Shooter.prototype.UpdateObjects = function(movement, delta)
{

    for(obj in this.objects)
	{

		this.objects[obj].WorldMove(movement);
		this.objects[obj].Update(delta);

	}

    for(obj in this.objects)
    {

        for(target in this.objects)
        {

        	if(this.objects[obj].Hit(this.objects[target]))
        	{

            	this.objects[target].Hurt(this.objects[obj]);

        	}

    	}

    	if(this.objects[obj].ShouldRemove())
        {

        	delete this.objects[obj];

        	Logger.LogInfo("Deleted Object " + obj);

    	}

    }

}

Shooter.prototype.UpdatePatterns = function(movement, delta)
{

	for(pattern in this.patterns)
	{

		this.patterns[pattern].WorldMove(movement);
		this.patterns[pattern].Update(delta);

        for(target in this.objects)
    	{

			if(this.patterns[pattern].Hit(this.objects[target]))
            {

                this.objects[target].Hurt(this.patterns[pattern]);

            }

    	}

        if(this.patterns[pattern].ShouldRemove())
        {

            delete this.patterns[pattern];

            Logger.LogInfo("Deleted Pattern " + pattern);

    	}

	}

}

Shooter.prototype.Render = function(delta)
{

	this.context.save();
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

	var world = this.stage.World();
	this.context.translate(-world.X(), -world.Y());

	this.stage.DebugRender(this.context);

	for(var obj in this.objects)
	{

		this.objects[obj].DebugRender(this.context);

	}

	for(var pattern in this.patterns)
	{

        	this.patterns[pattern].DebugRender(this.context);

	}

	this.context.restore();

}

Shooter.prototype.Pause = function()
{

	Timer.Pause();

}

Shooter.prototype.Unpause = function()
{

	Timer.Unpause();

}

Shooter.prototype.UnpauseCondition = function()
{

}

Shooter.prototype.GetObjectById = function(id)
{

	return this.objects[id];

}

Shooter.prototype.GetSheetById = function(id)
{

    if(!(id in this.sheet_master))
    {

        Logger.LogError("Attempting to hook missing spritesheet " + id);

        return null;

    }

    return this.sheet_master[id];

}

Shooter.prototype.GetImageResourceById = function(id)
{

    if(!(id in this.image_master))
    {

        Logger.LogError("Attempting to hook missing image " + id);

        return null;

    }

    return this.image_master[id];

}

Shooter.prototype.Resize = function(width, height)
{

        var playArea = this.stage.PlayerArea();

        var newWidth;
        var newHeight;

        if(playArea.Height() / playArea.Width() > height / width)
        {

                newHeight = height;
                newWidth = height * playArea.Width() / playArea.Height();

        }
        else
        {

                newWidth = width;
                newHeight = width * playArea.Height() / playArea.Width();

        }

        this.container.style.width = newWidth + "px";
        this.container.style.height = newHeight + "px";
        this.container.style.padding = (height - newHeight) / 2 + "px " + (width - newWidth) / 2+ "px";

}
