var Knob = function(_pos, _rad, _index, _band, _type){
	this.pos = _pos;
	this.rad = _rad;
	this.index = _index;
	this.band = _band;
	this.rotation = 0;
	this.ishandled = false;
	this.type = _type;

	if(this.band == 0)
		this.name = 'low';
	else if(this.band == 1)
		this.name = 'mid';
	else if(this.band == 2)
		this.name = 'high';
	else
		this.name = 'panning';

	this.min = -radians(135);
	this.max = radians(135);

	this.update = function(){
		if(this.ishandled){
			this.rotation = map((mouseX - this.pos.x), -this.pos.x*0.125, (width-this.pos.x)*0.125, this.min, this.max);
			this.rotation = min(max(this.rotation, this.min), this.max);

			if(this.type == "eq3" && !isQuestion)
				this.updateEQ(this.rotation);

			if(this.type == "pan" && !isQuestion)
				this.updatePan(this.rotation);
		}
	}

	this.display = function(){
		push();
		translate(this.pos.x, this.pos.y);
		noStroke();
		fill(255);
		text(this.name, 0, -20);

		rotate(this.rotation);
		stroke(255);
		noFill();
		ellipse(0, 0, this.rad, this.rad);
		point(0, 0);
		line(0, 0, 0, -this.rad*0.5);
		pop();
	}

	this.updateEQ = function(_value){
		if(this.band == 0)
			eq3[this.index].low.value = map(_value, this.min, this.max, -15, 15);
		else if(this.band == 1)
			eq3[this.index].mid.value = map(_value, this.min, this.max, -15, 15);
		else
			eq3[this.index].high.value = map(_value, this.min, this.max, -15, 15);
	}

	this.updatePan = function(_value){
		pan[this.index].pan.value = map(_value, this.min, this.max, 0, 1);
	}

	this.getPosition = function(){
		return this.pos;
	}

	this.getRad = function(){
		return this.rad;
	}
}
