/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Machine = function (options) 
	{
		options = options || {};
		
		this.renderResolution = options.renderResolution||64;
		this.workpiece = options.workpiece;
		this.machine = options.machine;
		this.material3D = options.material3D;
		this.lineColors = options.lineColors || {	g0: new THREE.Color(1,0,0),
													g1: new THREE.Color(0,0,1),
													g2: new THREE.Color(1,0,1),
													g3: new THREE.Color(0,1,1),};
		this.meshes = {mesh2D:false,mesh3D:false,meshWorkpiece:false};
		// For 2D drawing
		this.material2D = new THREE.ShaderMaterial( 
		{
			uniforms: {
				g0: { type: "c", value: this.lineColors.g0 },
				g1: { type: "c", value: this.lineColors.g1 },
				g2: { type: "c", value: this.lineColors.g2 },
				g3: { type: "c", value: this.lineColors.g3 }
			},
			vertexShader: CWS.SHADER["vs-2D"],
			fragmentShader: CWS.SHADER["fs-2D"],
			linewidth: 1,
		});
	}

CWS.Machine.prototype.constructor = CWS.Machine;

CWS.Machine.prototype.setMotion = function (motionData) 
	{
		this.motionData = motionData;
		this.meshes.mesh2D = false;
		this.meshes.mesh3D = false;
	};

CWS.Machine.prototype.create2DWorkpiece = function () 
	{
		throw new Error( "call to abstract method" );
	};

CWS.Machine.prototype.create3DWorkpiece = function () 
	{
		throw new Error( "call to abstract method" );
	};

CWS.Machine.prototype.create2DWorkpieceLimits = function () 
	{
		return {name:"2DWorkpieceDash"};
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

CWS.Machine.prototype.updateWorkpieceDimensions = function ()
    {
        
    };

CWS.Machine.prototype.updateTool = function ()
    {
        
    };

CWS.Machine.prototype.updateRendererResolution = function ()
    {
        
    };

CWS.Machine.prototype.create2DWorkpiece = function () 
	{
		this.mesh2D.visible = true;
		// MAYBE MISSING SOMETHING ABOUT POSITION
		if (this.machine.mtype==="Lathe")
    		this.mesh2D.position.x = -this.workpiece.z/2;
    	else
    	{
	    	this.mesh2D.position.x = -this.workpiece.x/2;
	        this.mesh2D.position.y = -this.workpiece.y/2;
	        this.mesh2D.position.z = -this.workpiece.z/2;
    	}
		if (this.meshes.mesh2D === true)
			return;

        var geometry = this.mesh2D.geometry;
        // Updating the positions and vcolor by the 'correct' way won't
        // work here because the buffer size keeps changing all the time
        // I don't want to create a new mesh every time. Adding again the
        // position and vcolor will replace the buffer. I'm not that sure
        // if I'm doing something that could break the code later. 
        geometry.addAttribute( 'position', new THREE.BufferAttribute( this.motionData.positions ,3));
		geometry.addAttribute( 'vcolor', new THREE.BufferAttribute( this.motionData.color ,1 ));
        geometry.setDrawRange(0,Infinity);
        this.mesh2D.visible = true;
        this.meshes.mesh2D = true;

        this.mesh2D.animation = {
        	size: geometry.attributes.position.array.length/3,
        	beg:0,
        	end:0,
        	dataSize: 2,
        	step:1,
        	animationState: false,
        	touggleAnimation: function () 
        	{
        		this.animationState = !this.animationState;
        		this.end = 0;
        		this.animate(this.animationState);
        	},
        	animate: function (b) 
        	{
        		if (b===true)
        		{
        			this.next = function () 
		        	{
		        		if (this.end>this.size)
		        		{
		        			this.animationState = false;
		        			return false;
		        		}
		        		this.end += this.step*this.dataSize;
		        		while (geometry.attributes.vcolor.array[this.end]>=2)
		        		{
		        			this.end += 2;
		        		}
		        		geometry.setDrawRange(this.beg,this.end);
		        		return true;
		        	}
        		}
        		else
        		{
        			this.next = function(){return false;};
        			geometry.setDrawRange(0,Infinity);	
        		}
        	},
        	next: function(){return false;},
    	};
    };

CWS.Machine.prototype.create3DWorkpiece = function () 
	{
		this.mesh3D.visible = true;
        
        if (this.meshes.mesh3D === true)
            return;

        this._create3DWorkpiece();

        this.mesh3D.geometry.setDrawRange(0,Infinity);
        this.mesh3D.visible = true;
        this.meshes.mesh3D = true;
        return this.mesh3D;
	};