Menu = function()
{    
	PIXI.Container.call( this );
}

Menu.prototype = Object.create(PIXI.Container.prototype);
Menu.prototype.constructor = Menu;
Menu.prototype.elements = [];
Menu.prototype.selectIndex  = -1;
Menu.prototype.selectedElement = null;
Menu.prototype.styleSelected = {font:"50px Arial", fill:"white", align:"center"};
Menu.prototype.styleUnselected = {font:"50px Arial", fill:"gray", align:"center"};
Menu.prototype.addElement = function(e)
{
	if(!e || this.elements.indexOf(e) > -1 || !e.hasOwnProperty("label"))
	{
		console.warn("Invalid menu element to create. Need to have 'label' and 'callback' fields.", e);
		return;
	}
	
	e.view = this.buildView(e.label);
	this.elements.push(e);
	this.addChild(e.view);
}
Menu.prototype.addElements = function(...args)
{
	while(args.length)
		this.addElement(args.shift());
}
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
Menu.prototype.buildView = function(label)
{
	var view = new PIXI.Text(label, this.styleUnselected);
	view.anchor.x = 0.5;
	view.anchor.y = 0.5;
	view.y = this.height + 20;
	return view;
}
Menu.prototype.confirmSelection = function()
{
	try { this.selectedElement.callback()}
	catch(e) { console.warn(e)}
}