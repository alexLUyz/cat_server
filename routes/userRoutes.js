var express = require("express");
var router = express.Router();
var Cat = require("../models/cat"),
    User = require("../models/user")

var middleware = require("../middleware");

router.get('/', middleware.isLoggedIn, async(req, res) => {
    await User.findById(req.user._id).populate("cats").exec(function(err, user) {

        if (err) console.log(err);
        else {
            var posts = [];
            var cats = user.cats;
            for (var i = 0; i < user.cats.length; i++) {

                posts.push(user.cats[i].posts[0].image);
            }

            //console.log(posts);

            res.render('users/myCats', { user: req.user, cats: cats, posts: posts });
        }

    });
});



module.exports = router;