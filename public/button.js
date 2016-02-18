var Button = function(_name, _action, _type, _pos, _w, _h, _i){
	this.pos = _pos;
	this.n = _name;
	this.act = _action;
	this.typ = _type;
	this.stroke_col = 255;
	this.fill_col = 0;
	this.isMuted = false;
	this.lastVolumeValue = 0;
	this.index = _i;

	this.isSelected = false;

	if(this.n == "Bypass")
		this.isSelected = true;

	this.w = _w;
	this.h = _h;

	this.update = function(){
		if(this.typ != 'mute')
			this.listen();

		if(this.isSelected){
			this.stroke_col = 0;
			this.fill_col = 255;
		}else{
			this.stroke_col = 255;
			this.fill_col = 0;
		}

		if(this.n == "Reset")
			this.isSelected = false;
	}

	this.display = function(){
		rectMode(CENTER);
		textAlign(CENTER, CENTER);
		stroke(this.stroke_col);
		fill(this.fill_col);

		push();
		translate(this.pos.x, this.pos.y);
		rect(0, 0, this.w, this.h);
		fill(abs(255-this.fill_col));
		stroke(abs(255-this.stroke_col));
		text(this.n, 0, 0);
		pop();
	}

	this.listen = function(){
			if(mouseX < this.pos.x + this.w*0.5 && mouseX > this.pos.x - this.w*0.5){
				if(mouseY < this.pos.y + this.h*0.5 && mouseY > this.pos.y - this.h*0.5){
					if(mouseIsPressed){
						if(!this.isSelected){
							if(this.typ == 'channel'){
								for(var i = 0; i < buttons_toggle_channel.length; i++){
									buttons_toggle_channel[i].isSelected = false;
									if(buttons_toggle_channel[i] == this)
										this.isSelected = true;
								}
							}

							if(this.act == "bypass")
								disconnectAll();
							else if(this.act == "question")
								connectRandom();
							else if(this.act == "response")
								connectUser();
							else if(this.act == "reset-question"){
								setRandomValues();
							}
						}
					}else{
						if(this.typ == 'mute'){
							this.isSelected = !this.isSelected;
							this.isMuted = !this.isMuted;

							if(samples[this.index].volume.value > -100)
								this.lastVolumeValue = samples[this.index].volume.value;

							if(this.isMuted){
								console.log('muting');
								samples[this.index].volume.value = -100;
							}else{
								samples[this.index].volume.value = this.lastVolumeValue;
							}
						}
					}
			}else{

			}
		}
	}
}
