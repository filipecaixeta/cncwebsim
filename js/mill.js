/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */

CWS.Mill = function (options)
	{
		options = options || {};
		CWS.Machine.call( this, options );

		this.tool = this.machine.tool;

		this.canvas = null;
		this.gl = null;
        this.debug = false;
        this.mtype="Mill";

        this.initWebGL();
        this.initGeometry2D();
        this.initGeometry3D();
        this.create2DWorkpieceLimits();
	}

CWS.Mill.prototype = Object.create( CWS.Machine.prototype );

CWS.Mill.prototype.constructor = CWS.Mill;

CWS.Mill.prototype.initWebGL = function ()
    {
        // For 3D drawing
		this.canvas =  document.createElement('canvas');
        this.canvas.style.zIndex ="1000000000";
        this.canvas.style.position = "absolute";
        this.canvas.style.background = "#f0f0f0";
        if (this.debug)
            document.body.appendChild(this.canvas); // For debugging
		var attributes = 
		{
			alpha: true,
			depth: true,
			stencil: false,
			antialias: false,
			premultipliedAlpha: false,
			preserveDrawingBuffer: true,
		};
		this.gl=this.canvas.getContext( 'webgl', attributes ) || this.canvas.getContext( 'experimental-webgl', attributes);
		if ( this.gl === null ) 
			throw 'Error creating WebGL context.';
	    this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        this.gl.clearDepth(1.0);                 // Clear everything
        this.gl.enable(this.gl.DEPTH_TEST);      // Enable depth testing
        this.gl.depthFunc(this.gl.LEQUAL);       // Near things obscure far things
    
	    this.shaderProgram1 = this.createProgram(this.gl, CWS.SHADER["vs-mill-1-3D"], CWS.SHADER["fs-mill-1-3D"]);
        this.gl.useProgram(this.shaderProgram1);
        this.shaderProgram1.dimensions = this.gl.getUniformLocation(this.shaderProgram1, "dimensions");
        this.shaderProgram1.resolution = this.gl.getUniformLocation(this.shaderProgram1, "resolution");
        this.shaderProgram1.currentDimension = this.gl.getUniformLocation(this.shaderProgram1, "currentDimension");
        this.shaderProgram1.toolRadius = this.gl.getUniformLocation(this.shaderProgram1, "toolRadius");
        this.shaderProgram1.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram1, "position");
    
        this.shaderProgram2 = this.createProgram(this.gl, CWS.SHADER["vs-mill-2-3D"], CWS.SHADER["fs-mill-2-3D"]);
        this.gl.useProgram(this.shaderProgram2);    
        this.shaderProgram2.dimensions = this.gl.getUniformLocation(this.shaderProgram2, "dimensions");
        this.shaderProgram2.currentDimension = this.gl.getUniformLocation(this.shaderProgram2, "currentDimension");
        this.shaderProgram2.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram2, "position");
        this.shaderProgram2.texcoordAttribute = this.gl.getAttribLocation(this.shaderProgram2, "texcoord");
    
        this.setRendererResolution();
    
        this.gl.lineWidth(1);
    
        this.gl.clearColor(0.0,0.0,0.0,0.0);
    };

