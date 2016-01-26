var renderer3d,camera3d,scene3d,cameraCube3d,sceneCube3d,textureCube3d,controls3d;
var renderer2d,camera2d,scene2d,controls2d;
var mouseCoord = new THREE.Vector3();
var mouseCoordinatesElem,maincanvasdiv;
var canvasDim={};
var useCanvas={'3d':true,'2d':true};
speed=0.005;

function init3DRenderer() 
{
	maincanvasdiv=document.getElementById('maincanvas');
	var width = maincanvasdiv.offsetWidth;
	var height = maincanvasdiv.offsetHeight;
	renderer3d = new THREE.WebGLRenderer({clearColor: 0xffffff,antialias: true });
	renderer3d.domElement.style.background = "#ffffff";
	renderer3d.setSize(width, height);
	renderer3d.autoClear = false;
	renderer3d.setClearColor( 0xffffff );
	maincanvasdiv.appendChild(renderer3d.domElement);
	renderer3d.domElement.id="renderer3d";
	renderer3d.domElement.style['z-index']=41;

	scene3d = new THREE.Scene();
	sceneCube3d = new THREE.Scene();

	camera3d = new THREE.PerspectiveCamera(20, width / height, 0.1, 20000);
	scene3d.add(camera3d);
	camera3d.position.set(0,150,400);
	camera3d.lookAt(scene3d.position);
	controls3d = new THREE.OrbitControls( camera3d, renderer3d.domElement );

	cameraCube3d = new THREE.PerspectiveCamera(45, width / height, 0.1, 20000);
	
	var imagePrefix = "../images/DarkSea-";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".jpg";
	var skyGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );	
	
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene3d.add(light);

	var ambientLight = new THREE.AmbientLight( 0x111111 );
	scene3d.add( ambientLight );

	pointLight = new THREE.PointLight( 0xff0000, 0.5 );
	pointLight.position.z = 2500;
	scene3d.add( pointLight );

	var pointLight2 = new THREE.PointLight( 0xff6666, 1 );
	camera3d.add( pointLight2 );

	var pointLight3 = new THREE.PointLight( 0x0000ff, 0.5 );
	pointLight3.position.x = - 1000;
	pointLight3.position.z = 1000;
	scene3d.add( pointLight3 );

	var ambient = new THREE.AmbientLight( 0xffffff );
	scene3d.add( ambient );

	// Skybox
	var r = "../images/";
	var urls = [ r + "xpos.jpg", r + "xneg.jpg",
				 r + "ypos.jpg", r + "yneg.jpg",
				 r + "zpos.jpg", r + "zneg.jpg" ];
	
	// img = "subway/20_Subway_Lights_8k";
	img = "factory/Factory_Catwalk_Bg";
	var urls = [ 
				 r + img+ ".threejs1.jpg",
				 r + img+ ".threejs3.jpg",
				 r + img+ ".threejs4.jpg", 
				 r + img+ ".threejs5.jpg", 
				 r + img+ ".threejs0.jpg", 
				 r + img+ ".threejs2.jpg", 
				 ];

	textureCube3d = THREE.ImageUtils.loadTextureCube( urls );
	textureCube3d.format = THREE.RGBFormat;

	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube3d;

	var material = new THREE.ShaderMaterial( {

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide

	} );

	var mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
	sceneCube3d.add( mesh );
	// controls3d.autoRotate=true;
	// controls3d.autoRotateSpeed=2;
}
function init2DRenderer() 
{
	maincanvasdiv=document.getElementById('maincanvas');
	var width = maincanvasdiv.offsetWidth;
	var height = maincanvasdiv.offsetHeight;
	renderer2d = new THREE.WebGLRenderer({clearColor: 0xffffff,antialias: true });
	renderer2d.domElement.style.background = "#ffffff";
	renderer2d.setSize(width, height);
	renderer2d.setClearColor( 0xffffff );
	maincanvasdiv.appendChild(renderer2d.domElement);
	renderer2d.domElement.id="renderer2d";
	renderer2d.domElement.style['z-index']=41;

	scene2d = new THREE.Scene();

	camera2d = new THREE.PerspectiveCamera(45, width / height, 0.1, 20000);
	scene2d.add(camera2d);
	camera2d.position.set(0,0,400);
	camera2d.lookAt(scene2d.position);
	controls2d = new THREE.OrbitControls( camera2d, renderer2d.domElement );
	// controls2d.enableRotate=false;
	var axisHelper = new THREE.AxisHelper( 50 );
	scene2d.add( axisHelper );
}
function initRenderer () 
{
	maincanvasdiv=document.getElementById('maincanvas');
	// Initialize the renderer for 2D
	init2DRenderer();
	// Initialize the renderer for 3D
	init3DRenderer();
	// Set the canvas size
	onWindowResize();
	// Initialize the animation
	animate();
	// Event for window resize
	window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() 
{
	var width = maincanvasdiv.offsetWidth;
	var height = maincanvasdiv.offsetHeight;
	if (useCanvas['3d']==true && useCanvas['2d']==true)
		height=height/2;
	
	camera2d.aspect = width / height;
	camera2d.updateProjectionMatrix();
	renderer2d.setSize( width, height );
	
	camera3d.aspect = width / height;
	camera3d.updateProjectionMatrix();
	renderer3d.setSize( width, height );
}
function animate() 
{
	requestAnimationFrame( animate );
	if (useCanvas['3d']==true)
		controls3d.update();
	if (useCanvas['2d']==true)
		controls2d.update();
	render();
}
function render() 
{
	render2D();
	render3D();
}
function render2D (r) 
{
	if (useCanvas['2d']==true || r==true)
	{
		renderer2d.clear();
		renderer2d.render( scene2d, camera2d );
	}
}
function render3D (r) 
{
	if (useCanvas['3d']==true || r==true)
	{
		renderer3d.clear();
		cameraCube3d.rotation.copy( camera3d.rotation );
		// renderer3d.render( sceneCube3d, cameraCube3d );
		// if (speed<0.02)
			// speed+=0.0001;
		scene3d.rotation.x = (scene3d.rotation.x+speed)%(Math.PI*2);
		renderer3d.render( scene3d, camera3d );
	}
}
function mouseCoordinates (event) 
{
	mouseCoord.x = ( event.clientX / maincanvasdiv.offsetWidth ) * 2 - 1;
	mouseCoord.y = - ( event.clientY / maincanvasdiv.offsetHeight) * 2 + 1;
	mouseCoord.z = 0;
	mouseCoord.unproject(camera);
	mouseCoordinatesElem.innerHTML="X = "+mouseCoord.x.toFixed(2)+" Y = "+mouseCoord.y.toFixed(2);
}
function enableRenderer (r) 
{
	if (r=='3d')
	{
		useCanvas['3d']=true;
		document.getElementById("renderer3d").style.display="inline";
		onWindowResize();
	}
	else
	{
		useCanvas['2d']=true;
		document.getElementById("renderer2d").style.display="inline";
		onWindowResize();
	}
	render();
}
function disableRenderer (r) 
{
	if (r=='3d' && useCanvas['2d']==true)
	{
		useCanvas['3d']=false;
		document.getElementById("renderer3d").style.display="none";
		onWindowResize();
	}
	else if (r=='2d' && useCanvas['3d']==true)
	{
		console.log("aqui");
		useCanvas['2d']=false;
		document.getElementById("renderer2d").style.display="none";
		onWindowResize();
	}
	else
		useCanvas[r]=!useCanvas[r];
}
function toggleRenderer (r) 
{
	useCanvas[r]=!useCanvas[r];
	if (useCanvas[r]==true)
		enableRenderer(r);
	else
		disableRenderer(r);
}
function clearCanvas () 
{
	renderer3d.clear();
	renderer2d.clear();
}
function remove2DWorkpiece () 
{
	self.scene2d.remove(self.scene2d.getObjectByName("2Dworkpiece"));
}
function remove3DWorkpiece () 
{
	self.scene3d.remove(self.scene3d.getObjectByName("3Dworkpiece"));
}
function removeWorkpieceBoundaries () 
{
	self.scene2d.remove(self.scene2d.getObjectByName("2DworkpieceDash"));
}