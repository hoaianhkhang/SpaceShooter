const CONST_AI_ACTION_PREFIX = "Action-";

function AI()
{

        this.startTime = Timer.RunningMilliseconds();

        this.movement_x = Helpers.ConstantFunction(0);
        this.movement_y = Helpers.ConstantFunction(0);


}

AI.prototype.Build = function(json)
{

        this.movement_x = Helpers.CreateParametrization(json.movement_x);
        this.movement_y = Helpers.CreateParametrization(json.movement_y);

}

AI.prototype.Run = function(delta)
{

        var commands = [];
        commands[0] = new Vector2();

        var t = Timer.RunningMilliseconds() - this.startTime;

        commands[0].X(this.movement_x(t) * delta);
        commands[0].Y(this.movement_y(t) * delta);

        return commands;

}

AI.prototype.Clone = function()
{

        var clone = new AI();

        clone.startTime = Timer.RunningMilliseconds();

        clone.movement_x = this.movement_x;
        clone.movement_y = this.movement_y;

        return clone;

}
