// TODO: have a level meter

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var track_number = 6;

var recordings_number = 5;
var recordings = [];
var recordings_buttons = [];
var recordings_names = ["A-B", "Close Mics", "NOS", "ORTF", "Room Mics"];
var pickedRecording;
var recording_answer;

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
var isBypass = true;
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

var question_range_eq = 200;
var question_range_pan = 0.2;

var result_colors = [];

//Instructions
var canShowInstructions = true;

function setup(){

	var back = createA('index.html', 'back to main page');

	var cnv = createCanvas(windowWidth, windowHeight*0.85);

	textAlign(CENTER);
	result_colors[0] = color(255, 0, 0);
	result_colors[1] = color(200, 200, 0);
	result_colors[2] = color(0, 255, 0);

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
	left_margin = (width/track_number)*0.5;
	channels_y = height*0.25;
	eq_y = height*0.55;
	pan_y = height*0.475;
	faders_y = height*0.65;
	spacing = width/track_number;
	toggle_y = height*0.52;

	if(current_module == "mic"){
		left_margin = (width/recordings_number)*0.5;
		spacing = width/recordings_number;
		pickedRecording = Math.floor(Math.random()*recordings_number);
	}

//SET UP USER INTERFACE
	for(var i = 0; i < track_number; i++){
		faders[i] = new Fader(createVector(left_margin + i*spacing, faders_y), height*0.1, i);
		buttons_mute[i] = new Button('M', 'mute', 'mute', createVector(left_margin-width*0.015 + i*spacing, toggle_y), width*0.02, height*0.03, height*0.015, i);
		buttons_solo[i] = new Button('Solo', 'solo', 'solo', createVector(left_margin + i*spacing, toggle_y), width*0.06, height*0.06, height*0.03, i);

		knobs_eq[i] = new Knob(createVector(left_margin-width*0.025 + i*spacing + 1 * width*0.025, eq_y), height*0.05, i, 1, "eq3");
		knobs_pan[i] = new Knob(createVector(left_margin-width*0.025 + i*spacing + width*0.025, pan_y), height*0.03, i, null, "pan");
	}

	setupButtons();

	//SET UP AUDIO PROCESSING OBJECTS
	if(current_module == "mic"){
		for(var i = 0; i < recordings_number; i++){
			recordings_buttons[i] = new Button(recordings_names[i], 'recording', 'recording', createVector(left_margin + i*spacing, toggle_y), width*0.1, height*0.06, height*0.03, i);

			recordings[i] = new Tone.Player({
				"url" : "./data/recordings/"+i+".wav",
				"playbackRate" : 1,
				"autostart": true,
				"loop" : true,
				"volume" : -200
			}).toMaster();
		}
	}else{
		for(var i = 0; i < track_number; i++){
			channel_label[i] = '--'+(i+1);
			// faders_volume[i] = new Tone.Volume(-10).toMaster();


			pan[i] = new Tone.Panner(0.5).toMaster();
			// eq3[i] = new Tone.EQ3(0, 0, 0).toMaster();
			eq3[i] = new Tone.Filter(0, "peaking").toMaster();
			eq3[i].gain.value = 10;

			pan_question[i] = new Tone.Panner(0.5).toMaster();
			eq3_question[i] = new Tone.Filter(2000, "peaking").toMaster();
			console.log(eq3_question[i]);
			eq3_question[i].gain.value = 10;

			pan_bypass[i] = new Tone.Panner(0.5).toMaster();
			eq3_bypass[i] = new Tone.Filter(0, "peaking").toMaster();
			eq3_bypass[i].gain.value = 0;

			samples[i] = new Tone.Player({
				"url" : "./data/"+(i+1)+".wav",
				"playbackRate" : 0,
				"autostart" : true,
				"loop" : true,
				"volume" : default_volume
			}).toMaster();
		}

		for(var j = 0; j < track_number; j++){
			text_inputs[j] = createInput('CH #'+(j+1).toString());
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
	background(10, 10, 20);

	if(current_module != "mic"){
		displayMixer();

		button_play.display();
		button_play.update();

		button_question.display();
		button_question.update();
	}else{
		displayRecordings();
	}

	button_bypass.display();
	button_bypass.update();

	button_response.display();
	button_response.update();

	button_check.display();
	button_check.update();

	//TITLE
	fill(255);
	textSize(height*0.05);
	text('Ain\'t no '+current_module+' training hard enough', width*0.5, height*0.05);


	if(canShowInstructions)
		showInstructions();
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

	if(canShowQuestion){
			text('the correct recording is: '+recordings_names[pickedRecording], width*0.5, height*0.6);
	}
}

function displayMixer(){
	for(var i = 0; i < faders.length; i++){
		if(isUser && current_module == "level")
			faders[i].display();

		textSize(12);
		noStroke();
		fill(255);
		text(channel_label[i], faders[i].pos.x, height*0.8);
		if(canShowQuestion && faders[i].active){
			if(current_module == "eq"){
				var freq = 'boosted frequency: '+parseInt(eq3_question[i].frequency.value);

					if(abs(eq3_question[i].frequency.value - eq3[i].frequency.value) < question_range_eq){
						fill(0, 150, 0);
						text(freq+' - good!', faders[i].pos.x, height*0.82);
					} else {
						fill(150, 0, 0);
						text(freq+' - too far!', faders[i].pos.x, height*0.82);
					}
			}else if(current_module == "pan"){
				if(abs(pan_question[i].value - pan[i].value) < question_range_pan){
					fill(0, 150, 0);
					text('correctly panned!', faders[i].pos.x, height*0.85);
				}else{
					fill(150, 0, 0);
					text('incorrectly panned!', faders[i].pos.x, height*0.85);
				}
			}else if(current_module == "mute"){
				if(buttons_mute[i].isMuted && faders[i].question_muted){
					fill(0, 150, 0);
					text('correctly muted!', faders[i].pos.x, height*0.85);
				}else if((buttons_mute[i].isMuted && !faders[i].question_muted) || (!buttons_mute[i].isMuted && faders[i].question_muted) ){
					fill(150, 0, 0);
					text('incorrectly muted!', faders[i].pos.x, height*0.85);
				}
			}else if(current_module == "levels"){

			}
		}

		fill(255);
		// text(level_meters.getValue(), left_margin+spacing*i*0.9, height*0.8);
		if(isUser){
			if(current_module == "eq"){
				knobs_eq[i].display();
				knobs_eq[i].update();
				text('find the boosted frequency on the highlighted channel!', width*0.5, height*0.4);
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

	fill(0);
	stroke(255);
	rect(width*0.5, height*0.5, width*0.8, height*0.8);
	fill(255);
	text('INSTRUCTIONS', width*0.5, height*0.3);

	text('press C to continue', width*0.5, height*0.7);

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
		recording_answer = 'good';
	else
		recording_answer = 'bad';

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
		for(var i = 0; i < active_channels; i++){
			var ind = active_channels_indexes[i];
			eq3_question[ind].frequency.value = random(10000, 11000);
			eq3_question[ind].gain.value = 10;
			console.log('eq',ind,'at',eq3_question[ind].frequency.value);
		}
}

function setupQuestionLevel(){
	for(var i = 0; i < active_channels; i++){
		var ind = active_channels_indexes[i];
		//TODO: maybe it's better to actually figure out the fucking volume as a separate bus thing
	}
}

function setupQuestionPan(){
	for(var i = 0; i < active_channels; i++){
		var ind = active_channels_indexes[i];
		pan_question[ind].pan.value = random(0, 1);
	}
}

function setupQuestionMute(){
	// for(var i = 0; i < active_channels; i++){
	// 	var ind = active_channels_indexes[i];
	// 	faders[ind].question_muted = true;
	// }

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
	button_bypass = new Button("Practice", "bypass", "channel", createVector(width*0.3, channels_y), width*0.1, height*0.075,  height*0.03);
	buttons_toggle_channel.push(button_bypass);

	button_question = new Button("Question", "question", "channel", createVector(width*0.5, channels_y), width*0.1, height*0.075, height*0.03);
	buttons_toggle_channel.push(button_question);

	button_response = new Button("Response", "response", "channel", createVector(width*0.7, channels_y), width*0.1, height*0.075, height*0.03);
	buttons_toggle_channel.push(button_response);

	button_check = new Button("Submit", "check", "check", createVector(width*0.85, channels_y), width*0.05, height*0.05, height*0.025);
	button_play = new Button("Play", "play", "play", createVector(width*0.15, channels_y*0.9), width*0.05, height*0.035, height*0.025);
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

function keyPressed(){
	if(key == ' '){
		togglePlay();
	}

	if(key == 'c' || key == 'C')
		canShowInstructions = !canShowInstructions;

}

function disconnectAll(){
	if(current_module != "mic"){
		for(var i = 0; i < track_number; i++){
			samples[i].disconnect();
			samples[i].volume.value = default_volume;
			samples[i].connect(eq3_bypass[i]).connect(pan_bypass[i]).toMaster();


			buttons_mute[i].isMuted = false;
			buttons_mute[i].isSelected = false;
			buttons_solo[i].isSelected = false;

		}
	}else{
		// TODO: keep track of last played? or mute all
		for(var i = 0; i < recordings.length; i++){
			recordings[i].volume.value = - 200;
		}
	}

	isUser = false;
	isBypass = true;
}

function connectRandom(){
	for(var i = 0; i < track_number; i++){
		samples[i].disconnect();
		samples[i].connect(eq3_question[i]).connect(pan_question[i]).toMaster();
	}
	isUser = false;
	isBypass = false;
}

function connectUser(){
	if(current_module != "mic"){
		for(var i = 0; i < track_number; i++){
			samples[i].disconnect();
			samples[i].connect(eq3[i]).connect(pan[i]).toMaster();
		}
	}else{
		recordings[pickedRecording].volume.value = default_volume;
	}
	isUser = true;
	isBypass = false;
}

function checkAnswers(){
	canShowQuestion = true;
	button_check.state = 1;
	button_check.n = 'next';

	for(var i = 0; i < active_channels_indexes.length; i++){
		// console.log('act',active_channels_indexes[i]);
		if(current_module == "eq"){
			if(abs(eq3_question[active_channels_indexes[i]].frequency.value - eq3[active_channels_indexes[i]].frequency.value) < question_range_eq){
				knobs_eq[active_channels_indexes[i]].result_col = result_colors[2];
				// console.log('good');
			}else if(abs(eq3_question[active_channels_indexes[i]].frequency.value - eq3[active_channels_indexes[i]].frequency.value) < question_range_eq*2){
				knobs_eq[active_channels_indexes[i]].result_col = result_colors[1];
				// console.log('bad');
			}else{
				knobs_eq[active_channels_indexes[i]].result_col = result_colors[0];
				// console.log('ugly');
			}
		}else if(current_module == "pan"){

		}else if(current_module == "level"){

		}else if(current_module == "mute"){

		}
	}
}

function deactivateChannels(){
	active_channels_indexes = [];
	for(var i = 0; i < track_number; i++){
		faders[i].active = false;
		faders[i].col = 100;

		knobs_eq[i][0].active = false;
		knobs_eq[i][0].col = 100;
		knobs_eq[i][0].result_col = 100;

		knobs_eq[i][1].active = false;
		knobs_eq[i][1].col = 100;
		knobs_eq[i][1].result_col = 100;

		knobs_eq[i][2].active = false;
		knobs_eq[i][2].col = 100;
		knobs_eq[i][2].result_col = 100;

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
	if(!isPlaying){
		playSamples();
		button_play.n = 'pause';
		isPlaying = true;
	}else{
		stopSamples();
		button_play.n  = 'play';
		isPlaying = false;
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
