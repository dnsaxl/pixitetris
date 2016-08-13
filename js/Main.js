
var w,h; // window width / height 
var stage; // PIXI stage
var renderer; // PIXI renderer
var game; // GAME 


$(document).ready(onDocumentLoaded);

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
	w = window.innerWidth;
	h = window.innerHeight;
	if(renderer != null)
		renderer.resize(w,h);
}

function setupPIXI()
{
	renderer = new PIXI.autoDetectRenderer(w, h);
	stage = new PIXI.Container();
	document.body.appendChild(renderer.view);
}

function buildContent()
{
	game = new GAME();
	stage.addChild(game);
}

function programLoop()
{
	renderer.render(stage);
	requestAnimationFrame(programLoop);
}

