
var w,h; // window width / height 
var stage; // PIXI stage
var renderer; // PIXI renderer


$( document ).ready(onDocumentLoaded);

function onDocumentLoaded()
{
	setupProject();
	setupPIXI();
	buildContent();
	programLoop();
}

function setupProject()
{
	onWindowResize();
	window.addEventListener("resize", onWindowResize);
}

function onWindowResize(e)
{
	w = $(window).width();
	h = $(window).height();
	if(renderer != null)
		renderer.resize(w,h);
}

function setupPIXI()
{
	renderer = new PIXI.autoDetectRenderer(w, h);
	stage = new PIXI.Stage(0x990000);
	document.body.appendChild(renderer.view);
}

function buildContent()
{
	
}

function programLoop()
{
	renderer.render(stage);
	requestAnimFrame(programLoop);
}

