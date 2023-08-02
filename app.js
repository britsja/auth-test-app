const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
require('dotenv').config({path: __dirname + '/.env'});

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const uri = process.env.MONGO_URL;

app.listen(3000, function() {
    console.log("Server listening on port 3000");
});

mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB connection established');
})

const userSchema = {
    email: String,
    password: String
}

const User = new mongoose.model("User", userSchema);

app.route("/")
    .get(
        function(req, res) {
            res.render("home");
        }
    );

app.route("/login")
    .get(
        function(req, res) {
            res.render("login");
        }
    );

app.route("/register")
    .get(
        function(req, res) {
            res.render("register");
        }
    );

app.route("/secrets")
    .get(
        function(req, res) {
            res.render("secrets");
        }
    );

app.route("/submit")
    .get(
        function(req, res) {
            res.render("submit");
        }
    );