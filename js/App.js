APP = function()
{    
	PIXI.Container.call( this );
	document.body.addEventListener("keydown", onKeyDown);
}

APP.prototype = Object.create(PIXI.Container.prototype);
APP.prototype.constructor = APP;
APP.prototype.build = build;
APP.prototype.menu = new Menu();
APP.prototype.game = null; // lazy instantiation
APP.prototype.onResize = onResize;
APP.prototype.atlas = null;
APP.prototype.texture = function(n) { return this.atlas ? this.atlas[n] : null };
function build()
{
	loadAssets();
}


function loadAssets()
{
	var loader = PIXI.loader;
	loader.add(atlasURL);
	loader.load(onAssetsLoaded);
}

function onAssetsLoaded()
{
	app.atlas = PIXI.loader.resources[atlasURL].textures;
	buildMenu();
}

function buildMenu()
{
	var s = {label:"start", callback : onMenuStart};
	var c = {label:"credits", callback : onMenuCredits};
	

	app.menu.addElements(s, c);
	app.menu.selectDown();
	app.addChild(app.menu);
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
	if(app.game && app.game.parent)
		app.game.moveLeftCurrentBlock();
}

function onUpArrow()
{
	if(app.menu && app.menu.parent)
		app.menu.selectUp();
	else if(app.game && app.game.parent)
		app.game.rotateCurrentBlock();
}

function onRightArrow()
{
	if(app.game && app.game.parent)
		app.game.moveRightCurrentBlock();
}

function onDownArrow()
{
	if(app.menu && app.menu.parent)
		app.menu.selectDown();
	else if(app.game && app.game.parent)
		app.game.moveDownCurrentBlock();
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
		positionGame();
		if(!app.game.parent)
			app.addChild(app.game);
		app.game.start();
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
	positionGame();
}


function positionMenu()
{
	if(!app.menu) return
	app.menu.x = w / 2;
	app.menu.y = (h - app.menu.height) / 2;
}

function positionGame()
{
	if(!app.game) return
	resolveSize(app.game, renderer);
	app.game.x = (w - app.game.width) / 2;
	app.game.y = (h - app.game.height) / 2;
}

function resolveSize(movable, static)
{
	var r = (movable.width / movable.height) ;
	if(r > (static.width / static.height))
	{
		
		movable.width = static.width;
		movable.height = movable.width / r;
	}
	else
	{
		
		movable.height = static.height;
		movable.width = movable.height * r;
	}
}