/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


var CWS = {};

importScripts("parser.js");
importScripts("interpreter.js");

var parser;
var interpreter;
var machineType;


function init (header) 
{
	parser 		= new CWS.Parser();
	interpreter = new CWS.Interpreter(header.machine);
}

function runCode (data) 
{
	var code = data.code;
	var errList = [];
	try 
	{
		parser.parseCode(code);	
	} catch(e) 
	{
		errList.push(String(e));
	}
	while(cmd=parser.getCommand())
	{
		try 
		{
			interpreter.runCommand(cmd);
		} 
		catch(e) 
		{
			errList.push(String(e));
		}
	}

	var l = interpreter.outputCommands.length*2*3;
	var positions = new Float32Array( l );
	var color = new Float32Array( interpreter.outputCommands.length*2);
	var triangles;
	if (data.header.machine.mtype==="3D Printer")
		triangles = new Float32Array( l*3*4 );
	var i=0;
	var c=0;
	var i2=0;
	if (data.header.machine.mtype==="3D Printer" && data.run3D===true)
	{
		d = data.header.workpiece.diameter;
		var d=0.4/2;
		while (i<l)
		{
			var cmd=interpreter.getCommand();

			positions[ i + 0 ] = cmd.x0;
			positions[ i + 1 ] = cmd.y0;
			positions[ i + 2 ] = cmd.z0;
			
			positions[ i + 3 ] = cmd.x1;
			positions[ i + 4 ] = cmd.y1;
			positions[ i + 5 ] = cmd.z1;

			vx=(cmd.x1-cmd.x0);
			vy=(cmd.y1-cmd.y0);
			N =Math.sqrt(vx*vx+vy*vy);

			Ux=-vy/N*d;
			Uy=vx/N*d;

			dx=cmd.x1-cmd.x0;
			dy=cmd.y1-cmd.y0;

			px=[Ux+cmd.x0,-Ux+cmd.x0];
			py=px+[dx,dy];

			p1=[cmd.x0,cmd.cmd.y0];
			p2=[cmd.x1,cmd.y1];
			p3=[Ux+cmd.x0,Uy+cmd.y0];
			p4=[p3[0]+dx,p3[1]+dy];
			p5=[-Ux+cmd.x0,-Uy+cmd.y0];
			p6=[p5[0]+dx,p5[1]+dy];
			//     p4   p2   p6
			//     /    /    /
			//    /    /    /
			//   /    /    /
			//  /    /    /
			// p3   p1   p5

			triangles[i2+0] = p5[0];
			triangles[i2+1] = p5[1];
			triangles[i2+2] = cmd.z0-d;

			triangles[i2+3] = p6[0];
			triangles[i2+4] = p6[1];
			triangles[i2+5] = cmd.z0-d;

			triangles[i2+6] = p5[0];
			triangles[i2+7] = p5[1];
			triangles[i2+8] = cmd.z1+d;

			triangles[i2+9 ] = p6[0];
			triangles[i2+10] = p6[1];
			triangles[i2+11] = cmd.z0-d;

			triangles[i2+12] = p6[0];
			triangles[i2+13] = p6[1];
			triangles[i2+14] = cmd.z0+d;

			triangles[i2+15] = p5[0];
			triangles[i2+16] = p5[1];
			triangles[i2+17] = cmd.z1+d;

			i2+=18;

			//////////////////////////

			triangles[i2+0] = p3[0];
			triangles[i2+1] = p3[1];
			triangles[i2+2] = cmd.z0+d;

			triangles[i2+3] = p4[0];
			triangles[i2+4] = p4[1];
			triangles[i2+5] = cmd.z0-d;

			triangles[i2+6] = p3[0];
			triangles[i2+7] = p3[1];
			triangles[i2+8] = cmd.z1-d;

			triangles[i2+9 ] = p4[0];
			triangles[i2+10] = p4[1];
			triangles[i2+11] = cmd.z0+d;

			triangles[i2+12] = p4[0];
			triangles[i2+13] = p4[1];
			triangles[i2+14] = cmd.z1-d;

			triangles[i2+15] = p3[0];
			triangles[i2+16] = p3[1];
			triangles[i2+17] = cmd.z1+d;

			i2+=18;

			//////////////////////////

			triangles[i2+0] = p5[0];
			triangles[i2+1] = p5[1];
			triangles[i2+2] = cmd.z0-d;

			triangles[i2+3] = p3[0];
			triangles[i2+4] = p3[1];
			triangles[i2+5] = cmd.z0-d;

			triangles[i2+6] = p4[0];
			triangles[i2+7] = p4[1];
			triangles[i2+8] = cmd.z1-d;

			triangles[i2+9 ] = p5[0];
			triangles[i2+10] = p5[1];
			triangles[i2+11] = cmd.z0-d;

			triangles[i2+12] = p4[0];
			triangles[i2+13] = p4[1];
			triangles[i2+14] = cmd.z1-d;

			triangles[i2+15] = p6[0];
			triangles[i2+16] = p6[1];
			triangles[i2+17] = cmd.z1-d;

			i2+=18;
			///////////////////////////
			//     p4   p2   p6
			//     /    /    /
			//    /    /    /
			//   /    /    /
			//  /    /    /
			// p3   p1   p5

			triangles[i2+0] = p5[0];
			triangles[i2+1] = p5[1];
			triangles[i2+2] = cmd.z0+d;

			triangles[i2+3] = p4[0];
			triangles[i2+4] = p4[1];
			triangles[i2+5] = cmd.z0+d;

			triangles[i2+6] = p3[0];
			triangles[i2+7] = p3[1];
			triangles[i2+8] = cmd.z1+d;

			triangles[i2+9 ] = p6[0];
			triangles[i2+10] = p6[1];
			triangles[i2+11] = cmd.z0+d;

			triangles[i2+12] = p4[0];
			triangles[i2+13] = p4[1];
			triangles[i2+14] = cmd.z1+d;

			triangles[i2+15] = p5[0];
			triangles[i2+16] = p5[1];
			triangles[i2+17] = cmd.z1+d;

			i2+=18;

			color[c]   = cmd.ctype;
			color[c+1] = cmd.ctype;

			c+=2;
			i+=6;
		}
	}
	else
	{
		while (i<l)
		{
			var cmd=interpreter.getCommand();

			positions[ i + 0 ] = cmd.x0;
			positions[ i + 1 ] = cmd.y0;
			positions[ i + 2 ] = cmd.z0;

			positions[ i + 3 ] = cmd.x1;
			positions[ i + 4 ] = cmd.y1;
			positions[ i + 5 ] = cmd.z1;

			color[c]   = cmd.ctype;
			color[c+1] = cmd.ctype;

			c+=2;
			i+=6;
		}
	}
	return {positions:positions,color:color,triangles:triangles,run3D:data.run3D,run2D:data.run2D,error:errList};
}

onmessage = function (ev) 
{
	init(ev.data.header);
	var result;
	result = runCode(ev.data);
	postMessage(result);
};