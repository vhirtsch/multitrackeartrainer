var Fader = function(_pos, _height, _index){
	this.index = _index;
	this.pos = _pos;
	this.h = _height;
	this.handle_startingpos = createVector(_pos.x, _pos.y - _height*0.75);
	this.handlepos = createVector(_pos.x, _pos.y - _height*0.75);
	this.handlewidth = width*0.01;
	this.handleheight = height*0.01;
	this.ishandled = false;

	this.active = false;
	this.col = 100;
	this.result_col = 255;

	this.vol = default_volume;
	this.question_muted = false;

	this.display = function(){
		stroke(this.col);
		fill(this.col);
		rectMode(CENTER);
		line(this.pos.x, this.pos.y-this.h, this.pos.x, this.pos.y+this.h);
		rect(this.handlepos.x, this.handlepos.y, this.handlewidth, this.handleheight);

		if(this.ishandled && isUser  && this.active){
			this.handlepos.y = mouseY;
			this.handlepos.y = constrain(this.handlepos.y, this.pos.y-this.h, this.pos.y+this.h);

			if(this.question_muted)
				this.vol = -200;
			else
				this.vol = map(this.handlepos.y, this.pos.y-this.h, this.pos.y+this.h, 0, -100);

		}else if(!isUser){
			this.handlepos.y = (this.pos.y - this.h*0.75);
		}

		if(isUser && !buttons_mute[this.index].isMuted){
			samples[this.index].volume.value = this.vol;
			user_levels[this.index] = this.vol;
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
