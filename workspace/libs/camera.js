
var timeout = 5000,
	timerId = 0,
	Camera 	= require("raspicam");

exports.takephotos = function(opts, cb){

	if (timerId) return;
 
  	timerId = setTimeout(function() {
    	clearTimeout(timerId);
    	timerId = null;
  	}, timeout);

	var camera = new Camera({
		mode 		: "timelapse",
		output 		: "./image_%06d_"+".jpg", // image_000001.jpg, image_000002.jpg,...
		encoding 	: "jpg",
		timelapse 	: 200, // take a picture every 3 seconds
		timeout 	: 2000 // take a total of 4 pictures over 12 seconds
	}),
	filenames = [];

	camera.on("start", function( err, timestamp ){
		console.log("timelapse started at " + timestamp);
	});

	camera.on("read", function( err, timestamp, filename ){
		console.log("timelapse image captured with filename: " + filename);
		if(filename.indexOf("~") == -1){
			filenames.push(filename);
		}
	});

	camera.on("exit", function( timestamp ){
		console.log("timelapse child process has exited");
	});

	camera.on("stop", function( err, timestamp ){
		console.log("timelapse child process has been stopped at " + timestamp);
		
	});

	camera.start();

	// test stop() method before the full 12 seconds is up
	setTimeout(function(){
		camera.stop();
		cb(filenames);
	}, 3000);
}