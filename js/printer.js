/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.Printer = function (options)
	{
        options = options || {};
		CWS.Machine.call( this, options );
		this.mtype="3D Printer";
		this.boundingSphere = false;
		this.create2DWorkpieceLimits();
		this.initGeometry2D();
		this.initGeometry3D();
    }

CWS.Printer.prototype = Object.create( CWS.Machine.prototype );

CWS.Printer.prototype.constructor = CWS.Printer;

CWS.Printer.prototype.initGeometry2D = function () 
    {
        var geometry = new THREE.BufferGeometry();
        geometry.boundingSphere = new THREE.Sphere( new THREE.Vector3(0,0,0),99999);
        geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array([0,0,0,0,0,0]) ,3));
        geometry.addAttribute( 'vcolor', new THREE.BufferAttribute( new Float32Array([0,0]) ,1 ));
        geometry.attributes.position.dynamic = true;
        geometry.attributes.vcolor.dynamic = true;
        geometry.setDrawRange(0,Infinity);
        var mesh = new THREE.LineSegments( geometry, this.material2D );
        mesh.name = "2DWorkpiece";
        this.mesh2D = mesh;
    };

CWS.Printer.prototype.initGeometry3D = function ()
    {
    	var geometry = new THREE.BufferGeometry();
	    geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(3), 3 ) );
		geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0),99999);
		// this.material3D.depthWrite = true;
		this.material3D.shading = THREE.FlatShading;
        var mesh = new THREE.Mesh( geometry, this.material3D);
            mesh.name="3DWorkpiece";
        this.mesh3D = mesh;
    };

CWS.Printer.prototype.create2DWorkpieceLimits = function () 
	{
		if (this.meshes.meshWorkpiece === true)
            return;

		var geometry = new THREE.PlaneGeometry(this.machine.dimension.x,this.machine.dimension.y,1,1);
		var material = new THREE.MeshBasicMaterial( {color: 0xa0a0a0, side: THREE.DoubleSide} );
		var mesh = new THREE.Mesh( geometry, material );

		mesh.visible = true;
        this.meshes.meshWorkpiece = true;
        this.meshWorkpiece = mesh;
	};

CWS.Printer.prototype._create3DWorkpiece = function () 
	{
        var positions = this.motionData.positions;
        var vcolor = this.motionData.color;
        var l = positions.length;
        var geometry = this.mesh3D.geometry;

		var vertices = new Float32Array( l*4 );
        var index = new Uint32Array( l*4 );

		// d = data.header.workpiece.diameter;
		var d=this.workpiece.layerHeight/2;
		var iv=0;
		var j=0;
		var ii=0;
		while (j<l)
		{
			vx=(positions[j+3]-positions[j+0]);
			vy=(positions[j+4]-positions[j+1]);
			N =Math.sqrt(vx*vx+vy*vy);

			Ux=-vy/N*d;
			Uy=vx/N*d;

			dx=positions[j+3]-positions[j+0];
			dy=positions[j+4]-positions[j+1];

			px=[Ux+positions[j+0],-Ux+positions[j+0]];
			py=px+[dx,dy];

			z1 = positions[j+2];
			z2 = positions[j+5];
			p1=[positions[j+0],positions[j+1]];
			// p2=[positions[j+3],positions[j+4]];
			p3=[Ux+p1[0],Uy+p1[1]];
			p4=[p3[0]+dx,p3[1]+dy];
			p5=[-Ux+p1[0],-Uy+p1[1]];
			p6=[p5[0]+dx,p5[1]+dy];
			//     p4   p2   p6
			//     /    /    /
			//    /    /    /
			//   /    /    /
			//  /    /    /
			// p3   p1   p5

			// p3-  0
			vertices[iv+0] = p3[0];
			vertices[iv+1] = p3[1];
			vertices[iv+2] = z1-d;
			// p4-  1
			vertices[iv+3] = p4[0];
			vertices[iv+4] = p4[1];
			vertices[iv+5] = z2-d;
			// p6-  2
			vertices[iv+6] = p6[0];
			vertices[iv+7] = p6[1];
			vertices[iv+8] = z2-d;
			// p5-  3
			vertices[iv+9] = p5[0];
			vertices[iv+10] = p5[1];
			vertices[iv+11] = z1-d;
			// p3+  4
			vertices[iv+12] = p3[0];
			vertices[iv+13] = p3[1];
			vertices[iv+14] = z1+d;
			// p4+  5
			vertices[iv+15] = p4[0];
			vertices[iv+16] = p4[1];
			vertices[iv+17] = z2+d;
			// p6+  6
			vertices[iv+18] = p6[0];
			vertices[iv+19] = p6[1];
			vertices[iv+20] = z2+d;
			// p5+  7
			vertices[iv+21] = p5[0];
			vertices[iv+22] = p5[1];
			vertices[iv+23] = z1+d;
			
			var i=iv/3;

			index[ii++] = i+3; index[ii++] = i+2; index[ii++] = i+7;
			index[ii++] = i+2; index[ii++] = i+6; index[ii++] = i+7;

			index[ii++] = i+4; index[ii++] = i+1; index[ii++] = i+0;
			index[ii++] = i+5; index[ii++] = i+1; index[ii++] = i+4;

			index[ii++] = i+3; index[ii++] = i+0; index[ii++] = i+1;
			index[ii++] = i+3; index[ii++] = i+1; index[ii++] = i+2;

			index[ii++] = i+7; index[ii++] = i+5; index[ii++] = i+4;
			index[ii++] = i+6; index[ii++] = i+5; index[ii++] = i+7;

			iv+=24;
			j+=6;
		}

		delete geometry.attributes.position;
		delete geometry.attributes.normal;
		geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices ,3));
		geometry.setIndex( new THREE.BufferAttribute( index, 1 ) );
		geometry.computeVertexNormals();

		this.mesh3D.animation =
		{
        	size: geometry.attributes.position.array.length,
        	beg:0,
        	end:0,
        	dataSize: 24,
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
		        			return;
		        		}
		        		this.end += this.step*this.dataSize;
		        		while (vcolor[this.end/this.dataSize*2]>=2)
		        		{
		        			this.end += this.dataSize;
		        		}
		        		geometry.setDrawRange(this.beg,this.end);
		        	}
        		}
        		else
        		{
        			this.next = function(){};
        			geometry.setDrawRange(0,Infinity);	
        		}
        	},
        	next: function(){},
    	};
	};