CWS.Mill.prototype.initGeometry3D = function ()
    {
        var tempDim = Math.max(this.workpiece.x,this.workpiece.y)+this.tool.radius*2;
        this.renderDimensions = new THREE.Vector3(tempDim,tempDim,this.workpiece.z);
        var minX = Math.round(this.tool.radius*this.renderResolution/this.renderDimensions.x);
        var minY = Math.round(this.tool.radius*this.renderResolution/this.renderDimensions.y);
        var maxX = Math.round((parseFloat(this.workpiece.x)+this.tool.radius)*this.renderResolution/this.renderDimensions.x);
        var maxY = Math.round((parseFloat(this.workpiece.y)+this.tool.radius)*this.renderResolution/this.renderDimensions.y);
        
        var geometry = new THREE.PlaneBufferGeometry( this.workpiece.x, this.workpiece.y,
                            maxX-minX+1, maxY-minY+1 );
            geometry.dim = {x:maxX-minX+2,y:maxY-minY+2};
            geometry.dynamic = true;
            if ( geometry.attributes.normal === undefined ) 
            {
                geometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geometry.attributes.position.array.length ), 3 ) );
            }
            geometry.attributes.position.dynamic = true;
            geometry.attributes.normal.dynamic = true;
            geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0),99999);

        var positions = geometry.attributes.position.array;
    
        var xDist = this.renderDimensions.x/65535.0;
        var yDist = this.renderDimensions.y/65535.0;
        var zDist = this.renderDimensions.z/65535.0;
        var rowSize = (maxX-minX+2);
        yi = 0;
        for (var xi=0; xi<(maxX-minX+2); xi++) 
        {
            var arrayPos2 = (yi*rowSize+xi)*3;
            positions[arrayPos2+0] = (xi/(xi+2)*xi)/(this.renderResolution-1)*this.renderDimensions.x;
            positions[arrayPos2+1] = (yi/(yi+2)*yi)/(this.renderResolution-1)*this.renderDimensions.y;
            positions[arrayPos2+2] = 0;
        }
        yi = maxY-minY+1;
        for (var xi=0; xi<(maxX-minX+2); xi++) 
        {
            var arrayPos2 = (yi*rowSize+xi)*3;
            positions[arrayPos2+0] = (xi/(xi+2)*xi)/(this.renderResolution-1)*this.renderDimensions.x;
            positions[arrayPos2+1] = (yi/(yi+2)*yi)/(this.renderResolution-1)*this.renderDimensions.y;
            positions[arrayPos2+2] = 0;
        }
        xi = 0;
        for (var yi=0; yi<(maxY-minY+2); yi++) 
        {
            var arrayPos2 = (yi*rowSize+xi)*3;
            positions[arrayPos2+0] = (xi/(xi+2)*xi)/(this.renderResolution-1)*this.renderDimensions.x;
            positions[arrayPos2+1] = (yi/(yi+2)*yi)/(this.renderResolution-1)*this.renderDimensions.y;
            positions[arrayPos2+2] = 0;
        }
        xi = maxX-minX+1;
        for (var yi=0; yi<(maxY-minY+2); yi++) 
        {
            var arrayPos2 = (yi*rowSize+xi)*3;
            positions[arrayPos2+0] = (xi/(xi+2)*xi)/(this.renderResolution-1)*this.renderDimensions.x;
            positions[arrayPos2+1] = (yi/(yi+2)*yi)/(this.renderResolution-1)*this.renderDimensions.y;
            positions[arrayPos2+2] = 0;
        }
        var mesh = new THREE.Mesh( geometry, this.material3D);
            mesh.name="3DWorkpiece";
        mesh.position.x = -this.workpiece.x/2;
        mesh.position.y = -this.workpiece.y/2;
        mesh.position.z = -this.workpiece.z/2;
        this.mesh3D = mesh;
    };

CWS.Mill.prototype.initGeometry2D = function () 
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
        mesh.position.x = -this.workpiece.x/2;
        mesh.position.y = -this.workpiece.y/2;
        mesh.position.z = -this.workpiece.z/2;
        this.mesh2D = mesh;
    };

CWS.Mill.prototype.create2DWorkpieceLimits = function () 
    {
        if (this.meshes.meshWorkpiece === true)
            return;
        
        var x=this.workpiece.x;
        var y=this.workpiece.y;
        var z=this.workpiece.z;
        var geometry = new THREE.Geometry();
        geometry.vertices.push( 
            new THREE.Vector3(x*0,y*0,z*0),new THREE.Vector3(x*1,y*0,z*0),
            new THREE.Vector3(x*1,y*0,z*0),new THREE.Vector3(x*1,y*0,z*1),
            new THREE.Vector3(x*1,y*0,z*1),new THREE.Vector3(x*0,y*0,z*1),
            new THREE.Vector3(x*0,y*0,z*1),new THREE.Vector3(x*0,y*0,z*0),
            new THREE.Vector3(x*0,y*0,z*0),new THREE.Vector3(x*0,y*1,z*0),
            new THREE.Vector3(x*0,y*0,z*1),new THREE.Vector3(x*0,y*1,z*1),
            new THREE.Vector3(x*1,y*0,z*1),new THREE.Vector3(x*1,y*1,z*1),
            new THREE.Vector3(x*1,y*0,z*0),new THREE.Vector3(x*1,y*1,z*0),
            new THREE.Vector3(x*0,y*1,z*0),new THREE.Vector3(x*1,y*1,z*0),
            new THREE.Vector3(x*1,y*1,z*0),new THREE.Vector3(x*1,y*1,z*1),
            new THREE.Vector3(x*1,y*1,z*1),new THREE.Vector3(x*0,y*1,z*1),
            new THREE.Vector3(x*0,y*1,z*1),new THREE.Vector3(x*0,y*1,z*0));
        geometry.computeLineDistances();

        var material = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2, gapSize: 1 } );
        
        var mesh = new THREE.Line( geometry, material );
        mesh.name="2DWorkpieceDash";
        mesh.position.x = -this.workpiece.x/2;
        mesh.position.y = -this.workpiece.y/2;
        mesh.position.z = -this.workpiece.z/2;

        mesh.visible = true;
        
        this.meshes.meshWorkpiece = true;
        this.meshWorkpiece = mesh;
    };

