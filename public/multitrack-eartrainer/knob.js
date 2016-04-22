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

	if(this.band == 1)
		this.name = 'eq';
	else
		this.name = 'pan';

	this.min = -radians(135);
	this.max = radians(135);

	this.update = function(){
		if(this.ishandled && this.active){
			if(this.first_time_interaction){
				for(var i = 0; i < eq3.length; i++){
					eq3[i].gain.value = eq_boost;
				}
				this.first_time_interaction = false;
			}
			this.rotation = map((mouseX - this.pos.x), -this.pos.x*0.125, (width-this.pos.x)*0.125, this.min, this.max);
			this.rotation = min(max(this.rotation, this.min), this.max);
			console.log(this.rotation);

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

		if(this.type == 'eq3'){
			text(parseInt(eq3[this.index].frequency.value), 0, 50);
			if(faders[this.index].active){
				rectMode(CENTER);
				noFill();
				stroke(this.col);
				rect(0, height*0.15, width*0.05, height*0.4);
			}
		}

		rotate(this.rotation);
		if(!canShowQuestion){
			stroke(this.col);
		}else{
			stroke(this.result_col);
		}
		strokeWeight(3);
		noFill();
		ellipse(0, 0, this.rad, this.rad);
		point(0, 0);
		line(0, 0, 0, -this.rad*0.5);

		pop();
		strokeWeight(1);


	}

	this.updateEQ = function(_value){
		var snapped_value = parseInt(map(_value, this.min, this.max, 0, eq_freq_values.length-1));
		console.log(snapped_value);
		eq3[this.index].frequency.value = eq_freq_values[snapped_value];
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
