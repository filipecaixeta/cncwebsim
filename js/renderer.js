/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Renderer = function (id,options) 
	{
		options = options || {};

		this.displayWireframe = options.displayWireframe===undefined?true:options.displayWireframe;

		this.renderer = new THREE.WebGLRenderer({clearColor: 0xffffff,antialias: true });
		// this.renderer.domElement.style.background = "#ffffff";
		this.renderer.autoClear = true;
		this.renderer.setClearColor( 0xffffff );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		
		this.renderer.domElement.id=id;
		this.renderer.domElement.style['z-index']=41;

		this.scene = new THREE.Scene();
    
        var ambientLight = new THREE.AmbientLight( 0x000000 );
        this.scene.add( ambientLight );

        var lights = [];
        lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );
    
        lights[0].position.set( 0, 200, 0 );
        lights[1].position.set( 100, 200, 100 );
        lights[2].position.set( -100, -200, -100 );

        this.scene.add( lights[0] );
        this.scene.add( lights[1] );
        this.scene.add( lights[2] );

//		var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
//		this.scene.add( ambientLight );

//		var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
//		directionalLight.position.x = Math.random() - 0.5;
//		directionalLight.position.y = Math.random() - 0.5;
//		directionalLight.position.z = Math.random() - 0.5;
//		directionalLight.position.normalize();
//		this.scene.add( directionalLight );
//
//		var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
//		directionalLight.position.x = Math.random() - 0.5;
//		directionalLight.position.y = Math.random() - 0.5;
//		directionalLight.position.z = Math.random() - 0.5;
//		directionalLight.position.normalize();
//		this.scene.add( directionalLight );

		this.width = options.width || 512;
		this.height = options.height || 512;

		this.camera = new THREE.PerspectiveCamera(20, this.width / this.height, 0.1, 2000);
		this.camera.position.x = 0;
		this.camera.position.y = 0;
		this.camera.position.z = 100;
		this.camera.lookAt( this.scene.position );
	}



CWS.Renderer.prototype.constructor = CWS.Renderer;

CWS.Renderer.prototype = 
	{
		get domElement()
	    {
	        return this.renderer.domElement;
	    },
	    set domElement(val)
	    {
	        this.renderer.domElement = val;
	    },
	};

CWS.Renderer.prototype.lookAtLathe = function (dimensions)
	{
		var aspect = this.camera.aspect;
		var fov = 20;
		var distance = dimensions.y/2/Math.tan( (fov/2)  * (Math.PI/180)  );
		var cameraPosition = new THREE.Vector3(0,0,distance);
		this.camera.position.copy( cameraPosition );
		this.camera.far = 20*Math.max(dimensions.x,dimensions.y);
		this.camera.near = 0.05*Math.max(dimensions.x,dimensions.y);
		this.camera.updateProjectionMatrix();
	};

CWS.Renderer.prototype.lookAtMill = function (dimensions)
	{
		var aspect = this.camera.aspect;
		var fov = 20;
		var distance = Math.max(dimensions.x,dimensions.y)/2/Math.tan( (fov/2)  * (Math.PI/180)  );
		var cameraPosition = new THREE.Vector3(0,0,distance);
		this.camera.position.copy( cameraPosition );
		this.camera.far = 20*Math.max(dimensions.x,dimensions.y);
		this.camera.near = 0.05*Math.max(dimensions.x,dimensions.y);
		this.camera.updateProjectionMatrix();
	};

CWS.Renderer.prototype.lookAt3DPrinter = function (center,radius)
	{
		if (!center || !radius)
			return;

		var distance =(center.z+radius)/2/Math.tan( (20/2)  * (Math.PI/180)  );
		var cameraPosition = new THREE.Vector3(0,0,distance);
		this.camera.position.copy( cameraPosition );
		this.camera.far = 2000;
		this.camera.near = 1;
		this.camera.updateProjectionMatrix();
	};