CWS.Mill.prototype.updateWorkpieceDimensions = function ()
    {
        this.initMesh();
    }

CWS.Mill.prototype.updateTool = function ()
    {
        this.initMesh();
    }

CWS.Mill.prototype.updateRendererResolution = function ()
    {
        this.initMesh();
    }

CWS.Mill.prototype.createToolTexture = function (dim,ang)
    {
        var imgData = new Uint8Array(dim*dim*4);
        function distance(cx,cy,x,y)
        {
            return Math.sqrt(Math.pow(cx-x,2)+Math.pow(cy-y,2));
        }  
        var cx=dim/2;
        var cy=dim/2;
        var radius=dim/2;
        var pos=0;
        var angTan = Math.tan(ang*Math.PI/180);
        for (var x=0; x<dim; x++)
        {
            for (var y=0; y<dim; y++)
            {
                var d = distance(cx,cy,x,y)/radius;
                if (d>1)
                {
                    imgData[pos++]=0;
                    imgData[pos++]=0;
                    imgData[pos++]=0;
                    imgData[pos++]=0;
                }
                else
                {
                    var v = d*255*angTan;
                    imgData[pos++]=v;
                    imgData[pos++]=0;
                    imgData[pos++]=0;
                    imgData[pos++]=255;
                }
            }
        }

        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, dim, dim, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imgData);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        // this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    };

CWS.Mill.prototype.setRendererResolution = function (renderResolution)
    {
        this.renderResolution = renderResolution || this.renderResolution;
        this.pixels1 = new Uint8Array(this.renderResolution*this.renderResolution*4);
        this.pixels2 = new Uint8Array(this.renderResolution*this.renderResolution*4);
        this.canvas.width  = this.renderResolution;
        this.canvas.height = this.renderResolution;
        this.canvas.style.width  = this.renderResolution;
        this.canvas.style.height = this.renderResolution;
        this.gl.viewportWidth = this.renderResolution;
        this.gl.viewportHeight = this.renderResolution;
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    };

CWS.Mill.prototype.createBuffer = function(oldBuffer,data,itemSize,attribute)
    {
        if (this.linesVertexPositionBuffer!=undefined)
            {
                try
                {
                    gl.deleteBuffer(oldBuffer);
                }catch(e)
                {    
                }
            }
            var buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
            buffer.itemSize = itemSize;
            buffer.numItems = data.length/itemSize;
            this.gl.enableVertexAttribArray(attribute);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.vertexAttribPointer(attribute, buffer.itemSize, this.gl.FLOAT, false, 0, 0);

            return buffer;
    };

CWS.Mill.prototype.draw = function(numItems,options,pixels)
    {
        options = options || {};
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT );
        if (options.LINE_STRIP==true)
            this.gl.drawArrays(this.gl.LINE_STRIP, 0, numItems);
        if (options.POINTS==true)
            this.gl.drawArrays(this.gl.POINTS, 0, numItems);
        if (options.TRIANGLES==true)
            this.gl.drawArrays(this.gl.TRIANGLES, 0, numItems);
        this.gl.flush();
        this.gl.readPixels( 0, 0, this.renderResolution, this.renderResolution,this.gl.RGBA,this.gl.UNSIGNED_BYTE, pixels);
    };

