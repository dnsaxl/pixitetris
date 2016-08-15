//---------------------- CONSTRUCTOR SECTION --------------------- */
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

	this.buildBlock();
	this.redistribute();
}
Block.prototype = Object.create(PIXI.Container.prototype);

//---------------------- CONSTRUCTOR SECTION --------------------- */
//---------------------- BUILD SECTION --------------------- */

Block.prototype.buildBlock = function()
{
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
}

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

//---------------------- BUILD SECTION --------------------- */
//------------------- inner-API ------------------ */

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
}

//------------------- inner-API ------------------ */
//------------------- API-manipulate ------------------ */

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

Block.prototype.rotate = function()
{
	this.rotIndex +=1;
	this.matrix = this.type[this.rotIndex % this.type.length];
	this.redistribute();
}

//------------------- API-manipulate ------------------ */
Block.prototype.nextMatrix = function(v)
{
	return this.type[(this.rotIndex + (v?v:1)) % this.type.length];
}

var I = [
	[
		[ ,  ,  ,  ],
		[1, 1, 1, 1],
		[ ,  ,  ,  ],
		[ ,  ,  ,  ],
	],
	[
		[ ,  , 1,  ],
		[ ,  , 1,  ],
		[ ,  , 1,  ],
		[ ,  , 1,  ],
	],
	[
		[ ,  ,  ,  ],
		[ ,  ,  ,  ],
		[1, 1, 1, 1],
		[ ,  ,  ,  ],
	],
	[
		[ , 1,  ,  ],
		[ , 1,  ,  ],
		[ , 1,  ,  ],
		[ , 1,  ,  ],
	]
];

var J = [
	[
		[1,  ,  ],
		[1, 1, 1],
		[ ,  ,  ]
	],
	[
		[ , 1, 1],
		[ , 1,  ],
		[ , 1,  ]
	],
	[
		[ ,  ,  ],
		[1, 1, 1],
		[ ,  , 1]
	],
	[
		[ , 1,  ],
		[ , 1,  ],
		[1, 1,  ]
	]
];

var L = [
	[
		[ ,  , 1],
		[1, 1, 1],
		[ ,  ,  ]
	],
	[
		[ , 1,  ],
		[ , 1,  ],
		[ , 1, 1]
	],
	[
		[ ,  ,  ],
		[1, 1, 1],
		[1,  ,  ]
	],
	[
		[1, 1,  ],
		[ , 1,  ],
		[ , 1,  ]
	]
];

var O = [
	[
		[1, 1],
		[1, 1],
	]
];

var S = [
	[
		[ , 1, 1],
		[1, 1,  ],
		[ ,  ,  ]
	],
	[
		[ , 1,  ],
		[ , 1, 1],
		[ ,  , 1]
	],
	[
		[ ,  ,  ],
		[ , 1, 1],
		[1, 1,  ]
	],
	[
		[1,  ,  ],
		[1, 1,  ],
		[ , 1,  ]
	]
];

var T = [
	[
		[ , 1,  ],
		[1, 1, 1],
		[ ,  ,  ]
	],
	[
		[ , 1,  ],
		[ , 1, 1],
		[ , 1,  ]
	],
	[
		[ ,  ,  ],
		[1, 1, 1],
		[ , 1,  ]
	],
	[
		[ , 1,  ],
		[1, 1,  ],
		[ , 1,  ]
	]
];

var Z = [
	[
		[1, 1,  ],
		[ , 1, 1],
		[ ,  ,  ]
	],
	[
		[ ,  , 1],
		[ , 1, 1],
		[ , 1,  ]
	],
	[
		[ ,  ,  ],
		[1, 1,  ],
		[ , 1, 1]
	],
	[
		[ , 1,  ],
		[1, 1,  ],
		[1,  ,  ]
	]
];
I.color = "block_cyan.png";
J.color = "block_blue.png";
L.color = "block_orange.png";
Z.color = "block_red.png";
S.color = "block_green.png";
T.color = "block_purple.png";
O.color = "block_yellow.png";

var blockTypes = [I,J,L,Z,S,T,O];