Game = function()
{    
	PIXI.Container.call( this );
	this.buildGrid(this.numColumns,this.numRows);
	this.newBlock();
}
Game.prototype = Object.create(PIXI.Container.prototype);
Game.prototype.constructor = Game;
Game.prototype.started = false;
Game.prototype.numColumns = 10;
Game.prototype.numRows = 20;
Game.prototype.bgGrid = null;
Game.prototype.grid = null;
Game.prototype.currentBlock = null;
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

Game.prototype.newBlock = function()
{
	this.currentBlock = new Block();
	this.addChild(this.currentBlock);
}
Game.prototype.rotateCurrentBlock = function()
{
	if(!this.currentBlock) return;
	var canMove = this.validateNewBlockPosition(null,null,this.currentBlock.nextMatrix());
	if(canMove) this.currentBlock.rotate();
}
Game.prototype.moveLeftCurrentBlock = function()
{
	if(!this.currentBlock) return;
	var canMove = this.validateNewBlockPosition(null,{x:-1});
	if(canMove) this.currentBlock.moveHor(-1);
}
Game.prototype.moveRightCurrentBlock = function()
{
	if(!this.currentBlock) return;
	var canMove = this.validateNewBlockPosition(null,{x:1});
	if(canMove) this.currentBlock.moveHor(1);
}
Game.prototype.moveDownCurrentBlock = function()
{
	if(!this.currentBlock) return;
	var canMove = this.validateNewBlockPosition(null,{y:1});
	if(canMove) 
		this.currentBlock.moveVer(1);
	else
		this.newBlock();
}

Game.prototype.validateNewBlockPosition = function(block,offset,matrix)
{
	block = block || this.currentBlock;
	offsetx = block.offset.x + (offset && offset.x ? offset.x : 0);
	offsety = block.offset.y + (offset && offset.y ? offset.y : 0);
	matrix = matrix || block.matrix;
	var h = matrix.length, mh = this.numColumns-1, mv = this.numRows-1, w,r,dx,dy;
	var g = this.grid;
	for(var i = 0; i < h; i++)
	{
		r = matrix[i];
		w = r.length;
		dy = offsety + i;
		for(var j = 0; j < w; j++)
		{
			if(!r[j]) continue;
			dx = offsetx + j;
			if(dx < 0 || dx > mh || dy > mv)
				return false;
		}
	}

	return true;
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
	this.typeId = Math.floor(Math.random() * blockTypes.length);
	this.type = blockTypes[this.typeId];
	this.matrix = this.type[this.rotIndex];
	this.len = this.matrix.length;
	var v;
	for(var i = 0, l = this.len; i < l; i++)
	{
		for(var j = 0, k = this.len; j < k; j++)
		{
			v = this.matrix[i][j];
			if(!v) continue;
			v = new PIXI.Sprite(app.texture(this.type.color));
			this.cells.push(v);
			this.addChild(v);
		}
	}
	this.redistribute();
}
Block.prototype = Object.create(PIXI.Container.prototype);
Block.prototype.type = null;
Block.prototype.rotIndex = 0;
Block.prototype.len = 0;
Block.prototype.matrix = [];
Block.prototype.cells =[];
Block.prototype.offset = {x:0,y:0};
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
		for(var j = 0, k = this.len; j < k; j++)
		{
			v = this.matrix[i][j];
			if(!v) continue;
			c = this.cells[ci++];
			c.x = celwid * j;
			c.y = celwid * i;
		}

	}
}

Block.prototype.rotate = function()
{
	this.rotIndex +=1;
	this.matrix = this.type[this.rotIndex % this.type.length];
	this.redistribute();
}
