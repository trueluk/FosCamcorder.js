FosCamcorder
=====

- Record video streams from Foscam IP cameras
- Get email alerts when a camera goes offline

## Purpose: 

I have multiple Foscam 8910W cameras setup on my LAN. The cameras, out of the box, have no mechanism for recording the video stream. That's a pretty big drawback to this camera. The camera will email or upload (6) images when motion is detected, but the (6) images are unable to provide enough context for some of my uses. Specifically, continued motion for the next 20 seconds or so (I don't know the real value here) doesn't trigger a motion alarm. A person with that knowledge can easily trigger the motion alarm, wait 10 seconds and then move in front of the camera freely while the motion detection mechanism is in a transitional state. As a result, I receive an email that resembles a false alarm; there is no sign of life in the pictures. 

Also, one of my cameras is susceptible to being unplugged. If the camera is unplugged before the (6) pictures--triggered by motion--are taken, then I never receive an email notification. For that reason, I also monitor whether the cameras are online. If a camera goes offline, I receive an email. In addition, I have a video recorded up to the point of the camera being unplugged (which in my case, allows me to see the person unplugging the camera).

## Description:

There is a record loop that runs every 5 minutes by default. That means each video is 5 minutes long (that's 288 videos per day). The loop kills the previous record processes, and then spawns a new process. To alter the length of the video files, change config.video_length in config.js. The videos are saved in the directory specified in your config.js file: config.save_location.

There is a cleanup loop that runs once per day. It will remove all files older than N days, where N is configurable in config.js as keep_videos. (ex. config.keep_videos = 5; will remove files older than 5 days).

In the future, I plan to increase the verboseness of the motion detection email with FosCamcorder. When motion is detected, FosCamcorder will pull a configurable amount of screenshots from the camera (ex. wget $server/screenshot.cgi?user=&pwd=) for the next N seconds. Those screenshots will then be emailed. This will make up for the cameras 'blindspot.' 

Additionally, I plan to add automatic transcoding of the video files from .asf to a more suitable viewing format.


## How to Use:
1. Add the local IP address of your cameras to config.js: 

    config.cam_servers = ['192.168.1.2'];

2. Set your save location:

    config.save_location = "./"; 

3. Change your smtp settings to receive email updates when a camera goes offline.

4. Run the script (use nohup to ensure the process continues after your session ends):

    nohup node FosCamcorder.js > /dev/null 2>&1 &

## Requirements:
* Unix/Linux/OSX: The script spawns pkill, wget, ping, and rm processes. 
* nodemailer (node.js module): for sending camera offline status messages