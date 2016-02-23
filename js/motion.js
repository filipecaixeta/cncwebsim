/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br/
 */

CWS.Motion = function () 
	{
		this.worker = new Worker("./js/motionWorker.js");
		this.running = false;
		this.data = null;
		this.controller = null;
	};

CWS.Motion.prototype.constructor = CWS.Motion;

CWS.Motion.prototype.run = function () 
	{
		if (this.running===true)
			return;
		this.postMessage(this.data);
	};

CWS.Motion.prototype.setData = function (data) 
	{
		this.data=data;
	};

CWS.Motion.prototype.postMessage = function () 
	{
		if (this.data!==null)
			{
				this.running = true;
				this.worker.postMessage(this.data);
			}
		this.data = null;
	};

CWS.Motion.prototype.setController = function (controller) 
	{
		this.controller = controller;
		var _this=this;
		this.worker.onmessage = function (e) 
		{
			if (e.data.error.length!=0)
				console.log(e.data.error);
			_this.controller.machine.setMotion(e.data);
			_this.controller.updateWorkpieceDraw();
			_this.running = false;
		};
	};