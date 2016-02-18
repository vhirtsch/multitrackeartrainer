var Knob = function(_pos, _rad, _index, _band, _type){
	this.pos = _pos;
	this.rad = _rad;
	this.index = _index;
	this.band = _band;
	this.rotation = 0;
	this.ishandled = false;
	this.type = _type;

	this.min = -radians(135);
	this.max = radians(135);

	this.update = function(){
		if(this.ishandled){
			this.rotation = map((mouseX - this.pos.x), -this.pos.x, width-this.pos.x, this.min, this.max);
			if(this.type == "eq3" && !isQuestion)
				this.updateEQ(this.rotation);
		}
	}

	this.display = function(){
		stroke(255);
		noFill();
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.rotation);
		ellipse(0, 0, this.rad, this.rad);
		point(0, 0);
		line(0, 0, 0, -this.rad*0.5);
		pop();
	}

	this.updateEQ = function(value){
		if(this.band == 0)
			eq3[this.index].low.value = map(value, this.min, this.max, -15, 15);
		else if(this.band == 1)
			eq3[this.index].mid.value = map(value, this.min, this.max, -15, 15);
		else
			eq3[this.index].high.value = map(value, this.min, this.max, -15, 15);
	}

	this.getPosition = function(){
		return this.pos;
	}

	this.getRad = function(){
		return this.rad;
	}
}
