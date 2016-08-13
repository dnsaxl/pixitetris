Game = function()
{    
	PIXI.Container.call( this );
	var texture = PIXI.Texture.fromImage('assets/background.png');
	var gridwid =  texture.crop.width * this.numColumns;
	var gridhei = texture.crop.height * this.numRows;

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
}

Game.prototype = Object.create(PIXI.Container.prototype);
Game.prototype.constructor = Game;
Game.prototype.started = false;
Game.prototype.numColumns = 10;
Game.prototype.numRows = 20;
Game.prototype.bgGrid = null;
Game.prototype.grid = null;
Game.prototype.isRowComplete = function(index)
{
	for(var i = this.numColumns; i--> 0;)
		if(!this.grid[i][index])
			return false;
	return true;
}
