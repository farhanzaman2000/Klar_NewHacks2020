var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var axios = require("axios");
var fs = require("fs");
var exphbs = require("express-handlebars");
var multer = require("multer");
var upload = multer({ dest: "uploads/" });
app.use(express.static(__dirname + "/public"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.engine(
  "hbs",
  exphbs({
    extname: "hbs"
  })
);
app.set("view engine", "hbs");

function sameer(arr, emot, res) {
  var retArr = [];
  //arr is an array of objects
  arr.forEach(obj => {
    var currentBreak = true;
    obj.image.forEach(face => {
      var thisOne = emot;
      if (face.faceAttributes.emotion[thisOne] > 0.2 && currentBreak) {
        currentBreak = false;
        retArr.push(Buffer.from(obj.bugger).toString("base64"));
      }
    });
  });
  res.render("results", { images: retArr });
}

const subscriptionKey = "09ca1c6457744004801f62169148d94b";
const url =
  "https://eastus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceAttributes=emotion&detectionModel=detection_01";

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/upload", function(req, res) {
  res.render("upload");
});

app.post("/upload", upload.array("userPhoto", 70), function(req, res) {
  var emotion = req.body.optradio;
  var filesArray = req.files;
  var score_array = [];
  var num_files = filesArray.length;
  for (let i = 0; i < num_files; i++) {
    var fileName = "./uploads/" + filesArray[i].filename;
    fs.readFile(fileName, function(err, data) {
      if (err) {
        console.log("something went wrong with file read: ", err);
        res.send("Error, sorry! :(");
      } else {
        const options = {
          method: "POST",
          data: data,
          headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": subscriptionKey
          },
          url
        };
        axios(options)
          .then(response => {
            score_array.push({
              image: response.data,
              bugger: data
            });
            if (i == num_files - 1) {
              setTimeout(function() {
                sameer(score_array, emotion, res);
              }, 7000);
            }
          })
          .catch(error => {
            console.log("ERROR: ", error.response);
            res.send("error");
          });
      }
    });
  }
});

app.listen(4000);
