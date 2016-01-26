var codeEditor;
var machine;
var locSto;
var parserWorker;
var geometryWorker;

function setMachine (run) 
{
	remove2DWorkpiece();
	remove3DWorkpiece();
	removeWorkpieceBoundaries();
	
	var machineType = locSto.machineType;
	if (machineType=="Lathe")
		self.machine = Lathe(locSto.header);
	else if (machineType=="Mill")
		self.machine = Mill(locSto.header);
	else if (machineType=="Printer" || machineType=="3D Printer")
		self.machine = new Printer(locSto.header);
	else
		return;
	if (run)
	{
		runCode();
	}
}
function runCode () 
{
	var code=codeEditor.getCode();
	if (code!="")
		parserWorker.postMessage({header:locSto.header,code:code});
	else
	{
		remove2DWorkpiece();
		remove3DWorkpiece();
	}
}
function mainInit () 
{
	// Init the menus
	initUI();
	// Create a worker for parsing the code
	self.parserWorker = new Worker("js/wwGenerate2d.js");
	// Create a worker for the generating the 3D meshes
	// self.geometryWorker = new Worker("js/wwGeometry3d.js");
	// Initialize the code editor
	self.codeEditor = new CodeEditor();
	// Initialize the renderer
	initRenderer();
	// Initialize the local storage
	self.locSto = new LocalStorage();
	self.locSto.init();
	// Create the machine
	// setMachine();
	// When parser is finished
	parserWorker.onmessage = function(e) 
	{
		// clearCanvas();
		machine.render(e.data);
	}
	// geometryWorker.onmessage = function(e) 
	// {
	// 	console.log(JSON.parse(e.data.geometry));
	// 	// machine.create3DWorkpiece(e.data);
	// };
}