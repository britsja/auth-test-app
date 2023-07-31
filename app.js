const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000, function() {
    console.log("Server listening on port 3000");
});

app.route("/")
    .get(
        function(req, res) {
            res.send("Hello World")
        }
    );
