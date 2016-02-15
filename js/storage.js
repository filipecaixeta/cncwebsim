/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */
 

// Keys: currentProjectCode, currentProjectHeader, projects, ideSettings
CWS.Storage = function (options) 
	{
		options = options || {};
		this.useCompression = (options.useCompression===undefined)?true:options.useCompression;
		// storage can be localStorage or a dictionary
	    this.storage = {};
	    this.isAvailable = false;
	    this.isFirstRun = false;
	    this.currentProjectHeaderCache = {};
	    this.projectsNameCache = {};

	    this.storageAvailable();
//	     this.reset();
	    this.storageCheckKeys();
	};
// For external access
CWS.Storage.prototype = 
	{
	    get code()
	    {
	        return this.getData("currentProjectCode");
	    },
	    set code(val)
	    {
	        this.saveCurrentProjectCode(val);
	    },
	    get machine()
	    {
	    	return this.currentProjectHeaderCache.machine;
	    },
	    set machine(val)
	    {
	    	this.currentProjectHeaderCache.machine = val;
	    	this.saveCurrentProjectHeader(this.currentProjectHeaderCache);
	    },
	    get machineType()
	    {
	    	return this.currentProjectHeaderCache.machine.mtype;
	    },
	    set machineType(val)
	    {
	    	this.currentProjectHeaderCache.machine.mtype = val;
	    	this.saveCurrentProjectHeader(this.currentProjectHeaderCache);
	    },
	    get workpiece()
	    {
	    	return this.currentProjectHeaderCache.workpiece;
	    },
	    set workpiece(val)
	    {
	    	this.currentProjectHeaderCache.workpiece=val;
	    	this.saveCurrentProjectHeader(this.currentProjectHeaderCache);
	    },
	    get header()
	    {
	        return this.currentProjectHeaderCache;
	    },
	    set header(val)
	    {
	        this.saveCurrentProjectHeader(this.currentProjectHeaderCache);
	    },
	    get projectNames()
	    {
	    	return this.projectsNameCache;
	    },
	};

CWS.Storage.prototype.constructor = CWS.Storage;
// Check if local storage is available and create
CWS.Storage.prototype.storageAvailable = function () 
	{
		this.storage = window["localStorage"];
		try 
		{
			var x = '__storage_test__';
			this.storage.setItem(x, x);
			this.storage.removeItem(x);
			this.isAvailable = true;
		}
		catch(e) 
		{
			// If local storage is not available create
			// an object with the same interface to keep
			// the application running
			this.storage = 
			{
				data: {},
				getItem: function (key)
				{
					return (this.data[key] || null);
				},
				setItem: function (key,data)
				{
					this.data[key] = data;
				},
				removeItem: function (key) 
				{
					delete this.data[key];
				},
			};
			this.isAvailable = false;
		}
	};
// Create the missing keys
CWS.Storage.prototype.storageCheckKeys = function () 
	{
		var data = this.storage.getItem("currentProjectCode");
		if( data === null)
		{
			data = "";
			this.saveData("currentProjectCode",data);
			this.isFirstRun = true;
		}

		data = this.storage.getItem("projects");
		if( data === null)
		{
			data = {};
			this.saveData("projects",data);
			this.isFirstRun = true;
		}
		data = this.getData("projects");
		this.projectsNameCache = {};
		for (var i in data) 
		{
			this.projectsNameCache[i] = data[i].header.machine.mtype;
		}

		data = this.storage.getItem("ideSettings");
		if( data === null)
		{
			data = {};
			this.saveData("ideSettings",data);
			this.isFirstRun = true;
		}
		
		data = this.storage.getItem("currentProjectHeader");
		if( data === null)
		{
			data = {};
			this.saveData("currentProjectHeader",data);
			this.isFirstRun = true;
		}
		data = this.getData("currentProjectHeader");
		this.currentProjectHeaderCache = data;
        if (data.name!==undefined)
            this.projectsNameCache[data.name] = data.machine.mtype;
	};

CWS.Storage.prototype.getData = function (key)
	{
		var data = this.storage.getItem(key);
		if (this.useCompression==true)
		{
			data = LZString.decompress(data);
		}
		data = JSON.parse(data);
		return data;
	};

CWS.Storage.prototype.saveData = function (key,data)
	{
		var _data = JSON.stringify(data);
		if (this.useCompression==true)
		{
			_data = LZString.compress(_data);
		}
		this.storage.setItem(key,_data);
	};

CWS.Storage.prototype.saveCurrentProjectCode = function (code) 
	{
		this.saveData("currentProjectCode",code);
	};

CWS.Storage.prototype.saveCurrentProjectHeader = function (header) 
	{
		this.currentProjectHeaderCache = header;
		this.saveData("currentProjectHeader",header);
	};

CWS.Storage.prototype.saveProjects = function (projects) 
	{
		this.projectsNameCache = {};
		for (var i in projects) 
		{
			this.projectsNameCache[i] = projects[i].header.machine.mtype;
		};
		this.saveData("projects",projects);
	};
// Create a new project.
// If the project already exists and unique name will be created.
// Set saveCurrent to true to make sure the current opened project will be saved.
CWS.Storage.prototype.createNewProject = function (projectName,machine,saveCurrent) 
	{
		if (saveCurrent==true)
			this.saveCurrentProjectToProjectsList();
		var project = CWS.Project.createDefaultProject(machine);
		project.header.name = this.getUniqueProjectName(projectName);
		this.saveCurrentProjectCode(project.code);
		this.saveCurrentProjectHeader(project.header);
        this.projectsNameCache[project.header.name]=project.header.machine.mtype;
		return project.projectName;
	};

CWS.Storage.prototype.loadProject = function (projectName,saveCurrent) 
	{
		if (saveCurrent==true)
			this.saveCurrentProjectToProjectsList();
		var projects = this.getData("projects");
		if (projects[projectName]!==undefined)
		{
			this.saveCurrentProjectHeader(projects[projectName].header);
			this.saveCurrentProjectCode(projects[projectName].code);
		}
	};

CWS.Storage.prototype.saveCurrentProjectToProjectsList = function () 
	{
		var currentProject = {};
		currentProject.header = this.getData("currentProjectHeader");
		if (currentProject.header.name===undefined)
			return;
		currentProject.code = this.getData("currentProjectCode");
		var projects = this.getData("projects");
		projects[currentProject.header.name] = currentProject;
		this.saveProjects(projects);
	};

CWS.Storage.prototype.getUniqueProjectName = function (projectName) 
	{
		if (projectName in this.projectsNameCache)
		{
			var i=0;
			var key;
			do
			{
				i++;
				key=projectName+"("+i+")";
			}while(key in this.projectsNameCache);
			projectName = key;
		}
		return projectName;
	};

CWS.Storage.prototype.reset = function () 
	{
		this.storage.clear();
	}
