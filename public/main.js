var faders = [];
var faders_volume = [];
var mute;
var knobs_eq = [];
var track_number = 8;
var buttons_mute = [];
var buttons_solo = [];

var samples = [];
var eq3 = [];
var samplesPlaying = false;

var buttons_toggle_channel = [];
var button_bypass;
var button_question;
var button_response;
var button_reset;

var isQuestion = false;

function setup(){
	var cnv = createCanvas(windowWidth, windowHeight);

	for(var i = 0; i < track_number; i++){
		faders[i] = new Fader(createVector(width*0.1 + i*width*0.1, height*0.5), height*0.1, i);
		buttons_mute[i] = new Button('M', 'mute', 'mute', createVector(width*0.085 + i*width*0.1, height*0.35), width*0.02, height*0.03, i);
		buttons_solo[i] = new Button('S', 'solo', 'solo', createVector(width*0.115 + i*width*0.1, height*0.35), width*0.02, height*0.03, i);
		knobs_eq[i] = [];
		for(var j = 0; j < 3; j++){
			knobs_eq[i][j] = new Knob(createVector(width*0.075 + i*width*0.1 + j * width*0.025, height*0.25), height*0.025, i, j, "eq3");
		}
	}

	for(var i = 0; i < track_number; i++){
		faders_volume[i] = new Tone.Volume(-10).toMaster();
		eq3[i] = new Tone.EQ3(-20, 15, 0).toMaster();
		eq3[i].low.value = random(-10, 10);
		eq3[i].mid.value = random(-10, 10);
		eq3[i].high.value = random(-10, 10);

		samples[i] = new Tone.Player({
			"url" : "./data/"+i+".wav",
			"autostart" : false,
			"loop" : true,
			"volume" : -10
		}).toMaster();

	}

	mute = new Tone.Volume(-100).toMaster();

	setTimeout(function(){
		for(var i = 0; i < samples.length; i++){
			samples[i].start();
		}
	}, 6000);


	button_bypass = new Button("Bypass", "bypass", "channel", createVector(width*0.3, height*0.15), width*0.1, height*0.1);
	buttons_toggle_channel.push(button_bypass);
	button_question = new Button("Question", "question", "channel", createVector(width*0.5, height*0.15), width*0.1, height*0.1);
	buttons_toggle_channel.push(button_question);
	button_response = new Button("Response", "response", "channel", createVector(width*0.7, height*0.15), width*0.1, height*0.1);
	buttons_toggle_channel.push(button_response);

	button_reset = new Button("Reset", "reset-question", "reset", createVector(width*0.85, height*0.15), width*0.05, height*0.05);
}

function draw(){
	background(10, 10, 20);

	for(var i = 0; i < faders.length; i++){
		faders[i].display();
			if(!isQuestion){
				buttons_solo[i].display();
				buttons_solo[i].update();
				buttons_mute[i].display();
				buttons_mute[i].update();
				for(var j = 0; j < 3; j++){
					knobs_eq[i][j].display();
					knobs_eq[i][j].update();
				}
			}
	}

	button_bypass.display();
	button_question.display();
	button_response.display();
	button_reset.display();

	button_bypass.update();
	button_question.update();
	button_response.update();
	button_reset.update();
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
	if(key == ' '){
		for(var i = 0; i < faders_volume.length; i++){
			console.log(faders_volume[i].volume);
		}
	}
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
}

function connectUser(){
	for(var i = 0; i < track_number; i++){
		samples[i].connect(eq3[i]).toMaster();
		console.log(samples[i]);
	}
	isQuestion = false;
}

function setRandomValues(){
	for(var i = 0; i < track_number; i++){
		eq3[i].low.value = random(-10, 10);
		eq3[i].mid.value = random(-10, 10);
		eq3[i].high.value = random(-10, 10);
	}
}

function mouseReleased(){
	for(var i = 0; i < track_number; i++){
		buttons_mute[i].listen();
		faders[i].ishandled = false;
		for(var j = 0; j < 3; j++){
			knobs_eq[i][j].ishandled = false;
		}
	}
}
