//---------------------- CONSTRUCTOR SECTION --------------------- */
Menu = function()
{    
	PIXI.Graphics.call( this );
	this.elements = [];
	this.selectIndex =-1;
	this.selectedElement = null;
	this.maxwidth = 0;
	this.curHeight = 0;
	this.gap = 10;
}

Menu.prototype = Object.create(PIXI.Graphics.prototype);
Menu.prototype.constructor = Menu;
Menu.prototype.elements = [];
Menu.prototype.selectIndex  = -1;
Menu.prototype.selectedElement = null;
Menu.prototype.styleSelected = {font:"50px Arial", fill:"white", align:"center"};
Menu.prototype.styleUnselected = {font:"50px Arial", fill:"gray", align:"center"};

//---------------------- CONSTRUCTOR SECTION --------------------- */
//---------------------- BUILD SECTION --------------------- */

Menu.prototype.buildView = function(label,style)
{
	var view = new PIXI.Text(label, style || this.styleUnselected);
	view.anchor.x = 0.5;

	view.y = this.curHeight;
	this.curHeight += view.height + this.gap;
	return view;
}

Menu.prototype.redrawBackground = function()
{
	this.clear();
	this.bounds = this.getBounds();
	this.beginFill(0x333333,0.5);
	this.drawRect(this.maxwidth/-2,0,this.maxwidth, this.curHeight);
}

//---------------------- BUILD SECTION --------------------- */
//------------------- API-create ------------------ */

Menu.prototype.addElement = function(e,unselectable)
{
	if(!e || this.elements.indexOf(e) > -1 || !e.hasOwnProperty("label"))
	{
		console.warn("Invalid menu element to create. Need to have at least 'label' field.", e);
		return;
	}

	e.view = this.buildView(e.label,e.style);
	var wid = e.view.width;
	if(wid > this.maxwidth)
		this.maxwidth = wid;

	if(!unselectable)
		this.elements.push(e);
	this.addChild(e.view);
	this.redrawBackground();
}

Menu.prototype.addElements = function()
{
	var args = Array.prototype.slice.call(arguments);
	while(args.length)
		this.addElement(args.shift());
}

//------------------- API-create ------------------ */
//------------------- API-manipulate ------------------ */

Menu.prototype.selectUp = function() { this.select(-1)};
Menu.prototype.selectDown = function() { this.select(1)}
Menu.prototype.select = function(v)
{
	var maxIndex = this.elements.length -1;
	this.selectIndex += v;
	if(this.selectIndex < 0)
		this.selectIndex = maxIndex;
	else if(this.selectIndex > maxIndex)
		this.selectIndex = 0;
	if(this.selectedElement != null)
		this.selectedElement.view.style = this.styleUnselected;
	this.selectedElement = this.elements[this.selectIndex];
	this.selectedElement.view.style = this.styleSelected;
}

Menu.prototype.confirmSelection = function()
{
	try { this.selectedElement.callback()}
	catch(e) { console.warn(e)}
}
//------------------- API-manipulate ------------------ */