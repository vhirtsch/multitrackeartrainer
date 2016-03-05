var Fader = function(_pos, _height, _index){
	this.index = _index;
	this.pos = _pos;
	this.h = _height;
	this.handlepos = createVector(_pos.x, _pos.y - _height*0.75);
	this.handlewidth = width*0.01;
	this.handleheight = height*0.01;
	this.ishandled = false;

	this.active = false;
	this.col = 100;

	this.display = function(){
		stroke(this.col);
		fill(this.col);
		rectMode(CENTER);
		line(this.pos.x, this.pos.y-this.h, this.pos.x, this.pos.y+this.h);
		rect(this.handlepos.x, this.handlepos.y, this.handlewidth, this.handleheight);

		if(this.ishandled){
			this.handlepos.y = mouseY;
		}

		this.handlepos.y = constrain(this.handlepos.y, this.pos.y-this.h, this.pos.y+this.h);
		var vol = map(this.handlepos.y, this.pos.y-this.h, this.pos.y+this.h, 0, -100);

		if(isUser && !buttons_mute[this.index].isMuted){
			samples[this.index].volume.value = vol;
			// text(parseInt(samples[this.index].volume.value), this.pos.x, this.pos.y);
		}
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
