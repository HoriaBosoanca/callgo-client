# Callgo
This is the client for a video call app that I made as a personal project (with the Angular framework and the Go standard library)

## Links
The repo for the server is [here](https://github.com/HoriaBosoanca/callgo-server). \
The live app is [here](https://callgo-client.vercel.app/menu).

## Todo
### Soon
Implement meeting join request / kick features \
Use websockets (currently using http) \
Use goroutines on backend \
Get API off Google Cloud and on my Raspberry PI before free trial ends \
Make some performance tests (CPU, RAM) \
Link to subdomain
### Later
Use WebRTC \
Microphone support \
Share screen support

## Done
Send and receive video data via http \
Make all operations blocking (await them) and only do 1 POST every 1 GET so video frames don't get mixed up \
Group videos into sessions (meetings) \
Fix a bug where 'ngFor' reloads the entire image element instead of only it's source \
Display every member's video on a decent UI, with display names as overlays and make a list of IDs component for debugging \
Use session storage so the app can be refreshed withoud leaving the meeting