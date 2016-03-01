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

		// var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
		// this.scene.add( ambientLight );

		// var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
		// directionalLight.position.x = Math.random() - 0.5;
		// directionalLight.position.y = Math.random() - 0.5;
		// directionalLight.position.z = Math.random() - 0.5;
		// directionalLight.position.normalize();
		// this.scene.add( directionalLight );

		// var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
		// directionalLight.position.x = Math.random() - 0.5;
		// directionalLight.position.y = Math.random() - 0.5;
		// directionalLight.position.z = Math.random() - 0.5;
		// directionalLight.position.normalize();
		// this.scene.add( directionalLight );

		this.width = options.width || 512;
		this.height = options.height || 512;

		this.camera = new THREE.PerspectiveCamera(20, this.width / this.height, 0.1, 2000);
		this.camera.position.x = 0;
		this.camera.position.y = 0;
		this.camera.position.z = 100;
		this.camera.lookAt( this.scene.position );
	}

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

CWS.Renderer.prototype.constructor = CWS.Renderer;

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

CWS.Renderer.prototype.removeMesh = function (meshName)
	{
		if (meshName!==undefined)
		{
			var mesh = this.scene.getObjectByName(meshName);
			if (mesh)
				this.scene.remove(mesh);
		}
	};

CWS.Renderer.prototype.render = function (controls)
	{
		if (this['2DWorkpiece'] && this['2DWorkpiece'].animation)
		{
			this['2DWorkpiece'].animation.next()
		}
		if (this['3DWorkpiece'] && this['3DWorkpiece'].animation)
		{
			this['3DWorkpiece'].animation.next();
		}
		this.renderer.render( this.scene, this.camera );
	};

CWS.Renderer.prototype.animate = function (b,meshName)
	{
		if (this[meshName])
			this[meshName].animation.touggleAnimation();
	};

CWS.Renderer.prototype.addMesh = function (meshName,mesh)
	{
		var meshTemp = this.scene.getObjectByName(meshName);
		if (meshTemp)
		{
			this.scene.remove(meshTemp);
			this[meshName] = undefined;
		}
		if (mesh.geometry !== undefined)
		{
			mesh.name = meshName;
			if (mesh instanceof THREE.BufferGeometry)
				mesh.geometry.setDrawRange(0,Infinity);
			this[meshName] = mesh;
			this.scene.add(mesh);
		}
	};