CWS.Mill.prototype.calculatePositionAndTexture = function(dimensions,toolRadius)
    {
        var xDist = (this.renderDimensions.x+1)/65535.0;
        var yDist = (this.renderDimensions.y+1)/65535.0;
        var zDist = (this.renderDimensions.z+1)/65535.0;
        var dataview1 = new DataView( this.pixels1.buffer, 0 );
        var dataview2 = new DataView( this.pixels2.buffer, 0 );
        var positions = [];
        var l=this.pixels1.length-4;
        for (var i=0; i<dataview2.byteLength; i+=4)
        {
            if (dataview2.getUint8(i+2)!==0)
            {
                var x = dataview1.getUint16(i)*xDist;
                var y = dataview1.getUint16(i+2)*yDist;
                var z = dataview2.getUint16(i);
                positions.push(  x+toolRadius, y+toolRadius, z,
                                 x-toolRadius, y+toolRadius, z,
                                 x-toolRadius, y-toolRadius, z,

                                 x+toolRadius, y+toolRadius, z,
                                 x-toolRadius, y-toolRadius, z,
                                 x+toolRadius, y-toolRadius, z);
            }
        }
        positions = new Float32Array(positions);

        texturePos = new Float32Array(positions.length/3*2);
        for (var i=0; i<texturePos.length; i+=12)
        {
            texturePos[i+ 0] = 1;
            texturePos[i+ 1] = 1;
            texturePos[i+ 2] = -1;
            texturePos[i+ 3] = 1;
            texturePos[i+ 4] = -1;
            texturePos[i+ 5] = -1;

            texturePos[i+ 6] = 1;
            texturePos[i+ 7] = 1;
            texturePos[i+ 8] = -1;
            texturePos[i+ 9] = -1;
            texturePos[i+10] = 1;
            texturePos[i+11] = -1;
        }
        return [positions,texturePos];
    };

