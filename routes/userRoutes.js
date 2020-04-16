var express = require("express");
var router = express.Router();
var Cat = require("../models/cat"),
    User = require("../models/user")

var middleware = require("../middleware");

// user login route
router.get('/', middleware.isLoggedIn, async(req, res) => {
    await User.findById(req.user._id).populate("cats").exec(function(err, user) {

        if (err) console.log(err);
        else {
            var cats = user.cats;
            res.render('users/myCats', { user: req.user, cats: cats });
        }

    });
});



module.exports = router;