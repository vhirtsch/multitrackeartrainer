// TODO: have a level meter

var active_channels_indexes = [];

var faders = [];
var faders_volume = [];
var knobs_eq = [];
var knobs_pan = [];
var track_number = 8;
var buttons_mute = [];
var buttons_solo = [];

var samples = [];
var eq3_question = [];
var pan_question = [];

var eq3 = [];
var pan = [];

var eq3_bypass = [];
var pan_bypass = [];

var channel_label = [];

var level_meters = [];

var buttons_toggle_channel = [];
var button_bypass;
var button_question;
var button_response;
var button_check;
var button_play;

var isUser;
var canShowQuestion;
var canShowResponse;

var default_volume;

var question_eq_min;
var question_eq_max;

var question_fader_min;
var question_fader_max;

var isPlaying;
var mouseUp;

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

	//setup
	isUser = false;
	canShowQuestion = false;
	canShowResponse = false;

	default_volume = -10;

	question_eq_min = -10;
	question_eq_max = 10;

	question_fader_min = -50;
	question_fader_max = 0;

	isPlaying = false;
	mouseUp = true;

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
		channel_label[i] = 'channel '+(i+1);
		// faders_volume[i] = new Tone.Volume(-10).toMaster();
		pan[i] = new Tone.Panner(0.5).toMaster();
		eq3[i] = new Tone.EQ3(0, 0, 0).toMaster();

		pan_question[i] = new Tone.Panner(0.5).toMaster();
		eq3_question[i] = new Tone.EQ3(0, 0, 0).toMaster();

		eq3_bypass[i] = new Tone.Panner(0.5).toMaster();
		pan_bypass[i] = new Tone.EQ3(0, 0, 0).toMaster();

		// level_meters[i] = new Tone.Meter();

		samples[i] = new Tone.Player({
			"url" : "./data/"+i+".wav",
			"autostart" : false,
			"loop" : true,
			"volume" : default_volume
		}).toMaster();
	}

	for(var i = 0; i < active_channels; i++){
		setupActiveChannels();
	}

	if(current_module == "eq")
		setTimeout(setupQuestionEQ, 100);

	if(current_module == "level")
		setTimeout(setupQuestionLevel, 100);

	if(current_module == "pan")
		setTimeout(setupQuestionPan, 100);

	if(current_module == "mute")
		setTimeout(setupQuestionMute, 100);

	button_bypass = new Button("Bypass", "bypass", "channel", createVector(width*0.3, channels_y), width*0.1, height*0.075,  height*0.03);
	buttons_toggle_channel.push(button_bypass);

	button_question = new Button("Question", "question", "channel", createVector(width*0.5, channels_y), width*0.1, height*0.075, height*0.03);
	buttons_toggle_channel.push(button_question);

	button_response = new Button("Response", "response", "channel", createVector(width*0.7, channels_y), width*0.1, height*0.075, height*0.03);
	buttons_toggle_channel.push(button_response);

	button_check = new Button("Submit", "check", "check", createVector(width*0.85, channels_y), width*0.05, height*0.05, height*0.025);
	button_play = new Button("Play", "play", "play", createVector(width*0.15, channels_y*0.9), width*0.05, height*0.035, height*0.025);

	//setting up the proper bypass routine
	disconnectAll();
}

function draw(){
	background(10, 10, 20);

	for(var i = 0; i < faders.length; i++){
		faders[i].display();
		noStroke();
		text(channel_label[i], faders[i].pos.x, height*0.8);
		if(canShowQuestion){
			text('low - '+parseInt(eq3_question[i].low.value), faders[i].pos.x, height*0.85);
			text('mid - '+parseInt(eq3_question[i].mid.value), faders[i].pos.x+10, height*0.875);
			text('high - '+parseInt(eq3_question[i].high.value), faders[i].pos.x+20, height*0.9);

			if(abs(eq3_question[i].low.value - eq3[i].low.value) < 1){
				fill(0, 150, 0);
				text('good!', faders[i].pos.x, height*0.92);
			} else {
				fill(150, 0, 0);
				text('too far!', faders[i].pos.x, height*0.92);
			}
			if(abs(eq3_question[i].mid.value - eq3[i].mid.value) < 1){
				fill(0, 150, 0);
				text('good!', faders[i].pos.x+10, height*0.95);
			} else {
				fill(150, 0, 0);
				text('too far!', faders[i].pos.x+10, height*0.95);
			}

			if(abs(eq3_question[i].high.value - eq3[i].high.value) < 1){
				fill(0, 150, 0);
				text('good!', faders[i].pos.x+20, height*0.98);
			} else {
				fill(150, 0, 0);
				text('too far!', faders[i].pos.x+20, height*0.98);
			}

		}

		fill(255);
		// text(level_meters.getValue(), left_margin+spacing*i*0.9, height*0.8);

		if(isUser){
			for(var j = 0; j < 3; j++){
				knobs_eq[i][j].display();
				knobs_eq[i][j].update();
			}
		}

		buttons_solo[i].display();
		buttons_solo[i].update();

		buttons_mute[i].display();
		buttons_mute[i].update();

		knobs_pan[i].display();
		knobs_pan[i].update();
	}

	button_bypass.display();
	button_question.display();
	button_response.display();
	button_check.display();
	button_play.display();

	button_bypass.update();
	button_question.update();
	button_response.update();
	button_check.update();
	button_play.update();

	//TITLE
	fill(255);
	textSize(height*0.05);
	text('Ain\'t no '+current_module+' training hard enough', width*0.5, height*0.05);
}

