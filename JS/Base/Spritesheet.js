const CONST_SPRITESHEET_EMPTY = -1;

function FrameData(x, y, w, h, duration)
{

	this.box = new Box(x, y, w, h);
	this.duration = duration;

}

FrameData.prototype.Duration = function()
{

	return this.duration;

}

FrameData.prototype.Box = function()
{

	return this.box;

}

function Spritesheet()
{

	Resource.call(this);

	this.frames = [];
	this.animations = [];

}

Spritesheet.prototype = Object.create(Resource.prototype);
Spritesheet.prototype.constructor = Spritesheet;

Spritesheet.prototype.Populate = function(json, proceed)
{

	for(var i = 0; i < json.frames.length; i++)
	{

		var box = json.frames[i].box;
		this.frames[i] = new FrameData(box.x, box.y, box.width, box.height, json.frames[i].duration);

	}

	this.animations = json.animations.slice(0);

	this.FinishPopulation(proceed);

}

Spritesheet.prototype.Play = function(animation, loop, start)
{

	if(animation >= 0 && animation <= this.animations.length)
	{

		var frame = 0;
		var time = Timer.RunningMilliseconds() - start;

		while(frame < this.animations[animation].length && time >= this.frames[this.animations[animation][frame]].Duration())
		{

			time = time - this.frames[this.animations[animation][frame]].Duration();
			frame += 1;

		}

		return (frame >= this.animations[animation].length ? ((loop ? 0 : CONST_SPRITESHEET_EMPTY)) : frame);

	}

	Logger.LogError("Attempting to play invalid animation at index " + animation);

	return CONST_SPRITESHEET_EMPTY;

}

Spritesheet.prototype.Box = function(frame)
{

	if(frame >= 0 || frame < this.frames.length)
	{

		return this.frames[frame].Box();

	}

	Logger.LogError("Attempting to access frame at invalid index " + frame);

	return new Box();

}

function SheetReference(sheet)
{

	this.currentAnimation = CONST_SPRITESHEET_EMPTY;
	this.nextAnimation = CONST_SPRITESHEET_EMPTY;
	this.loop = false;
	this.startTime = 0;

	this.currentFrame = CONST_SPRITESHEET_EMPTY;

	this.sheet = sheet;

}

SheetReference.prototype.Promise = function(current, next, loop)
{

	this.currentAnimation = current;
	this.nextAnimation = next;
	this.loop = loop;

	this.Start();

}

SheetReference.prototype.Start = function()
{

	this.startTime = Timer.RunningMilliseconds();

	this.Lookup();

}

SheetReference.prototype.Lookup = function()
{

	this.currentFrame = this.sheet.Play(this.currentAnimation, (this.nextAnimation != CONST_SPRITESHEET_EMPTY ? false : this.loop), this.startTime);

}

SheetReference.prototype.Update = function(delta)
{

	if(this.currentAnimation != CONST_SPRITESHEET_EMPTY)
	{

		this.Lookup();

		if(this.currentFrame == CONST_SPRITESHEET_EMPTY)
		{

			if(this.nextAnimation != CONST_SPRITESHEET_EMPTY)
			{

				this.currentAnimation = this.nextAnimation;
				this.nextAnimation = CONST_SPRITESHEET_EMPTY;

				this.Start();

			}
			else
			{

				this.currentAnimation = CONST_SPRITESHEET_EMPTY;

			}

		}

	}

}
