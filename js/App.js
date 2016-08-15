//---------------------- CONSTRUCTOR SECTION --------------------- */
APP = function()
{    
	PIXI.Container.call( this );
	document.body.addEventListener("keydown", onKeyDown);
}

APP.prototype = Object.create(PIXI.Container.prototype);
APP.prototype.constructor = APP;
APP.prototype.build = build;
APP.prototype.onResize = onResize;

APP.prototype.menu = new Menu();
APP.prototype.game = null; 
APP.prototype.gameOverMenu = null;
APP.prototype.pauseMenu = null;
APP.prototype.credits = null;

APP.prototype.atlas = null;
APP.prototype.texture = function(n) { return this.atlas ? this.atlas[n] : null };

//---------------------- CONSTRUCTOR SECTION --------------------- */
//---------------------- BUILD SECTION --------------------- */

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
	positionMenu(app.menu);
	animatedAdd(app.menu);
}

function buildGameOverMenu()
{
	var g = {label:"GAME OVER", style : {font:"50px Arial", fill:"red", align:"center"}};
	var p = {label:"play again", callback : onPlayAgain};
	var e = {label:"exit", callback : onExitGame};

	app.gameOverMenu = new Menu();
	app.gameOverMenu.addElement(g,false);
	app.gameOverMenu.addElements(p,e);
	app.gameOverMenu.selectDown();
	positionMenu(app.gameOverMenu);
}

function buildPauseMenu()
{
	var r = {label:"resume",  callback : onResume};
	var p = {label:"play again", callback : onPlayAgain};
	var e = {label:"exit", callback : onExitGame};

	app.pauseMenu = new Menu();
	app.pauseMenu.addElements(r,p,e);
	app.pauseMenu.selectDown();
	positionMenu(app.pauseMenu);
}

function buildCredits()
{
	var p = {label:desc, style : {font:"14px Arial", fill:"white", align:"center"}};
	var e = {label:"exit", callback : onExitCredits};

	app.credits = new Menu();
	app.credits.addElement(p,false);
	app.credits.addElement(e);
	app.credits.selectDown();
	positionMenu(app.credits);
}

//---------------------- BUILD SECTION --------------------- */
//  ---------------- KEYBOARD EVENTS ------------------*/

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
		case 27:
			onEscapeKey();
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
	else if(app.gameOverMenu && app.gameOverMenu.parent)
		app.gameOverMenu.selectUp();
	else if(app.pauseMenu && app.pauseMenu.parent)
		app.pauseMenu.selectUp();
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
	else if(app.gameOverMenu && app.gameOverMenu.parent)
		app.gameOverMenu.selectDown();
	else if(app.pauseMenu && app.pauseMenu.parent)
		app.pauseMenu.selectDown();
	else if(app.game && app.game.parent)
		app.game.moveDownCurrentBlock(true);
}

function onEnterKey()
{
	if(app.menu && app.menu.parent)
		app.menu.confirmSelection();
	else if(app.gameOverMenu && app.gameOverMenu.parent)
		app.gameOverMenu.confirmSelection();
	else if(app.pauseMenu && app.pauseMenu.parent)
		app.pauseMenu.confirmSelection();
	else if(app.credits && app.credits.parent)
		app.credits.confirmSelection();
}

function onEscapeKey()
{
	if(app.game && !app.game.isPaused)
		onPause();
}

//  ---------------- KEYBOARD EVENTS ------------------*/
//------------------- MECHANIC END POINTS ------------------ */
function onMenuStart()
{
	if(app.menu.parent)
	{
		animatedRemove(app.menu)
		if(!app.game)
		{
			app.game = new Game(); // lazy instantiation for faster initial load
			app.game.onGameOver = onGameOver;
		}
		positionGame();
		if(!app.game.parent)
			animatedAdd(app.game)
		app.game.start();
	}
}

function onMenuCredits()
{
	animatedRemove(app.menu);
	if(!app.credits)
		buildCredits();
	animatedAdd(app.credits);
}

function onExitCredits()
{
	animatedRemove(app.credits);
	animatedAdd(app.menu);
}

function onGameOver()
{
	if(!app.gameOverMenu)
		buildGameOverMenu();
	animatedAdd(app.gameOverMenu);
}

function onPlayAgain()
{
	animatedRemove(app.gameOverMenu);
	animatedRemove(app.pauseMenu);
	animatedAdd(app.game);
	app.game.restart();
}

function onExitGame()
{
	animatedRemove(app.pauseMenu);
	animatedRemove(app.gameOverMenu);
	animatedRemove(app.game);
	animatedAdd(app.menu);
}

function onPause()
{
	app.game.pause();
	animatedRemove(app.game);
	if(!app.pauseMenu)
		buildPauseMenu();
	animatedAdd(app.pauseMenu);
}

function onResume()
{
	animatedRemove(app.pauseMenu);
	animatedAdd(app.game);
	app.game.resume();
}
//------------------- MECHANIC END POINTS ------------------ */
//------------------- RESPONSIVENESS ------------------ */

function onResize()
{
	positionMenu(app.menu);
	positionMenu(app.gameOverMenu);
	positionMenu(app.credits);
	positionGame();
}

function positionMenu(v)
{
	if(!v) return
	v.x = w / 2;
	v.y = (h - v.height) / 2;
}

function positionGame()
{
	if(!app.game) return;
	resolveSize(app.game, renderer);
	app.game.x = (w - app.game.width) / 2;
	app.game.y = (h - app.game.height) / 2;
}

//------------------- RESPONSIVENESS ------------------ */
//----------------------- HELPERS ------------------------ //

function animatedRemove(t)
{
	if(!t || !t.parent) return;
	function remove()
	{
		if(t.parent)
			t.parent.removeChild(t);
	}
	TweenLite.to(t, 0.4, {y:h, onComplete : remove});
}

function animatedAdd(t)
{
	t.y = -t.height;
	app.addChild(t);
	TweenLite.to(t, 0.4, {y:(h - t.height) / 2});
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
var desc = "\n16h PIXI JS Tetris Game assesment\n\n" +
"Denis Aleksandrowicz 2016\n\n" +
"This is my very first JS app/game over 200 lines.\n" +
"Lack of optimisation (no object pooling, no batching), poor events distribution,\n" +
"no preview due to time limit.\n\n"+
"RIGHT ARROW - move block right\n" +
"LEFT ARROW - move block left\n" +
"UP ARROW - rotate block or select menu option\n" +
"DOWN ARROW - speed up block on it's way down or select menu option\n" +
"ENTER - confirm menu selection\n" +
"ESC - pause game\n";
//----------------------- HELPERS ------------------------ //