var Fader = function(_pos, _height, _index){
	this.index = _index;
	this.pos = _pos;
	this.h = _height;
	this.handlepos = createVector(_pos.x, _pos.y + _height);
	this.handlewidth = width*0.01;
	this.handleheight = height*0.01;
	this.ishandled = false;

	this.display = function(){
		stroke(255);
		rectMode(CENTER);
		line(this.pos.x, this.pos.y-this.h, this.pos.x, this.pos.y+this.h);
		rect(this.handlepos.x, this.handlepos.y, this.handlewidth, this.handleheight);

		if(this.ishandled){
			this.handlepos.y = mouseY;
		}

		this.handlepos.y = constrain(this.handlepos.y, this.pos.y-this.h, this.pos.y+this.h);
		var volume = map(this.handlepos.y, this.pos.y-this.h, this.pos.y+this.h, 1, 0);
		samples[this.index].setVolume(volume);
	}

	this.moveFader = function(){
		this.handlepos.y = mouseY;
	}

	this.getHandlePos = function(){
		return this.handlepos;
	}

		this.getHandleWidth = function(){
		return this.handlewidth;
	}

		this.getHandleHeight = function(){
		return this.handleheight;
	}
}