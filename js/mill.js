function Mill (options) 
{
	if(this === window)
        return new Mill(options);

	options = options || {};
    this.renderResolution = options.renderResolution||{x:400,y:400};
	this.workpiece = {x:100,y:100,z:10};
	this.lineColors = {g0: new THREE.Color(1,0,0),
		g1: new THREE.Color(0,0,1),g2: new THREE.Color(1,0,1),g3: new THREE.Color(0,1,1)};
	this.init();
}
Mill.prototype.init = function () 
{
	this.init2D();
	// this.init3D();
}
Mill.prototype.create2DWorkpiece = function (positions,colors) 
{
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'vcolor', new THREE.BufferAttribute( colors, 1 ) );
	geometry.computeBoundingSphere();
	var mesh = new THREE.Line( geometry, this.material2d );
	mesh.name="2Dworkpiece";
	self.scene2d.remove(self.scene2d.getObjectByName(mesh.name));
	self.scene2d.add( mesh );
};
Mill.prototype.init2D = function () 
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
Mill.prototype.init3D = function() 
{
	this.renderer3dL1 = new THREE.WebGLRenderer({clearColor: 0xffffff,antialias: false });
	this.renderer3dL1.setSize(this.renderResolution.x, this.renderResolution.y);
	this.scene3dL1 = new THREE.Scene();
	var ambient = new THREE.AmbientLight( 0xffffff );
	this.scene3dL1.add( ambient );
	this.camera3dL1 = new THREE.OrthographicCamera(0, this.renderResolution.x, this.renderResolution.y, 0, -10, 10 );
	this.camera3dL1.lookAt(new THREE.Vector3(0.0,0.0,-10.0));
	this.camera3dL1.position.x = 0;
	this.camera3dL1.position.y = 0;
	this.camera3dL1.position.z = 0;
	// this.camera3dL1.lookAt(this.scene3dL1.position);
	this.scene3dL1.add( this.camera3dL1 );

	maincanvasdiv.appendChild(this.renderer3dL1.domElement);
	this.renderer3dL1.domElement.id="renderer3d";
	this.renderer3dL1.domElement.style['z-index']=42;

	this.material3d = new THREE.ShaderMaterial( {
					uniforms: {
						g0: { type: "c", value: this.lineColors.g0 },
						g1: { type: "c", value: this.lineColors.g1 },
						g2: { type: "c", value: this.lineColors.g2 },
						g3: { type: "c", value: this.lineColors.g3 }
					},
					vertexShader:
	'varying vec2 vUv;\n'+
	'varying float distZ;\n'+
	'float scaleWorkpiece=2.0;\n'+
	'void main()\n'+
	'{\n'+
	'	vUv = uv;\n'+
	'	vec4 mvPosition = modelViewMatrix * vec4( position*scaleWorkpiece,1.0 );\n'+
	'	gl_Position = projectionMatrix * mvPosition;\n'+
	'	distZ = -50.0*position.z;\n'+
	'}'
					,
					fragmentShader: 
	'varying vec2 vUv;\n'+
	'varying float distZ;\n'+
	'void main(void) \n'+
	'{\n'+
		'if (distZ<0.0)\n'+
		'	{discard;}\n'+
		'float r=floor(distZ);\n'+
		'float g=(distZ-r)*100.0;\n'+
		'float b=g*100.0-floor(g)*100.0;\n'+
		'g=floor(g);\n'+
		// 'gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n'+
		'gl_FragColor = vec4(r/255.0,g/255.0,b/255.0,1.0);\n'+
	'}'
					,
					linewidth: 1,side: THREE.DoubleSide,
				} );
};
Mill.prototype.create3DWorkpiece = function (positions,colors,tri) 
{
	// var geometry = new THREE.BufferGeometry();
	// geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	// geometry.addAttribute( 'vcolor', new THREE.BufferAttribute( colors, 1 ) );
	// geometry.computeBoundingSphere();
	// var mat = new THREE.LineBasicMaterial({color: 0x00ff00, linewidth: 10});
	// var mesh = new THREE.Line( geometry, this.material3d );
	// mesh.name="3Dworkpiece";
	// this.scene3dL1.remove(this.scene3dL1.getObjectByName(mesh.name));
	// this.scene3dL1.add( mesh );
	// this.renderer3dL1.render( this.scene3dL1, this.camera3dL1 );

	// var geometry = new THREE.BufferGeometry();
	// geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	// geometry.addAttribute( 'vcolor', new THREE.BufferAttribute( colors, 1 ) );
	// geometry.computeBoundingSphere();
	// var mat = new THREE.LineBasicMaterial({color: 0x00ff00, linewidth: 10});
	// var mesh = new THREE.Line( geometry, this.material3d );
	// mesh.name="3Dworkpiece";
	// this.scene3dL1.remove(this.scene3dL1.getObjectByName(mesh.name));
	// this.scene3dL1.add( mesh );
	// this.renderer3dL1.render( this.scene3dL1, this.camera3dL1 );

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( tri, 3 ) );
	// geometry.computeBoundingSphere();
	var mat = new THREE.LineBasicMaterial({color: 0x00ff00, linewidth: 10});
	var mesh = new THREE.Mesh( geometry, this.material3d );
	mesh.name="3Dworkpiece";
	this.scene3dL1.remove(this.scene3dL1.getObjectByName(mesh.name));
	this.scene3dL1.add( mesh );
	this.renderer3dL1.render( this.scene3dL1, this.camera3dL1 );
};

Mill.prototype.render = function(data) 
{
	this.create2DWorkpiece(data.positions,data.color);
	// this.create3DWorkpiece(data.positions,data.color,data.triangles);
}