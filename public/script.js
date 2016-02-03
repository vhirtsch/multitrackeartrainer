var faders = [];
var track_number = 8;

var samples = [];
var samplesPlaying = false;

function preload(){

}

function setup(){
	var cnv = createCanvas(windowWidth, windowHeight);

	for(var i = 0; i < track_number; i++){
		faders[i] = new Fader(createVector(width*0.1 + i*width*0.1, height*0.5), height*0.1, i);
	}

	for(var i = 0; i < track_number; i++){
		samples[i] = loadSound('data/'+i+'.wav', function(){
			// this.stop();
		});
	}
}

function draw(){
	background(10, 10, 20);
	for(var i = 0; i < faders.length; i++){
		faders[i].display();
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
	}
}

function keyPressed(){

	if(allSamplesLoaded()){
			if(key == ' '){
			for(var i = 0; i < track_number; i++){
				if(!samplesPlaying){
					samples[i].play();
					console.log('playing #'+i+'@'+millis()/1000);
				}
					
				else
					samples[i].pause();
			}
		}else if(key == 's' || key == 'S'){
			for(var i = 0; i < track_number; i++){
				if(samples[i].isPlaying())
					samples[i].stop();
			}
		}

		samplesPlaying = !samplesPlaying;
	}
}

function allSamplesLoaded(){
	var allLoaded = true;
	for(var i = 0; i < track_number; i++){
		if(!samples[i].isLoaded())
			allLoaded = false;
		console.log('sample #'+i+" is loaded? "+samples[i].isLoaded());
	}
	console.log('all samples loaded?'+allLoaded);
	return allLoaded;
}

function mouseReleased(){
	for(var i = 0; i < track_number; i++){
		faders[i].ishandled = false;
	}
}