function setupActiveChannels(){
	if(active_channels_indexes.length < active_channels){
		var ind = Math.floor(random(track_number));
		var isAlreadyActive = false;
		for(var i = 0; i < active_channels_indexes.length; i++){
			if(active_channels_indexes[i] == ind)
				isAlreadyActive = true;
		}

		if(!isAlreadyActive){
			console.log('not active, activating',ind);
			active_channels_indexes.push(ind);
			faders[ind].active = true;
			faders[ind].col = 255;

			knobs_eq[ind][0].active = true;
			knobs_eq[ind][0].col = 255;

			knobs_eq[ind][1].active = true;
			knobs_eq[ind][1].col = 255;

			knobs_eq[ind][2].active = true;
			knobs_eq[ind][2].col = 255;

			knobs_pan[ind].active = true;
			knobs_pan[ind].col = 255;

			buttons_solo[ind].active = true;
			buttons_mute[ind].active = true;
		}else{
			setTimeout(setupActiveChannels, 1);
		}
	}
}

function setupQuestionEQ(){
	if(question_eq == 1){
		for(var i = 0; i < active_channels; i++){
			var ind = active_channels_indexes[i];
			var r = Math.random();
			if(r < 0.3)
				eq3_question[ind] = new Tone.EQ3(random(question_eq_min, question_eq_max), 0, 0).toMaster();
			else if(r < 0.6)
				eq3_question[ind] = new Tone.EQ3(0, random(question_eq_min, question_eq_max), 0).toMaster();
			else {
				eq3_question[ind] = new Tone.EQ3(0, 0, random(question_eq_min, question_eq_max)).toMaster();
			}
		}
	}else if(question_eq == 2){
		for(var i = 0; i < active_channels; i++){
			var ind = active_channels_indexes[i];
			var r = Math.random();
			if(r < 0.3)
				eq3_question[ind] = new Tone.EQ3(random(question_eq_min, question_eq_max), random(question_eq_min, question_eq_max), 0).toMaster();
			else if(r < 0.6)
				eq3_question[ind] = new Tone.EQ3(0, random(question_eq_min, question_eq_max), random(question_eq_min, question_eq_max)).toMaster();
			else {
				eq3_question[ind] = new Tone.EQ3(random(question_eq_min, question_eq_max), 0, random(question_eq_min, question_eq_max)).toMaster();
			}
		}
	}else{
		eq3_question[i] = new Tone.EQ3(random(question_eq_min, question_eq_max), random(question_eq_min, question_eq_max), random(question_eq_min, question_eq_max)).toMaster();
	}
}

function setupQuestionLevel(){
	for(var i = 0; i < active_channels; i++){
		var ind = active_channels[i];
		//TODO: maybe it's better to actually figure out the fucking volume as a separate bus thing
	}
}

function setupQuestionPan(){
	for(var i = 0; i < active_channels; i++){
		var ind = active_channels[i];
		pan_question[ind].pan.value = random(0, 1);
	}
}

function setupQuestionMute(){
	for(var i = 0; i < active_channels; i++){
		var ind = active_channels[i];
		// TODO: have a question version of mute...
	}
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
	if(key == 'q' || key == 'Q'){
		canShowQuestion = !canShowQuestion;
	}

	if(key == ' '){
		togglePlay();
	}
}

function disconnectAll(){
	for(var i = 0; i < track_number; i++){
		samples[i].disconnect();
		samples[i].volume.value = default_volume;
		samples[i].connect(eq3_bypass[i]).connect(pan_bypass[i]).toMaster();


		buttons_mute[i].isMuted = false;
		buttons_mute[i].isSelected = false;
		buttons_solo[i].isSelected = false;

	}
	isUser = false;
}

function connectRandom(){
	for(var i = 0; i < track_number; i++){
		samples[i].disconnect();
		samples[i].connect(eq3_question[i]).connect(pan_question[i]).toMaster();
	}
	isUser = false;
}

function connectUser(){
	for(var i = 0; i < track_number; i++){
		samples[i].disconnect();
		samples[i].connect(eq3[i]).connect(pan[i]).toMaster();
	}
	isUser = true;
}

function checkAnswers(){
	canShowQuestion = true;
	button_check.state = 1;
	button_check.n = 'next';
}

function resetQuestions(){
	canShowQuestion = false;
	setupQuestionEQ();
	button_check.state = 0;
	button_check.n = 'submit';
	console.log('again');
}

function setRandomValues(){
	for(var i = 0; i < track_number; i++){
		eq3_question[i].low.value = random(-10, 10);
		eq3_question[i].mid.value = random(-10, 10);
		eq3_question[i].high.value = random(-10, 10);
	}
}

function togglePlay(){
	if(!isPlaying){
		playSamples();
		button_play.n = 'stop';
		isPlaying = true;
	}else{
		stopSamples();
		button_play.n  = 'play';
		isPlaying = false;
	}
}

function playSamples(){
	for(var i = 0; i < samples.length; i++){
		samples[i].start();
	}
}

function stopSamples(){
	console.log('stopping');
	for(var i = 0; i < samples.length; i++){
		samples[i].stop();
	}
}

function mouseReleased(){
	mouseUp = true;
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
