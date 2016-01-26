function DialogBox (title) 
{
	try{document.body.removeChild(document.getElementById("dialogBox"));}
	catch(e){}
	var dialog=document.createElement("div");
	dialog.className="dialogBox";
	dialog.id="dialogBox";
	
	dialog.dh=document.createElement('div');
	dialog.dh.className="dialogBoxH";
	dialog.appendChild(dialog.dh);
	
	dialog.db=document.createElement("div");
	dialog.dh.innerHTML=title+'<span title="Close" class="icon-cross">';
	dialog.db.className="dialogBoxB";
	dialog.appendChild(dialog.db);
	
	document.body.appendChild(dialog);
	
	dialog.dh.getElementsByClassName("icon-cross")[0].addEventListener("click", function(e)
	{
    	document.body.removeChild(dialog);
	});

	var selected = dialog,
    x_pos = 0, y_pos = 200,
    x_elem = 0, y_elem = 0;
	x_pos=(document.getElementById('maincanvas').offsetWidth-400)/2;
	dialog.style.left=x_pos;

	function _drag_init() 
	{
		selected=dialog;
	    x_elem = x_pos - selected.offsetLeft;
	    y_elem = y_pos - selected.offsetTop;
	}

	function _move_elem(e) 
	{
	    x_pos = document.all ? window.event.clientX : e.pageX;
	    y_pos = document.all ? window.event.clientY : e.pageY;
	    if (selected !== null) {
	        selected.style.left = (x_pos - x_elem ) + 'px';
	        selected.style.top = (y_pos - y_elem ) + 'px';
	    }
	}
	function _destroy() 
	{
	    selected = null;
	}
	dialog.dh.onmousedown = function () 
	{
	    _drag_init();
	    document.onmousemove = _move_elem;
		document.onmouseup = _destroy;
	    return false;
	};

	this.dialog=dialog;

	switch (title)
	{
		case 'New File':
			
		default:
			break;
	}
}
DialogBox.prototype.close = function () 
{
	document.body.removeChild(this.dialog);
}
///////////////////////////
////      MENU FILE     ///
///////////////////////////
DialogBox.prototype.dialogNewFile = function()
{
	var html=  '<label for="filename">File Name: </label>'+
  					'<input type="text" name="filename">'+
      			'<label for="machinetype">Machine: </label>'+
   					'<input type="radio" name="machinetype" value="Lathe">Lathe'+
					'<input type="radio" name="machinetype" value="Mill">Mill'+
					'<input type="radio" name="machinetype" value="Printer">3D printer'+
      			'<label for="includeheader">Include sample header: </label>'+
      				'<input type="radio" name="includeheader" value="yes">Yes'+
					'<input type="radio" name="includeheader" value="no">No';
    button=document.createElement("button");
    button.innerHTML="Create";
  	this.dialog.db.innerHTML=html;
  	this.dialog.db.appendChild(button);
  	var _this=this;
  	button.addEventListener("click", function(e)
	{
		var filename="";
		var includeheader="yes";
		var machineType;
		el=_this.dialog.db.getElementsByTagName('input');
		for (var i = 0; i < el.length; i++) 
		{
			if (el[i].name=="filename")
				filename=el[i].value;
			else if (el[i].name=="machinetype" && el[i].checked)
				machineType=el[i].value;
			else if (el[i].name=="includeheader" && el[i].checked)
				includeheader=el[i].value;
		};
		if (filename!="")
		{
			var pname=locSto.newProject({name:filename,machineType:machineType})
			locSto.loadProject(pname);
		}
		_this.close();
	});
};
DialogBox.prototype.dialogOpenFile = function()
{
	var projectList=locSto.projectNames;
	var row = '<div class="dialogBoxRow">';
	html="";
	for (var i=0; i<projectList.length; i++)
	{
		if (i%3==0 || i==projectList.length-1)
			html+=row;

		html+= '<div class="dialogBoxIcons">'+
					'<span class="icon icon-file-text2"></span>'+
	  				'<div class="dialogBoxL">'+projectList[i]+'</div>'+
	      		'</div>';

		if (i%3==2 || i==projectList.length-1)
			html+='</div>';		
	} 
  	this.dialog.db.innerHTML=html;
  	var _this=this;
  	this.dialog.db.addEventListener("click", function(e)
	{
		var el=e.target.parentNode.childNodes[1];
		if (el.className=="dialogBoxL")
		{
			locSto.loadProject(el.innerHTML);
		}
		_this.close();
	});
};
///////////////////////////
////    MENU MACHINE    ///
///////////////////////////
DialogBox.prototype.dialogOpenMachine = function()
{
	var row = '<div class="dialogBoxRow">';
	html="";
	html+=row;
	html+= '<div class="dialogBoxIcons">'+
				'<span class="icon icon-lathe"></span>'+
	  			'<div class="dialogBoxL">Lathe</div>'+
	      	'</div>';
	html+= '<div class="dialogBoxIcons">'+
				'<span class="icon icon-mill"></span>'+
	  			'<div class="dialogBoxL">Mill</div>'+
	      	'</div>';
	html+= '<div class="dialogBoxIcons">'+
				'<span class="icon icon-printer"></span>'+
	  			'<div class="dialogBoxL">3D Printer</div>'+
	      	'</div>';
	html+='</div>';
  	this.dialog.db.innerHTML=html;
	var _this=this;
  	this.dialog.db.addEventListener("click", function(e)
	{
		var el=e.target.parentNode.childNodes[1];
		if (el.className=="dialogBoxL")
		{
			locSto.machineType = el.innerHTML;
		}
		_this.close();
	});
};
///////////////////////////
////   MENU Workpiece   ///
///////////////////////////
DialogBox.prototype.dialogWPDimension = function()
{
	var workpiece=locSto.workpiece;
	if (locSto.machineType=="Lathe")
	{
		html=	'<label for="Diameter">Diameter: </label>'+
					'<input type="number" name="Diameter" min="0.001" max="10000" step = "any" value="'+workpiece.diameter+'">'+
				'<label for="Length">Length: </label>'+
					'<input type="number" name="Length" min="0.001" max="10000" step = "any" value="'+workpiece.len+'">';
	}
	else
	{
		html=	'<label for="Size X">Size X: </label>'+
					'<input type="number" name="Size X" min="0.001" max="10000" step = "any" value="'+workpiece.x+'">'+
				'<label for="Size Y">Length: </label>'+
					'<input type="number" name="Size Y" min="0.001" max="10000" step = "any" value="'+workpiece.y+'">'+
				'<label for="Size Z">Length: </label>'+
					'<input type="number" name="Size Z" min="0.001" max="10000" step = "any" value="'+workpiece.z+'">';	
	}
	button=document.createElement("button");
    button.innerHTML="Save";
  	this.dialog.db.innerHTML=html;
  	this.dialog.db.appendChild(button);
  	var _this=this;
  	button.addEventListener("click", function(e)
	{
		el=_this.dialog.db.getElementsByTagName('input');
		for (var i = 0; i < el.length; i++) 
		{
			if (el[i].name=="Diameter")
				workpiece.diameter = parseFloat(el[i].value);
			else if (el[i].name=="Length")
				workpiece.len = parseFloat(el[i].value);
			else if (el[i].name=="Size X")
				workpiece.x = parseFloat(el[i].value);
			else if (el[i].name=="Size Y")
				workpiece.y = parseFloat(el[i].value);
			else if (el[i].name=="Size Z")	
				workpiece.z = parseFloat(el[i].value);
		};
		locSto.workpiece = workpiece;
		runCode();
		_this.close();
	});
};
function initUI () 
{
	document.getElementById("mainmenu").addEventListener("click", function(e)
	{
		switch (e.target.title)
		{
			case "New File":
				var d = new DialogBox(e.target.title);
				d.dialogNewFile();
				break;
			case "Open File":
				var d = new DialogBox(e.target.title);
				d.dialogOpenFile();
				break;
			case "Open Machine":
				var d = new DialogBox(e.target.title);
				d.dialogOpenMachine();
				break;
			case "Workpiece dimensions":
				var d = new DialogBox(e.target.title);
				d.dialogWPDimension();
				break;
			default:
				break;
		}
	});
	document.getElementById("footermenu").addEventListener("click", function(e)
	{
		switch (e.target.title)
		{
			case "Simulate 2D":
				toggleRenderer('2d');
				break;
			case "Simulate 3D":
				toggleRenderer('3d');
				break;
			case "Run":
				reloadSim();
				break;
			default:
				break;
		}
	});

}