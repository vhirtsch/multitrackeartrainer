var faders = [];
var knobs_eq = [];
var track_number = 8;

var samples = [];
var eq3 = [];
var samplesPlaying = false;

var button_bypass;
var button_question;
var button_response;

var isQuestion = false;

function setup(){
	var cnv = createCanvas(windowWidth, windowHeight);

	for(var i = 0; i < track_number; i++){
		faders[i] = new Fader(createVector(width*0.1 + i*width*0.1, height*0.5), height*0.1, i);
		knobs_eq[i] = [];
		for(var j = 0; j < 3; j++){
			knobs_eq[i][j] = new Knob(createVector(width*0.1 + i*width*0.1 + j * width*0.025, height*0.25), height*0.05, i, j, "eq3");
		}
	}

	for(var i = 0; i < track_number; i++){

		eq3[i] = new Tone.EQ3(-20, 15, 0).toMaster();

		samples[i] = new Tone.Player({
			"url" : "./data/"+i+".wav",
			"autostart" : false,
			"loop" : true,
			"volume" : -100
		}).toMaster();

	}

	setTimeout(function(){
		for(var i = 0; i < samples.length; i++){
			samples[i].start();
		}
	}, 4000);


	button_bypass = new Button("Bypass", "bypass", createVector(width*0.3, height*0.15), width*0.1, height*0.1);
	button_question = new Button("Question", "question", createVector(width*0.5, height*0.15), width*0.1, height*0.1);
	button_response = new Button("Response", "response", createVector(width*0.7, height*0.15), width*0.1, height*0.1);
}

function draw(){
	background(10, 10, 20);
	for(var i = 0; i < faders.length; i++){
		faders[i].display();
		for(var j = 0; j < 3; j++){
			knobs_eq[i][j].display();
			knobs_eq[i][j].update();
		}
	}

	button_bypass.display();
	button_question.display();
	button_response.display();

	button_bypass.update();
	button_question.update();
	button_response.update();
}

function mousePressed(){
	for(var i = 0; i < track_number; i++){
		if(mouseX < faders[i].getHandlePos().x + faders[i].getHandleWidth() && mouseX > faders[i].getHandlePos().x - faders[i].getHandleWidth()){
			if(mouseY < faders[i].getHandlePos().y + faders[i].getHandleHeight() && mouseY > faders[i].getHandlePos().y - faders[i].getHandleHeight()){
				faders[i].ishandled = true;
			}	
		}else{
			faders[i].ishandled = false;
		}

		for(var j = 0; j < 3; j++){
			var k = knobs_eq[i][j]
			if(mouseX < k.getPosition().x + k.getRad() && mouseX > k.getPosition().x - k.getRad()){
				if(mouseY < k.getPosition().y + k.getRad() && mouseY > k.getPosition().y - k.getRad()){
					k.ishandled = true;
				}
			}else{
				k.ishandled = false;
			}
		}
	}
}

function keyPressed(){

}

function disconnectAll(){
	for(var i = 0; i < track_number; i++){
		samples[i].disconnect();
		samples[i].toMaster();
	}
	isQuestion = false;
}

function connectRandom(){
	for(var i = 0; i < track_number; i++){
		samples[i].connect(eq3[i]).toMaster();
	}
	isQuestion = true;
	setRandomValues();
}

function connectUser(){
	for(var i = 0; i < track_number; i++){
		samples[i].connect(eq3[i]).toMaster();
	}
	isQuestion = false;
}

function setRandomValues(){
	for(var i = 0; i < track_number; i++){
		console.log(knobs_eq[i]);
		eq3[i].low.value = random(-100, 100);
		eq3[i].mid.value = random(-10, 10);
		eq3[i].high.value = random(-100, 100);
	}
}

function mouseReleased(){
	for(var i = 0; i < track_number; i++){
		faders[i].ishandled = false;
		for(var j = 0; j < 3; j++){
			knobs_eq[i][j].ishandled = false;
		}
	}
}