//all the middlewares goes here
var middlewareObj = {};
var Cat = require("../models/cat");
//var Comment = require("../models/comment");

middlewareObj.checkCatOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Cat.findById(req.params.id, function(err, foundCat) {
            if (err) {
                console.log("error", "Cat NOT Found!");
                res.redirect("back");
            } else {
                //does the author own the campground?
                if (foundCat.owner.id.equals(req.user._id)) {
                    next();
                } else {
                    console.log("error", "Sorry. You do NOT have the permission!");
                    console.log("user id: " + req.user._id + "  owner id: " + foundCat.owner.id);
                    res.redirect("back");
                }

            }
        });
    } else {
        console.log("error", "You need to log in first!");
        res.redirect("/login");
    }
}



middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    console.log("error", "You need to log in first!");
    res.redirect("/login");
}

middlewareObj.returnKey = function(url) {
    var index = url.indexOf('image');
    var str = url.substring(index);
    return str;
}


module.exports = middlewareObj;