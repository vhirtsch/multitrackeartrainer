var Button = function(_name, _action, _type, _pos, _w, _h, _font_size, _i){
	this.pos = _pos;
	this.n = _name;
	this.act = _action;
	this.type = _type;
	this.stroke_col = 255;
	this.fill_col = 0;
	this.isMuted = false;
	this.lastVolumeValue = 0;
	this.index = _i;

	if(this.type != 'mute' && this.type != 'solo')
	this.active = true;
	else{
		this.active = false;
		this.stroke_col = 100;
	}

	this.state = 0;


	this.isSelected = false;

	if(this.act == "bypass")
	this.isSelected = true;

	this.w = _w;
	this.h = _h;

	this.font_size = _font_size;

	this.update = function(){
		if(this.type != 'mute' && this.type != 'solo')
		this.listen();

		if(this.isSelected){
			this.stroke_col = 0;
			this.fill_col = 255;
		}else{
			this.stroke_col = 255;
			this.fill_col = 0;
		}

		if(this.act == "check" || this.act == "play")
		this.isSelected = false;
	}

	this.display = function(){
		rectMode(CENTER);
		textAlign(CENTER, CENTER);
		textSize(this.font_size);

		if(this.type == 'mute' || this.type == 'solo'){
			fill(this.fill_col);
			stroke(this.stroke_col);
		}else{
			fill(this.fill_col);
			stroke(this.stroke_col);
		}

		push();

		translate(this.pos.x, this.pos.y);
		rect(0, 0, this.w, this.h);
		if(this.type == 'mute' || this.type == 'solo'){
			fill(abs(255-this.fill_col));
			stroke(abs(255-this.stroke_col));
		}else{
			fill(abs(255-this.fill_col));
			stroke(abs(255-this.stroke_col));
		}

		text(this.n, 0, 0);
		pop();
	}

	this.listen = function(){
		if(mouseX < this.pos.x + this.w*0.5 && mouseX > this.pos.x - this.w*0.5){
			if(mouseY < this.pos.y + this.h*0.5 && mouseY > this.pos.y - this.h*0.5){
				if(mouseIsPressed){
					if(!this.isSelected){
						this.isSelected = true;
						if(this.type == 'channel'){
							for(var i = 0; i < buttons_toggle_channel.length; i++){
								buttons_toggle_channel[i].isSelected = false;
								if(buttons_toggle_channel[i] == this)
								this.isSelected = true;
							}
						}

						if(mouseUp){
							if(this.act == "bypass")
							disconnectAll();
							else if(this.act == "question")
							connectRandom();
							else if(this.act == "response")
							connectUser();
							else if(this.act == "check"){
								if(this.state == 0)
									checkAnswers();
								else if(this.state == 1)
									resetQuestions();
							}else if(this.act == "play"){
								togglePlay();
							}
							mouseUp = false;
						}
					}
				}else{ //THIS HAPPENS ON MOUSE RELEASE - MUTE AND SOLO
					if(this.type == 'mute'){
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

					if(this.type == 'solo'){
						if(!this.isSelected){

							this.isSelected = true;

							for(var i = 0; i < buttons_mute.length; i++){
								if(i != this.index){ //mute all other buttons
									if(samples[this.index].volume.value > -200)
									buttons_mute[i].lastVolumeValue = samples[i].volume.value;

									samples[i].volume.value = -200;

									buttons_mute[i].isMuted = true;
									buttons_solo[i].isSelected = false;
								}else{ //just in case our button is muted, we unmute it
									if(buttons_mute[i].isMuted){
										samples[this.index].volume.value = buttons_mute[i].lastVolumeValue;
										buttons_mute[i].isMuted = false;
										buttons_mute[i].isSelected = false;
									}
								}
							}
						}else{//if it is already selected, it means we have to deselect it and restore all other to their previous levels
							for(var i = 0; i < buttons_mute.length; i++){
								buttons_mute[i].isMuted = false;
								samples[i].volume.value = buttons_mute[i].lastVolumeValue;
							}
							this.isSelected = false;
						}
					}
				}
			}
		}else{
			//mouse out
		}
	}
}
