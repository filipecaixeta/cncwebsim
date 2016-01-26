function Lathe (options)
{
	if(this === window)
        return new Lathe(options);

	this.renderResolution = options.renderResolution||200;
	this.workpiece = options.workpiece;
	this.machine = options.machine;
	
	this.lineColors = options.lineColors || {g0: new THREE.Color(1,0,0),
		g1: new THREE.Color(0,0,1),g2: new THREE.Color(1,0,1),g3: new THREE.Color(0,1,1),};
	
	this._machine=null;
	this._workpiece=null;

	this.init();
}
Lathe.prototype = 
{
    get machine()
    {
        return this._machine;
    },
    set machine(val)
    {
        this._machine=val;
    },
    get workpiece()
    {
        return this._workpiece;
    },
    set workpiece(val)
    {
        this._workpiece=val;
        this.R = val.diameter/2;
		this.L = val.len;
    },
}
Lathe.prototype.init = function () 
{
	this.initL1();
	this.init2D();
}
// Initialize the WebGL 2D renderer for rendering Level 1 of the workpiece
Lathe.prototype.initL1 = function () 
{
	this.linesVertexPositionBuffer = undefined;

	this._canvas =  document.createElement('canvas');
	// document.body.appendChild(this._canvas);
	var attributes = 
	{
		alpha: false,
		depth: true,
		stencil: false,
		antialias: false,
		premultipliedAlpha: false,
		preserveDrawingBuffer: true
	};
	this.glL1=this._canvas.getContext( 'webgl', attributes ) || this._canvas.getContext( 'experimental-webgl', attributes);
	if ( this.glL1 === null ) 
		throw 'Error creating WebGL context.';

    this.glL1.enable(this.glL1.DEPTH_TEST);

    var fragmentShader = this.getShader(this.glL1, "shader-fs");
    var vertexShader = this.getShader(this.glL1, "shader-vs");

    this.shaderProgram = this.glL1.createProgram();
    this.glL1.attachShader(this.shaderProgram, vertexShader);
    this.glL1.attachShader(this.shaderProgram, fragmentShader);
    this.glL1.linkProgram(this.shaderProgram);

    if (!this.glL1.getProgramParameter(this.shaderProgram, this.glL1.LINK_STATUS))
      alert("Could not initialise shaders");

    this.glL1.useProgram(this.shaderProgram);
    this.shaderProgram.maxLUniform = this.glL1.getUniformLocation(this.shaderProgram, "maxL");
    this.shaderProgram.maxRUniform = this.glL1.getUniformLocation(this.shaderProgram, "maxR");
    this.shaderProgram.vertexPositionAttribute = this.glL1.getAttribLocation(this.shaderProgram, "position");
    this.glL1.uniform1f(this.shaderProgram.maxLUniform, this.L);
    this.glL1.uniform1f(this.shaderProgram.maxRUniform, this.R);
    
    this.material = {
			"Orange": 	new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: textureCube3d, combine: THREE.MixOperation, reflectivity: 0.3 } ),
			"Blue": 	new THREE.MeshLambertMaterial( { color: 0x001133, envMap: textureCube3d, combine: THREE.MixOperation, reflectivity: 0.3 } ),
			"Red": 		new THREE.MeshLambertMaterial( { color: 0x660000, envMap: textureCube3d, combine: THREE.MixOperation, reflectivity: 0.25 } ),
			"Black": 	new THREE.MeshLambertMaterial( { color: 0x000000, envMap: textureCube3d, combine: THREE.MixOperation, reflectivity: 0.15 } ),
			"White":	new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: textureCube3d, combine: THREE.MixOperation, reflectivity: 0.25 } ),

			"Carmine": 	new THREE.MeshPhongMaterial( { color: 0x770000, specular:0xffaaaa, envMap: textureCube3d, combine: THREE.MultiplyOperation } ),
			"Gold": 	new THREE.MeshPhongMaterial( { color: 0xaa9944, specular:0xbbaa99, shininess:50, envMap: textureCube3d, combine: THREE.MultiplyOperation } ),
			"Bronze":	new THREE.MeshPhongMaterial( { color: 0x150505, specular:0xee6600, shininess:10, envMap: textureCube3d, combine: THREE.MixOperation, reflectivity: 0.25 } ),
			"Chrome": 	new THREE.MeshPhongMaterial( { color: 0xffffff, specular:0xffffff, envMap: textureCube3d, combine: THREE.MultiplyOperation } ),

			"Orange metal": new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: textureCube3d, combine: THREE.MultiplyOperation } ),
			"Blue metal": 	new THREE.MeshLambertMaterial( { color: 0x001133, envMap: textureCube3d, combine: THREE.MultiplyOperation } ),
			"Red metal": 	new THREE.MeshLambertMaterial( { color: 0x770000, envMap: textureCube3d, combine: THREE.MultiplyOperation } ),
			"Green metal": 	new THREE.MeshLambertMaterial( { color: 0x007711, envMap: textureCube3d, combine: THREE.MultiplyOperation } ),
			"Black metal":	new THREE.MeshLambertMaterial( { color: 0x222222, envMap: textureCube3d, combine: THREE.MultiplyOperation } ),

			"Pure chrome": 	new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: textureCube3d } ),
			"Dark chrome":	new THREE.MeshLambertMaterial( { color: 0x444444, envMap: textureCube3d } ),
			"Darker chrome":new THREE.MeshLambertMaterial( { color: 0x222222, envMap: textureCube3d } ),

			"Black glass": 	new THREE.MeshLambertMaterial( { color: 0x101016, envMap: textureCube3d, opacity: 0.975, transparent: true } ),
			"Dark glass":	new THREE.MeshLambertMaterial( { color: 0x101046, envMap: textureCube3d, opacity: 0.25, transparent: true } ),
			"Blue glass":	new THREE.MeshLambertMaterial( { color: 0x668899, envMap: textureCube3d, opacity: 0.75, transparent: true } ),
			"Light glass":	new THREE.MeshBasicMaterial( { color: 0x223344, envMap: textureCube3d, opacity: 0.25, transparent: true, combine: THREE.MixOperation, reflectivity: 0.25 } ),

			"Red glass":	new THREE.MeshLambertMaterial( { color: 0xff0000, opacity: 0.75, transparent: true } ),
			"Yellow glass":	new THREE.MeshLambertMaterial( { color: 0xffffaa, opacity: 0.75, transparent: true } ),
			"Orange glass":	new THREE.MeshLambertMaterial( { color: 0x995500, opacity: 0.75, transparent: true } ),

			"Orange glass 50":	new THREE.MeshLambertMaterial( { color: 0xffbb00, opacity: 0.5, transparent: true } ),
			"Red glass 50": 	new THREE.MeshLambertMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } ),

			"Fullblack rough":	new THREE.MeshLambertMaterial( { color: 0x000000 } ),
			"Black rough":		new THREE.MeshLambertMaterial( { color: 0x050505 } ),
			"Darkgray rough":	new THREE.MeshLambertMaterial( { color: 0x090909 } ),
			"Red rough":		new THREE.MeshLambertMaterial( { color: 0x330500 } ),

			"Darkgray shiny":	new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x050505 } ),
			"Gray shiny":		new THREE.MeshPhongMaterial( { color: 0x050505, shininess: 20 } ),
			

			"cubeMaterial3": new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: textureCube3d, combine: THREE.MixOperation, reflectivity: 0.3 } ),
			"cubeMaterial2": new THREE.MeshLambertMaterial( { color: 0xffee00, envMap: textureCube3d, refractionRatio: 0.95 } ),
			"cubeMaterial1": new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: textureCube3d } ),
			
			"mat1": new THREE.MeshPhongMaterial( { specular: 0x101010, shininess: 50, envMap: textureCube3d, combine: THREE.MixOperation, reflectivity: 0.7, side: THREE.DoubleSide } ),
		};
	this.setRendererResolution();
    this.clearL1();
};
Lathe.prototype.setRendererResolution = function (renderResolution) 
{
	this.renderResolution = renderResolution || this.renderResolution;
	this.pixels = new Uint8Array(this.renderResolution*4);
	this.dataLevel1 = new Float32Array(this.renderResolution);
	this._canvas.width  = this.renderResolution;
	this._canvas.height = 1;
	this.glL1.viewportWidth = this.renderResolution;
    this.glL1.viewportHeight = 1;
    this.glL1.viewport(0, 0, this.glL1.viewportWidth, this.glL1.viewportHeight);
}
Lathe.prototype.renderL1 = function () 
{
	this.glL1.clear(this.glL1.DEPTH_BUFFER_BIT);
	this.glL1.uniform1f(this.shaderProgram.maxLUniform, this.L);
    this.glL1.uniform1f(this.shaderProgram.maxRUniform, this.R);
	this.glL1.bindBuffer(this.glL1.ARRAY_BUFFER, this.linesVertexPositionBuffer);
	this.glL1.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.linesVertexPositionBuffer.itemSize, this.glL1.FLOAT, false, 0, 0);
	this.glL1.drawArrays(this.glL1.LINE_STRIP, 0, this.linesVertexPositionBuffer.numItems);
	this.glL1.flush();
};
Lathe.prototype.getShader = function (gl, id) 
{
	var shaderScript = document.getElementById(id);
	if (!shaderScript) 
	  return null;
	
	var str = "";
	var k = shaderScript.firstChild;
	while (k) 
	{
	  if (k.nodeType == 3)
	      str += k.textContent;
	  k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") 
	  shader = this.glL1.createShader(this.glL1.FRAGMENT_SHADER);
	else if (shaderScript.type == "x-shader/x-vertex")
	  shader = this.glL1.createShader(this.glL1.VERTEX_SHADER);
	else
	  return null;

	this.glL1.shaderSource(shader, str);
	this.glL1.compileShader(shader);

	if (!this.glL1.getShaderParameter(shader, this.glL1.COMPILE_STATUS)) 
	{
	  throw this.glL1.getShaderInfoLog(shader);
	}

	return shader;
};
Lathe.prototype.createLinesL1 = function (positions) 
{
	if (this.linesVertexPositionBuffer!=undefined)
		try
		{
			gl.deleteBuffer(this.linesVertexPositionBuffer);
		}catch(e){}

    this.linesVertexPositionBuffer = this.glL1.createBuffer();
    this.glL1.bindBuffer(this.glL1.ARRAY_BUFFER, this.linesVertexPositionBuffer);
    this.glL1.bufferData(this.glL1.ARRAY_BUFFER, positions, this.glL1.STATIC_DRAW);
    this.linesVertexPositionBuffer.itemSize = 3;
    this.linesVertexPositionBuffer.numItems = positions.length/3;
    this.glL1.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
};
Lathe.prototype.calcL1 = function () 
{
	this.glL1.readPixels(
		0, 0, this.renderResolution, 1,this.glL1.RGBA,this.glL1.UNSIGNED_BYTE, this.pixels);
	for (var i = 0; i < this.pixels.length; i+=4) 
	{
		r=this.pixels[i];
		g=this.pixels[i+1]/100.0;
		b=this.pixels[i+2]/10000.0;
		v=r+g+b;
		this.dataLevel1[i/4]=v;
	};
};
Lathe.prototype.clearL1 = function () 
{
	this.glL1.clearColor(this.R/255, 0,0, 0);
	this.glL1.clear(this.glL1.DEPTH_BUFFER_BIT | this.glL1.COLOR_BUFFER_BIT );
};
Lathe.prototype.create3DWorkpiece = function () 
{
	materialKey="Gold";
	this.material[materialKey].shading=THREE.SmoothShading;
	var points = [];
	seg=this.L/this.dataLevel1.length;
	points.push(new THREE.Vector3(0,0,-this.L/2));
	for ( var i = 0; i < this.dataLevel1.length; i++ ) 
	{
		points.push(new THREE.Vector3(this.dataLevel1[i],0,i*seg-this.L/2));
	}
	points.push(new THREE.Vector3(0,0,this.L/2));
	var geometry = new THREE.LatheGeometry( points,60 );
	var lathe = new THREE.Mesh( geometry, this.material[materialKey] );
	lathe.rotation.y = 1.75;
	lathe.scale.multiplyScalar(4);
	// clearScene();
	lathe.name="3Dworkpiece";
	remove3DWorkpiece();
	self.scene3d.add( lathe );
	// camera3d.position.set(scene3d.position.x,scene3d.position.y,4000);
	// camera3d.lookAt(scene3d.position);
	renderer3d.clear();
};
Lathe.prototype.create2DWorkpiece = function (positions,colors) 
{
	var lineGeometry = new THREE.Geometry();
	var vertArray = lineGeometry.vertices;
	vertArray.push( new THREE.Vector3(this.R,0,0), new THREE.Vector3(this.R,0, this.L) ,
		new THREE.Vector3(0,0, this.L),new THREE.Vector3(0,0,0),new THREE.Vector3(this.R,0,0) );
	lineGeometry.computeLineDistances();
	var lineMaterial = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2, gapSize: 1 } );
	var line = new THREE.Line( lineGeometry, lineMaterial );
	line.name="2DworkpieceDash";
	line.rotation.x=Math.PI/2;
	line.rotation.y=Math.PI/2;
	self.scene2d.remove(self.scene2d.getObjectByName(line.name));
	self.scene2d.add(line);


	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'vcolor', new THREE.BufferAttribute( colors, 1 ) );
	geometry.computeBoundingSphere();
	var mesh = new THREE.Line( geometry, this.material2d );
	mesh.name="2Dworkpiece";
	remove2DWorkpiece();
	mesh.rotation.x=Math.PI/2;
	mesh.rotation.y=Math.PI/2;
	self.scene2d.add( mesh );
	// camera2d.position.set(scene2d.position.x,scene2d.position.y,400);
	// camera2d.lookAt(scene2d.position);
};
Lathe.prototype.init2D = function () 
{
	this.material2d = new THREE.ShaderMaterial( {
					uniforms: {
						g0: { type: "c", value: this.lineColors.g0 },
						g1: { type: "c", value: this.lineColors.g1 },
						g2: { type: "c", value: this.lineColors.g2 },
						g3: { type: "c", value: this.lineColors.g3 }
					},
					vertexShader:
	'attribute float vcolor;\n'+
	'varying float fcolor;\n'+
	'varying vec2 vUv;\n'+
	'void main()\n'+
	'{\n'+
	'	vUv = uv;\n'+
	'	fcolor = vcolor;\n'+
	'	vec4 mvPosition = modelViewMatrix * vec4( position,1.0 );\n'+
	'	gl_Position = projectionMatrix * mvPosition;\n'+
	'}'
					,
					fragmentShader: 
	'varying float fcolor;\n'+
	'uniform vec3 g0;\n'+
	'uniform vec3 g1;\n'+
	'uniform vec3 g2;\n'+
	'uniform vec3 g3;\n'+
	'varying vec2 vUv;\n'+
	'void main(void) \n'+
	'{\n'+
		'float color=floor(fcolor+0.5);\n'+
		'if (color==0.0)\n'+
			'{gl_FragColor=vec4(g0,1.0);}\n'+
		'else if (color==1.0)\n'+
			'{gl_FragColor=vec4(g1,1.0);}\n'+
		'else if (color==2.0)\n'+
			'{gl_FragColor=vec4(g2,1.0);}\n'+
		'else if (color==3.0)\n'+
			'{gl_FragColor=vec4(g3,1.0);}\n'+
		'else\n'+
			'{discard;}\n'+
	'}'
					,
					linewidth: 1,
				} );
}
Lathe.prototype.render = function (data) 
{
	this.workpiece = data.header.workpiece;
	if (useCanvas['2d']==true)
	{
		this.create2DWorkpiece(data.positions,data.color);
	}
	if (useCanvas['3d']==true)
	{
		this.clearL1();
		this.createLinesL1(data.positions);
		this.renderL1();
		this.calcL1();
		// self.geometryWorker.postMessage({machineType:self.machineType,positions:this.dataLevel1,L:this.L});
		// console.log(this.dataLevel1);
		this.create3DWorkpiece();
	}
}
