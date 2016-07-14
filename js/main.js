var loaded =  false;
var load_sum = 0;

var bg_color;

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var track_number = 6;

var recordings_number = 5;
var recordings = [];
var recordings_buttons = [];
var recordings_names = ["A-B", "Close Mics", "NOS", "ORTF", "Room Mics"];
var pickedRecording;
var recording_answer;

var selected_recording = -1;

var active_channels_indexes = [];

var text_inputs = [];

var faders = [];
var faders_volume = [];
var knobs_eq = [];
var knobs_pan = [];
var buttons_mute = [];
var buttons_solo = [];

var samples = [];
var eq3_question = [];
var pan_question = [];

var eq3 = [];
var pan = [];
//map -100 to 100 to 0 - 1
var pan_values = [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100];

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

var play_icon;
var pause_icon;

var isUser;
var isBypass = true;
var canShowQuestion;
var canShowResponse;

var default_volume;

var question_levels = [];
var user_levels = [];

var question_eq_min;
var question_eq_max;
var eq_freq_values = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

var question_fader_min;
var question_fader_max;

var isPlaying;
var mouseUp;

//POSITION
var left_margin;
var channels_y;
var lol;
var eq_y;
var pan_y;
var faders_y;
var spacing;

var question_range_eq = 200;
var question_range_pan = 0.2;
var question_range_level = 2;

var result_colors = [];
var answer_pos;

var eq_gain_value = 20;
var first_time_interaction = true;

//Instructions
var canShowInstructions = true;

function preload(){
	play_icon = loadImage('img/play_icon.png');
	pause_icon = loadImage('img/pause_icon.png');
}

