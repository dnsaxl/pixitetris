//---------------------- CONSTRUCTOR SECTION --------------------- */
APP = function()
{    
	PIXI.Container.call( this );
	var self = this;
	document.body.addEventListener("keydown", onKeyDown);
	//---------------------- CONSTRUCTOR SECTION --------------------- */

	var eventsReceiver = null;
	//---------------------- BUILD SECTION --------------------- */

	this.build = function()
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
		self.atlas = PIXI.loader.resources[atlasURL].textures;
		Game.prototype.getTexture = self.getTexture;
		Block.prototype.getTexture = self.getTexture;
		buildMenu();
	}

	function buildGame()
	{
		self.game = new Game();
		self.game.onGameOver = self.onGameOver;
		self.game.onPause = self.onPause;
		self.game.build();
	}

	function buildMenu()
	{
		var s = {label:"start", callback : self.onMenuStart};
		var c = {label:"credits", callback : self.onMenuCredits};
		self.menu = new Menu();
		self.menu.addElements(s, c);
		self.menu.selectDown();
		centralizeMenu(self.menu);
		animatedAdd(self.menu);
	}

	function buildGameOverMenu()
	{
		var g = {label:"GAME OVER", style : {font:"50px Arial", fill:"red", align:"center"}};
		var p = {label:"play again", callback : self.onPlayAgain};
		var e = {label:"exit", callback : self.onExitGame};

		self.gameOverMenu = new Menu();
		self.gameOverMenu.addElement(g,true);
		self.gameOverMenu.addElements(p,e);
		self.gameOverMenu.selectDown();
		centralizeMenu(self.gameOverMenu);
	}

	function buildPauseMenu()
	{
		var r = {label:"resume",  callback : self.onResume};
		var p = {label:"play again", callback : self.onPlayAgain};
		var e = {label:"exit", callback : self.onExitGame};

		self.pauseMenu = new Menu();
		self.pauseMenu.addElements(r,p,e);
		self.pauseMenu.selectDown();
		centralizeMenu(self.pauseMenu);
	}

	function buildCredits()
	{
		var p = {label:desc, style : {font:"14px Arial", fill:"white", align:"center"}};
		var e = {label:"exit", callback : self.onExitCredits};

		self.credits = new Menu();
		self.credits.addElement(p,true);
		self.credits.addElement(e);
		self.credits.selectDown();
		centralizeMenu(self.credits);
	}

	//---------------------- BUILD SECTION --------------------- */
	//  ---------------- KEYBOARD EVENTS ------------------*/

	function onKeyDown(e)
	{
		if(eventsReceiver && eventsReceiver.hasOwnProperty("keyMap"))
		{
			var f = eventsReceiver.keyMap[String(e.keyCode)];
			if(f != null)
				f(e);
		}
	}

	//  ---------------- KEYBOARD EVENTS ------------------*/
	//------------------- MECHANIC END POINTS ------------------ */

	this.onMenuStart = function()
	{
		if(self.menu.parent)
		{
			animatedRemove(self.menu)
			if(!self.game)
				buildGame();
			centralizeGame();
			animatedAdd(self.game);
			self.game.start();
		}
	}

	this.onMenuCredits = function()
	{
		animatedRemove(self.menu);
		if(!self.credits)
			buildCredits();
		animatedAdd(self.credits);
		self.state = ""
	}

	this.onExitCredits = function()
	{
		animatedRemove(self.credits);
		animatedAdd(self.menu);
	}

	this.onGameOver = function()
	{
		if(!self.gameOverMenu)
			buildGameOverMenu();
		animatedAdd(self.gameOverMenu);
	}

	this.onPlayAgain = function()
	{
		animatedRemove(self.gameOverMenu);
		animatedRemove(self.pauseMenu);
		animatedAdd(self.game);
		self.game.restart();
	}

	this.onExitGame = function()
	{
		animatedRemove(self.pauseMenu);
		animatedRemove(self.gameOverMenu);
		animatedRemove(self.game);
		animatedAdd(self.menu);
	}

	this.onPause = function()
	{
		animatedRemove(self.game);
		if(!self.pauseMenu)
			buildPauseMenu();
		animatedAdd(self.pauseMenu);
	}

	this.onResume = function()
	{
		animatedRemove(self.pauseMenu);
		animatedAdd(self.game);
		self.game.resume();
	}

	//------------------- MECHANIC END POINTS ------------------ */
	//------------------- RESPONSIVENESS ------------------ */

	this.onResize = function()
	{
		centralizeMenu(self.menu);
		centralizeMenu(self.gameOverMenu);
		centralizeMenu(self.credits);
		centralizeGame();
	}

	function centralizeGame()
	{
		if(!self.game) return;
		resolveSize(self.game, renderer);
		self.game.x = (w - self.game.width) / 2;
		self.game.y = (h - self.game.height) / 2;
	}

	function centralizeMenu(v)
	{
		if(!v) return
		v.x = w / 2;
		v.y = (h - v.height) / 2;
	}
	//------------------- RESPONSIVENESS ------------------ */
	//------------------- OTHER ------------------ */
	this.getTexture = function(n) 
	{ 
		return self.atlas ? self.atlas[n] : null 
	}

	function animatedAdd(t,container,targetIsNotAnEventReceiver)
	{
		container = container || stage;
		t.y = -t.height;
		container.addChild(t);
		TweenLite.to(t, 0.4, {y:(h - t.height) / 2});
		if(!targetIsNotAnEventReceiver)
			eventsReceiver = t;
	}

	function animatedRemove(t)
	{
		if(!t || !t.parent) return;
		var remove = function()
		{
			if(t.parent)
				t.parent.removeChild(t);
		}
		TweenLite.to(t, 0.4, {y:h, onComplete : remove});
	}
}
APP.prototype = Object.create(PIXI.Container.prototype);

//----------------------- HELPERS ------------------------ //

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