/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Lathe = function (options)
	{
		options = options || {};
		CWS.Machine.call( this, options );
		this.linesVertexPositionBuffer = undefined;
        this.segments = 60;
		this.canvas = null;
		this.gl = null;
		this.mtype="Lathe";

		this.initWebGL();
		this.initGeometry2D();
        this.initGeometry3D();
        this.create2DWorkpieceLimits();
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

	    this.shaderProgram1 = this.createProgram(this.gl, CWS.SHADER["vs-lathe-1-3D"], CWS.SHADER["fs-lathe-1-3D"]);

	    this.shaderProgram1.workpieceLengthUniform = this.gl.getUniformLocation(this.shaderProgram1, "workpieceLength");
	    this.shaderProgram1.workpieceRadiusUniform = this.gl.getUniformLocation(this.shaderProgram1, "workpieceRadius");
	    this.shaderProgram1.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram1, "position");

	    this.setRendererResolution(this.renderResolution);
	    this.gl.clearColor(1.0,1.0,1.0,1.0);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT );
	}

CWS.Lathe.prototype.updateWorkpieceDimensions = function ()
    {
        this.meshes.mesh3D = false;
        this.meshes.meshWorkpiece = false;
        this.create3DWorkpiece();
        this.create2DWorkpieceLimits();
    }

CWS.Lathe.prototype.updateRendererResolution = function ()
    {
        setRendererResolution(this.renderResolution);
        this.meshes.mesh3D = false;
        this.create3DWorkpiece();
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

CWS.Lathe.prototype.initGeometry2D = function () 
	{
		var geometry = new THREE.BufferGeometry();
		geometry.boundingSphere = new THREE.Sphere( new THREE.Vector3(0,0,0),99999);
        geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array([0,0,0,0,0,0]) ,3));
		geometry.addAttribute( 'vcolor', new THREE.BufferAttribute( new Float32Array([0,0]) ,1 ));
		geometry.attributes.position.dynamic = true;
		geometry.attributes.vcolor.dynamic = true;
		geometry.setDrawRange(0,Infinity);
		var mesh = new THREE.LineSegments( geometry, this.material2D );
		mesh.name = "2DWorkpiece";
		mesh.rotation.x = Math.PI/2;
		mesh.rotation.y = Math.PI/2;
		mesh.position.x = -this.workpiece.z/2;
        this.mesh2D = mesh;
    }

CWS.Lathe.prototype.initGeometry3D = function () 
	{
		this.material3D.shading = THREE.SmoothShading;
		var segments = this.segments;
        var phiStart = 0;
        var phiLength = 2*Math.PI;
		var SlicesX = this.renderResolution+2;

		var geometry = new THREE.BufferGeometry();
            geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0),99999);
		var vertices = new Float32Array( SlicesX*segments*3 );
        var uvs = new Float32Array( vertices.length );
        var index = new Uint32Array( (SlicesX-1)*(segments-1)*6 );
        
        // Pre calculate sin and cos
        var sinTable = new Float32Array( segments );
        var cosTable = new Float32Array( segments );
        var invSeg = (1/(segments-1))*phiLength;
        for (var ir=0; ir<segments; ir++)
        {
            var ang = invSeg*ir;
            cosTable[ir] = Math.cos(ang);
            sinTable[ir] = Math.sin(ang);
        }
        this.cosTable = cosTable;
        this.sinTable = sinTable;
    
        // Create the index vector
        var ii=0;
        var ifa=0;
        for ( var ix = 0; ix < SlicesX-1; ix++) 
		{    
            var ir;
            for (ir=0; ir<segments-2; ir++)
			{
                var i=ix*segments+ir;
                
                var iv=ii;
				index[ii++] = i+1+segments;
				index[ii++] = i+1;
				index[ii++] = i;
                
				index[ii++] = i;
				index[ii++] = i+segments;;
                index[ii++] = i+1+segments;
			}
            ir--;
            var i1=ix*segments+0;
            var i2=ix*segments+ir;
            index[ii++] = i1+segments;
            index[ii++] = i1;
            index[ii++] = i2+1;
              
            index[ii++] = i2+1;
            index[ii++] = i2+segments+1;
            index[ii++] = i1+segments;
        }
        // Generate the UVs
        var iv=0;
		for ( var ix = 0; ix < SlicesX; ix++) 
		{
			var r=this.dataLevel1[ix];
			for (var ir=0; ir<segments; ir++)
			{
				uvs[iv++] = ix*1/SlicesX;
				uvs[iv++] = sinTable[ir]*0.5+0.5;
				uvs[iv++] = cosTable[ir]*0.5+0.5;
			}
		}
    
        geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
		geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.setIndex( new THREE.BufferAttribute( index, 1 ) );
		geometry.attributes.position.dynamic = true;

        var mesh = new THREE.Mesh( geometry, this.material3D);
		mesh.position.x = -this.workpiece.z/2;
		mesh.name="3DWorkpiece";
    
        this.mesh3D = mesh;
    }

