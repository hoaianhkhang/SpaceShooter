const CONST_TYPE_FLAGPOLE = new FlagPole();

const CONST_EMPTY_FLAG = 0;
const CONST_PLAYER_FLAG = CONST_TYPE_FLAGPOLE.RegisterFlag();
const CONST_ENEMY_FLAG = CONST_TYPE_FLAGPOLE.RegisterFlag();
const CONST_BULLET_FLAG = CONST_TYPE_FLAGPOLE.RegisterFlag();

const CONST_MESSAGE_TYPE_KILLED = "Killed";

function GameObject(owner)
{

	Resource.call(this);

	this.position = new Vector2();
	this.shapes = [];

	this.canMove = true;

	this.direction = new Vector2(1, 0);

	this.owner = owner;

	this.max_health = 0;
	this.health = 0;
	this.damage = 0;

	this.delay = 0;
	this.last_hit = 0;

	this.flag = CONST_EMPTY_FLAG;

	this.spritesheet = "";
	this.image = "";

}

GameObject.prototype = Object.create(Resource.prototype);
GameObject.prototype.constructor = GameObject;

GameObject.prototype.X = function()
{

	return this.position.X();

}

GameObject.prototype.Y = function()
{

	return this.position.Y();

}

GameObject.prototype.Position = function()
{

	return this.position;

}

GameObject.prototype.MinX = function()
{

	var minX = this.position.X();

	for(var i = 0; i < this.shapes.length; i++)
	{

		var min = this.shapes[i].MinX();

		if(min < minX)
		{

			minX = min;

		}

	}

	return minX;

}

GameObject.prototype.MaxX = function()
{

	var maxX = this.position.X();

	for(var i = 0; i < this.shapes.length; i++)
	{

		var max = this.shapes[i].MaxX();

		if(max > maxX)
		{

			maxX = max;

		}

	}

	return maxX;


}

GameObject.prototype.MinY = function()
{

	var minY = this.position.Y();

	for(var i = 0; i < this.shapes.length; i++)
	{

		var min = this.shapes[i].MinY();

		if(min < minY)
		{

			minY = min;

		}

	}

	return minY;

}

GameObject.prototype.MaxY = function()
{

	var maxY = this.position.Y();

	for(var i = 0; i < this.shapes.length; i++)
	{

		var max = this.shapes[i].MaxY();

		if(max > maxY)
		{

			maxY = max;

		}

	}

	return maxY;


}

GameObject.prototype.Populate = function(json, proceed)
{

	this.position = new Vector2(json.position.x, json.position.y);

	for(var i = 0; i < json.shapes.length; i++)
	{

		this.shapes[i] = Shape.ShapeFactory(json.shapes[i]);
		this.shapes[i].Shift(this.Position());

	}

	this.direction = new Vector2(json.direction.x, json.direction.y);

	this.max_health = json.health;
	this.health = this.max_health;
	this.damage = json.damage;

	this.delay = json.delay;
	this.last_hit = Timer.RunningMilliseconds() - this.delay;

	this.debug = {};
	if(json.hasOwnProperty('debug'))
	{

		this.debug.fill_color = json.debug.fill_color;
		this.debug.line_width = json.debug.line_width;
		this.debug.line_color = json.debug.line_color;

	}

	this.flag = json.flag;

	this.spritesheet = json.spritesheet;
	this.image = json.image;

	this.FinishPopulation(proceed);

}

GameObject.prototype.Hook = function()
{

	this.spritesheet = new SheetReference(this.owner.GetSheetById(this.spritesheet));
	this.image = this.owner.GetImageResourceById(this.image);
}

GameObject.prototype.Move = function(v)
{

	if(this.canMove)
	{

		this.WorldMove(v);

	}

}

GameObject.prototype.WorldMove = function(v)
{

	this.position = Vector2.Sum(this.Position(), v);

	for(var i = 0; i < this.shapes.length; i++)
	{

		this.shapes[i].Shift(this.Position());

	}

}

GameObject.prototype.Direction = function(dir)
{

	if(dir === undefined)
	{

		return this.direction;

	}

	this.direction = dir;

}

