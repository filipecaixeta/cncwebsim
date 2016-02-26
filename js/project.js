/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Project = function (options) 
	{
		this.machine = options.machine || "Lathe";
	}

CWS.Project.createDefaultMachine = function (machine) 
	{
		if (machine=="Lathe")
		{
			return {
				mtype: "Lathe",
				dimension: {x:100,y:100,z:200},
				maxSpindleRPM: 100,
				home1:{x:100,y:0,z:200},
				home2:{x:0,y:0,z:0},
			};
		}
		else if (machine=="Mill")
		{
			return {
				mtype: "Mill",
				dimension: {x:500,y:500,z:500},
				maxSpindleRPM: 100,
				home1:{x:0,y:0,z:100},
				home2:{x:0,y:0,z:0},
				tool:{radius:2.5,angle:0},
			};
		}
		else if (machine=="3D Printer")
		{
			return {
				mtype: "3D Printer",
				dimension: {x:300,y:300,z:500},
				maxSpindleRPM: 100,
				maxFeedRate: {x:500,y:500,z:500},
				home1:{x:0,y:0,z:4},
				home2:{x:0,y:0,z:0},
			};
		}
		else
			console.error(machine+" Not available");
	}

CWS.Project.createDefaultWorkpiece = function (machine) 
	{
		if (machine=="Lathe")
		{
			return {
				material: "aluminum",
				x: 50,
				z: 100,
			};
		}
		else if (machine=="Mill")
		{
			return {
				material: "aluminum",
				x: 200,
				y: 200,
				z: 50,
			};
		}
		else if (machine=="3D Printer")
		{
			return {
				material: "plastic",
				diameter: 0.5,
			};
		}
		else
			console.error(machine+" Not available");
	}

CWS.Project.createDefaultCode = function (machine) 
	{
		if (machine=="Lathe")
		{
			return 	"G18 ( Plane X,Z )\n"+
					"G21 ( Millimeter )\n"+
					"G90 ( Absolute )\n"+
					"G40 ( Cancel radius compensation )\n"+
					"G92 X0 Z0 ( Offset coordinate system )\n";
		}
		else if (machine=="Mill")
		{
			return 	"G17 ( Plane X,Y )\n"+
					"G21 ( Millimeter )\n"+
					"G90 ( Absolute )\n"+
					"G40 ( Cancel radius compensation )\n"+
					"G92 X0 Y0 Z0 ( Offset coordinate system )\n";
		}
		else if (machine=="3D Printer")
		{
			return 	"G17 ( Plane X,Y )\n"+
					"G21 ( Millimeter )\n"+
					"G90 ( Absolute )\n"+
					"G40 ( Cancel radius compensation )\n"+
					"G92 X0 Y0 Z0 ( Offset coordinate system )\n";
		}
		else
			console.error(machine+" Not available");
	}

CWS.Project.createDefaultProject = function (machine) 
	{
		var project = {};
		project.header = {};
		project.header.date = new Date();
		project.header.workpiece = this.createDefaultWorkpiece(machine);
        project.header.machine = this.createDefaultMachine(machine);
		project.code = this.createDefaultCode(machine);
		return project;
	}
