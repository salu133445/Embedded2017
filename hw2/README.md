######  Lab 2 of Embedded System Lab 2017 Spring
# MeowChat 
by B02901061 鄧郁璇 & B02901080 董皓文

This project is based on *Idiot Chat Room* we made for Lab 1.

Input Module:
* ambient
* climate
* USB camera

Output Module:
* USB audio

## Required Packages & Modules

### JavaScript packages
* express
* socket.io
* t2-cli
* ambient-attx4
* climate-si7020
* tessel-av

### Tessel 2 modules
* ambient
* climate
* USB camera
* USB audio

### Others
* a headphone or a speaker

## How to Run

1. Connect your PC to the tessel 2 board
2. Plug the climate module at port A and the ambient module at port B.
3. Make sure your tessel 2 has been connected to the same wifi AP as the client end does, since the demo is done within LAN.
4. Run the following
    ```
        t2 run meow.js
    ```
    You may see the following
    ```
    Connected to climate module
    Connected to ambient module
    Camera is on
    listening on *: xxxx
    http://oooooo.local:xxxx
    ```
5. Enter the address in a browser (Chrome recommended)

## Features
MeowChat is a multifunctional pet monitoring system embedded in an online chat room with the following features.
* Realtime video monitoring
* Calling your pets (press *Meow* and your cat will hear your prerecorded voice)
* Receiving calls from your pets once their paws are detected. 
* Temperature and humidity monitoring (update every sec)
* Chat room (with online user list)
* Login and registration system

## System Architecture

We use socket.io to create mutual communications between the server and the clients.

### Server End
* Initialization
    * Connect with tessel modules.
    * Establish a socket connection through socket.io.
* Monitoring
    * Detect the light level data by the ambient module (sampled every second). Whenever the light level is less than * ambientLightThreshold* (0.025 by default), a socket will be emitted and an alert will pop out in the client end.
    * Detect the temperature and humidity by the climate module (sampled every second). Emit a socket containg the data. Then the temperature and humidity information in the client end (shown on the right top) will be updated accordingly.
* Listening
    *  Listen to the incoming sockets and act accordingly.

### Client End
* Initialization
    * Ask users for login or sign-up information.
    * Send the login attempts to the server.
    * Wait for form-submit and button-click events once the user has logged in succesfully.
* Send a message
    *  Whenever the form has been submitted (through pressing the send button or enter on the keyboard), the input message will be sent to the server.  And then the server will broadcast the received message to all other users. 
* Send a Meow
    * Whenever the button *Meow* (shown on the right top of the video image) is pressed, a socket will be emitted. Then a pre-recorded sound file (*meow.mp3*) will be played in the server end.
* Listening
    *  Listen to the incoming sockets and act accordingly.
	 
### Snapshots
#### System Overview

![IMAG-system](https://github.com/salu133445/Embedded2017/blob/master/hw2/snapshot/IMAG1887.jpg)

#### User Interface

![User Interface](https://github.com/salu133445/Embedded2017/blob/master/hw2/snapshot/UI.png)

#### User Interface - Ambient Module Triggered

Once the ambient module is triggered, an alert will pop out in the user interface. 

![UI-Ambient](https://github.com/salu133445/Embedded2017/blob/master/hw2/snapshot/UI-Ambient.png)

#### User Interface - Temperature & Humidity Information Updating

The temperature and humidity information are shown on the right top of the user interface, being updated every second.

![UI-Climate](https://github.com/salu133445/Embedded2017/blob/master/hw2/snapshot/UI-Climate.png)
