var Button = function(_name, _action, _pos, _w, _h){
	this.pos = _pos;
	this.n = _name;
	this.act = _action;
	this.stroke_col = 255;
	this.fill_col = 0;
	console.log(this.n);

	this.isSelected = false;

	if(this.n == "Bypass")
		this.isSelected = true;	

	this.w = _w;
	this.h = _h;

	this.update = function(){
		this.listen();

		if(this.isSelected){
			this.stroke_col = 0;
			this.fill_col = 255;
		}else{
			this.stroke_col = 255;
			this.fill_col = 0;
		}
	}

	this.display = function(){
		rectMode(CENTER);
		textAlign(CENTER);
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

		if(mouseIsPressed){
			if(mouseX < this.pos.x + this.w*0.5 && mouseX > this.pos.x - this.w*0.5){
				if(mouseY < this.pos.y + this.h*0.5 && mouseY > this.pos.y - this.h*0.5){
					if(!this.isSelected){
						this.isSelected = true;

						if(this.n == "Bypass")
							disconnectAll();
						else if(this.n == "Question")
							connectRandom();
						else
							connectUser();
					}
				}
			}else{
				this.isSelected = false;
			}
		}
	}
}