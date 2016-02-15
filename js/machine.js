/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Machine = function (options) 
	{
		options = options || {};
		
		this.renderResolution = options.renderResolution||64;
		this.workpiece = options.workpiece;
		this.machine = options.machine;
		this.material = new THREE.MeshNormalMaterial({wireframe: false});
		this.lineColors = options.lineColors || {	g0: new THREE.Color(1,0,0),
													g1: new THREE.Color(0,0,1),
													g2: new THREE.Color(1,0,1),
													g3: new THREE.Color(0,1,1),};
		// For 2D drawing
		this.material2D = new THREE.ShaderMaterial( 
		{
			uniforms: {
				g0: { type: "c", value: this.lineColors.g0 },
				g1: { type: "c", value: this.lineColors.g1 },
				g2: { type: "c", value: this.lineColors.g2 },
				g3: { type: "c", value: this.lineColors.g3 }
			},
			vertexShader: CWS.SHADER["vs-lathe-mill-2D"],
			fragmentShader: CWS.SHADER["fs-lathe-mill-2D"],
			linewidth: 1,
		});
	}

CWS.Machine.prototype.constructor = CWS.Machine;

CWS.Machine.prototype.setMotion = function (motionData) 
	{
		this.motionData = motionData;
	};

CWS.Machine.prototype.create2DWorkpiece = function () 
	{
		throw new Error( "call to abstract method" );
	};

CWS.Machine.prototype.create3DWorkpiece = function () 
	{
		throw new Error( "call to abstract method" );
	};

CWS.Machine.prototype.createProgram = function (gl, vertexShader, fragmentShader) 
	{
		function compile (shaderSource,type) 
		{
		  	var shader = gl.createShader(gl[type]);
		  	gl.shaderSource(shader, shaderSource);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
			{
			  throw gl.getShaderInfoLog(shader)+"\n"+shaderSource;
			}
			return shader;
		};

		var vs = compile(vertexShader,"VERTEX_SHADER");
		var fs = compile(fragmentShader,"FRAGMENT_SHADER");

		var shaderProgram = gl.createProgram();
	    gl.attachShader(shaderProgram, vs);
	    gl.attachShader(shaderProgram, fs);
	    gl.linkProgram(shaderProgram);

	    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
	      throw "Could not initialize shaders";

	  	return shaderProgram;
	}; 
