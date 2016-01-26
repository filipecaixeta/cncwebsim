importScripts("parser.js");
importScripts("interpreter.js");

var parser;
var interpreter;
var machineType;


function init (header) 
{
	parser 		= new Parser();
	interpreter = new Interpreter(header.machine);
}

function runCode (data) 
{
	var code = data.code;
	parser.parseCode(code);
	while(cmd=parser.getCommand())
	{
		interpreter.runCommand(cmd);
	}

	var l = interpreter.outputCommands.length*2*3;
	var positions = new Float32Array( l );
	var color = new Float32Array( interpreter.outputCommands.length*2);
	var i=0;
	var c=0;

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

	return {positions:positions,color:color,header:data.header};
}

function runCodeMill (code) 
{
	parser.parseCode(code);
	while(cmd=parser.getCommand())
	{
		interpreter.runCommand(cmd);
	}

	var l = interpreter.outputCommands.length*2*3;
	var positions = new Float32Array( l );
	var color = new Float32Array( interpreter.outputCommands.length*2);
	var i=0;
	var c=0;

	var tri = new Float32Array( l*3 );

	var i2=0;
	while (i<l)
	{
		var cmd=interpreter.getCommand();

		positions[ i + 0 ] = cmd.x0;
		positions[ i + 1 ] = cmd.y0;
		positions[ i + 2 ] = cmd.z0;
		
		positions[ i + 3 ] = cmd.x1;
		positions[ i + 4 ] = cmd.y1;
		positions[ i + 5 ] = cmd.z1;

		d=1;

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

		tri[i2+0] = p5[0];
		tri[i2+1] = p5[1];
		tri[i2+2] = cmd.z0;

		tri[i2+3] = p3[0];
		tri[i2+4] = p3[1];
		tri[i2+5] = cmd.z0;

		tri[i2+6] = p4[0];
		tri[i2+7] = p4[1];
		tri[i2+8] = cmd.z1;

		tri[i2+9 ] = p5[0];
		tri[i2+10] = p5[1];
		tri[i2+11] = cmd.z0;

		tri[i2+12] = p4[0];
		tri[i2+13] = p4[1];
		tri[i2+14] = cmd.z1;

		tri[i2+15] = p6[0];
		tri[i2+16] = p6[1];
		tri[i2+17] = cmd.z1;

		color[c]   = cmd.ctype;
		color[c+1] = cmd.ctype;

		c+=2;
		i+=6;
		i2+=18;
	}

	return {positions:positions,color:color,triangles:tri};
}
onmessage = function (ev) 
{
	init(ev.data.header);
	var result;
	// if (ev.data.machineType=="Mill")
	// 	result = runCodeMill(ev.data.code);
	// else
		result = runCode(ev.data);
	postMessage(result);
};