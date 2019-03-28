function Character(owner)
{

	GameEntity.call(this, owner);

	this.hSpeed = 0;
	this.vSpeed = 0;

	this.velocity = new Vector2();

}

Character.prototype = Object.create(GameEntity.prototype);
Character.prototype.constructor = Character;

Character.prototype.Populate = function(json, proceed)
{

	GameEntity.prototype.Populate.call(this, json.entity);

	this.hSpeed = json.hSpeed;
	this.vSpeed = json.vSpeed;
	this.forward = json.forward;

	this.FinishPopulation(proceed);

}

Character.prototype.Update = function(delta)
{

	this.Unblock();

	for(var i = 0; i < this.actions.length; i++)
	{

		if(Input.DigitalDown(i))
		{

			this.actions[i].Fire();

		}


		if(this.actions[i].Blocking())
		{

			this.Block();

		}

	}

	GameEntity.prototype.Update.call(this, delta);

	this.velocity = Input.DirectionalInput(0);

	this.velocity.X(this.velocity.X() * this.hSpeed * delta);
	this.velocity.Y(this.velocity.Y() * this.vSpeed * delta);

	this.Move(this.velocity);

}

Character.prototype.Velocity = function()
{

	return this.velocity;

}
