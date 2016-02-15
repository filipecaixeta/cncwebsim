/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Printer = function (options)
	{
        options = options || {};
		CWS.Machine.call( this, options );

		this.tool = {radius:2.5,angle:70};
    }

CWS.Printer.prototype = Object.create( CWS.Machine.prototype );

CWS.Printer.prototype.constructor = CWS.Printer;

CWS.Printer.prototype.create2DWorkpiece = function () 
	{
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
		line = {};
		line.name="2DWorkpieceDash";
		return line;
	};

CWS.Printer.prototype.create3DWorkpiece = function () 
{
	var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( this.motionData.triangles, 3 ) );
	geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
	geometry.computeVertexNormals();
    var material = new THREE.MeshNormalMaterial({
            // wireframe: true,
            side: THREE.DoubleSide,
        });
    var mesh = new THREE.Mesh( geometry, material);
    mesh.name="3DWorkpiece";
    return mesh;
};