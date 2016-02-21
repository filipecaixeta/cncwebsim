/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.SHADER = {};

CWS.SHADER["vs-lathe-3D"] = 
	"attribute vec3 position;\n"+
	"varying float vDist;\n"+
	"uniform float workpieceLength;\n"+
	"uniform float workpieceRadius;\n"+
	"#define maxValue 65535.0 // 2^16-1\n"+
	"void main() \n"+
	"{\n"+
	"	// Z = horizontal\n"+
	"	// X = vertical\n"+
	"	float z=position.z/workpieceLength*2.0-1.0;\n"+
	"	float x=position.x/workpieceRadius*2.0-1.0;\n"+
	"	gl_Position = vec4(z,1.0,x, 1.0 );\n"+
	"	vDist = position.x/workpieceRadius*maxValue;\n"+
	"}\n";

CWS.SHADER["fs-lathe-3D"] = 
	"precision highp float;	\n"+
	"varying float vDist;\n"+
	"void main(void) \n"+
	"{\n"+
    "   float v = vDist;\n"+
    "   if (v<0.0)\n"+
    "       v=0.0;\n"+
	"	float r=floor(v/256.0);\n"+
	"	float g=v-r*256.0;\n"+
	"	gl_FragColor = vec4(r/256.0,g/256.0,0.0,1.0);\n"+
	"}\n";

CWS.SHADER["vs-lathe-mill-2D"] = 
	"attribute float vcolor;\n"+
	"varying float fcolor;\n"+
	"varying vec2 vUv;\n"+
	"void main()\n"+
	"{\n"+
	"	vUv = uv;\n"+
	"	fcolor = vcolor;\n"+
	"	vec4 mvPosition = modelViewMatrix * vec4( position,1.0 );\n"+
	"	gl_Position = projectionMatrix * mvPosition;\n"+
	"}\n";

CWS.SHADER["fs-lathe-mill-2D"] = 
	"varying float fcolor;\n"+
	"uniform vec3 g0;\n"+
	"uniform vec3 g1;\n"+
	"uniform vec3 g2;\n"+
	"uniform vec3 g3;\n"+
	"varying vec2 vUv;\n"+
	"void main(void) \n"+
	"{\n"+
	"	float color=floor(fcolor+0.5);\n"+
	"	if (color==0.0)\n"+
	"		{gl_FragColor=vec4(g0,1.0);}\n"+
	"	else if (color==1.0)\n"+
	"		{gl_FragColor=vec4(g1,1.0);}\n"+
	"	else if (color==2.0)\n"+
	"		{gl_FragColor=vec4(g2,1.0);}\n"+
	"	else if (color==3.0)\n"+
	"		{gl_FragColor=vec4(g3,1.0);}\n"+
	"	else\n"+
	"		{discard;}\n"+
	"}\n";

CWS.SHADER["vs-mill-1-3D"] = 
    "attribute vec3 position;\n"+
    "varying float vDist;\n"+
    "varying float xDist;\n"+
    "varying float yDist;\n"+
    "uniform vec3 dimensions;\n"+
    "#define maxValue 65535.0 // 2^16-1\n"+
    "void main()\n"+
    "{\n"+
    "    float x=position.x/dimensions.x*2.0-1.0;\n"+
    "    float y=position.y/dimensions.y*2.0-1.0;\n"+
    "    float z=(dimensions.z-position.z)/dimensions.z*2.0-1.0;\n"+
    "    gl_Position = vec4(x,y,z, 1.0 );\n"+
    "    vDist = (z/2.0+0.5)*maxValue;\n"+
    "    xDist = position.x/dimensions.x;\n"+
    "    yDist = position.y/dimensions.y;\n"+
    "}\n";

// Old version
CWS.SHADER["fs-mill-1-3D"] = 
    "precision highp float;\n"+
    "uniform float resolution;\n"+
    "varying float vDist;\n"+
    "varying float xDist;\n"+
    "varying float yDist;\n"+
    "#define maxValue 65535.0 // 2^16-1\n"+
    "void main(void) \n"+
    "{\n"+
    "   float x = xDist*resolution;\n"+
    "   float pixelPositionX = floor(x+127.0/256.0); // get the pixel position\n"+
    "   x = x-pixelPositionX; // real distance - pixel position gives a value from (-0.5,0.5)\n"+
    "   x = 0.5+x; // value from 0 to 1\n"+
    "   // to get the value back\n"+
    "   // (i/resolution+(v[i]-128)/255)*dimension\n"+
    
//                position[i*this.renderResolution*3+j*3+1] = (i+(dataview.getUint8(l+2)-127.0)/255.0)/this.renderResolution*dimensions.x;
//                position[i*this.renderResolution*3+j*3+0] = (j+(dataview.getUint8(l+3)-127.0)/255.0)/this.renderResolution*dimensions.y;
    
    "   \n"+
    "   float y = yDist*resolution;\n"+
    "   float pixelPositionY = floor(y+127.0/256.0); // get the pixel position\n"+
    "   y = y-pixelPositionY; // real distance - pixel position gives a value from (-0.5,0.5)\n"+
    "   y = 0.5+y; // value from 0 to 1\n"+
    "   \n"+
    "   float r = floor(vDist/256.0);\n"+
    "   float g = vDist-r*256.0;\n"+
    "   gl_FragColor = vec4(r/256.0,g/256.0,x,y);\n"+
    "}\n";

