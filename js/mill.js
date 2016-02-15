/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Mill = function (options)
	{
		options = options || {};
		CWS.Machine.call( this, options );

		this.tool = {radius:0.5,angle:70};

		this.canvas = null;
		this.gl = null;
    
		this.initWebGL();
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
        // document.body.appendChild(this.canvas); // For debugging
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
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        this.gl.clearDepth(1.0);                 // Clear everything
        this.gl.enable(this.gl.DEPTH_TEST);      // Enable depth testing
        this.gl.depthFunc(this.gl.LEQUAL);       // Near things obscure far things
    
	    this.shaderProgram1 = this.createProgram(this.gl, CWS.SHADER["vs-mill-1-3D"], CWS.SHADER["fs-mill-1-3D"]);
        this.gl.useProgram(this.shaderProgram1);
        this.shaderProgram1.dimensions = this.gl.getUniformLocation(this.shaderProgram1, "dimensions");
        this.shaderProgram1.resolution = this.gl.getUniformLocation(this.shaderProgram1, "resolution");
        this.shaderProgram1.currentDimension = this.gl.getUniformLocation(this.shaderProgram1, "currentDimension");
        this.shaderProgram1.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram1, "position");
    
        this.shaderProgram2 = this.createProgram(this.gl, CWS.SHADER["vs-mill-2-3D"], CWS.SHADER["fs-mill-2-3D"]);
        this.gl.useProgram(this.shaderProgram2);    
        this.shaderProgram2.texture = this.gl.getUniformLocation(this.shaderProgram2, "uSampler");
        this.shaderProgram2.dimensions = this.gl.getUniformLocation(this.shaderProgram2, "dimensions");
        this.shaderProgram2.currentDimension = this.gl.getUniformLocation(this.shaderProgram2, "currentDimension");
        this.shaderProgram2.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram2, "position");
        this.shaderProgram2.texcoordAttribute = this.gl.getAttribLocation(this.shaderProgram2, "texcoord");
    
        this.setRendererResolution();
    
        this.gl.lineWidth(1);
    
        this.gl.clearColor(0.0,0.0,0.0,0.0);
    };

CWS.Mill.prototype.createToolTexture = function (dim,ang)
    {
        var imgData = new Uint8ClampedArray(dim*dim*4);
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
        this.geometryL1 = new THREE.PlaneBufferGeometry( this.workpiece.x, this.workpiece.y,
                            this.renderResolution -1 , this.renderResolution - 1 );
    
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

CWS.Mill.prototype.create2DWorkpiece = function () 
	{
		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( this.motionData.positions, 3 ) );
		geometry.addAttribute( 'vcolor', new THREE.BufferAttribute( this.motionData.color, 1 ) );
		geometry.computeBoundingSphere();
		var mesh = new THREE.Line( geometry, this.material2D );
		mesh.name="2DWorkpiece";
		return mesh;
	};

CWS.Mill.prototype.create2DWorkpieceLimits = function () 
	{
		var x=this.workpiece.x;
		var y=this.workpiece.y;
        var z=this.workpiece.z;
		var lineGeometry = new THREE.Geometry();
		var vertArray = lineGeometry.vertices;
		vertArray.push( 
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
		lineGeometry.computeLineDistances();
		var lineMaterial = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2, gapSize: 1 } );
		var line = new THREE.LineSegments( lineGeometry, lineMaterial );
		line.name="2DWorkpieceDash";
		return line;
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
        var xDist = dimensions.x/65535.0;
        var yDist = dimensions.y/65535.0;
        var zDist = dimensions.z/65535.0;
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
            texturePos[i+ 2] = 0;
            texturePos[i+ 3] = 1;
            texturePos[i+ 4] = 0;
            texturePos[i+ 5] = 0;

            texturePos[i+ 6] = 1;
            texturePos[i+ 7] = 1;
            texturePos[i+ 8] = 0;
            texturePos[i+ 9] = 0;
            texturePos[i+10] = 1;
            texturePos[i+11] = 0;
        }
        return [positions,texturePos];
    };

CWS.Mill.prototype.create3DWorkpiece = function () 
	{	
        this.toolTexture = this.createToolTexture(32,this.tool.angle);
    
        var dimensions = this.workpiece;
    
		this.gl.useProgram(this.shaderProgram1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.linesVertexPositionBuffer = this.createBuffer(  this.linesVertexPositionBuffer,this.motionData.positions,3,
                                                        this.shaderProgram2.vertexPositionAttribute);
        this.gl.uniform3f(this.shaderProgram1.dimensions, dimensions.x,dimensions.y,dimensions.z);
        this.gl.uniform1f(this.shaderProgram1.resolution, this.renderResolution);
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
        
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.toolTexture);
        this.gl.uniform1i(this.shaderProgram2.texture, 0);
        this.gl.uniform3f(this.shaderProgram2.dimensions, dimensions.x,dimensions.y,dimensions.z);
        this.gl.uniform1i(this.shaderProgram2.currentDimension, 0);
        this.draw(this.linesVertexPositionBuffer.numItems,{TRIANGLES:true},this.pixels1);
        this.gl.uniform1i(this.shaderProgram2.currentDimension, 1);
        this.draw(this.linesVertexPositionBuffer.numItems,{TRIANGLES:true},this.pixels2);

        this.geometryL1.dynamic = true;
        var positions = this.geometryL1.attributes.position.array;
    
        var xDist = dimensions.x/65535.0;
        var yDist = dimensions.y/65535.0;
        var zDist = dimensions.z/65535.0;
        var dataview1 = new DataView( this.pixels1.buffer, 0 );
        var dataview2 = new DataView( this.pixels2.buffer, 0 );
        var i=0;
        for (var xi=0; xi<this.renderResolution; xi++) 
		{
            for (var yi=0; yi<this.renderResolution; yi++)   
            {
                if (dataview2.getUint8(i+3)!==0)
                {
                    var x = dataview1.getUint16(i)*xDist;
                    var y = dataview1.getUint16(i+2)*yDist;
                    var z = dimensions.z-dataview2.getUint16(i)*zDist;
                    // positions[xi*this.renderResolution*3+yi*3+0] = x;
                    // positions[xi*this.renderResolution*3+yi*3+1] = y;
                    positions[xi*this.renderResolution*3+yi*3+1] = xi/(this.renderResolution-1)*dimensions.x;
                    positions[xi*this.renderResolution*3+yi*3+0] = yi/(this.renderResolution-1)*dimensions.y;
                    positions[xi*this.renderResolution*3+yi*3+2] = z;
                }
                else
                {
                    positions[xi*this.renderResolution*3+yi*3+1] = xi/(this.renderResolution-1)*dimensions.x;
                    positions[xi*this.renderResolution*3+yi*3+0] = yi/(this.renderResolution-1)*dimensions.y;
                    positions[xi*this.renderResolution*3+yi*3+2] = dimensions.z;
                }
                i = i+4;
            }
        }
    
        this.geometryL1.verticesNeedUpdate = true;
        this.geometryL1.attributes.position.array=positions;

        this.geometryL1.computeBoundingBox();
        this.geometryL1.computeFaceNormals();
        this.geometryL1.computeVertexNormals();
    
    
        var material = new THREE.MeshNormalMaterial({
            // wireframe: true
            side: THREE.DoubleSide,
        });
        var mesh = new THREE.Mesh( this.geometryL1, material);
        mesh.name="3DWorkpiece";
        return mesh;
	};