function setup(){
	var cnv = createCanvas(windowWidth, windowHeight*0.85);
	var back = createA('index.html', 'back to main page');
	var instructions = createDiv('instructions');
	instructions.position(width*0.9, height*0.025);
	instructions.mouseClicked(toggleShowInstructions);

	bg_color = color(0, 0, 40);

	textAlign(CENTER);
	result_colors[0] = color(255, 0, 0);
	result_colors[1] = color(200, 200, 0);
	result_colors[2] = color(0, 255, 0);
	answer_pos = createVector(0, height*0.4);
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

//SET UP POSITION VARIABLES FOR MIXER
	left_margin = (width/track_number)*0.9;
	channels_y = height*0.25;
	eq_y = height*0.55;
	pan_y = height*0.475;
	faders_y = height*0.65;
	spacing = width/(track_number*1.2);
	toggle_y = height*0.52;
	toggle_y_solo = height*0.525;

	if(current_module == "mic"){
		left_margin = (width/recordings_number)*0.5;
		spacing = width/recordings_number;
		pickedRecording = Math.floor(Math.random()*recordings_number);
	}

//SET UP USER INTERFACE
	for(var i = 0; i < track_number; i++){
		user_levels[i] = default_volume;
		faders[i] = new Fader(createVector(left_margin + i*spacing, faders_y), height*0.1, i);
		buttons_mute[i] = new Button('M', 'mute', 'mute', createVector(left_margin-width*0.015 + i*spacing, toggle_y), width*0.02, height*0.03, height*0.015, i);
		buttons_solo[i] = new Button('S', 'solo', 'solo', createVector(left_margin + i*spacing, toggle_y_solo), height*0.08, height*0.08, height*0.03, i);

		knobs_eq[i] = new Knob(createVector(left_margin-width*0.025 + i*spacing + 1 * width*0.025, eq_y), height*0.05, i, 1, "eq3");
		knobs_pan[i] = new Knob(createVector(left_margin-width*0.025 + i*spacing + width*0.025, pan_y), height*0.03, i, null, "pan");
	}

	setupButtons();

	//SET UP AUDIO PROCESSING OBJECTS
	if(current_module == "mic"){
		for(var i = 0; i < recordings_number; i++){
			recordings_buttons[i] = new Button(recordings_names[i], 'recording', 'recording', createVector(left_margin + i*spacing, toggle_y), width*0.1, height*0.06, height*0.03, i);

			recordings[i] = new Tone.Player({
				"url" : "./audio/recordings/"+i+".wav",
				"playbackRate" : 1,
				"autostart": true,
				"loop" : true,
				"volume" : -200
			}).toMaster();

			Tone.Buffer.onload = function(){
				load_sum++;
			}
		}
	}else{
		for(var i = 0; i < track_number; i++){
			channel_label[i] = '--'+(i+1);
			// faders_volume[i] = new Tone.Volume(-10).toMaster();


			pan[i] = new Tone.Panner(0.5).toMaster();
			eq3[i] = new Tone.Filter(1000, "peaking").toMaster();
			eq3[i].gain.value = eq_gain_value;

			pan_question[i] = new Tone.Panner(0.5).toMaster();
			eq3_question[i] = new Tone.Filter(1000, "peaking").toMaster();
			if(current_module == 'eq')
				eq3_question[i].gain.value = 0;
			else
				eq3_question[i].gain.value = 0;

			pan_bypass[i] = new Tone.Panner(0.5).toMaster();
			eq3_bypass[i] = new Tone.Filter(0, "peaking").toMaster();
			eq3_bypass[i].gain.value = 0;

			samples[i] = new Tone.Player({
				"url" : "audio/"+(i+1)+".wav",
				"playbackRate" : 0,
				"autostart" : true,
				"loop" : true,
				"volume" : default_volume
			}).toMaster();

			Tone.Buffer.onload = function(){
				load_sum++;
			}

			level_meters[i] = new Tone.Meter();
		}

		for(var j = 0; j < track_number; j++){
			text_inputs[j] = createInput('CH '+(j+1).toString());
			text_inputs[j].id(j.toString());
			text_inputs[j].input(updateChannelName);
		}

		for(var i = 0; i < active_channels; i++){
			setupActiveChannels();
		}

		if(current_module == "eq")
			setTimeout(setupQuestionEQ, 1000);

		if(current_module == "level")
			setTimeout(setupQuestionLevel, 1000);

		if(current_module == "pan")
			setTimeout(setupQuestionPan, 1000);

		if(current_module == "mute")
			setTimeout(setupQuestionMute, 1000);

			//setting up the proper bypass routine
			disconnectAll();
	}
}

function draw(){
	background(bg_color);

	if(loaded){
		if(current_module != "mic"){
			displayMixer();



			button_question.display();
			button_question.update();
		}else{
			displayRecordings();
		}

		button_play.display();
		button_play.update();

		button_bypass.display();
		button_bypass.update();

		button_response.display();
		button_response.update();

		button_check.display();
		button_check.update();

		if(canShowInstructions)
			showInstructions();
	}else{
		showLoadingAnimation();
		checkForLoadSamples();
	}

	//TITLE
	fill(255);
	textSize(height*0.05);
	text(current_module.toUpperCase(), width*0.5, height*0.05);
}

function showLoadingAnimation(){
	var str = '.';

	if(frameCount % 60 < 20)
		str = '.';
	else if(frameCount % 60 < 40)
		str = '..';
	else
		str = '...';

		text("loading baby"+str, width*0.5, height*0.5);
}

function checkForLoadSamples(){
	if(current_module != 'mic'){
		if(load_sum >= samples.length)
			loaded = true;
	}else{
		if(load_sum >= recordings.length)
			loaded = true;
	}
}

function displayRecordings(){
	for(var i = 0; i < recordings_number; i++){
		fill(255);
		recordings_buttons[i].display();
		recordings_buttons[i].update();
	}

	fill(255);
	if(isUser && canShowResponse)
		text(recording_answer, width*0.5, height*0.75);

	if(canShowQuestion && selected_recording != pickedRecording){
			text('the correct recording is: '+recordings_names[pickedRecording], width*0.5, height*0.8);
	}
}

