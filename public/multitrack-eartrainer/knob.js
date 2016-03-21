var Knob = function(_pos, _rad, _index, _band, _type){
	this.pos = _pos;
	this.rad = _rad;
	this.index = _index;
	this.band = _band;
	this.rotation = 0;
	this.ishandled = false;
	this.type = _type;

	this.active = false;
	this.col = 100;
	this.result_col = this.col;

	if(this.band == 0)
		this.name = 'low';
	else if(this.band == 1)
		this.name = 'mid';
	else if(this.band == 2)
		this.name = 'high';
	else
		this.name = 'pan';

	this.min = -radians(135);
	this.max = radians(135);

	this.update = function(){
		if(this.ishandled && this.active){
			this.rotation = map((mouseX - this.pos.x), -this.pos.x*0.125, (width-this.pos.x)*0.125, this.min, this.max);
			this.rotation = min(max(this.rotation, this.min), this.max);

			if(this.type == "eq3" && isUser)
				this.updateEQ(this.rotation);

			if(this.type == "pan" && isUser)
				this.updatePan(this.rotation);
		}
	}

	this.display = function(){
		push();
		translate(this.pos.x, this.pos.y);
		noStroke();
		if(!canShowQuestion){
			fill(this.col);
		}else{
			fill(this.result_col);
		}

		text(this.name, 0, -20);

		if(this.type == 'eq3'){
			if(this.band == 0)
				text(parseInt(eq3[this.index].low.value), 0, 15);
			else if(this.band == 1)
				text(parseInt(eq3[this.index].mid.value), 0, 15);
			else
				text(parseInt(eq3[this.index].high.value), 0, 15);
		}

		rotate(this.rotation);
		if(!canShowQuestion){
			stroke(this.col);
		}else{
			stroke(this.result_col);
		}
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

			//TODO add 5 and 6 for crossover value between low and mid and mid and high
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