CWS.Renderer.prototype.setCamera = function (camera)
	{
		if (camera=="Perspective")
			this.camera.toPerspective();
		else if (camera=="Orthographic")
			this.camera.toOrthographic();
	};

CWS.Renderer.prototype.setSize = function (width,height) 
	{
		this.width = width;
		this.height = height;
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.width, this.height );
	};

CWS.Renderer.prototype.addMesh = function (obj)
	{
		this.scene.add(obj);
	};

CWS.Renderer.prototype.removeMesh = function (meshName)
	{
		if (meshName!==undefined)
		{
			var mesh = this.scene.getObjectByName(meshName);
			if (mesh)
				this.scene.remove(mesh);
		}
	};

CWS.Renderer.prototype.render = function (obj)
	{
		if (this.doAnimation)
		{
			this.animationEnd2D +=this.animationStep*this.animationDataSize2D;
			this.animationEnd3D +=this.animationStep*this.animationDataSize3D;
		    if (this.mesh3D && this.animationDataSize3D!==0)
		    {
		    	if (this.animationEnd3D>=this.mesh3D.geometry.attributes.position.array.length/3)
		    		this.doAnimation = false;
		    	this.mesh3D.geometry.setDrawRange(0,this.animationEnd3D);
		    }
		    if (this.mesh2D)
		    {
		    	if (this.animationEnd2D>=this.mesh2D.geometry.attributes.position.array.length/3)
		    	{
		    		this.doAnimation = false;
		    	}
		    	var color = this.mesh2D.geometry.attributes.vcolor.array;
		    	while (color[this.animationEnd2D]==2 || color[this.animationEnd2D]==3)
		    	{
		    		this.animationEnd2D+=2;	
		    	}
		    	this.mesh2D.geometry.setDrawRange(0,this.animationEnd2D);
		    }
		}
		this.renderer.render( this.scene, this.camera );
	};

CWS.Renderer.prototype.updateMesh = function (obj)
	{
		this.removeMesh(obj.name);
		if (obj.name==="3DWorkpiece")
		{
			if (obj.geometry!==undefined)
			{
				this.addMesh(obj);
				this.mesh3D = obj;
			}
			else
				this.mesh3D = undefined;
		}
		else if (obj.name==="2DWorkpiece")
		{
			if (obj.geometry!==undefined)
			{
				this.addMesh(obj);
				this.mesh2D = obj;
			}
			else
				this.mesh2D = undefined;
		}
		else if (obj.name==="2DWorkpieceDash")
		{
			if (obj.geometry!==undefined)
			{
				this.mesh2DWireframe = obj;
				if (this.displayWireframe!==false)
					this.addMesh(obj);
			}
			else
				this.mesh2DWireframe = undefined;
		}
	};

CWS.Renderer.prototype.animate = function (b,machineType)
	{
		if (this.doAnimation===true&& b===true)
			b=false;
		this.animationStep = 1;
		if (b===false)
		{
			this.doAnimation=false;
			this.animationEnd2D = Infinity;
	    	this.animationEnd3D = Infinity;
		}
		else
		{
			this.doAnimation=true;
			this.animationEnd2D = 0;
	    	this.animationEnd3D = 0;
		}

		if (machineType==="Lathe")
		{
			this.animationDataSize2D = 2;
			this.animationDataSize3D = 0;
			this.animationEnd3D = Infinity;
		}
		else if (machineType==="Mill")
		{
			this.animationDataSize2D = 2;
			this.animationDataSize3D = 0;
			this.animationEnd3D = Infinity;
		}
		else if (machineType==="3D Printer")
		{
			this.animationDataSize2D = 2;
			this.animationDataSize3D = 24;
		}
	    this.animationEnd3D +=this.animationStep*this.animationDataSize3D;
		this.animationEnd2D +=this.animationStep*this.animationDataSize2D;

	    if (this.mesh3D)
	    	this.mesh3D.geometry.setDrawRange(0,this.animationEnd3D);
	    if (this.mesh2D)
	    	this.mesh2D.geometry.setDrawRange(0,this.animationEnd2D);
	};