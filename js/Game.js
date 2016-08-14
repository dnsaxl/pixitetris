Game = function()
{    
	PIXI.Container.call( this );
	this.buildGrid(this.numRows,this.numColumns);
}

Game.prototype = Object.create(PIXI.Container.prototype);
Game.prototype.constructor = Game;
Game.prototype.started = false;
Game.prototype.numColumns = 10;
Game.prototype.numRows = 20;
Game.prototype.bgGrid = null;
Game.prototype.grid = null;
Game.prototype.currentBlock = null;
Game.prototype.numBlocks = 0;

Game.prototype.buildGrid = function(r,c)
{
	var texture = app.texture('background.png');	
	var gridwid = texture.crop.width * c;
	var gridhei = texture.crop.height * r;
	celwid = texture.crop.width;

	this.bgGrid = new PIXI.extras.TilingSprite(texture, gridwid,gridhei);
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
Game.prototype.start = function()
{
	if(this.started) return;
	this.started = true;
	this.newBlock();
}

Game.prototype.newBlock = function()
{
	this.currentBlock = null;
	this.currentBlock = new Block();
	this.addChild(this.currentBlock);
}
Game.prototype.rotateCurrentBlock = function()
{
	if(!this.currentBlock) return;
	var canMove = this.validateNewBlockPosition(null,this.currentBlock.nextMatrix());
	console.log("rotate blick", this.currentBlock.id);
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
Game.prototype.moveDownCurrentBlock = function()
{
	if(!this.currentBlock) return;
	var canMove = this.validateNewBlockPosition({y:1});
	if(canMove) 
		this.currentBlock.moveVer(1);
	else
	{
		this.cementCurrentBlock();
		this.validateCompleteLines();
	}
}

Game.prototype.validateCompleteLines = function ()
{
	var g = this.grid, nr = this.numRows, nc = this.numColumns, line;
	var rowsToShift = [];
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
			rowsToShift.push(r);
	}
	console.log("rowsToShift", rowsToShift);
	if(rowsToShift.length < 1)
		this.newBlock();
	else
	{
		this.processCompleteLines(rowsToShift,g);
	}
}
Game.prototype.processCompleteLines = function(a,g)
{
	var al = a.length, nc = this.numColumns,cell,r;
	for(var i = al; i-->0;)
	{
		r = a[i];
		console.log("row to shift",r,g[r]);
		for(var c = nc; c-->0;)
		{
			cell = g[r][c];
			if(cell.parent)
				cell.parent.removeChild(cell);
			g[r][c] = null;
		}
	}
	this.animateDropLines(a,g);
}

Game.prototype.animateDropLines = function(a,g)
{
	var max = Math.max.apply(null,a), nr = this.numRows, nc = this.numColumns;
	var completed = false;
	shiftArrays();
	matchToArrays();
	function animComplete()
	{
		if(completed) return;
		completed = true;
		app.game.newBlock();
	}
	function shiftArrays()
	{
		for(var i = a.length; i -->0;)
			g.unshift(g.splice(a[i],1).pop());
	}
	function matchToArrays()	
	{
		var v,cell;
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
			if(dx < 0 || dx > mh || dy > mv || g[dy][dx])
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
			g[dy][dx] = cell;
			cell.x = celwid * dx;
			cell.y = celwid * dy;
			this.bgGrid.addChild(cm[i][j]);
		}
	}
	b.destroy();
	this.currentBlock = null;
}


Block = function()
{
	PIXI.Container.call( this );
	this.id = app.game.numBlocks++;
	this.typeId = Math.floor(Math.random() * blockTypes.length);
	this.type = blockTypes[this.typeId];
	this.rotIndex = 0;
	this.matrix = this.type[this.rotIndex];
	this.len = this.matrix.length;
	this.cells = [];
	this.cellsMatrix = [];
	this.offset = {x:0,y:0};

	var v;
	for(var i = 0, l = this.len; i < l; i++)
	{
		this.cellsMatrix[i] = [];
		for(var j = 0, k = this.len; j < k; j++)
		{
			v = this.matrix[i][j];
			if(!v) continue;
			v = new PIXI.Sprite(app.texture(this.type.color));
			this.cells.push(v);
			this.cellsMatrix[i][j] = v;
			this.addChild(v);
		}
	}
	this.redistribute();
	console.log("block created", this.id, this.offset.x, this.offset.y);
}
Block.prototype = Object.create(PIXI.Container.prototype);
Block.prototype.destroy = function()
{
	while(this.cells.length)
		this.cells.pop();
	while(this.cellsMatrix.length)
	{
		while(this.cellsMatrix[0].length)
			this.cellsMatrix[0].pop();
		this.cellsMatrix.shift();
	}
	this.id = this.typeId = this.rotIndex = 0;
	this.type = this.matrix = this.offset = this.len = this.cellsMatrix = this.cells = null;
}
Block.prototype.nextMatrix = function(v)
{
	return this.type[(this.rotIndex + (v?v:1)) % this.type.length];
}
Block.prototype.moveHor = function(v)
{
	this.offset.x += v;
	this.x = this.offset.x * celwid;
}
Block.prototype.moveVer = function(v)
{
	this.offset.y += v;
	this.y = this.offset.y * celwid;
}
Block.prototype.redistribute = function()
{
	var v,c,ci=0;
	for(var i = 0, l = this.len; i < l; i++)
	{
		this.cellsMatrix[i] = [];
		for(var j = 0, k = this.len; j < k; j++)
		{
			v = this.matrix[i][j];
			if(!v) continue;
			c = this.cells[ci++];
			this.cellsMatrix[i][j] = c;
			c.x = celwid * j;
			c.y = celwid * i;
		}
	}
	console.log("REDISTRIBUTE", this.id);
}

Block.prototype.rotate = function()
{
	this.rotIndex +=1;
	this.matrix = this.type[this.rotIndex % this.type.length];
	this.redistribute();
}