function displayMixer(){
	for(var i = 0; i < faders.length; i++){
		drawChannelBoxes(i);

		if(isUser && current_module == "level")
			faders[i].display();

		textSize(12);
		noStroke();
		fill(255);

		//level meters
		stroke(255);
		if(samples[0].playbackRate == 1)
			drawLevelMeters(i);

		noStroke();
		textAlign(CENTER, CENTER);
		if(canShowQuestion && faders[i].active){
			if(current_module == "eq"){
				var freq = 'boosted frequency: '+parseInt(eq3_question[i].frequency.value);

					if(abs(eq3_question[i].frequency.value - eq3[i].frequency.value) < question_range_eq){
						fill(0, 150, 0);
						knobs_eq[i].result_col = color(0, 150, 0);
						text(freq+'\ngood!', faders[i].pos.x, answer_pos.y);
					} else {
						fill(150, 0, 0);
						knobs_eq[i].result_col = color(150, 0, 0);
						text(freq+'\ntoo far!', faders[i].pos.x, answer_pos.y);
					}
			}else if(current_module == "pan"){
				if(abs(pan_question[i].value - pan[i].value) < question_range_pan){
					fill(0, 150, 0);
					knobs_pan[i].result_col = color(0, 150, 0);
					text('correctly panned!', faders[i].pos.x, answer_pos.y);
				}else{
					fill(150, 0, 0);
					knobs_pan[i].result_col = color(150, 0, 0);
					text('incorrectly panned!', faders[i].pos.x, answer_pos.y);
				}
			}else if(current_module == "mute"){
				if(buttons_mute[i].isMuted && faders[i].question_muted){
					fill(0, 150, 0);
					text('correctly muted!', faders[i].pos.x, answer_pos.y);
				}else if((buttons_mute[i].isMuted && !faders[i].question_muted) || (!buttons_mute[i].isMuted && faders[i].question_muted) ){
					fill(150, 0, 0);
					text('incorrectly muted!', faders[i].pos.x, answer_pos.y);
				}
			}else if(current_module == "level"){
				if(abs(question_levels[i] - user_levels[i]) < question_range_level){
					fill(0, 150, 0);
					text('correct level! '+parseInt(question_levels[i]), faders[i].pos.x, answer_pos.y);
				}else{
					fill(150, 0, 0);
					text('incorrect level... it was: '+parseInt(question_levels[i]), faders[i].pos.x, answer_pos.y);
				}
			}
		}

		fill(255);
		// text(level_meters.getValue(), left_margin+spacing*i*0.9, height*0.8);
		if(isUser){
			if(current_module == "eq" && faders[i].active){
				knobs_eq[i].display();
				knobs_eq[i].update();
			}

			if(current_module == "mute"){
				buttons_mute[i].display();
				buttons_mute[i].update();
			}

			if(current_module == "pan"){
				knobs_pan[i].display();
				knobs_pan[i].update();
			}
		}

		if(isBypass){
			buttons_solo[i].display();
			buttons_solo[i].update();
		}
	}
}

function showInstructions(){
	fill(0, 0, 20);
	stroke(255);
	rect(width*0.5, height*0.5, width*0.8, height*0.8);
	fill(255);
	noStroke();
	text('INSTRUCTIONS', width*0.5, height*0.25);
	text("Start in LISTEN mode.\nFamiliarize yourself with all channels - try to identify the instrument you are hearing and name each channel accordingly.\n\nSwitch to QUESTION mode.\nA 10dB EQ boost will be applied to only 2 of the channels. Listen carefully to the change in timbre of the 2 active channels.\n\nMove on to RESPONSE mode.\nYou will be asked to match the EQ change you just heard in QUESTION mode.\nUse the knobs on the 2 active channels to find the frequency ranges that have the 10dB boosts.\n\nClick SUBMIT and check your answer.\n\nHave fun!", width*0.5, height*0.4);
	text('click anywhere to dismiss', width*0.2, height*0.85);
}

