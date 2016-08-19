//---------------------- CONSTRUCTOR SECTION --------------------- */
Block = function()
{
	PIXI.Container.call( this );
	var self = this;
	var typeId = this.blockIDtypes[Math.floor(Math.random() * this.blockIDtypes.length)];
	var rotIndex = 0;
	var cells = [];
	this.cellsMatrix = [];
	this.type = this.types[typeId];
	this.matrix = this.type[rotIndex];
	this.offset = {x:0,y:0};

	buildBlock();
	redistribute();
	//---------------------- CONSTRUCTOR SECTION --------------------- */
	//---------------------- BUILD SECTION --------------------- */
	function buildBlock()
	{
		var v, cm = self.cellsMatrix, m = self.matrix, len = m.length;
		for(var i = 0, l = len; i < l; i++)
		{
			cm[i] = [];
			for(var j = 0, k = len; j < k; j++)
			{
				v = m[i][j];
				if(!v) continue;
				v = new PIXI.Sprite(self.getTexture(self.type.color));
				cells.push(v);
				cm[i][j] = v;
				self.addChild(v);
			}
		}
	}

	function redistribute()
	{
		var v, cm = self.cellsMatrix, m = self.matrix, len = m.length,ci=0;
		for(var i = 0, l = len; i < l; i++)
		{
			cm[i] = [];
			for(var j = 0, k = len; j < k; j++)
			{
				v = m[i][j];
				if(!v) continue;
				c = cells[ci++];
				cm[i][j] = c;
				c.x = celwid * j;
				c.y = celwid * i;
			}
		}
	}
	//---------------------- BUILD SECTION --------------------- */
	//------------------- API-manipulate ------------------ */
	this.moveHor = function(v)
	{
		self.offset.x += v;
		self.x = self.offset.x * celwid;
	}

	this.moveVer = function(v)
	{
		self.offset.y += v;
		self.y = self.offset.y * celwid;
	}

	this.rotate = function()
	{
		rotIndex +=1;
		self.matrix = self.type[rotIndex % self.type.length];
		redistribute();
	}

	this.nextMatrix = function(v)
	{
		return self.type[(rotIndex + (v?v:1)) % self.type.length];
	}

	this.destroy = function()
	{
		var cm = self.cellsMatrix;
		while(cells.length)
			cells.pop();
		while(cm.length)
		{
			while(cm[0].length)
				cm[0].pop();
			cm.shift();
		}
		typeId = rotIndex = 0;
		self.type = self.matrix = self.offset = self.cellsMatrix = cells = cm  = null;
	}
	//------------------- API-manipulate ------------------ */
}
Block.prototype = Object.create(PIXI.Container.prototype);
Block.prototype.types = {};
Block.prototype.types.I = [
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
Block.prototype.types.J = [
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
Block.prototype.types.L = [
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
Block.prototype.types.O = [
	[
		[1, 1],
		[1, 1],
	]
];
Block.prototype.types.S = [
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
Block.prototype.types.T = [
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
Block.prototype.types.Z = [
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
Block.prototype.types.I.color = "block_cyan.png";
Block.prototype.types.J.color = "block_blue.png";
Block.prototype.types.L.color = "block_orange.png";
Block.prototype.types.Z.color = "block_red.png";
Block.prototype.types.S.color = "block_green.png";
Block.prototype.types.T.color = "block_purple.png";
Block.prototype.types.O.color = "block_yellow.png";
Block.prototype.blockIDtypes = ["I","J","L","Z","S","T","O"];