//---------------------- CONSTRUCTOR SECTION --------------------- */
Game = function()
{    
	PIXI.Container.call(this);
	var self = this;

	var bgGrid = null;
	var topbar = null;
	var tfPoints = null;
	var tfSpeedPoints = null;
	var currentBlock = null;
	var nextBlock = null;
	
	var grid = null;
	var numBlocks = 0;
	var points = 0;
	var speedPoints = 0;
	var intervalId = 0;
	var stylePoints =  {font:"16px Arial", fill:"white", align:"left"};
	var styleSpeedPoints = {font:"16px Arial", fill:"white", align:"right"};

	
	//---------------------- BUILD SECTION --------------------- */
	this.build = function()
	{

		buildGrid(this.numRows,this.numColumns);
		buildTop();
		buildPoints();

	}

	function buildGrid(r,c)
	{
		var texture = self.getTexture('background.png');
		celwid = texture.crop.width;	
		gridwid = celwid * c;
		gridhei = celwid * r;

		bgGrid = new PIXI.extras.TilingSprite(texture, gridwid,gridhei);
		bgGrid.y = celwid *2;
		self.addChild(bgGrid);

		grid = [];
		for(var i = r; i--> 0;)
		{
			var row = [];	
			for(var j = c; j--> 0;)
				row.push(null);
			grid.push(row);
		}
	}

	function buildTop()
	{
		topbar = new PIXI.Graphics();
		topbar.beginFill(0,0);
		topbar.drawRect(0, 0, gridwid, celwid *2);

		var tfnext = new PIXI.Text("NEXT:", stylePoints);
		tfnext.x = bgGrid.width;
		topbar.addChild(tfnext);
		self.addChild(topbar);
	}

	function buildPoints()
	{
		

		tfPoints = new PIXI.Text("", stylePoints);
		tfSpeedPoints = new PIXI.Text("",styleSpeedPoints);
		tfSpeedPoints.anchor.x = 1;
		tfSpeedPoints.x = bgGrid.width;

		updatePoints();
		topbar.addChild(tfPoints);
		topbar.addChild(tfSpeedPoints);
	}

	//---------------------- BUILD SECTION --------------------- */
	//------------------- MECHANIC END POINTS ------------------ */

	this.start = function()
	{
		if(self.isStarted)
		{
			self.restart();
			return;
		}
		self.isStarted = true;
		newBlock();
		updatePoints();
		updateSpeedPoints();
		intervalId = setInterval(self.tick,self.tickInterval);
	}

	this.restart = function()
	{
		points = speedPoints = numBlocks = 0;
		bgGrid.removeChildren();
		g = grid;
		for(var r = self.numRows; r-->0;)
			for(var c = self.numColumns; c-->0;)
				g[r][c] = null;
		self.isStarted = self.isPaused = false;
		clearInterval(intervalId);
		self.start();
	}

	this.pause = function()
	{
		self.isPaused = true;
		clearInterval(intervalId);
		if(self.onPause != null)
			self.onPause();
	}

	this.resume = function()
	{
		self.isPaused = false;
		intervalId = setInterval(self.tick,self.tickInterval);
	}

	this.tick = function()
	{
		moveDownCurrentBlock(false);
	}

	function gameOverSequence()
	{
		currentBlock = null;
		clearInterval(intervalId);
		if(self.onGameOver != null)
			self.onGameOver();
	}
	

	//------------------- MECHANIC END POINTS ------------------ */
	//------------------- BLOCKS MANIPULATION ------------------ */

	function newBlock()
	{
		if(nextBlock == null)
			nextBlock = new Block();

		currentBlock = nextBlock;
		currentBlock.x = currentBlock.y = 0;
		currentBlock.moveHor(Math.floor(self.numColumns/2));
		currentBlock.moveVer(-1);

		bgGrid.addChild(currentBlock);

		nextBlock = new Block();
		nextBlock.x = celwid * self.numColumns;
		nextBlock.y = celwid * 2;
		self.addChild(nextBlock);
		
		speedPoints = 0;
		updateSpeedPoints();

		var canPlace = validateNewBlockPosition();
		if(!canPlace)
			gameOverSequence();
	}

	function rotateCurrentBlock()
	{
		if(!currentBlock) return;
		var canMove = validateNewBlockPosition(null,currentBlock.nextMatrix());
		if(canMove) currentBlock.rotate();
	}

	function moveLeftCurrentBlock()
	{
		if(!currentBlock) return;
		var canMove = validateNewBlockPosition({x:-1});
		if(canMove) currentBlock.moveHor(-1);
	}

	function moveRightCurrentBlock()
	{
		if(!currentBlock) return;
		var canMove = validateNewBlockPosition({x:1});
		if(canMove) currentBlock.moveHor(1);
	}

	function moveDownCurrentBlock(key)
	{
		if(!currentBlock) return;
		var canMove = validateNewBlockPosition({y:1});
		if(canMove) 
		{
			if(key)
			{
				speedPoints += 1;
				updateSpeedPoints();
			}
			
			currentBlock.moveVer(1);
		}
		else
		{
			var success = cementCurrentBlock();
			if(success)
				lookForCompletedLines();
			else
				gameOverSequence();
		}
	}

	function validateNewBlockPosition(offset,matrix)
	{
		block = currentBlock;
		if(!block) return false;
		bx = block.offset.x + (offset && offset.x ? offset.x : 0);
		by = block.offset.y + (offset && offset.y ? offset.y : 0);
		matrix = matrix || block.matrix;
		var h = matrix.length, mh = self.numColumns-1, mv = self.numRows-1, w,r,dx,dy;
		var g = grid;
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

	function cementCurrentBlock()
	{
		var b = currentBlock, g = grid;
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
				bgGrid.addChild(cm[i][j]);
			}
		}
		b.destroy();
		currentBlock = null;
		return success;
	}

	//------------------- BLOCKS MANIPULATION ------------------ */
	//-------------------- LINES DROP LOGIC ------------------- */

	function lookForCompletedLines()
	{
		var g = grid, nr = self.numRows, nc = self.numColumns, line;
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
			processCompleteLines(completedLines,g);
		else
			newBlock();
	}

	function processCompleteLines(rts,g)
	{
		var al = rts.length, nc = self.numColumns,cell,r;
		// remove cells view, clear grid matrix spots
		for(var i = al; i-->0;)
		{
			r = rts[i];
			points += self.pointsForLine;
			for(var c = nc; c-->0;)
			{
				cell = g[r][c];
				if(cell.parent)
					cell.parent.removeChild(cell);
				g[r][c] = null;
			}
		}
		// count points for lines, trigger animations
		animateDropLines(rts,g);
		points += speedPoints;
		updatePoints();
	}

	function animateDropLines(rts,g)
	{
		//shift arrays
		for(var i = rts.length; i -->0;)
			g.unshift(g.splice(rts[i],1).pop());

		// match to arrays
		var max = Math.max.apply(null,rts), nc = self.numColumns, v,cell;
		for(var r = 0; r <= max; r++)
		{
			v = r * celwid;
			for(var c = nc; c-->0;)
			{
				cell = g[r][c];
				if(!cell) continue;
				TweenLite.to(cell, 0.4,{y : v, onComplete : animComplete, ease: "easeInPower3"});
			}
		}
		// continue after animation
		var completed = false;
		function animComplete()
		{
			if(completed) return;
			completed = true;
			newBlock();
		}
	}

	//-------------------- LINES DROP LOGIC ------------------- */
	//-------------------- POINTS UPDATE------------------- */

	function updatePoints()
	{
		tfPoints.text = "Points: " + String(points);
	}

	function updateSpeedPoints()
	{
		tfSpeedPoints.alpha = speedPoints > 0 ? 1 : 0;
		tfSpeedPoints.text = String(speedPoints);
	}
	//-------------------- POINTS UPDATE------------------- */
	this.keyMap  = {
		"27" : self.pause,
		"37" : moveLeftCurrentBlock,
		"38" : rotateCurrentBlock,
		"39" : moveRightCurrentBlock,
		"40" : moveDownCurrentBlock
	}
}

Game.prototype = Object.create(PIXI.Container.prototype);

Game.prototype.numColumns = 10;
Game.prototype.numRows = 20;

Game.prototype.isStarted = false;
Game.prototype.isPaused = false;

Game.prototype.pointsForLine = 10;
Game.prototype.tickInterval = 500;
//---------------------- CONSTRUCTOR SECTION --------------------- */





