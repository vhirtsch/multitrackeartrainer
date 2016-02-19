// TODO: have a level meter

var faders = [];
var faders_volume = [];
var knobs_eq = [];
var knobs_pan = [];
var track_number = 8;
var buttons_mute = [];
var buttons_solo = [];

var samples = [];
var eq3_question = [];
var eq3 = [];
var pan = [];
var level_meters = [];

var buttons_toggle_channel = [];
var button_bypass;
var button_question;
var button_response;
var button_reset;
var button_play;

var isQuestion = false;


//POSITION
var left_margin;
var channels_y;
var eq_y;
var pan_y;
var faders_y;
var spacing;

function setup(){
	var cnv = createCanvas(windowWidth, windowHeight);

	textAlign(CENTER);

//SET UP POSITION VARIABLES
	left_margin = width*0.15;
	channels_y = height*0.25;
	eq_y = height*0.4;
	pan_y = height*0.475;
	faders_y = height*0.65;
	spacing = width*0.1;
	toggle_y = height*0.52;

//SET UP USER INTERFACE
	for(var i = 0; i < track_number; i++){
		faders[i] = new Fader(createVector(left_margin + i*spacing, faders_y), height*0.1, i);
		buttons_mute[i] = new Button('M', 'mute', 'mute', createVector(left_margin-width*0.015 + i*spacing, toggle_y), width*0.02, height*0.03, height*0.015, i);
		buttons_solo[i] = new Button('S', 'solo', 'solo', createVector(left_margin+width*0.015 + i*spacing, toggle_y), width*0.02, height*0.03, height*0.015, i);

		knobs_eq[i] = [];
		for(var j = 0; j < 3; j++){
			knobs_eq[i][j] = new Knob(createVector(left_margin-width*0.025 + i*spacing + j * width*0.025, eq_y), height*0.025, i, j, "eq3");
		}

		knobs_pan[i] = new Knob(createVector(left_margin-width*0.025 + i*spacing + width*0.025, pan_y), height*0.03, i, null, "pan");
	}

	//SET UP AUDIO PROCESSING OBJECTS
	for(var i = 0; i < track_number; i++){
		faders_volume[i] = new Tone.Volume(-10).toMaster();
		pan[i] = new Tone.Panner(0.5).toMaster();

		eq3_question[i] = new Tone.EQ3(random(-10, 10), random(-10, 10), random(-10, 10)).toMaster();

		eq3[i] = new Tone.EQ3(0, 0, 0).toMaster();

		// level_meters[i] = new Tone.Meter();

		samples[i] = new Tone.Player({
			"url" : "./data/"+i+".wav",
			"autostart" : false,
			"loop" : true,
			"volume" : -1000
		}).toMaster();
	}

	//WAIT BEFORE STARTING PLAYBACK
	// var delay = 6000;
	// setTimeout(function(){
	// 	for(var i = 0; i < samples.length; i++){
	// 		samples[i].start();
	// 	}
	// }, delay);


	button_bypass = new Button("Bypass", "bypass", "channel", createVector(width*0.3, channels_y), width*0.1, height*0.075,  height*0.03);
	buttons_toggle_channel.push(button_bypass);

	button_question = new Button("Question", "question", "channel", createVector(width*0.5, channels_y), width*0.1, height*0.075, height*0.03);
	buttons_toggle_channel.push(button_question);

	button_response = new Button("Response", "response", "channel", createVector(width*0.7, channels_y), width*0.1, height*0.075, height*0.03);
	buttons_toggle_channel.push(button_response);

	button_reset = new Button("Reset", "reset-question", "reset", createVector(width*0.85, channels_y), width*0.05, height*0.05, height*0.025);
	button_play = new Button("Play", "play", "play", createVector(width*0.15, channels_y), width*0.05, height*0.05, height*0.025);
}

function draw(){
	background(10, 10, 20);

	for(var i = 0; i < faders.length; i++){
		faders[i].display();

		fill(255);
		// text(level_meters.getValue(), left_margin+spacing*i*0.9, height*0.8);

		if(!isQuestion){
			buttons_solo[i].display();
			buttons_solo[i].update();

			buttons_mute[i].display();
			buttons_mute[i].update();

			knobs_pan[i].display();
			knobs_pan[i].update();

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
	button_play.display();

	button_bypass.update();
	button_question.update();
	button_response.update();
	button_reset.update();
	button_play.update();

	//TITLE
	fill(255);
	textSize(height*0.05);
	text('Ain\'t no ear training hard enough', width*0.5, height*0.05);
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

		if(mouseX < knobs_pan[i].getPosition().x + knobs_pan[i].getRad() && mouseX > knobs_pan[i].getPosition().x - knobs_pan[i].getRad()){
			if(mouseY < knobs_pan[i].getPosition().y + knobs_pan[i].getRad() && mouseY > knobs_pan[i].getPosition().y - knobs_pan[i].getRad()){
				knobs_pan[i].ishandled = true;
			}
		}else{
			knobs_pan[i].ishandled = false;
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
		buttons_mute[i].isMuted = false;
		buttons_mute[i].isSelected = false;
		buttons_solo[i].isSelected = false;
		samples[i].volume.value = buttons_mute[i].lastVolumeValue;
	}
	isQuestion = false;
}

function connectRandom(){
	for(var i = 0; i < track_number; i++){
		samples[i].disconnect();
		samples[i].connect(eq3_question[i]).toMaster();
	}
	isQuestion = true;
}

function connectUser(){
	for(var i = 0; i < track_number; i++){
		samples[i].connect(eq3[i]).connect(pan[i]).toMaster();
	}
	isQuestion = false;
}

function setRandomValues(){
	for(var i = 0; i < track_number; i++){
		eq3_question[i].low.value = random(-10, 10);
		eq3_question[i].mid.value = random(-10, 10);
		eq3_question[i].high.value = random(-10, 10);
	}
}

function playSamples(){
	for(var i = 0; i < samples.length; i++){
		samples[i].start();
	}
}

function mouseReleased(){
	for(var i = 0; i < track_number; i++){
		buttons_mute[i].listen();
		buttons_solo[i].listen();
		faders[i].ishandled = false;
		knobs_pan[i].ishandled = false;
		for(var j = 0; j < 3; j++){
			knobs_eq[i][j].ishandled = false;
		}
	}
}
