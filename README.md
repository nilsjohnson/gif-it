# [gif-it.io](https://gif-it.io "Free + Easy Gif Conversion")

### gif-it.io is a website where users can create and share gifs.

To run project:

#### 1.) Install FFMpeg if neccessary. 

```$ sudo apt update```

```$ sudo apt install ffmpeg```

#### 2.) Install mySQL and run the script in ./sql/create-db.sql

#### 3.) Install dependencies

```$ npm install```

#### 4.) Start the app for development using the create-react-app scripts

```$ node ./server/server.js```

```$ npm run start```

And the app should now be running running on port 3001 with http requests forwarded from 3000!

## sever.js flags

You can pass '--debug' to server.js flag to print debug statements.

```$ node ./server/server.js --debug```

If you are working on the app, you should pass in the '--dev' flag. This makes it so the app doesnt make S3 requests and also serves gifs from a local directory.

```$ node ./server/server.js --dev```

If you are developing the app, typically you might want to pass both.
```$ node ./server/server.js --dev --debug```


## TODO List in order of importance
- ~~Users have a cool, soothing and linear gradient to look at.~~
- ~~users can upload and convert video files to gif~~
- ~~users can tag gifs they upload~~
- ~~users can search for gifs by tag~~
- ~~Sanitze inputs so that if a user enters tags as like "cat, cute, kitten" the tags table does not contain "cat," and "cute,".~~
- ~~During upload and conversion, make the Paper stay the same size thoughout the process.~~
- ~~During conversion, only report the speed and percentage done.~~
- ~~Turn off "Convert To Gif" Button after it's been pressed.~~
- ~~Notify user when they successfully share gif. // (currently always alerts success..)~~
- ~~Users can give gifs descriptions~~
- ~~Save gifs in an S3 bucket instead of on the server~~
- ~~Serve the website from S3 to reduce load on the EC2 instance~~
- Properly escape all SQL
- Users can search by description
- Users can categorize gifs (educational, funny, pets, etc.)
- allow users to flag inappropriate gifs
- create a table of blacklisted tags and prevent them from being shown
- allow users to search by popular tags, date added, and description
- create thumbnail gifs and only show the fullsize gif when clicked on in both the gallery and the uploader.
- allow users to trim videos before converting to gif
- add effects if desired, such as speed up, slow down, blk/white, sepia, etc

Thanks for checking out my app, I'm activly working on it every week!

