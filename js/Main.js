$( document ).ready(onDocumentLoaded);

var stage = new PIXI.Stage(0x990000);
var renderer = new PIXI.autoDetectRenderer(400, 300);

var contentBuild = false;

function onDocumentLoaded()
{
	document.body.appendChild(renderer.view);
	buildContent();
	programLoop();
}

function programLoop()
{
	renderer.render(stage);
	requestAnimFrame(programLoop);
}

function buildContent()
{
	if(buildContent) 
		return
}