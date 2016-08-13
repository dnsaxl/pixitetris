APP = function()
{    
	PIXI.Container.call( this );
	document.body.addEventListener("keydown", onKeyDown);
}

APP.prototype = Object.create(PIXI.Container.prototype);
APP.prototype.constructor = APP;
APP.prototype.build = build;
APP.prototype.menu = new Menu();
APP.prototype.game = null;
APP.prototype.onResize = onResize;

function build()
{
	var s = {label:"start", callback : onMenuStart};
	var c = {label:"credits", callback : onMenuCredits};
	

	this.menu.addElements(s, c);
	this.menu.selectDown();
	this.addChild(this.menu);
	positionMenu();
}
/**  ---------------- KEYBOARD EVENTS ------------------*/
function onKeyDown(e)
{
	switch(e.keyCode)
	{
		case 37:
			onLeftArrow();
			break;
		case 38:
			onUpArrow();
			break;
		case 39:
			onRightArrow();
			break;
		case 40:
			onDownArrow();
			break;
		case 13:
			onEnterKey();
			break;
	}
}

function onLeftArrow()
{

}

function onUpArrow()
{
	if(app.menu && app.menu.parent)
		app.menu.selectUp();
}

function onRightArrow()
{

}

function onDownArrow()
{
	if(app.menu && app.menu.parent)
		app.menu.selectDown();
}

function onEnterKey()
{
	if(app.menu && app.menu.parent)
		app.menu.confirmSelection();
}


/**  ---------------- KEYBOARD EVENTS ------------------*/

function onMenuStart()
{
	if(app.menu.parent)
	{
		app.menu.parent.removeChild(app.menu);
		if(!app.game)
			app.game = new Game(); // lazy instantiation for faster initial load
		if(!app.game.parent)
			app.addChild(app.game);
	}
}

function onMenuCredits()
{
	if(app.menu.parent)
		app.menu.parent.removeChild(app.menu);
}

function onResize()
{
	positionMenu();
}


function positionMenu()
{
	app.menu.x = w / 2;
	app.menu.y = (h - app.menu.height) / 2;
}