/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */

CWS.CodeEditor = function () 
	{
		this.editor = new ace.edit("editor");
		this.editor.$blockScrolling = Infinity;
		this.editor.setTheme("ace/theme/monokai");
	    this.editor.getSession().setMode("ace/mode/gcode");
	    this.editor.getSession().setUseWrapMode(true);
	    this.editor.getSession().setTabSize(4);
	    this.editor.setFontSize(18);
	    this.unsaved = false;
		this.codeChangedSubscribers = [];

	    var context = this;
	    this.editor.on("change", function(e)
		{
			if (e.isLarge)
				return;
			context.codeChanged(e);
		});
	};

CWS.CodeEditor.prototype.constructor = CWS.CodeEditor;

CWS.CodeEditor.prototype.codeChanged = function (ev) 
	{
		var code = this.getCode();
		for (var i = 0; i < this.codeChangedSubscribers.length; i++) 
		{
			this.codeChangedSubscribers[i](code,ev);
		}
	};

CWS.CodeEditor.prototype.subscribeToCodeChanged = function (func) 
	{
		this.codeChangedSubscribers.push(func);
	};

CWS.CodeEditor.prototype.getCode = function() 
	{
		return this.editor.getValue();
	};

CWS.CodeEditor.prototype.setCode = function(code) 
	{
		this.editor.setValue(code,-1);
	};

CWS.CodeEditor.prototype.readOnly = function(ro) 
	{
		this.editor.setReadOnly(ro);
	};