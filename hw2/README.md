######  Lab 2 of Embedded System Lab 2017 Spring
# MeowChat 
by B02901061 鄧郁璇 & B02901080 董皓文
This project is based on *Idiot Chat Room* we made for Lab 1.

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

1. Connect to the tessel 2 board
2. Run the following
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
3. Open the address in a browser (Chrome recommended)

## Features
MeowChat is a multifunctional pet monitoring system embedded in a online chat room with the following features.
* Realtime video monitoring
* Calling your pets (press *Meow* and your cat will hear your voice)
* Temperature and humidity monitoring (update every sec)
* Chatting room (with online user list)
* Login and registration system

## System Architecture
We use socket.io to create mutual communications between the server and the clients.  
### Server
* Initilization
    * modules connected
    * connection established
* Monitoring
    * We use only the light level data of the ambient module (sampled every second). Whenever the light level is less than *ambientLightThreshold* (default is 0.025), an socket will be emitted and an alert will pop up in the client end.
    * We sampled the temperature and humidty information provided by the climate module every second, and a socket containg the data will be emitted. Then the temperature and humidty information (shown on the right top) will be updated accordingly.
* Listening
    *  Listen to the incoming sockets and act accordingly.

### Client
* Initilization
    * Ask users for login or sign-up information
    * 
* Send a Meow
    * Whenever the button *Meow* is pressed, a socket will be emitted. Then a pre-recorded sound file (*meow.mp3*) will be played in the erver end.
* Listening
    *  Listen to the incoming sockets and act accordingly.