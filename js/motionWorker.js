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
	return {positions:positions,color:color,error:errList};
}

onmessage = function (ev) 
{
	init(ev.data.header);
	var result;
	result = runCode(ev.data);
	postMessage(result);
};