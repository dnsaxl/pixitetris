//---------------------- CONSTRUCTOR SECTION --------------------- */
Game = function()
{    
	PIXI.Container.call(this);
	var self = this;

	var bgGrid = null;
	var topbar = null;
	var tfPoints = null;
	var tfSpeedPoints = null;
	var tfnext = null;
	var currentBlock = null;
	var nextBlock = null;
	var btnLeft = null;
	var btnRight = null;
	var btnRotate = null;
	var btnSpeed = null;
	
	var grid = null;
	var numBlocks = 0;
	var points = 0;
	var speedPoints = 0;
	var intervalId = 0;
	var leftAligned =  {font:"16px Arial", fill:"white", align:"left"};
	var centerAligned = {font:"16px Arial", fill:"white", align:"center"};
	var lasers = [];
	var GAP = 15;
	var level = 0;
	var levelMap = [1000,900,800,700,600,500,400,300,200,100,50,25];
	var lines = 0;
	var linesTillNextLevel = 10;

	
	//---------------------- BUILD SECTION --------------------- */
	this.build = function()
	{

		buildGrid(this.numRows,this.numColumns);
		buildTop();
		buildPoints();
		buildLasers();
		buildButtons();
		positionAll();

	}

	function buildGrid(r,c)
	{
		var texture = self.getTexture('background.png');
		celwid = texture.crop.width;
		GAP = celwid	
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
		topbar.beginFill(0, 0);
		topbar.drawRect(0, 0, gridwid, celwid *2);

		tfnext = new PIXI.Text("NEXT", centerAligned);

		topbar.addChild(tfnext);
		self.addChild(topbar);
	}

	function buildPoints()
	{
		
		tfPoints = new PIXI.Text("", leftAligned);
		tfSpeedPoints = new PIXI.Text("bonus:",centerAligned);

		updatePoints();
		topbar.addChild(tfPoints);
		topbar.addChild(tfSpeedPoints);
	}

	function buildLasers()
	{

		for(var i = 0; i < 4; i++)
		{
			var laser = new PIXI.Sprite(self.getTexture("laser"+i+".png"));
			laser.width = bgGrid.width;
			laser.x = bgGrid.x;
			laser.anchor.y = 0.5;
			laser.blendMode = PIXI.BLEND_MODES.ADD;
			lasers[i] = laser;
		}
	}

	function buildButtons()
	{
		
		btnLeft = new PIXI.Sprite(self.getTexture("left.png"));
		btnRight = new PIXI.Sprite(self.getTexture("right.png"));
		btnRotate = new PIXI.Sprite(self.getTexture("rotate.png"));
		btnSpeed = new PIXI.Sprite(self.getTexture("speed.png"));

		addListeners(btnLeft, moveLeftCurrentBlock);
		addListeners(btnRight, moveRightCurrentBlock);
		addListeners(btnRotate, rotateCurrentBlock);
		addListeners(btnSpeed, moveDownCurrentBlock);

		self.addChild(btnLeft);
		self.addChild(btnRight);
		self.addChild(btnRotate);
		self.addChild(btnSpeed);
	}

	function positionAll()
	{
		bgGrid.x = btnLeft.width + GAP
		bgGrid.y = celwid *2;

		tfnext.x =  bgGrid.x + bgGrid.width + GAP;

		tfSpeedPoints.x = bgGrid.x + bgGrid.width + GAP;
		tfSpeedPoints.y = Math.floor(self.numRows / 2) * celwid;

		btnLeft.x = 0;
		btnLeft.y = bgGrid.y + bgGrid.height - btnLeft.height;

		btnRight.x = bgGrid.x + bgGrid.width + GAP;
		btnRight.y = btnLeft.y;

		btnRotate.x = btnRight.x;
		btnRotate.y = btnLeft.y - btnRotate.height - GAP;

		btnSpeed.x = 0;
		btnSpeed.y = btnRotate.y;

		for(var i = 0; i < lasers.length; i++)
			lasers[i].x = bgGrid.x;
	}

	function addListeners(t,f)
	{
		var delay = 300, frequency = 20;
		var onDown = function(e)
		{
			f(e);
			t.timeOutId = setTimeout(setRepeat,delay);
		}
		var onUp = function(e)
		{
			clearTimeout(t.timeOutId);
			clearInterval(t.intervalId);
		}
		var setRepeat = function(e)
		{
			clearTimeout(t.timeOutId);
			clearInterval(t.intervalId);
			t.intervalId = setInterval(f,frequency,e);
		}

		t.interactive = t.buttonMode = true;
		t.mousedown  = t.touchstart = onDown;
		t.mouseup = t.touchend = onUp;
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
		intervalId = setInterval(self.tick,levelMap[level]);
	}

	this.restart = function()
	{
		points = speedPoints = numBlocks = level = lines = 0;
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
		intervalId = setInterval(self.tick,levelMap[level]);
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
		nextBlock.x = bgGrid.x + bgGrid.width + GAP;
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

		var removeBlocks = function()
		{
			var al = rts.length, nc = self.numColumns,cell,r;
			// remove cells view, clear grid matrix spots
			for(var i = al; i-->0;)
			{
				r = rts[i];
				points += self.pointsForLine;
				if((++lines % linesTillNextLevel) == 0)
					levelUp();
				for(var c = nc; c-->0;)
				{
					cell = g[r][c];
					if(!cell) continue;
					if(cell.parent)
						cell.parent.removeChild(cell);
					g[r][c] = null;
				}
			}
			//shift arrays
			for(var i = rts.length; i -->0;)
				g.unshift(g.splice(rts[i],1).pop());
			// add points
			points += speedPoints;
			updatePoints();
		}

		animateLasers(rts,removeBlocks);
	}

	function animateLasers(rts, onComplete)
	{
		for(var i = rts.length; i-->0;)
		{

			var laser = lasers[i];
			laser.y = (rts[i] + 2.5) * celwid;
			laser.alpha = 1;
			laser.scale.y = 0;
			TweenMax.to(laser, 0.2,{alpha : 1, yoyo : true, repeat : 1});
			TweenMax.to(laser.scale, 0.2, {y : 1, yoyo : true, repeat: 1, onComplete : animComplete, onCompleteParams : [laser]})
			self.addChild(laser);

		}
		
		var completed = false;
		function animComplete(l)
		{
			if(l.parent)
				l.parent.removeChild(l);

			if(completed) return;
			completed = true;
			onComplete();
			animateDropLines(rts, grid);
		}
	}

	function animateDropLines(rts,g)
	{

		// match to arrays
		var max = Math.max.apply(null,rts), nc = self.numColumns, v,cell;
		for(var r = 0; r <= max; r++)
		{
			v = r * celwid;
			for(var c = nc; c-->0;)
			{
				cell = g[r][c];
				if(!cell) continue;
				TweenMax.to(cell, 0.4,{y : v, onComplete : animComplete, ease: "easeInPower3"});
			}
		}
		var completed = false;
		function animComplete()
		{
			if(completed) return;
			completed = true;
			newBlock();
		}
	}

	function levelUp()
	{
		if(++level < levelMap.length)
		{
			clearInterval(intervalId);
			intervalId = setInterval(self.tick,levelMap[level]);
		}
	}

	//-------------------- LINES DROP LOGIC ------------------- */
	//-------------------- POINTS UPDATE------------------- */

	function updatePoints()
	{
		tfPoints.text = "POINTS: " + String(points);
	}

	function updateSpeedPoints()
	{
		TweenMax.killTweensOf(tfSpeedPoints);
		TweenMax.to(tfSpeedPoints, 0.3,{alpha: speedPoints > 0 ? 1 : 0});
		tfSpeedPoints.text = "BONUS\n" + String(speedPoints);
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