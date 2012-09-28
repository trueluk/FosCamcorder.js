/** FosCamcorder.js 
	To begin node process in background, and so that it continues running after your current session ends:
		nohup node FosCamcorder.js > /dev/null 2>&1 &
**/


var http = require("http");
var exec = require("child_process").exec;
//setup configuration
var config = require('./config');
//setup emailer
var email = require("nodemailer");
if(config.email_smtp)
	email.SMTP = config.email_smtp;
else{
	console.log("Warning: Cannot email status updates. Set email_smtp options in config.js");
}
//get and handle output from ping command
function ping_puts(error, stdout, stderr) {
	var m=stdout.match(/PING\s([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
	var host = "unkown";
	if(m &&m.length>1){
		host = m[1];	//find this host
	}
	if(stdout.indexOf("0 received")>=0){
		emailAlert({
			subject: "IP Camera Offline - "+host,
			body: "The camera at host " + host +" appears to be offline"
		});
	}//else: host online
}
emailAlert = function(msg){
	if(config.email_smtp){
		email.send_mail({
			sender: config.email_options.sender,
			to: config.email_options.recipient,
			subject: msg.subject,
			body: msg.body
		},
		function(err,result){
			if(err) console.log(err);	
				return;
		});
	}else{
		console.log("Cannot email, no config setup");
	}
}


Camera = function(cam_num, server){
	this._number = cam_num;
	this._server = server;
	this._pid = null;	//my process id
	this._statusInt = null;

	this.checkStatus = function(){
		exec("ping -c 2 "+ this._server, ping_puts);	
	}
	this.recordFile = function(){
		//run process
		/** TODO:
				* create file name here so that node process knows the filename
				* save it in this._files array
				* after record() is called, call a transcode() function that searches each cam object's _files array
					* foreach file in array:
						- spawn child process (handbrake-cli) to transcode the .asf file to m4v 
						- NOTE: don't delete the .asf file immediately:
							- old .asf files are deleted after config.video_retain_length days
		**/
		var filename = "cam"+this._number+"_`date +%F_%T`.asf";
		var cmd = "nohup wget http://"+this._server+"/videostream.asf?user="+config.cam_user+"\\&pwd="+config.cam_pwd+" -O "
			+ config.save_location + filename + " > /dev/null 2>&1 &";
		//exec cmd
		var child = exec(cmd, function(e,stdout){
			console.log("STDOUT");
			console.log(stdout);
		});
		if(child&&child.pid)
			this._pid = child.pid;	//not the actual pid, no way to kill just this process w/o parsing stdout from `ps ax`
	}

	//now start checking status
	var _self =this;	
	this.checkStatus();
	this._statusInt = setInterval(function(){_self.checkStatus()}, config.status_interval);	//check my status every 60 seconds
}

cleanupLoop = function(){
	/** TODO:
			test this.	
	**/
	if(config.keep_videos){
		//remove old videos		
		var cmd = 'rm ' + config.save_location+'/cam*_`date --date="'+config.keep_videos+' days ago" +%F_`*.asf';
		//exec(cmd, function(e,stdout){});
	}
	if(config.transcode_videos && config.keep_transcoded_videos){
		//remove old transcoded videos
		var cmd = 'rm ' + config.save_location+'/cam*_`date --date="'+config.keep_transcoded_videos+' days ago" +%F_`*.m4v';
		//exec(cmd, function(e,stdout){});
	}
}

record = function(){
	for(var i=0;i<cameras.length;i++){
		cameras[i].recordFile();
	}
}
recordLoop = function(){
	//kill existing camera recordings
	exec("pkill -9 wget");
	//start recording new files
	setTimeout(record, 10);
}

//global cameras array
var cameras = [];
main = function(){
	for(var i=0;i<config.cam_servers.length;i++){
		var c = new Camera((i+1), config.cam_servers[i]);
		cameras[i] = c;
	}
	//call first record
	recordLoop();
	//start the recording loop
	setInterval(recordLoop, config.video_length);	
	//start the cleanup loop
	setInterval(cleanupLoop, 86400000);				
}

//testing:

config = {};
config.cam_servers = [ "192.168.1.3","192.168.1.4"];
config.cam_user = "admin";
config.cam_pwd = "CAMPASSWORD";	

config.save_location = "./";             //where to save the video streams

config.video_length = 300000;	         // length in ms (300000 = 5 minute videos)
config.keep_videos = 10;	             // in days, how many days to keep a video, 10 days; 0 to keep forever
config.transcode_videos = false;         // transcode videos with handbrake-cli
config.keep_transcoded_videos = 0;       // how long (in days) to keep transcoded files; 0 to keep forever

config.status_interval = 60000;          //how often to check cam status in ms (60000 = 1 minute)
config.email_smtp = {                    //smtp settings
	host: "smtp.gmail.com",
	port: 465,
	ssl: true,
	user_authentication: true,
	user: 'USERNAME',	
	pass: 'PASSWORD,'
};

config.email_options = {
	sender: "SEND_MSG_FROM",             //who's sending the email?
	recipient: "SEND_MSG_TO"             //where am I sending status alerts to
}

function exec(cmd){console.log("EXEC at "+new Date().toString()+": " + cmd);}


//startup the cameras
main();