function drawLevelMeters(i){
	rectMode(CORNER);
	stroke(255);
	fill(255);
	rect(faders[i].pos.x-width*0.0125, height*0.95, width*0.025, map(max(-60, parseInt(level_meters[i].getDb())), -60, 0, 0, -height*0.45));
}

function drawChannelBoxes(i){
	rectMode(CENTER);

	if(isUser || isBypass || faders[i].active){
		if(current_module == "eq"){
			for (var j = height*0.45; j <= height*0.7+height*0.25; j++) {
				var inter = map(j, height*0.7, height*0.7+height*0.5, 0, 1);
				var c = lerp(50+map(knobs_eq[i].rotation, -radians(135), radians(135), -50, 100), +map(knobs_eq[i].rotation, -radians(135), radians(135), 155, 455), inter);
				stroke(255, c);
				line(faders[i].pos.x-width*0.045, j, faders[i].pos.x+width*0.045, j);
			}
		}
	}

	noFill();
	stroke(255);
	rect(faders[i].pos.x, height*0.7, width*0.09, height*0.5);
}

function playPickedRecording(){
	for(var i = 0; i < recordings.length; i++){
		recordings[i].volume.value = -200;
	}

	recordings[pickedRecording].volume.value = default_volume;
}

function checkRecordingAnswer(index){
	console.log(index,'=',pickedRecording);
	if(index == pickedRecording)
		recording_answer = 'correct!';
	else
		recording_answer = 'wrong...';

	canShowResponse = true;
}

function setupActiveChannels(){
	if(active_channels_indexes.length < active_channels){
		var ind = Math.floor(random(track_number)); //pick a random track
		var isAlreadyActive = false;
		for(var i = 0; i < active_channels_indexes.length; i++){
			if(active_channels_indexes[i] == ind)
				isAlreadyActive = true;
		}

		if(!isAlreadyActive){
			active_channels_indexes.push(ind);
			faders[ind].active = true;
			faders[ind].col = 255;

			knobs_eq[ind].active = true;
			knobs_eq[ind].col = 255;

			knobs_pan[ind].active = true;
			knobs_pan[ind].col = 255;

			buttons_solo[ind].active = true;
			buttons_mute[ind].active = true;
		}else{
			setTimeout(setupActiveChannels, 1);
		}
	}
}

function updateChannelName(){
	channel_label[parseInt(this.elt.id)] = this.elt.value;
}

function setupQuestionEQ(){
	for(var i = 0; i < faders.length; i++){
		knobs_eq[i].rotation = 0;
		eq3[i].frequency.value = 0;
		eq3_question[i].gain.value = 0;
		eq3_question[i].frequency.value = 0;
	}

		for(var i = 0; i < active_channels; i++){
			var ind = active_channels_indexes[i];
			eq3_question[ind].frequency.value = eq_freq_values[Math.floor(Math.random()*eq_freq_values.length)];
			eq3_question[ind].gain.value = eq_gain_value;
		}


}

function setupQuestionLevel(){
	for(var i = 0; i < track_number; i++){
		var question_level = default_volume;
		for(var j = 0; j < active_channels; j++){
				var ind = active_channels_indexes[j];
					if(i == ind)
						question_level = random(default_volume*0.25, default_volume*1.75);
		}

		question_levels.push(question_level);
	}
}

function setupQuestionPan(){
	for(var i = 0; i < active_channels; i++){
		var ind = active_channels_indexes[i];
		pan_question[ind].pan.value = random(0, 1);
	}
}

function setupQuestionMute(){
	faders[Math.floor(Math.random()*active_channels_indexes.length)].question_muted = true;
}

function setupQuestionMic(){
	for(var i = 0; i < recordings.length; i++){
		recordings[i].volume.value = -200;
	}
	pickedRecording = Math.floor(Math.random()*recordings_number);
	recording_answer = '';
}

