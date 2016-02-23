/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Printer = function (options)
	{
        options = options || {};
		CWS.Machine.call( this, options );
		this.initMesh();
    }

CWS.Printer.prototype = Object.create( CWS.Machine.prototype );

CWS.Printer.prototype.constructor = CWS.Printer;

CWS.Printer.prototype.initMesh = function ()
    {
    	var geometry = new THREE.BufferGeometry();
	    geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(3), 3 ) );
		geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0),99999);
        var mesh = new THREE.Mesh( geometry, this.material3D);
            mesh.name="3DWorkpiece";
        this.mesh3D = mesh;
    };


CWS.Printer.prototype.create2DWorkpiece = function () 
	{
		if (!this.motionData.run2D)
			return {name:"2DWorkpiece"};
		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( this.motionData.positions, 3 ) );
		geometry.addAttribute( 'vcolor', new THREE.BufferAttribute( this.motionData.color, 1 ) );
		geometry.computeBoundingSphere();
		var mesh = new THREE.LineSegments( geometry, this.material2D );
		
        mesh.name="2DWorkpiece";
		return mesh;
	};

CWS.Printer.prototype.create2DWorkpieceLimits = function () 
	{
		return {name:"2DWorkpieceDash"};
	};

CWS.Printer.prototype.create3DWorkpiece = function () 
{
	if (!this.motionData.run3D || this.motionData.triangles.length===0)
		return {name:"3DWorkpiece"};
	var geometry = this.mesh3D.geometry;
	geometry.attributes.position.array = this.motionData.triangles;
	geometry.attributes.position.needsUpdate = true;
    geometry.computeFaceNormals();
	geometry.computeVertexNormals();

    return this.mesh3D;
};