CWS.Mill.prototype._create3DWorkpiece = function () 
	{	
        // this.toolTexture = this.createToolTexture(32,this.tool.angle);
        var dimensions = this.workpiece;
    
		this.gl.useProgram(this.shaderProgram1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.linesVertexPositionBuffer = this.createBuffer(  this.linesVertexPositionBuffer,this.motionData.positions,3,
                                                        this.shaderProgram2.vertexPositionAttribute);
        this.gl.uniform3f(this.shaderProgram1.dimensions, this.renderDimensions.x,this.renderDimensions.y,this.renderDimensions.z);
        this.gl.uniform1f(this.shaderProgram1.resolution, this.renderResolution);
        this.gl.uniform1f(this.shaderProgram1.toolRadius, this.tool.radius);
        this.gl.uniform1i(this.shaderProgram1.currentDimension, 0);
        this.draw(this.linesVertexPositionBuffer.numItems,{LINE_STRIP:true,POINTS:true},this.pixels1);
        this.gl.uniform1i(this.shaderProgram1.currentDimension, 1);
        this.draw(this.linesVertexPositionBuffer.numItems,{LINE_STRIP:true,POINTS:true},this.pixels2);
       
        data = this.calculatePositionAndTexture(dimensions,this.tool.radius);
        positions = data[0];
        texturePos = data[1];
    
        this.gl.useProgram(this.shaderProgram2);
        this.linesVertexPositionBuffer = this.createBuffer(  this.linesVertexPositionBuffer,positions,3,
                                                        this.shaderProgram2.vertexPositionAttribute);
        this.texcoordBuffer = this.createBuffer( this.texcoordBuffer,texturePos,2,
                                            this.shaderProgram2.texcoordAttribute);
        
        this.gl.uniform3f(this.shaderProgram2.dimensions, this.renderDimensions.x,this.renderDimensions.y,this.renderDimensions.z);
        this.gl.uniform1i(this.shaderProgram2.currentDimension, 0);
        this.draw(this.linesVertexPositionBuffer.numItems,{TRIANGLES:true},this.pixels1);
        this.gl.uniform1i(this.shaderProgram2.currentDimension, 1);
        this.draw(this.linesVertexPositionBuffer.numItems,{TRIANGLES:true},this.pixels2);

        var geometry  = this.mesh3D.geometry;
        var positions = geometry.attributes.position.array;
    
        var xDist = this.renderDimensions.x/65535.0;
        var yDist = this.renderDimensions.y/65535.0;
        var zDist = this.renderDimensions.z/65535.0;
        var dataview1 = new DataView( this.pixels1.buffer, 0 );
        var dataview2 = new DataView( this.pixels2.buffer, 0 );
        var i=0;
        var minX = Math.round(this.tool.radius*this.renderResolution/this.renderDimensions.x);
        var minY = Math.round(this.tool.radius*this.renderResolution/this.renderDimensions.y);
        var maxX = Math.round((parseFloat(this.workpiece.x)+this.tool.radius)*this.renderResolution/this.renderDimensions.x);
        var maxY = Math.round((parseFloat(this.workpiece.y)+this.tool.radius)*this.renderResolution/this.renderDimensions.y);

        var rowSize = (maxX-minX+2);
        for (var yi=minY; yi<maxY; yi++)   
        {
            for (var xi=minX; xi<maxX; xi++) 
            {
                var arrayPos1 = (yi*this.renderResolution+xi)*4;
                var arrayPos2 = ((yi-minY+1)*rowSize+xi-minX+1)*3;
                if (dataview2.getUint8(arrayPos1+3)!==0)
                {
                    var x = dataview1.getUint16(arrayPos1)*xDist;
                    var y = dataview1.getUint16(arrayPos1+2)*yDist;
                    var z = this.renderDimensions.z-dataview2.getUint16(arrayPos1)*zDist;
                    positions[arrayPos2+0] = (xi-minX)/(this.renderResolution-1)*this.renderDimensions.x;
                    positions[arrayPos2+1] = (yi-minY)/(this.renderResolution-1)*this.renderDimensions.y;
                    positions[arrayPos2+2] =z;
                }
                else
                {
                    positions[arrayPos2+0] = (xi-minX)/(this.renderResolution-1)*this.renderDimensions.x;
                    positions[arrayPos2+1] = (yi-minY)/(this.renderResolution-1)*this.renderDimensions.y;
                    positions[arrayPos2+2] = this.renderDimensions.z;
                }
            }
        }
    
         var index = geometry.index;
         var attributes = geometry.attributes;
         var groups = geometry.groups;

         var positions = attributes.position.array;
         var array = attributes.normal.array;

         for ( var i = 0, il = array.length; i < il; i ++ ) 
         {
             array[i] = 0;
         }

         var normals = attributes.normal.array;
         var vA, vB, vC,

         pA = new THREE.Vector3(),
         pB = new THREE.Vector3(),
         pC = new THREE.Vector3(),

         cb = new THREE.Vector3(),
         ab = new THREE.Vector3();

         var indices = index.array;
         if ( groups.length === 0 ) 
         {
             geometry.addGroup( 0, indices.length );
         }
         for ( var j = 0, jl = groups.length; j < jl; ++ j ) 
         {
             var group = groups[ j ];
             var start = group.start;
             var count = group.count;

             for ( var i = start, il = start + count; i < il; i += 3 ) 
             {
                 vA = indices[ i + 0 ] * 3;
                 vB = indices[ i + 1 ] * 3;
                 vC = indices[ i + 2 ] * 3;

                 pA.fromArray( positions, vA );
                 pB.fromArray( positions, vB );
                 pC.fromArray( positions, vC );

                 cb.subVectors( pC, pB );
                 ab.subVectors( pA, pB );
                 cb.cross( ab );

                 normals[ vA ] += cb.x;
                 normals[ vA + 1 ] += cb.y;
                 normals[ vA + 2 ] += cb.z;

                 normals[ vB ] += cb.x;
                 normals[ vB + 1 ] += cb.y;
                 normals[ vB + 2 ] += cb.z;

                 normals[ vC ] += cb.x;
                 normals[ vC + 1 ] += cb.y;
                 normals[ vC + 2 ] += cb.z;
             }
         }

         var x, y, z, n;
         for ( var i = 0, il = normals.length; i < il; i += 3 ) 
         {
             x = normals[ i ];
             y = normals[ i + 1 ];
             z = normals[ i + 2 ];
             n = 1.0 / Math.sqrt( x * x + y * y + z * z );
             normals[ i ] *= n;
             normals[ i + 1 ] *= n;
             normals[ i + 2 ] *= n;
         }

        attributes.position.needsUpdate = true;
        attributes.normal.needsUpdate = true;
	};