function setupButtons(){
	button_bypass = new Button("Listen", "bypass", "channel", createVector(width*0.3, channels_y), width*0.1, height*0.075,  height*0.03);
	buttons_toggle_channel.push(button_bypass);

	button_question = new Button("Question", "question", "channel", createVector(width*0.5, channels_y), width*0.1, height*0.075, height*0.03);
	buttons_toggle_channel.push(button_question);

	if(current_module != 'mic'){
			button_response = new Button("Response", "response", "channel", createVector(width*0.7, channels_y), width*0.1, height*0.075, height*0.03);
	}else{
		button_response = new Button("Choose", "response", "channel", createVector(width*0.7, channels_y), width*0.1, height*0.075, height*0.03);
	}

	buttons_toggle_channel.push(button_response);

	button_check = new Button("Submit", "check", "check", createVector(width*0.85, channels_y), width*0.05, height*0.05, height*0.025);
	button_play = new Button("Play", "play", "play", createVector(width*0.15, channels_y*0.9), width*0.05, height*0.035, height*0.025);
}

function mousePressed(){
	if(canShowInstructions)
		canShowInstructions = false;


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

		var k = knobs_eq[i];
		if(mouseX < k.getPosition().x + k.getRad() && mouseX > k.getPosition().x - k.getRad()){
			if(mouseY < k.getPosition().y + k.getRad() && mouseY > k.getPosition().y - k.getRad()){
				k.ishandled = true;
			}
		}else{
			k.ishandled = false;
		}
	}
}

function toggleShowInstructions(){
	canShowInstructions = true;
}

function keyPressed(){
	if(key == ' '){
		togglePlay();
	}
}

function disconnectAll(){
	if(current_module != "mic"){
		for(var i = 0; i < track_number; i++){
			samples[i].disconnect();
			samples[i].volume.value = default_volume;
			samples[i].connect(eq3_bypass[i]).connect(pan_bypass[i]).connect(level_meters[i]).toMaster();


			buttons_mute[i].isMuted = false;
			buttons_mute[i].isSelected = false;
			buttons_solo[i].isSelected = false;

		}
	}else{
		for(var i = 0; i < recordings.length; i++){
			recordings[i].volume.value = -200;
		}

		button_play.n  = 'play';
		button_play.current_image = play_icon;
		isPlaying = false;
	}

	isUser = false;
	isBypass = true;
}

function connectRandom(){
	for(var i = 0; i < track_number; i++){
		samples[i].disconnect();
		samples[i].volume.value = default_volume;
		samples[i].connect(eq3_question[i]).connect(pan_question[i]).connect(level_meters[i]).toMaster();
	}

	if(current_module == 'level'){
		for(var i = 0; i < track_number; i++){
			// var ind = active_channels_indexes[i];
			samples[i].volume.value = question_levels[i];
		}
	}

	isUser = false;
	isBypass = false;
}

function connectUser(){
	if(current_module != "mic"){
		for(var i = 0; i < track_number; i++){
			samples[i].disconnect();
			samples[i].volume.value = default_volume;
			console.log('changed to ', samples[i].volume.value);
			samples[i].connect(eq3[i]).connect(pan[i]).connect(level_meters[i]).toMaster();
		}
	}else{
		for(var i = 0; i < recordings.length; i++){
			recordings[i].volume.value = -200;
		}
		recordings[pickedRecording].volume.value = default_volume;
	}
	isUser = true;
	isBypass = false;
}

