/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Lathe = function (options)
	{
		options = options || {};
		CWS.Machine.call( this, options );
		this.linesVertexPositionBuffer = undefined;

		this.canvas = null;
		this.gl = null;

		this.initWebGL();
	}

CWS.Lathe.prototype = Object.create( CWS.Machine.prototype );

CWS.Lathe.prototype.constructor = CWS.Lathe;

CWS.Lathe.prototype.initWebGL = function () 
	{
		// For 3D drawing
		this.canvas =  document.createElement('canvas');
		var attributes = 
		{
			alpha: true,
			depth: true,
			stencil: false,
			antialias: false,
			premultipliedAlpha: false,
			preserveDrawingBuffer: true
		};
		this.gl=this.canvas.getContext( 'webgl', attributes ) || this.canvas.getContext( 'experimental-webgl', attributes);
		if ( this.gl === null ) 
			throw 'Error creating WebGL context.';
	    this.gl.enable(this.gl.DEPTH_TEST);

	    this.shaderProgram = this.createProgram(this.gl, CWS.SHADER["vs-lathe-3D"], CWS.SHADER["fs-lathe-3D"]);

	    this.shaderProgram.workpieceLengthUniform = this.gl.getUniformLocation(this.shaderProgram, "workpieceLength");
	    this.shaderProgram.workpieceRadiusUniform = this.gl.getUniformLocation(this.shaderProgram, "workpieceRadius");
	    this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "position");

	    this.setRendererResolution(this.renderResolution);
	    this.gl.clearColor(0.0,0.0,0.0,0.0);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT );
	}

CWS.Lathe.prototype.setRendererResolution = function (renderResolution) 
	{
		this.renderResolution = renderResolution || this.renderResolution;
		this.pixels = new Uint8Array(this.renderResolution*4);
		this.dataLevel1 = new Float32Array(this.renderResolution);
		this.canvas.width  = this.renderResolution;
		this.canvas.height = 1;
		this.gl.viewportWidth = this.renderResolution;
	    this.gl.viewportHeight = 1;
	    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
	};

CWS.Lathe.prototype.create3DWorkpiece = function () 
	{
		var radius = this.workpiece.x/2.0;

		this.gl.useProgram(this.shaderProgram);
		// Delete the last buffer
		if (this.linesVertexPositionBuffer!=undefined)
            try
            {
                gl.deleteBuffer(this.linesVertexPositionBuffer);
            }catch(e){}
		// Create a new buffer
	    this.linesVertexPositionBuffer = this.gl.createBuffer();
	    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.linesVertexPositionBuffer);
	    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.motionData.positions, this.gl.STATIC_DRAW);
	    this.linesVertexPositionBuffer.itemSize = 3;
	    this.linesVertexPositionBuffer.numItems = this.motionData.positions.length/3;
	    this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
		// Clear the deth buffer, and load the uniforms and atrtributes
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT );
		this.gl.uniform1f(this.shaderProgram.workpieceLengthUniform, this.workpiece.z);
	    this.gl.uniform1f(this.shaderProgram.workpieceRadiusUniform, radius);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.linesVertexPositionBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.linesVertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
		// Draw the lines
		this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.linesVertexPositionBuffer.numItems);
		// Draw everything as points to make sure vertical lines will also be rendered
		this.gl.drawArrays(this.gl.POINTS, 0, this.linesVertexPositionBuffer.numItems);
		this.gl.flush();
		// Read the rendered data and calculate the values
		this.gl.readPixels(0, 0, this.renderResolution, 1,this.gl.RGBA,this.gl.UNSIGNED_BYTE, this.pixels);
		var vDist = radius/65535.0;
		
		var dataview = new DataView( this.pixels.buffer, 0 );
		var l=this.pixels.length;
		for (var i = 0; i < l; i+=4) 
		{
			this.dataLevel1[i/4]=dataview.getUint16(i)*vDist;
		};
		

		var geometry = this.generateLatheGeometry1();

		// var geometry = this.generateLatheGeometry2();

		var lathe = new THREE.Mesh( geometry, this.material);
		lathe.rotation.y = Math.PI/2;
		// lathe.scale.multiplyScalar(1);
		lathe.name="3DWorkpiece";
		
		return lathe;
	};

