const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
require('dotenv').config({path: __dirname + '/.env'});
const md5 = require('md5');


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

const userSchema = new mongoose.Schema( {
    email: String,
    password: String
})

const secret = process.env.SECRET;

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
    )
    .post(
        async function(req, res) {
            const username = req.body.username;
            const password = md5(req.body.password);                 

            await User.findOne({email: username}).then((data) => {
                
                if (data.password === password) {
                    res.render('secrets');
                }  
                else {
                    console.log("Password given: " + password);
                    console.log("Password in DB: " + data.password);
                }              
            })
            .catch((err)=>{
                console.log(err);
                res.render("login")
            });           
            
        }    
    );

app.route("/register")
    .get(
        function(req, res) {
            res.render("register");
        }
    )
    .post(
        async function(req, res) {
            try {
            const newUser = new User({
                email: req.body.username,
                password: md5(req.body.password)
            });
            await newUser.save();
            res.render('secrets');
            }
            catch(err) {
                console.log(err);                
            }
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