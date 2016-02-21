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
                material3D: this.material3D,
				workpiece: this.storage.workpiece,
				renderResolution: 512});
		}
		else if (this.storage.machineType=="Mill")
		{
            document.getElementById('machineIcon').className = "icon-mill";
			this.machine = new CWS.Mill({
				machine: this.storage.machine,
                material3D: this.material3D,
				workpiece: this.storage.workpiece,
				renderResolution: 512});
		}
		else if (this.storage.machineType=="3D Printer")
		{
			document.getElementById('machineIcon').className = "icon-printer";
            this.machine = new CWS.Printer({
				machine: this.storage.machine,
                material3D: this.material3D,
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
                material3D: this.material3D,
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
                material3D: this.material3D,
				renderResolution: 512});
		}
		else if (machine=="3D Printer")
		{
            this.storage.machine = CWS.Project.createDefaultMachine(machine);
            this.storage.workpiece = CWS.Project.createDefaultWorkpiece(machine);
			document.getElementById('machineIcon').className = "icon-printer";
            this.machine = new CWS.Printer({
				machine: this.storage.machine,
                material3D: this.material3D,
				workpiece: this.storage.workpiece});
		}
        this.runGCode();
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
        this.machine.updateWorkpieceDimensions();
        this.runGCode();
	};

CWS.Controller.prototype.exportToOBJ = function()
	{
        console.log("Exporting");
        var filename = this.storage.header.name;
        // Problem with STL Exporter
        var exporter = new THREE.STLBinaryExporter ();
		var result = exporter.parse (this.renderer.scene);
        var element = document.createElement('a');
        var blob = new Blob([result], {type: 'text/plain'});
        element.setAttribute('href', URL.createObjectURL(blob));
        element.setAttribute('download', filename+".stl");

        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
	};

CWS.Controller.prototype.createDatGUI = function ()
    {
        if (document.getElementById("gui"))
            document.getElementById("gui").remove();
        
        var material3D = new THREE.MeshStandardMaterial(
        { 
            color: 0xff4400,
            shading: THREE.SmoothShading,
            emissive: 0xff4400,
            blending:0,
            alphaTest:0,
            transparent:false,
            wireframe:false,
            refractionRatio:0.98,
        });
		material3D.metalness=0.0;
        material3D.roughness=0.0;
        material3D.opacity=1;
        material3D.visible=true;
        material3D.side = THREE.DoubleSide;
        
        function handleColorChange ( color )
        {
            return function ( value )
            {
                if (typeof value === "string") 
                {
                    value = value.replace('#', '0x');
                }
                color.setHex( value );
            };
        };
        var gui = new dat.GUI({ autoPlace: false });
        gui.domElement.id = 'gui';
        gui.close();
        document.getElementById("canvasContainer").appendChild(gui.domElement);
        var data = 
        {
            color : material3D.color.getHex(),
            emissive : material3D.emissive.getHex(),
        };
        var folder = gui.addFolder('Material');
        //        folder.add( material3D,'transparent');
        //        folder.add( material3D, 'opacity', 0, 1 );
        folder.add( material3D, 'metalness', 0, 1 );
        folder.add( material3D, 'roughness', 0, 1 );
        folder.add( material3D, 'visible' );
        folder.addColor( data, 'color' ).onChange( handleColorChange( material3D.color ) );
        folder.addColor( data, 'emissive' ).onChange( handleColorChange( material3D.emissive ) );
        folder.add( material3D, 'wireframe' );
        //        folder.add( material3D, 'refractionRatio', 0, 1 );
    
        this.material3D = material3D;
    };

CWS.Controller.prototype.runGCode = function()
    {
        this.editor.codeChanged();
    };
