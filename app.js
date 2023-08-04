const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
require('dotenv').config({path: __dirname + '/.env'});
const bcrypt = require('bcrypt');

const saltRounds = 8;


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
            const password = req.body.password;                 

            await User.findOne({email: username}).then((data) => {
                
                if (data) {
                    bcrypt.compare(password, data.password, function(err, result) {
                        if (result === true) {
                            res.render("secrets");
                        }
                        else {                            
                            res.render("login");
                        }
                    })
                }  
                else {
                    res.render("login");
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
        function(req, res) {
            try {

            bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                });
                await newUser.save();
                res.render('secrets');
            });            
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