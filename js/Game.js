//---------------------- CONSTRUCTOR SECTION --------------------- */
Game = function()
{    
	PIXI.Container.call(this);
	this.points = 0;
	this.buildGrid(this.numRows,this.numColumns);
	this.buildTop();
	this.buildPoints();
}

Game.prototype = Object.create(PIXI.Container.prototype);
Game.prototype.constructor = Game;
Game.prototype.isStarted = false;
Game.prototype.isPaused = false;
Game.prototype.numColumns = 10;
Game.prototype.numRows = 20;
Game.prototype.bgGrid = null;
Game.prototype.grid = null;
Game.prototype.currentBlock = null;
Game.prototype.numBlocks = 0;
Game.prototype.points = 0;
Game.prototype.speedPoints = 0;
Game.prototype.pointsForLine = 10;
Game.prototype.tickInterval = 500;
Game.prototype.intervalId = 0;

//---------------------- CONSTRUCTOR SECTION --------------------- */
//---------------------- BUILD SECTION --------------------- */

Game.prototype.buildGrid = function(r,c)
{
	var texture = app.texture('background.png');
	celwid = texture.crop.width;	
	gridwid = celwid * c;
	gridhei = celwid * r;

	this.bgGrid = new PIXI.extras.TilingSprite(texture, gridwid,gridhei);
	this.bgGrid.y = celwid *2;
	this.addChild(this.bgGrid);

	this.grid = [];
	for(var i = r; i--> 0;)
	{
		var row = [];	
		for(var j = c; j--> 0;)
			row.push(null);
		this.grid.push(row);
	}
}

Game.prototype.buildTop = function()
{
	var topbar= new PIXI.Graphics();
	topbar.beginFill(0,0);
	topbar.drawRect(0, 0, gridwid, celwid *2);
	this.addChild(topbar);
}

Game.prototype.buildPoints = function()
{
	var stylePoints =  {font:"16px Arial", fill:"white", align:"left"};
	var styleSpeedPoints = {font:"16px Arial", fill:"white", align:"right"};

	this.tfPoints = new PIXI.Text("", stylePoints);
	this.tfSpeedPoints = new PIXI.Text("",styleSpeedPoints);
	this.tfSpeedPoints.anchor.x = 1;
	this.tfSpeedPoints.x = this.bgGrid.width;

	this.addChild(this.tfPoints);
	this.addChild(this.tfSpeedPoints);
	this.updatePoints();
}

//---------------------- BUILD SECTION --------------------- */
//------------------- MECHANIC END POINTS ------------------ */

Game.prototype.start = function()
{
	if(this.isStarted)
	{
		this.restart();
		return;
	}
	this.isStarted = true;
	this.newBlock();
	this.updatePoints();
	this.updateSpeedPoints();
	this.intervalId = setInterval(this.tick,this.tickInterval);
}

Game.prototype.restart = function()
{
	this.points = this.speedPoints = this.numBlocks = 0;
	this.bgGrid.removeChildren();
	g = this.grid;
	for(var r = this.numRows; r-->0;)
		for(var c = this.numColumns; c-->0;)
			g[r][c] = null;
	this.isStarted = this.isPaused = false;
	clearInterval(this.intervalId);
	this.start();
}

Game.prototype.pause = function()
{
	this.isPaused = true;
	clearInterval(this.intervalId);
}

Game.prototype.resume = function()
{
	this.isPaused = false;
	this.intervalId = setInterval(this.tick,this.tickInterval);
}

Game.prototype.gameOverSequence = function()
{
	this.currentBlock = null;
	clearInterval(this.intervalId);
	if(this.onGameOver != null)
		this.onGameOver();
}
Game.prototype.tick = function()
{
	app.game.moveDownCurrentBlock(false);
}

//------------------- MECHANIC END POINTS ------------------ */
//------------------- BLOCKS MANIPULATION ------------------ */

Game.prototype.newBlock = function()
{
	this.currentBlock = null;
	this.currentBlock = new Block();
	this.currentBlock.moveHor(4); // initial pos;
	this.currentBlock.moveVer(-1); // initial pos;
	this.speedPoints = 0;
	this.updateSpeedPoints();
	this.bgGrid.addChild(this.currentBlock);

	var canPlace = this.validateNewBlockPosition();
	if(!canPlace)
		this.gameOverSequence();
}

Game.prototype.rotateCurrentBlock = function()
{
	if(!this.currentBlock) return;
	var canMove = this.validateNewBlockPosition(null,this.currentBlock.nextMatrix());
	if(canMove) this.currentBlock.rotate();
}

Game.prototype.moveLeftCurrentBlock = function()
{
	if(!this.currentBlock) return;
	var canMove = this.validateNewBlockPosition({x:-1});
	if(canMove) this.currentBlock.moveHor(-1);
}

