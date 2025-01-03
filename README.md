# Callgo
This is the client for a video call app that I made as a personal project (with the Angular framework and the Go standard library)

## Links
The repo for the server is [here](https://github.com/HoriaBosoanca/callgo-server-ws). \
The live app is [here](https://callgo-client.vercel.app/menu).

## Todo
Move client to rpi and link it to domain \
Microphone support \
Use more goroutines on the server \
Make a session cleanup system on the server (session timeouts) \
Use WebRTC \
Share screen support \
Implement join request feature

## Done
Send and receive video data via http \
Make all operations blocking (await them) and only do 1 POST every 1 GET so video frames don't get mixed up \
Group videos into sessions (meetings) \
Fix a bug where 'ngFor' reloads the entire image element instead of only it's source \
Display every member's video on a decent UI, with display names as overlays and make a component with a list of IDs for debugging \
Use session storage so the app can be refreshed without leaving the meeting \
Moved API from Google Cloud to Raspberry PI \
Implement leave / kick feature \ 
Rewrite server with websockets \
Rewire client to new server \
Reimplement meeting rejoin after refreshing tab \
Implement redirect to menu when the websocket closes \ 
Reimplement list component and kicking \
Learn about sync.mutex and use it on the server (to safely write to ws connections and maps) \
Live member join and disconnect ws notifications