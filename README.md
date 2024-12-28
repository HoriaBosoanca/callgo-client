# Callgo
This is the client for a video call app that I made as a personal project (with the Angular framework and the Go standard library)

## Links
The repo for the server is [here](https://github.com/HoriaBosoanca/callgo-server). \
The live app is [here](https://callgo-client.vercel.app/menu).

## Todo
### Soon
Replace all http with websockets, optimize backend with goroutines \
Use websockets to do contious checks --> kicks + redirects, join requests \
Link client to domain
### Later
Use WebRTC \
Microphone support \
Share screen support

## Done
Send and receive video data via http \
Make all operations blocking (await them) and only do 1 POST every 1 GET so video frames don't get mixed up \
Group videos into sessions (meetings) \
Fix a bug where 'ngFor' reloads the entire image element instead of only it's source \
Display every member's video on a decent UI, with display names as overlays and make a component with a list of IDs for debugging \
Use session storage so the app can be refreshed without leaving the meeting \
Moved API from Google Cloud to Raspberry PI \
Implement leave / kick feature 