//camera configuration options
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

module.exports = config;