/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */

CWS.Controller = function (editor,storage,renderer,motion,autoRun) 
	{
		this.storage = storage;
		this.editor = editor;
		this.renderer = renderer;
        this.motion = motion;
        this.motion.setController(this);
        this.saveFlag = 0;
        this.autoRun = false;
        this.run3D = true;
        this.run2D = true;

        this.createDatGUI();
        // Init the storage
        if (this.storage.isFirstRun)
            {
                this.createProject({projectName:"Untitled",machineType:"Lathe"});
            }
        else
            {
                this.openProject(this.storage.header.name);
            }
        // Init the editor
        var controller = this;
        this.editor.subscribeToCodeChanged(function (code,ev) 
        {
            controller.save();
        });
        this.editor.subscribeToCodeChanged(function (code,ev) 
        {
            controller.runInterpreter();
        });
        // Add the renderer to the container
        document.getElementById("canvasContainer").appendChild(renderer.domElement);
        // Create controls
        this.controls = new THREE.TrackballControls( this.renderer.camera ,this.renderer.domElement);
        this.controls.rotateSpeed = 5.0;
        this.controls.zoomSpeed = 2;
        this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;
        // Set renderer size
        this.windowResize();
        // Save changes every 5 seconds
        setInterval(function () 
            {
                if (controller.saveFlag===0)
                    return;
                controller.saveFlag = Infinity;
                controller.save(); 
            }, 5000);
        this.autoRun = autoRun;
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
        this.loadMachine();
		this.editor.setCode(this.storage.code);
	};

CWS.Controller.prototype.loadMachine = function()
    {
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
    };

CWS.Controller.prototype.openMachine = function(machine)
    {
		this.storage.machine = CWS.Project.createDefaultMachine(machine);
        this.storage.workpiece = CWS.Project.createDefaultWorkpiece(machine);
        this.loadMachine();
        this.runInterpreter();
	};

CWS.Controller.prototype.workpieceDimensions = function(dimensions)
	{
		this.storage.workpiece.dimension = dimensions;
	};

CWS.Controller.prototype.getMachineType = function()
	{
		return this.storage.machineType;
	};

CWS.Controller.prototype.getMachine = function()
    {
        return this.storage.machine;
    };

CWS.Controller.prototype.setMachineTool = function(tool)
    {
        this.storage.machine.tool.radius = parseFloat(tool['toolradius']);
        this.storage.machine.tool.angle = parseFloat(tool['toolangle']);
        this.machine.updateTool();
        this.updateWorkpieceDraw();
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
        if (this.machine.mtype=="3D Printer")
            this.runInterpreter();
        else
            this.updateWorkpieceDraw();
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

CWS.Controller.prototype.setEditor = function()
    {
        this.editor.codeChanged();
    };

CWS.Controller.prototype.windowResize = function()
    {
        var maincanvasdiv = document.getElementById("canvasContainer");
        this.controls.handleResize();
        this.renderer.setSize(maincanvasdiv.offsetWidth,maincanvasdiv.offsetHeight);
    };

CWS.Controller.prototype.render = function()
    {
        this.controls.update();
        this.renderer.render();
    };

CWS.Controller.prototype.save = function(forceSave)
    {
        // Set the number of changes to save the code
        var changes = 5;
        if (forceSave===true)
            this.saveFlag=Infinity;    
        this.saveFlag++;
        // Don't save
        if (this.saveFlag<changes)
        {
            $("#saveIcon").css('color', 'red');
        }
        // Save
        else
        {
            $("#saveIcon").css('color', 'green');
            this.saveFlag=0;
            this.storage.code = this.editor.getCode();
        }
    };

CWS.Controller.prototype.runInterpreter = function(forceRun)
    {
        if (this.autoRun===false && forceRun!==true)
            return;
        var code = this.editor.getCode();
        this.motion.setData({ header:this.storage.header,
                                code:code,
                                run3D:this.run3D,run2D:this.run2D});
        this.motion.run();
    };

CWS.Controller.prototype.updateWorkpieceDraw = function()
    {
        var mesh;
        mesh = this.machine.create2DWorkpieceLimits();
        this.renderer.updateMesh(mesh);
        mesh = this.machine.create2DWorkpiece();
        this.renderer.updateMesh(mesh);
        mesh = this.machine.create3DWorkpiece();
        this.renderer.updateMesh(mesh);
    };