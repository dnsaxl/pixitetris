//---------------------- CONSTRUCTOR SECTION --------------------- */
Menu = function()
{    
	PIXI.Graphics.call( this );
	var self = this;
	var elements = [];
	var selectIndex =-1;
	var selectedElement = null;
	var maxwidth = 0;
	var curHeight = 0;
	this.gap = 10;

	
	//---------------------- CONSTRUCTOR SECTION --------------------- */
	//---------------------- BUILD SECTION --------------------- */
	function redrawBackground()
	{
		self.clear();
		self.beginFill(0x333333,0.5);
		self.drawRect(maxwidth/-2,0,maxwidth, curHeight);
	}

	function buildView(label,style)
	{
		var view = new PIXI.Text(label, style || self.styleUnselected);
		view.anchor.x = 0.5;

		view.y = curHeight;
		curHeight += view.height + self.gap;
		return view;
	}
	//---------------------- BUILD SECTION --------------------- */

	this.select = function(v)
	{
		selectIndex += v;
		if(selectedElement != null)
			selectedElement.view.style = self.styleUnselected;
		selectedElement = elements[Math.abs(selectIndex) % elements.length];
		selectedElement.view.style = self.styleSelected;
	}

	//------------------- API-manipulate ------------------ */
	this.selectUp = function() { self.select(-1)}
	this.selectDown = function() { self.select(1)}

	this.confirmSelection = function()
	{
		try { selectedElement.callback()}
		catch(e) { console.warn(e)}
	}
	//------------------- API-manipulate ------------------ */

	//------------------- API-create ------------------ */
	this.addElement = function(e,unselectable)
	{
		if(!e || elements.indexOf(e) > -1 || !e.hasOwnProperty("label"))
		{
			console.warn("Invalid menu element to create. Need to have at least 'label' field.", e);
			return;
		}

		e.view = buildView(e.label,e.style);
		var wid = e.view.width;
		if(wid > maxwidth) maxwidth = wid;
		if(!unselectable) 
		{
			elements.push(e);
			e.view.interactive = true;
			e.view.click = e.view.tap = e.callback;
			e.view.mouseover = self.onMouseOver;
			e.view.buttonMode = true;
		}
		self.addChild(e.view);
		redrawBackground();
	}


	this.onMouseOver = function(e)
	{
		var t = e.target;
		for(var i = elements.length; i-->0;)
			if(t === elements[i].view)			
				return self.select(i-selectIndex);
	}

	this.addElements = function()
	{
		var args = Array.prototype.slice.call(arguments);
		while(args.length)
			self.addElement(args.shift());
	}
	//------------------- API-create ------------------ */
	this.keyMap  = {
		"38" : self.selectUp,
		"40" : self.selectDown,
		"13" : self.confirmSelection
	}
}

Menu.prototype = Object.create(PIXI.Graphics.prototype);
Menu.prototype.styleSelected = {font:"90px Arial", fill:"white", align:"center"};
Menu.prototype.styleUnselected = {font:"90px Arial", fill:"gray", align:"center"};