CWS.Lathe.prototype.generateLatheGeometry = function () 
	{
        var segments = this.segments;
		var SlicesX = this.renderResolution;
        var L = this.workpiece.z;
		var seg = L/this.dataLevel1.length;
		var z=0;
		var iv=0;
        var sinTable = this.sinTable;
        var cosTable = this.cosTable;
		var vertices = this.mesh3D.geometry.attributes.position.array;
        for (var ir=0; ir<segments; ir++)
        {
            vertices[iv++] = z;
            vertices[iv++] = 0;
            vertices[iv++] = 0;
        }
		for ( var ix = 1; ix < SlicesX; ix++,z+=seg) 
		{
			var r=this.dataLevel1[ix];
			for (var ir=0; ir<segments; ir++)
			{
				vertices[iv++] = z;
				vertices[iv++] = r*sinTable[ir];
				vertices[iv++] = r*cosTable[ir];
			}
		}
        for (var ir=0; ir<segments; ir++)
        {
            vertices[iv++] = z;
            vertices[iv++] = 0;
            vertices[iv++] = 0;
        }

        this.mesh3D.geometry.attributes.position.array = vertices;
        this.mesh3D.geometry.attributes.position.needsUpdate = true;
		this.mesh3D.geometry.computeFaceNormals();
		this.mesh3D.geometry.computeVertexNormals();
	};

CWS.Lathe.prototype.create2DWorkpieceLimits = function () 
	{
		if (this.meshes.meshWorkpiece === true)
			return;
		
		var R=this.workpiece.x/2;
		var L=this.workpiece.z;

		var geometry = new THREE.Geometry();
		// var geometry = new THREE.BufferGeometry();
		// var positions = new Float32Array([R,0,0, R,0,L, 0,0,L, 0,0,0, R,0,0]);
        // geometry.addAttribute( 'position', new THREE.BufferAttribute(positions,3));

		geometry.vertices.push( new THREE.Vector3(R,0,0), new THREE.Vector3(R,0,L) , new THREE.Vector3(0,0,L),
								new THREE.Vector3(0,0,0), new THREE.Vector3(R,0,0) );
		geometry.computeLineDistances();

		var material = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2, gapSize: 1 } );
		
		var mesh = new THREE.Line( geometry, material );
		mesh.name="2DWorkpieceDash";
		mesh.rotation.x=Math.PI/2;
		mesh.rotation.y=Math.PI/2;
		mesh.position.x = -this.workpiece.z/2;
        mesh.visible = true;
        
        this.meshes.meshWorkpiece = true;
		this.meshWorkpiece = mesh;
	};

CWS.Lathe.prototype._create3DWorkpiece = function () 
	{
		var radius = this.workpiece.x/2.0;
		this.gl.useProgram(this.shaderProgram1);
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
	    this.gl.enableVertexAttribArray(this.shaderProgram1.vertexPositionAttribute);
		// Clear the deth buffer, and load the uniforms and atrtributes
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT );
		this.gl.uniform1f(this.shaderProgram1.workpieceLengthUniform, this.workpiece.z);
	    this.gl.uniform1f(this.shaderProgram1.workpieceRadiusUniform, radius);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.linesVertexPositionBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram1.vertexPositionAttribute, this.linesVertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
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
		var i = 0;
		for (i=0; i < l; i+=4) 
		{
			var d = dataview.getUint16(i)*vDist;
			if (d===0)
				break;
			this.dataLevel1[i/4]=d;
		};
		for (i=i; i < l; i+=4) 
		{
			this.dataLevel1[i/4]=0;
		};
        this.generateLatheGeometry();
	};
