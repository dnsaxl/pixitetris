var gameContainer, menu;
function GAME()
{
	gameContainer = new PIXI.Container();
	buildGameContainerContents();
	return gameContainer;
}


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