CWS.SHADER["function-to16BitValue"] = 
    "vec2 to16BitValue(float value)\n"+
    "   {\n"+
    "     vec2 v;\n"+
    "     v.x = floor(value/256.0);\n"+
    "     v.y = value-v.x*256.0;\n"+
    "     v.x = v.x/256.0;\n"+
    "     v.y = v.y/256.0;\n"+
    "     return v;\n"+
    "   }\n";

CWS.SHADER["vs-mill-1-3D"] = 
    "attribute vec3 position;\n"+
    "varying float xDist;\n"+
    "varying float yDist;\n"+
    "varying float zDist;\n"+
    "uniform vec3 dimensions;\n"+
    "uniform float toolRadius;\n"+
    "#define maxValue 65535.0 // 2^16-1\n"+
    "void main()\n"+
    "{\n"+
    "    xDist = (position.x+toolRadius)/dimensions.x;\n"+
    "    yDist = (position.y+toolRadius)/dimensions.y;\n"+
    "    zDist = (dimensions.z-position.z)/dimensions.z;\n"+
    "    float x = xDist*2.0-1.0;\n"+
    "    float y = yDist*2.0-1.0;\n"+
    "    float z = zDist*2.0-1.0;\n"+
    "    gl_Position = vec4(x,y,z, 1.0 );\n"+
    "    xDist = xDist*maxValue;\n"+
    "    yDist = yDist*maxValue;\n"+
    "    zDist = zDist*maxValue;\n"+
    "}\n";

CWS.SHADER["fs-mill-1-3D"] = 
    "precision highp float;\n"+
    "precision highp int;\n"+
    "uniform int currentDimension;\n"+
    "uniform float resolution;\n"+
    "varying float xDist;\n"+
    "varying float yDist;\n"+
    "varying float zDist;\n"+
    "\n"+
    CWS.SHADER["function-to16BitValue"]+
    "\n"+
    "void main(void) \n"+
    "{\n"+
    "    if (currentDimension==0)\n"+
    "    {\n"+
    "        vec2 x = to16BitValue(xDist);\n"+
    "        vec2 y = to16BitValue(yDist);\n"+
    "        gl_FragColor = vec4(x.x,x.y,y.x,y.y);\n"+
    "    }\n"+
    "    else\n"+
    "    {\n"+
    "        vec2 z = to16BitValue(zDist);\n"+
    "        gl_FragColor = vec4(z.x,z.y,1.0,1.0);\n"+
    "    }\n"+
    "}\n";

CWS.SHADER["vs-mill-2-3D"] = 
    "attribute vec3 position;\n"+
    "attribute vec2 texcoord;\n"+
    "varying float zDist;\n"+
    "varying float xDist;\n"+
    "varying float yDist;\n"+
    "uniform vec3 dimensions;\n"+
    "varying vec2 vTextureCoord;\n"+
    "#define maxValue 65535.0 // 2^16-2\n"+
    "void main() \n"+
    "{\n"+
    "  float x=position.x/dimensions.x*2.0-1.0;\n"+
    "  float y=position.y/dimensions.y*2.0-1.0;\n"+
    "  float z=position.z/maxValue*2.0-1.0;\n"+
    "  gl_Position = vec4(x,y,z, 1.0 );\n"+
    "  zDist = position.z;\n"+
    "  xDist = position.x/dimensions.x*maxValue;\n"+
    "  yDist = position.y/dimensions.y*maxValue;\n"+
    "  vTextureCoord = texcoord;\n"+
    "}\n";

CWS.SHADER["fs-mill-2-3D"] = 
    "precision highp float;\n"+
    "precision highp int;\n"+
    "varying highp vec2 vTextureCoord;\n"+
    "varying float zDist;\n"+
    "varying float xDist;\n"+
    "varying float yDist;\n"+
    "uniform vec3 dimensions;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform int currentDimension;\n"+
    "#define TOOLMAXDEPH 10.0 // 10mm\n"+
    CWS.SHADER["function-to16BitValue"]+
    "void main(void) \n"+
    "{\n"+
    "  vec4 color = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n"+
//    "  if (color.a == 1.0)\n"+
    "  if (vTextureCoord.x*vTextureCoord.x+vTextureCoord.y*vTextureCoord.y<=1.0)\n"+
    "  {\n"+
    "    if (currentDimension==0)\n"+
    "    {\n"+
    "      vec2 x = to16BitValue(xDist);\n"+
    "      vec2 y = to16BitValue(yDist);\n"+
    "      gl_FragColor = vec4(x.x,x.y,y.x,y.y);\n"+
    "    }\n"+
    "    else\n"+
    "    {\n"+
    "      float d = color.r/dimensions.z*65535.0;\n"+
    "      vec2 z = to16BitValue(zDist);\n"+
    "      gl_FragColor = vec4(z.x,z.y,0.0,1.0);\n"+
    "    }\n"+
    "  }\n"+
    "  else\n"+
    "  {\n"+
    "    discard;\n"+
    "  }\n"+
    "}\n";
