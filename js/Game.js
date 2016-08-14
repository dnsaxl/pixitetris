Game = function()
{    
	PIXI.Container.call( this );
	this.buildGrid(this.numColumns,this.numRows);
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
Game.prototype.buildGrid = function(c,r)
{
	var texture = app.texture('background.png');	
	var gridwid = texture.crop.width * c;
	var gridhei = texture.crop.height * r;
	celwid = texture.crop.width;

	this.bgGrid = new PIXI.extras.TilingSprite(texture, gridwid,gridhei);
	this.addChild(this.bgGrid);

	this.grid = [];
	for(var i = c; i--> 0;)
	{
		var column = [];	
		for(var j = r; j--> 0;)
			column.push(null);
		this.grid.push(column);
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
			if(!g[c][r])
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
	var al = a.length, gl = g.length,c,r;
	for(var i = al; i-->0;)
	{
		r = a[i];
		console.log("row to shift",r);
		for(var j = gl; j-->0;)
		{
			c = g[j][r];
			console.log('cell to shift', c);
			if(c.parent)
				c.parent.removeChild(c);
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
			if(dx < 0 || dx > mh || dy > mv || g[dx][dy])
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
			g[dx][dy] = cell;
			cell.x = celwid * dx;
			cell.y = celwid * dy;
			this.bgGrid.addChild(cm[i][j]);
		}
	}
	b.destroy();
	this.currentBlock = null;
}

Game.prototype.isRowComplete = function(index)
{
	for(var i = this.numColumns; i--> 0;)
		if(!this.grid[i][index])
			return false;
	return true;
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