GameObject.prototype.Block = function()
{

	this.canMove = false;

}

GameObject.prototype.Unblock = function()
{

	this.canMove = true;

}

GameObject.prototype.ShouldHit = function(flag)
{

	return CONST_TYPE_FLAGPOLE.TestFlag(this.Flag(), flag, CONST_EMPTY_FLAG);

}

GameObject.prototype.Hit = function(obj)
{

	if(this.ShouldHit(obj.Flag()))
	{

		if(this.Intersects(obj))
		{

			this.Hurt(obj);

			return true;

		}

	}

	return false;

}

GameObject.prototype.Intersects = function(obj)
{

	for(var i = 0; i < this.shapes.length; i++)
	{

		for(var j = 0; j < obj.shapes.length; j++)
		{

			var intersect = this.shapes[i].Intersects(obj.shapes[j]);
			if(intersect)
			{

				return true;

			}

		}

	}

	return false;

}

GameObject.prototype.Hurt = function(obj)
{

	if(this.health > 0 && (Timer.RunningMilliseconds() - this.last_hit > this.delay))
	{

		this.health = Math.max(this.health - obj.damage, 0);
		this.last_hit = Timer.RunningMilliseconds();

		if(this.health == 0)
		{

			this.Killed();

		}

	}

}

GameObject.prototype.Killed = function()
{
}

GameObject.prototype.Update = function(delta)
{

}

GameObject.prototype.DebugRender = function(context)
{

	context.beginPath();

	context.arc(this.X(), this.Y(), 5, 0, 2 * Math.PI, false);
	context.fillStyle = "#FFFFFF";

	context.fill();

	for(var i = 0; i < this.shapes.length; i++)
	{

		this.shapes[i].Render(context, this.debug.fill_color, this.debug.line_width, this.debug.line_color);

	}

}

GameObject.prototype.ShouldRemove = function()
{

	return (this.health == 0);

}

GameObject.prototype.Flag = function()
{

	return this.flag;

}

GameObject.prototype.Copy = function(target, start)
{

	target.position = new Vector2(start.X(), start.Y());

	target.shapes = [];
	for(var i = 0; i < this.shapes.length; i++)
	{

		target.shapes[i] = this.shapes[i].Clone();

	}

	target.direction = new Vector2(this.Direction().X(), this.Direction().Y());

	target.max_health = this.max_health;
	target.health = this.health;
	target.damage = this.damage;

	target.delay = this.delay;
	target.Last_hit = Timer.RunningMilliseconds() - this.delay;

	target.flag = this.flag;

	target.debug = this.debug;

	target.spritesheet = this.spritesheet;
	target.Hook();

}

function GameEntity(owner)
{

	GameObject.call(this, owner);


	this.actions = [];

}

GameEntity.prototype = Object.create(GameObject.prototype);
GameEntity.prototype.constructor = GameEntity;

GameEntity.prototype.Populate = function(json, proceed)
{

	GameObject.prototype.Populate.call(this, json.object, true);

	for(var i = 0; i < json.actions.length; i++)
	{

		this.actions[i] = new Action();
		this.actions[i].Populate(json.actions[i], true);

	}

	this.FinishPopulation(proceed);

}

GameEntity.prototype.Update = function(delta)
{

	GameObject.prototype.Update.call(this, delta);

}

GameEntity.prototype.LinkActions = function(id)
{

	for(var i = 0; i < this.actions.length; i++)
	{

		this.actions[i].LinkParent(id, this.Flag());

	}

}

GameEntity.prototype.Copy = function(target, start)
{

	GameObject.prototype.Copy.call(this, target, start);

	target.actions = [];
	for(var i = 0; i < this.actions.length; i++)
	{

		target.actions[i] = this.actions[i].Clone();

	}

}

function KilledMessage()
{

	Message.call(this, CONST_MESSAGE_TYPE_KILLED);

}

KilledMessage.prototype = Object.create(Message.prototype);
KilledMessage.prototype.constructor = KilledMessage;
