const CONST_MESSAGE_TYPE_SPAWN = "Spawn";

function Actor(owner)
{

	GameEntity.call(this, owner);

    this.velocity = new Vector2();

    this.ai = new AI();

}

Actor.prototype = Object.create(GameEntity.prototype);
Actor.prototype.constructor = Actor;

Actor.prototype.Populate = function(json, proceed)
{

	GameEntity.prototype.Populate.call(this, json.entity);

    this.ai.Build(json.ai);

	this.FinishPopulation(proceed);

}

Actor.prototype.Update = function(delta)
{

	this.Unblock();

    var commands = this.ai.Run(delta);

	for(var i = 0; i < this.actions.length; i++)
	{

        if(commands.indexOf(CONST_AI_ACTION_PREFIX + i))
        {

        	this.actions[i].Fire();

    	}

		if(this.actions[i].Blocking())
		{

			this.Block();

		}

	}

	GameEntity.prototype.Update.call(this, delta);

    this.velocity = commands[0];
    this.Move(this.velocity);

}

Actor.prototype.Clone = function(position)
{

    var clone = new Actor(this.owner);
    GameEntity.prototype.Copy.call(this, clone, position);

    clone.ai = this.ai.Clone();

    return clone;

}

function SpawnMessage(actorId, position)
{

    Message.call(this, CONST_MESSAGE_TYPE_SPAWN);

	this.actorId = actorId;

	this.position = (position ? position : new Vector2());

}

SpawnMessage.prototype = Object.create(Message.prototype);
SpawnMessage.prototype.constructor = SpawnMessage;

SpawnMessage.prototype.Actor = function()
{

	return this.actorId;

}

SpawnMessage.prototype.Position = function()
{

	return this.position;

}
