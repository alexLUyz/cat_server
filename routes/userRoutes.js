var express = require("express");
var router = express.Router();
var Cat = require("../models/cat"),
    User = require("../models/user")

var middleware = require("../middleware");

router.get('/', middleware.isLoggedIn, async(req, res) => {
    await (await User.findById(req.user._id).populate("cats")).execPopulate(function(err, user) {
        if (err) console.log(err);

        res.render('users/myCats');
    });
});



module.exports = router;