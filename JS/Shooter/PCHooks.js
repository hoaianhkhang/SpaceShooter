function Hooks()
{

}

Hooks.HookInput = function()
{

	Hooks.HookPCInput();

}

Hooks.HookGPInput = function(index)
{


	Input.RegisterInput(new GPInput(index));

}

Hooks.HookPCInput = function()
{

  var input = new MKInput();
  input.SetDirection(87, 83, 65, 68);
  input.SetDigital(75);

  Input.RegisterInput(input);

}

window.addEventListener("gamepadconnected", function(e)
{

	Hooks.HookGPInput(e.gamepad.index);

});

window.addEventListener("gamepaddisconnected", function(e)
{

	Hooks.HookPCInput();

});