CWS.Lathe.prototype.generateLatheGeometry1 = function () 
	{
		var points = [];
		var L = this.workpiece.z;
		var seg = L/(this.dataLevel1.length-1);
		points.push(new THREE.Vector3(0,0,0));
		for ( var i = 0; i < this.dataLevel1.length; i++ ) 
		{
			points.push(new THREE.Vector3(this.dataLevel1[i],0,i*seg));
		}
		points.push(new THREE.Vector3(0,0,L));
		var geometry = new THREE.LatheGeometry( points,60 );
		
		return geometry;
	};

CWS.Lathe.prototype.generateLatheGeometry2 = function () 
	{
		var sinTable = CWS.sinTable60;
		var cosTable = CWS.cosTable60;
		
		var SlicesR = 60;
		var SlicesX = this.renderResolution+1;

		var geometry = new THREE.BufferGeometry();
		var vertices = new Float32Array( SlicesX*SlicesR*3 );

		var L = this.workpiece.z;
		var seg = L/this.dataLevel1.length;
		var z=seg-L/2;
		var iv=0;

		for (var ang=0; ang<SlicesR; ang++)
		{
			vertices[iv++] = z;
			vertices[iv++] = 0;
			vertices[iv++] = 0;
		}
		for ( var i = 0; i < SlicesX-1; i++,z+=seg) 
		{
			var r=this.dataLevel1[i++]/2;
			for (var ang=0; ang<SlicesR; ang++)
			{

				vertices[iv++] = z;
				vertices[iv++] = r*sinTable[ang];
				vertices[iv++] = r*cosTable[ang];
			}
		}

		var i6=0;
		var index = new Uint32Array( (SlicesX-1)*(SlicesR-1)*6 );
		var row = 0;
		for (var i = 0; i < SlicesX-1; ++i,row+=SlicesR)
		{
			for (var j = 0; j < SlicesR-25; j++,i6+=6) 
			{
				index[i6+0] = row+j;
			    index[i6+1] = row+j+SlicesR+1;
			    index[i6+2] = row+j+SlicesR;

			    index[i6+3] = row+j+SlicesR+1;
			    index[i6+4] = row+j;
			    index[i6+5] = row+j+1;
			};
			// break;
		}

		geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.setIndex( new THREE.BufferAttribute( index, 1 ) );
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		return geometry;
	};

CWS.Lathe.prototype.create2DWorkpiece = function () 
	{
		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( this.motionData.positions, 3 ) );
		geometry.addAttribute( 'vcolor', new THREE.BufferAttribute( this.motionData.color, 1 ) );
		geometry.computeBoundingSphere();
		var mesh = new THREE.Line( geometry, this.material2D );
		mesh.name="2DWorkpiece";
		mesh.rotation.x=Math.PI/2;
		mesh.rotation.y=Math.PI/2;
		return mesh;
	};

CWS.Lathe.prototype.create2DWorkpieceLimits = function () 
	{
		var R=this.workpiece.x/2;
		var L=this.workpiece.z;
		var lineGeometry = new THREE.Geometry();
		var vertArray = lineGeometry.vertices;
		vertArray.push( new THREE.Vector3(R,0,0), new THREE.Vector3(R,0, L) ,
			new THREE.Vector3(0,0, L),new THREE.Vector3(0,0,0),new THREE.Vector3(R,0,0) );
		lineGeometry.computeLineDistances();
		var lineMaterial = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2, gapSize: 1 } );
		var line = new THREE.Line( lineGeometry, lineMaterial );
		line.name="2DWorkpieceDash";
		line.rotation.x=Math.PI/2;
		line.rotation.y=Math.PI/2;
		return line;
	};
