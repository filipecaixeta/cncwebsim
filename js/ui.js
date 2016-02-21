/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */


CWS.UI = function (controller) 
	{
		$("#topMenu").click(
			function  (ev) 
			{
				var title = ev.target.title
				switch (title)
				{
					case "New Project":
						var d = new CWS.DialogBox(title);
						d.newProject(controller);
						break;
					case "Open Project":
						var d = new CWS.DialogBox(title);
						d.openProject(controller);
						break;
					case "Open Machine":
						var d = new CWS.DialogBox(title);
						d.openMachine(controller);
						break;
					case "Workpiece dimensions":
						var d = new CWS.DialogBox(title);
						d.workpieceDimensions(controller);
						break;
                    case "Export File":
                        controller.exportToOBJ();
                        break;
					default:
						break;
				}
			});

		this.elementEditor = $(document.getElementById("editor"));
		this.elementTopMenu = $(document.getElementById("topMenu"));
		this.elementCanvasContainer = $(document.getElementById("canvasContainer"));
		this.elementBottomMenu = $(document.getElementById("bottomMenu"));
		this.elementBody = $(document.body);
	};

CWS.UI.prototype.resize = function()
	{
		var width = this.elementBody.innerWidth();
		
		var editorWidth;
		if (this.elementEditor.css('display')=='none')
			editorWidth = 0;
		else
			editorWidth = this.elementEditor.innerWidth();

		this.elementTopMenu.innerWidth(width-editorWidth);
		this.elementCanvasContainer.innerWidth(width-editorWidth);
		this.elementBottomMenu.innerWidth(width-editorWidth);
	};

CWS.UI.prototype.constructor = CWS.UI;

CWS.DialogBox = function (title)
	{
		$("#dialogBox").remove();
		
		this.dialog = $( '<div id="dialogBox" title="'+title+'" ></div>');
	}

CWS.DialogBox.prototype.constructor = CWS.DialogBox;

CWS.DialogBox.prototype.newProject = function (controller)
	{
		var html = '<form id="menuNewProject">'+
			'<ul>'+
			'  <li>'+
			'    <label for= "projectName" >Project Name</label>'+
			'    <input type= "text" name= "projectName" />'+
			'  </li>'+
			'  <li>'+
			'    <label for= "machineType" >Machine</label>'+
			'    <input type="radio" name="machineType" value="Lathe" checked> Lathe'+
			'    <input type="radio" name="machineType" value="Mill"> Mill'+
			'    <input type="radio" name="machineType" value="3D Printer"> 3D Printer'+
			'  </li>'+
			'</ul>'+
			'</form>';
		this.dialog.append($(html));
		this.dialog.dialog(
	      {
	      width: 400,
	      buttons: 
	        { 
	            "Create": function()
	            {
	            	var values = {};
	            	var result = $(this.firstChild).serializeArray();
	            	for (var i = 0; i < result.length; i++) 
	            	{
	            		values[result[i].name]=result[i].value;
	            	}
	              	controller.createProject(values);
	              	$(this).dialog("close");
	            },
	          	"Cancel": function()
	            {
          			$(this).dialog("close");
	            }
	        }
	      });
	};

CWS.DialogBox.prototype.openProject = function (controller)
	{
		html = '<ul class="tableList">';
		var fileList = Object.keys(controller.listProjects());
		for (var i = 0; i < fileList.length; i++) 
		{
			html += '<li><span class="icon icon-file-text2"></span>'+fileList[i]+'</li>';
		}
		html += "</ul>";
        var dialog = this.dialog;
		html = $(html).click(function (event) 
			{
                if (event.target.parentElement.tagName.toLocaleLowerCase()=="div")
                    return;
                var projectName="";
                if (event.target.tagName.toLocaleLowerCase()=="li")
                {
                    projectName = event.target.textContent;
                }
                else
                {
                    projectName = event.target.parentElement.textContent;
                }
                controller.openProject(projectName);
                dialog.dialog("close");
			});
		this.dialog.append(html);
		this.dialog.dialog(
	      {
	      width: 400,
	      buttons: 
	        { 
	          	"Cancel": function()
	            {
          			$(this).dialog("close");
	            }
	        }
	      });
	};

CWS.DialogBox.prototype.openMachine = function (controller)
	{
		html = '<ul class="tableList">'+
		'  <li><span class="icon icon-lathe"></span>Lathe</li>'+
		'  <li><span class="icon icon-mill"></span>Mill</li>'+
		'  <li><span class="icon icon-printer"></span>3D Printer</li>'+
		'</ul>';
        var dialog = this.dialog;
		html = $(html).click(function (event) 
			{
                if (event.target.parentElement.tagName.toLocaleLowerCase()=="div")
                    return;
                var machineName="";
                if (event.target.tagName.toLocaleLowerCase()=="li")
                {
                    machineName = event.target.textContent;
                }
                else
                {
                    machineName = event.target.parentElement.textContent;
                }
                controller.openMachine(machineName);
                dialog.dialog("close");
			});
		this.dialog.append(html);
		this.dialog.dialog(
	      {
	      width: 400,
	      buttons: 
	        { 
	          	"Cancel": function()
	            {
          			$(this).dialog("close");
	            }
	        }
	      });
	};

CWS.DialogBox.prototype.workpieceDimensions = function (controller)
	{
        var machineType = controller.getMachineType();
        var workpiece = controller.getWorkpiece();
        var html = "";
        if (machineType=="Lathe")
        {
            html = '<form id="workpieceDimensions">'+
            '<ul>'+
            '  <li>'+
            '    <label for= "x" >Diameter</label>'+
            '    <input type= "text" name= "x" value="'+workpiece.x+'"/>'+
            '  </li>'+
            '   <li>'+
            '    <label for= "z" >Lenght</label>'+
            '    <input type= "text" name= "z" value="'+workpiece.z+'"/>'+
            '  </li>'+
            '</ul></form>';
        }
        else if (machineType=="Mill")
        {
            html = '<form id="workpieceDimensions">'+
            '<ul>'+
            '  <li>'+
            '    <label for= "x" >Size X</label>'+
            '    <input type= "text" name= "x" value="'+workpiece.x+'"/>'+
            '  </li>'+
            '  <li>'+
            '    <label for= "y" >Size Y</label>'+
            '    <input type= "text" name= "y" value="'+workpiece.y+'"/>'+
            '  </li>'+
            '   <li>'+
            '    <label for= "z" >Size Z</label>'+
            '    <input type= "text" name= "z" value="'+workpiece.z+'"/>'+
            '  </li>'+
            '</ul></form>';
        }
		this.dialog.append($(html));
		this.dialog.dialog(
	      {
	      width: 400,
	      buttons: 
	        { 
	            "Save": function()
	            {
	            	var values = {};
	            	var result = $(this.firstChild).serializeArray();
	            	for (var i = 0; i < result.length; i++) 
	            	{
	            		values[result[i].name]=result[i].value;
	            	}
	              	controller.setWorkpieceDimensions(values);
	              	$(this).dialog("close");
	            },
	          	"Cancel": function()
	            {
          			$(this).dialog("close");
	            }
	        }
	      });
	};
