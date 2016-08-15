
var w,h; // window width / height 
var stage; // PIXI stage
var renderer; // PIXI renderer
var app; // APP 
var atlasURL = 'assets/atlas/spritesheet.json';


$(document).ready(onDocumentLoaded);

function onDocumentLoaded()
{
	setupProject();
	setupPIXI();
	buildContent();
}

function setupProject()
{
	onWindowResize();
	window.addEventListener("resize", onWindowResize);
}

function setupPIXI()
{
	renderer = new PIXI.autoDetectRenderer(w, h);
	stage = new PIXI.Container();
	document.body.appendChild(renderer.view);
	programLoop();
}

function programLoop()
{
	renderer.render(stage);
	requestAnimationFrame(programLoop);
}

function buildContent()
{
	app = new APP();
	app.build();
	stage.addChild(app);
}

function onWindowResize(e)
{
	w = window.innerWidth;
	h = window.innerHeight;
	if(renderer != null)
		renderer.resize(w,h);
	if(app)
		app.onResize();
}