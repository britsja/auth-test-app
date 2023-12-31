const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
require('dotenv').config({path: __dirname + '/.env'});
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const uri = process.env.MONGO_URL;

app.listen(3000, function() {
    console.log("Server listening on port 3000");
});

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB connection established');
})

const userSchema = new mongoose.Schema( {
    email: String,
    password: String,
    googleId: String,
    secret: String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const secret = process.env.SECRET;

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id        
      });
    });
  });
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.route("/")
    .get(
        function(req, res) {
            res.render("home");
        }
    );  
    
app.route("/auth/google")
    .get(
        passport.authenticate('google', { scope: ['profile'] }) 
    )

app.route("/auth/google/secrets")
    .get(
        passport.authenticate('google', { failureRedirect: '/login' }),
        function(req, res) {            
            res.redirect('/secrets');
        }
    );

app.route("/login")
    .get(
        function(req, res) {
            res.render("login");
        }
    )
    .post(
        function(req, res) {
            const user = new User({
                username: req.body.username,
                password: req.body.password
            });

            req.login(user, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    passport.authenticate("local")(req,res, function() {
                        res.redirect("/secrets");
                    });
                }
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
            User.register({username: req.body.username}, req.body.password, function(err, user) {
                if (err) {
                    console.log(err);
                    res.redirect("/register")
                } else {
                    passport.authenticate("local")(req, res, function() {
                        res.redirect("/secrets");
                    })
                }
            });
        }
    );

app.route("/secrets")
    .get(
        function(req, res) {
            User.find({"secret": {$ne: null}}).then((users) => {
                try {
                    res.render("secrets", {usersWithSecrets: users});
                } catch(err) {
                    console.log(err)
                }
            })
        }       
    );

app.route("/submit")
    .get(
        function(req, res) {
            if (req.isAuthenticated()) {
                res.render("submit");
            } else {
                res.redirect("/login");
            }   
        }
    )
    .post(
        function(req, res) {
            const submittedSecret = req.body.secret;
            User.findById(req.user.id).then((user) => {
                user.secret = submittedSecret;
                user.save().then(res.redirect("/secrets"));
            })               
        }
    )

app.route("/logout")
    .get(
        function(req, res) {
            req.logout(function(err) {
                if (err) { return next(err); }
                res.redirect('/');
              });            
        }
    );