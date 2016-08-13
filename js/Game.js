var gameContainer, menu;
function GAME()
{
	gameContainer = new PIXI.Container();
	buildGameContainerContents();
	return gameContainer;
}

/** ------------------- MENU SECTION ------------------- **/
	/** ------------------- MENU CLASS ------------------- **/
var menuStyle_selected = {font:"50px Arial", fill:"white"};
var menuStyle_unselected = {font:"50px Arial", fill:"gray"};

Menu = function()
{    
	PIXI.Container.call( this );
}

Menu.prototype = Object.create(PIXI.Container.prototype);
Menu.prototype.constructor = Menu;
Menu.prototype.elements = [];
Menu.prototype.selectIndex  = -1;
Menu.prototype.selectedElement = null;
Menu.prototype.addElement = function(e)
{
	if(!e || this.elements.indexOf(e) > -1 || !e.hasOwnProperty("label"))
	{
		console.warn("Invalid menu element to create. Need to have 'label' and 'callback' fields.", e);
		return;
	}
	var view = new PIXI.Text(e.label, menuStyle_unselected);
	view.y = this.height + 20;
	e.view = view;
	this.elements.push(e);
	this.addChild(e.view);
}
Menu.prototype.addElements = function(...args)
{
	while(args.length)
		this.addElement(args.pop());
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
		this.unselect(this.selectedElement)
	this.selectedElement = this.elements[this.selectIndex];
	this.selectedElement.view.style = menuStyle_selected;
	console.log(this.selectIndex,"selected:", this.selectedElement);
}

Menu.prototype.unselect = function(e)
{
	if(!e || !e.hasOwnProperty("view"))
		return;
	e.view.style = menuStyle_unselected;
	
}
/** ------------------- MENU CLASS ------------------- **/
/** ------------------- MENU SECTION ------------------- **/

function buildGameContainerContents()
{
	var s = {label:"Start", callback : onMenuStart};
	var c = {label:"Credits", callback : onMenuCredits};

	menu = new Menu();
	menu.addElements(s, c);
	gameContainer.addChild(menu);
}

function onMenuStart()
{
	if(menu.parent)
		menu.parent.removeChild(menu);
}

function onMenuCredits()
{
	if(menu.parent)
		menu.parent.removeChild(menu);
}


function distribute(cont, gap, horizontal=true, offset=0)
{
	var mod = { a : horizontal ? 'x' : 'y', d : horizontal ? 'width' : 'height'}
	var ob;
	var i =-1;
	var c = cont.children.length;
	var totalSize = offset;
	
	while(++i<c)
	{
		ob = cont.getChildAt(i);
		ob[mod.a] = totalSize;
		totalSize += ob[mod.d] + gap;
	}
	mod = null;
	ob = null;
	cont = null;
}