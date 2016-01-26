function Printer (options) 
{
	if(this === window)
        return new Printer(options);
	options = options || {};
	this.renderResolution = options.renderResolution||1024;
	this.workpiece = {x:100,y:100,z:10};
	this.lineColors = {g0: new THREE.Color(1,0,0),
		g1: new THREE.Color(0,0,1),g2: new THREE.Color(1,0,1),g3: new THREE.Color(0,1,1)};
}
Printer.prototype.init = function () 
{
	this.init2D();
}

Printer.prototype.create2DWorkpiece = function (positions,colors) 
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
Printer.prototype.init2D = function () 
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