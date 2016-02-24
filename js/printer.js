/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Printer = function (options)
	{
        options = options || {};
		CWS.Machine.call( this, options );
		this.mtype="3D Printer";
		this.boundingSphere = false;
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
		this.boundingSphere = geometry.boundingSphere;
		var mesh = new THREE.LineSegments( geometry, this.material2D );
		// mesh.rotation.x=-Math.PI/2;
		if (this.boundingSphere)
		{
			// console.log(this.boundingSphere);
			mesh.position.x = -this.boundingSphere.center.x;
	        mesh.position.y = -this.boundingSphere.center.y;
	        // mesh.position.z = -this.boundingSphere.center.z;
		}
        mesh.name="2DWorkpiece";
		return mesh;
	};

CWS.Printer.prototype.create2DWorkpieceLimits = function () 
	{
		// return {name:"2DWorkpieceDash"};
		var geometry = new THREE.PlaneGeometry(this.machine.dimension.x,this.machine.dimension.y,1,1);
		var material = new THREE.MeshBasicMaterial( {color: 0xa0a0a0, side: THREE.DoubleSide} );
		var mesh = new THREE.Mesh( geometry, material );
		if (this.boundingSphere)
		{
			// console.log(this.boundingSphere);
			mesh.position.x = -this.boundingSphere.center.x;
	        mesh.position.y = -this.boundingSphere.center.y;
	        // mesh.position.z = -this.boundingSphere.center.z;
		}
		mesh.name="2DWorkpieceDash";
		return mesh;
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
		if (this.boundingSphere)
		{
			this.mesh3D.position.x = -this.boundingSphere.center.x;
	        this.mesh3D.position.y = -this.boundingSphere.center.y;
	        // this.mesh3D.position.z = -this.boundingSphere.center.z;
		}
		// this.mesh3D.rotation.x=-Math.PI/2;
		// this.mesh3D.rotation.y=Math.PI/2;
	    return this.mesh3D;
	};