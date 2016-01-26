function CodeEditor (editor) 
{
	this.editor = new ace.edit("editor");
	this.editor.$blockScrolling = Infinity;
	this.editor.setTheme("ace/theme/monokai");
    this.editor.getSession().setMode("ace/mode/gcode");
    this.editor.getSession().setUseWrapMode(true);
    this.editor.getSession().setTabSize(4);
    this.editor.setFontSize(18);
    this.unsaved = false;

    var _this = this;
    this.editor.on("change", function(e)
	{
		// Ace editor fires one event for every 20000 lines changed
		// A modification on Document.splitAndapplyLargeDelta makes possible to detect that
		// If isLarge is true it means that the code was splited
		if (e.isLarge)
			return;
		// Files smaller than 1000 lines will be automaticaly saved
		if (_this.editor.getSession().getLength()<1000)
		{
			try
			{
				locSto.code=_this.getCode();
				_this.unsaved = false;
			}catch(e){}
		}
		else
			_this.unsaved = true;
		// Call the parserWorker to parse the code on the background
		runCode();
	});
}
CodeEditor.prototype.setCode = function(code) 
{
	this.editor.setValue(code,-1);
};
CodeEditor.prototype.readOnly = function(ro) 
{
	this.editor.setReadOnly(ro);
};
CodeEditor.prototype.getCode = function() 
{
	return this.editor.getValue();
};
