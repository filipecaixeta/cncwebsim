
// currentProjectCode = "g code here";
// currentProject = 
// {
// 	name:"project name",
// 	created:"date of creation",
// 	machine:
// 		{
// 			mtype:"machine type",
// 			dimension:{x,y,z},
// 			maxSpindleRPM:5000,
// 			maxFeedRate:{x,y,z}
// 			home1:{x,y,z},
// 			home2:{x,y,z},
// 		}
// 	workpiece:
// 		{
// 			x:100,
// 			y:100,
// 			z:10,
// 			len:100,
// 			diameter:40,
//			material:material,
// 		}
// }
// projects = {projectname:projectData}
// ideSettings = {}

function LocalStorage () 
{
	this.storage = window["localStorage"];
	if (this.storageAvailable()==false)
		return false;
	this.firstTime = false;
	this.storageInitialize();
	
	var projects = this.getData("projects");
	this.projectNamesList = Object.keys(projects);
}

LocalStorage.prototype = 
{
    get code()
    {
        return this.getData("currentProjectCode");
    },
    set code(val)
    {
        this.saveData("currentProjectCode",val);
    },
    get machine()
    {
    	return this.currentProject.machine;
    },
    set machine(val)
    {
    	this.currentProject.machine = val;
    	this.saveData("currentProject",this.currentProject);
    	setMachine(true);
    },
    get machineType()
    {
    	return this.currentProject.machine.machineType;
    },
    set machineType(val)
    {
    	this.currentProject.machine.machineType = val;
    	this.saveData("currentProject",this.currentProject);
    	setMachine(true);
    },
    get workpiece()
    {
    	return this.currentProject.workpiece;
    },
    set workpiece(val)
    {
    	this.currentProject.workpiece=val;
    	this.saveData("currentProject",this.currentProject);
    	machine.workpiece = this.currentProject.workpiece;
    },
    set machine(val)
    {
    	this.currentProject.workpiece = val;
    	this.saveData("currentProject",this.currentProject);
    },
    get projectNames()
    {
    	return this.projectNamesList;
    },
    get header()
    {
        return this.getData("currentProject");
    },
    set header(val)
    {
        this.saveData("currentProject",val);
    },
};
LocalStorage.prototype.init = function () 
{
	if (this.firstTime)
	{
		var pname=this.newProject();
		this.loadProject(pname);
	}
	else
		this.loadCurrentProject();
};
// Check if local storage is available
LocalStorage.prototype.storageAvailable = function ()
{
	try 
	{
		var x = '__storage_test__';
		this.storage.setItem(x, x);
		this.storage.removeItem(x);
		return true;
	}
	catch(e) 
	{
		return false;
	}
};
// Initialize the storage if it is the firs time
LocalStorage.prototype.storageInitialize = function ()
{
	keys=["currentProjectCode","currentProject","projects","ideSettings"];
	if(this.storage.getItem("currentProjectCode") === null)
	{
		this.saveData("currentProjectCode","");
		this.firstTime = true;
	}
	if(this.storage.getItem("projects") === null)
	{
		this.saveData("projects",{});
		this.firstTime = true;
	}
	if(this.storage.getItem("ideSettings") === null)
	{
		this.saveData("ideSettings",{});
		this.firstTime = true;
	}
	if(this.storage.getItem("currentProject") === null)
	{
		this.saveData("currentProject",{});
		this.firstTime = true;
	}
};
// Available local storage space
LocalStorage.prototype.availableSpace = function ()
{
	// BODY
};
// Get all the projects headers
LocalStorage.prototype.getProjets = function ()
{
	var projects = this.getData("projects");
	return Object.keys(projects);
};
// Load a project
LocalStorage.prototype.loadProject = function (projName)
{
	oldproj={header:this.getData("currentProject"),code:this.getData("currentProjectCode")};
	projects = this.getData("projects");
	if (oldproj.header.name!==undefined)
	{
		projects[oldproj.header.name]=oldproj;
		this.saveData("projects",projects);
	}
	if (projName in projects)
	{
		this.saveData("currentProject",projects[projName].header);
		this.saveData("currentProjectCode",projects[projName].code);
		this.loadCurrentProject(projName);
		return true;
	}
	else
		return false;
};
LocalStorage.prototype.loadCurrentProject = function (projName)
{
	proj={header:this.getData("currentProject"),code:this.getData("currentProjectCode")};
	this.currentProject = proj.header;
	setMachine();
	self.codeEditor.setCode(proj.code);
};
// Create a new project 
LocalStorage.prototype.newProject = function (proj)
{
	var projects = this.getData("projects");
	proj = proj || {};
	if (proj.machineType=="Mill")
	{
		proj.machine= {	machineType:"Mill",
						dimension:{x:100,y:100,z:100},
						maxSpindleRPM:5000,
						maxFeedRate:{x:100,y:100,z:100},
						home1:{x:0,y:0,z:100},
						home2:{x:0,y:0,z:100},
						};
	}
	else if (proj.machineType=="Printer")
	{
		proj.machine= {	machineType:"Printer",
						dimension:{x:100,y:100,z:100},
						maxSpindleRPM:5000,
						maxFeedRate:{x:100,y:100,z:100},
						home1:{x:0,y:0,z:100},
						home2:{x:0,y:0,z:100},
						};
	}
	else
	{
		proj.machine= {	machineType:"Lathe",
						dimension:{x:100,y:100,z:100},
						maxSpindleRPM:5000,
						maxFeedRate:{x:100,y:100,z:100},
						home1:{x:100,y:0,z:100},
						home2:{x:100,y:0,z:100},
						};
	}
	delete proj.machineType;
	proj.workpiece = proj.workpiece||{x:100,y:100,z:10,len:100,diameter:40};
	if (proj.name===undefined)
		proj.name = "untitled";
	if (proj.name in projects)
	{
		var i=0;
		var key;
		do
		{
			i++;
			key=proj.name+"("+i+")";
		}while(key in projects);
		proj.name = key;
	}
	proj.created = new Date();
	proj.code = proj.code || "";

	code = proj.code;
	delete proj.code;
	projects[proj.name]={header:proj,code:code};
	this.saveData("projects",projects);
	this.projectNamesList = Object.keys(projects);
	return proj.name;
};
// Save the current project at projectsList
LocalStorage.prototype.saveCurrentProject = function ()
{
	
};
LocalStorage.prototype.getData = function (key)
{
	if (key=="projects")
		return JSON.parse(LZString.decompress(this.storage.getItem(key)));
	else
		return JSON.parse(this.storage.getItem(key));
};
LocalStorage.prototype.saveData = function (key,data)
{
	if (key=="projects")
		this.storage.setItem(key,LZString.compress(JSON.stringify(data)));
	else
		this.storage.setItem(key,JSON.stringify(data));
};