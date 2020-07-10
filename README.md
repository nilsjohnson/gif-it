#gif-it.io
##This is an app to convert videos to GIFs.
___

To run project:

1.) Install FFMpeg if neccessary. 

   ``` $ sudo apt install ffmpeg```

2.) Install mySQL and run the script in ./sql/create-db.sql

3.) Install dependencies
     
     ```$ npm install```

4.) Start the app for development using the create-react-app scripts
   
   ``` $ node ./server/server.js```
    ```$ npm run start```

And the app should nw be running running on port 3001 with http requests forwarded from 3000!

Current State of the App:

- As a user, one can upload, convert to gif and tag a video files.  
- As a user, one can search for a gif by a tag.

The flow is a little rough at the moment but the wiring is all there. Updates coming in often.

## // TODO List in order of importance
- ~~users can upload and convert video files to gif
- ~~users can tag gifs they upload
- ~~users can search for gifs by tag
- During upload and conversion, make the Paper stay the same size thoughout the process.
- During conversion, only report the speed and percentage done.
- Turn of "Convert To Gif" Button after it's been pressed.
- Notify user if they successfully share thier gif.

- categorize gifs (educational, funny, pets, etc.)
- allow users to flag inappropriate gifs
- allow users to search by popular tags, date added, and description

- create thumbnail gifs and only show the fullsize gif when clicked on in both the gallery and the uploader.
- allow users to trim videos before converting to gif
- add effects if desired, such as speed up, slow down, blk/white, sepia, etc