function checkAnswers(){
	canShowQuestion = true;
	button_check.state = 1;
	button_check.n = 'next';

	if(current_module != 'mic'){
		j = 0;
		for(var i = 0; i < active_channels_indexes.length; i++){
			var ind = active_channels_indexes[i];
			// console.log('act',active_channels_indexes[i]);
			if(current_module == "eq"){
				if(abs(eq3_question[ind].frequency.value - eq3[ind].frequency.value) < question_range_eq){
					knobs_eq[ind].result_col = result_colors[2];
					// console.log('good');
				}else if(abs(eq3_question[ind].frequency.value - eq3[ind].frequency.value) < question_range_eq*2){
					knobs_eq[ind].result_col = result_colors[1];
					// console.log('bad');
				}else{
					knobs_eq[ind].result_col = result_colors[0];
					// console.log('ugly');
				}
			}else if(current_module == "pan"){

			}else if(current_module == "level"){
				if(abs(samples[ind].volume.value - question_levels[j]) < question_range_level){
					console.log('did right');
				}else{
					console.log('did not do right');
				}
			}else if(current_module == "mute"){

			}

			j++; //for accessing the questions_levels array
		}
	}else{
		checkRecordingAnswer(selected_recording);
	}
}

function deactivateChannels(){
	active_channels_indexes = [];
	for(var i = 0; i < track_number; i++){
		faders[i].active = false;
		faders[i].col = 100;
		faders[i].handlepos = faders[i].handle_startingpos.copy();
		faders[i].vol = default_volume;

		knobs_eq[i].active = false;
		knobs_eq[i].col = 100;
		knobs_eq[i].result_col = 100;

		knobs_pan[i].active = false;
		knobs_pan[i].col = 100;

		buttons_solo[i].active = false;
		buttons_mute[i].active = false;
	}
}

function resetQuestions(){
	canShowQuestion = false;
	if(current_module == "eq")
		setupQuestionEQ();

	if(current_module == "level")
		setupQuestionLevel();

	if(current_module == "pan")
		setupQuestionPan();

	if(current_module == "mute")
		setupQuestionMute();

	if(current_module == "mic")
		setupQuestionMic();

	button_check.state = 0;
	button_check.n = 'submit';

	if(current_module != "mic"){
		deactivateChannels();

		// active_channels = parseInt(random(1, 8));
		for(var i = 0; i < active_channels; i++){
			setupActiveChannels();
		}

		setupButtons();
	}

	button_question.active = false;
	button_response.active = false;
	button_bypass.active = true;

	isUser = false;
	isBypass = true;

	for(var i = 0; i < samples.length; i++){
		samples[i].playbackRate = 0;
	}
}

function setRandomValues(){
	for(var i = 0; i < track_number; i++){
		eq3_question[i].low.value = random(-10, 10);
		eq3_question[i].mid.value = random(-10, 10);
		eq3_question[i].high.value = random(-10, 10);
	}
}

function togglePlay(){
	if(current_module != 'mic'){
		if(!isPlaying){
			playSamples();
			button_play.n = 'pause';
			button_play.current_image = pause_icon;
			isPlaying = true;
		}else{
			stopSamples();
			button_play.n  = 'play';
			button_play.current_image = play_icon;
			isPlaying = false;
		}
	}else{
		if(!isPlaying){
			for(var i = 0; i < recordings.length; i++){
				recordings[i].playbackRate.value = 1;
				recordings[i].volume.value = -200;
			}
			recordings[0].volume.value = default_volume;
			button_play.n = 'pause';
			button_play.current_image = pause_icon;
			isPlaying = true;
		}else{
			for(var i = 0; i < recordings.length; i++){
				recordings[i].playbackRate.value = 0;
				recordings[i].volume.value = -200;
			}
			button_play.n  = 'play';
			button_play.current_image = play_icon;
			isPlaying = false;
		}
	}
}

function playSamples(){
	for(var i = 0; i < samples.length; i++){
		samples[i].playbackRate = 1;
	}
}

function stopSamples(){
	for(var i = 0; i < samples.length; i++){
		samples[i].playbackRate = 0;
	}
}

function mouseReleased(){
	mouseUp = true;

	if(current_module != "mic"){
		for(var i = 0; i < track_number; i++){
			buttons_mute[i].listen();
			buttons_solo[i].listen();
			faders[i].ishandled = false;
			knobs_pan[i].ishandled = false;
			knobs_eq[i].ishandled = false;
		}
	}
}