Game.prototype.moveRightCurrentBlock = function()
{
	if(!this.currentBlock) return;
	var canMove = this.validateNewBlockPosition({x:1});
	if(canMove) this.currentBlock.moveHor(1);
}

Game.prototype.moveDownCurrentBlock = function(key)
{
	if(!this.currentBlock) return;
	var canMove = this.validateNewBlockPosition({y:1});
	if(canMove) 
	{
		if(key)
		{
			this.speedPoints += 1;
			this.updateSpeedPoints();
		}
		
		this.currentBlock.moveVer(1);
	}
	else
	{
		var success = this.cementCurrentBlock();
		if(success)
			this.lookForCompletedLines();
		else
			this.gameOverSequence();
	}
}

Game.prototype.validateNewBlockPosition = function(offset,matrix)
{
	block = this.currentBlock;
	if(!block) return false;
	bx = block.offset.x + (offset && offset.x ? offset.x : 0);
	by = block.offset.y + (offset && offset.y ? offset.y : 0);
	matrix = matrix || block.matrix;
	var h = matrix.length, mh = this.numColumns-1, mv = this.numRows-1, w,r,dx,dy;
	var g = this.grid;
	for(var i = 0; i < h; i++)
	{
		r = matrix[i];
		w = r.length;
		dy = by + i;
		for(var j = 0; j < w; j++)
		{
			if(!r[j]) continue;
			dx = bx + j;
			if(dx < 0 || dx > mh || dy > mv || (dy > -1 && g[dy][dx]))
				return false;
		}
	}
	return true;
}

Game.prototype.cementCurrentBlock = function()
{
	var b = this.currentBlock, g = this.grid;
	var bx = b.offset.x, by = b.offset.y, m = b.matrix, cm = b.cellsMatrix;
	var h = m.length,w,r,cell;
	var success = true;
	for(var i = 0; i < h; i++)
	{
		r = m[i];
		w = r.length;
		dy = by + i;
		for(var j = 0; j < w; j++)
		{
			if(!r[j]) continue;
			cell = cm[i][j];
			dx = bx + j;
			if(dy < 0)
				success = false;
			else
				g[dy][dx] = cell;
			cell.x = celwid * dx;
			cell.y = celwid * dy;
			this.bgGrid.addChild(cm[i][j]);
		}
	}
	b.destroy();
	this.currentBlock = null;
	return success;
}

//------------------- BLOCKS MANIPULATION ------------------ */
//-------------------- LINES DROP LOGIC ------------------- */

Game.prototype.lookForCompletedLines = function()
{
	var g = this.grid, nr = this.numRows, nc = this.numColumns, line;
	var completedLines = [];
	for(var r = nr; r-->0;)
	{
		line = true;
		for(var c = nc; c-->0;)
		{
			if(!g[r][c])
			{
				line = false;
				break;
			}
		}
		if(line)
			completedLines.push(r);
	}

	if(completedLines.length > 0)
		this.processCompleteLines(completedLines,g);
	else
		this.newBlock();
}

Game.prototype.processCompleteLines = function(rts,g)
{
	var al = rts.length, nc = this.numColumns,cell,r;
	// remove cells view, clear grid matrix spots
	for(var i = al; i-->0;)
	{
		r = rts[i];
		this.points += this.pointsForLine;
		for(var c = nc; c-->0;)
		{
			cell = g[r][c];
			if(cell.parent)
				cell.parent.removeChild(cell);
			g[r][c] = null;
		}
	}
	// count points for lines, trigger animations
	this.animateDropLines(rts,g);
	this.points += this.speedPoints;
	this.updatePoints();
}

Game.prototype.animateDropLines = function(rts,g)
{
	//shift arrays
	for(var i = rts.length; i -->0;)
		g.unshift(g.splice(rts[i],1).pop());

	// match to arrays
	var max = Math.max.apply(null,rts), nc = this.numColumns, v,cell;
	for(var r = 0; r <= max; r++)
	{
		v = r * celwid;
		for(var c = nc; c-->0;)
		{
			cell = g[r][c];
			if(!cell) continue;
			TweenLite.to(cell, 0.4,{y : v, onComplete : animComplete});
		}
	}
	// continue after animation
	var completed = false;
	function animComplete()
	{
		if(completed) return;
		completed = true;
		app.game.newBlock();
	}
}

//-------------------- LINES DROP LOGIC ------------------- */
//-------------------- POINTS UPDATE------------------- */

Game.prototype.updatePoints = function()
{
	this.tfPoints.text = "Points: " + String(this.points);
}

Game.prototype.updateSpeedPoints = function()
{
	this.tfSpeedPoints.alpha = this.speedPoints > 0 ? 1 : 0;
	this.tfSpeedPoints.text = String(this.speedPoints);
}
//-------------------- POINTS UPDATE------------------- */