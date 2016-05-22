var request = require('request');
var fs = require('fs');
var util = require('util');
var mkdirp = require('mkdirp');

const dir = "./pics";
const earthDate = "2016-02-23";
// This is the directory where the files will be saved.
const savedImageDir = util.format("%s/%s", dir, earthDate);
const dataRetrieveUrl =  util.format("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=%s&api_key=DEMO_KEY", earthDate);

/*
* Fire off a request to the URL which will allow us to retrieve the necessary data
* back from the NASA API.
*/
request(dataRetrieveUrl, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    // Make sure the directory is in place before continuing.
    createDirectory(savedImageDir, function() {
        var result = body;
        var photoObj = JSON.parse(body);
        // Directory exists so we can now process through the images.
        processImages(photoObj);
    });
  }
});


/*
* Process through the images retrieved through the call to the NASA API.
*/
processImages = function(jsonObj) {
  for (var i = 0; i < jsonObj.photos.length ; i ++) {
    var imageUrl = jsonObj.photos[i].img_src;
    var filename = util.format("%s/%s.png", savedImageDir, jsonObj.photos[i].id);
    download(imageUrl, filename, function() {
      // Saved the image successfully.
    });
  }
}
/*
* Create the directory then execute the callback when we're done.
*/
createDirectory = function(directory, callback) {
  mkdirp(directory, function (err) {
    if(!err) {
      callback();
    }
    else {
      console.error(err);
    }
  });
}
/*
* download a file from a URL and execute the callback when we've saved
* the file to disk.
*/
var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    console.log('saved the image to filename: %s', filename);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
