/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */

CWS.Controller = function () 
	{
		this.storage = null;
		this.editor = null;
		this.machine = null;
	};

CWS.Controller.prototype.constructor = CWS.Controller;

CWS.Controller.prototype.createProject = function(data)
	{
        if (data['projectName']=="" || data['projectName']===undefined)
             return;
		var projectName = this.storage.createNewProject(data['projectName'],data['machineType'],true);
        this.openProject(projectName);
		return projectName;
	};

CWS.Controller.prototype.listProjects = function()
	{
		return this.storage.projectNames;
	};

CWS.Controller.prototype.openProject = function(projectName)
	{
		this.storage.loadProject(projectName,true);
        if (this.storage.machineType=="Lathe")
		{
            document.getElementById('machineIcon').className = "icon-lathe";
			this.machine = new CWS.Lathe({
				machine: this.storage.machine,
				workpiece: this.storage.workpiece,
				renderResolution: 2048});
		}
		else if (this.storage.machineType=="Mill")
		{
            document.getElementById('machineIcon').className = "icon-mill";
			this.machine = new CWS.Mill({
				machine: this.storage.machine,
				workpiece: this.storage.workpiece,
				renderResolution: 512});
		}
		else if (this.storage.machineType=="3D Printer")
		{
			document.getElementById('machineIcon').className = "icon-printer";
            this.machine = new CWS.Printer({
				machine: this.storage.machine,
				workpiece: this.storage.workpiece});
		}
		this.editor.setCode(this.storage.code);
	};

CWS.Controller.prototype.openMachine = function(machine)
	{
		if (machine=="Lathe")
		{
			this.storage.machine = CWS.Project.createDefaultMachine(machine);
            this.storage.workpiece = CWS.Project.createDefaultWorkpiece(machine);
            document.getElementById('machineIcon').className = "icon-lathe";
			this.machine = new CWS.Lathe({
				machine: this.storage.machine,
				workpiece: this.storage.workpiece,
				renderResolution: 512});
		}
		else if (machine=="Mill")
		{
			this.storage.machine = CWS.Project.createDefaultMachine(machine);
            this.storage.workpiece = CWS.Project.createDefaultWorkpiece(machine);
            document.getElementById('machineIcon').className = "icon-mill";
			this.machine = new CWS.Mill({
				machine: this.storage.machine,
				workpiece: this.storage.workpiece,
				renderResolution: 512});
		}
		else if (machine=="3D Printer")
		{
            this.storage.machine = CWS.Project.createDefaultMachine(machine);
            this.storage.workpiece = CWS.Project.createDefaultWorkpiece(machine);
			document.getElementById('machineIcon').className = "icon-printer";
            this.machine = new CWS.Printer({
				machine: this.storage.machine,
				workpiece: this.storage.workpiece});
		}
	};

CWS.Controller.prototype.workpieceDimensions = function(dimensions)
	{
		this.storage.workpiece.dimension = dimensions;
	};

CWS.Controller.prototype.getMachineType = function()
	{
		return this.storage.machineType;
	};

CWS.Controller.prototype.getWorkpiece = function()
	{
		return this.storage.workpiece;
	};

CWS.Controller.prototype.setWorkpieceDimensions = function(dimensions)
	{
        var workpiece = this.storage.workpiece;
        for (var i in dimensions)
        {
            workpiece[i] = dimensions[i];
        }
        this.storage.workpiece = workpiece;
	};