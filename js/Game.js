Game = function()
{    
	PIXI.Container.call( this );
	var texture = app.texture('background.png');	
	var gridwid =  texture.crop.width * this.numColumns;
	var gridhei = texture.crop.height * this.numRows;
	celwid = texture.crop.width;

	this.bgGrid = new PIXI.extras.TilingSprite(texture, gridwid,gridhei);
	this.addChild(this.bgGrid);

	this.grid = [];
	for(var i = this.numColumns; i--> 0;)
	{
		var column = [];	
		for(var j = this.numRows; j--> 0;)
			column.push(null);
		this.grid.push(column);
	}
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

Game.prototype.newBlock = function()
{
	this.currentBlock = new Block();
	this.addChild(this.currentBlock);
}
Game.prototype.rotateCurrentBlock = function()
{
	this.currentBlock  ? this.currentBlock.rotate() : null;
}
Game.prototype.moveLeftCurrentBlock = function()
{
	this.currentBlock ? this.currentBlock.moveHor(-1) : null;
}
Game.prototype.moveRightCurrentBlock = function()
{
	this.currentBlock ? this.currentBlock.moveHor(1) : null;
}
Game.prototype.moveDownCurrentBlock = function()
{
	this.currentBlock ? this.currentBlock.moveVer(1) : null;
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

 function rad2deg(rad) { return rad * 180/Math.PI};
 function deg2rad(deg) { return deg / 180.0 * Math.PI };