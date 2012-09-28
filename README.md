FosCamcorder
=====

- Record streams from Foscam IP cameras
- Get email alerts when camera goes offline


## How to Use:
1. Add the local IP address of your cameras to config.js: 

    config.cam_servers = ['192.168.1.2'];

2. Set your save location:

    config.save_location = "./"; 

3. Change your smtp settings to receive email updates when a camera goes offline.

4. Run the script (use nohup to ensure the process continues after your session ends):

    nohup node FosCamcorder.js > /dev/null 2>&1 &

## Requirements:

* nodemailer: for sending camera offline status messages