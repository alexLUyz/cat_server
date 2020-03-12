var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", function(req, res) {
  
    res.render("landing");
});

//==============
//AUTH ROUTES
//==============

//show sign up form
router.get("/register", function(req, res) {
    res.render("register");
});

//handle signup logic
router.post("/register", function(req, res) {
    //req.body.username
    //req.body.password
    User.register(new User({ username: req.body.username }), req.body.password, function(err, user) {
        if (err) {
            console.log("ERR:" + err.message);
            //req.flash("error", err.message)
            return res.redirect("/register");
        }

        //log the user in
        passport.authenticate("local")(req, res, function() {
            //req.flash("success", "Welcome to YelpCamp, " + user.username);
            console.log("success", "Welcome to YelpCamp, " + user.realUsername);
            res.redirect("/");
        });
    });
});

//LOGIN ROUTES
router.get("/login", function(req, res) {
    res.render("login");
});

//handle login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), function(req, res) {});


//LOGOUT ROUTE
router.get("/logout", function(req, res) {
    req.logout();
    //req.flash("success", "Logged You Out!")
    res.redirect("/");
});


function isLoggedIn(req, res, next) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/login");
}

module.exports = router;