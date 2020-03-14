var express = require("express");
var router = express.Router({ mergeParams: true });
var Cat = require("../models/cat"),
    Post = require("../models/post"),
    Gallery = require("../models/gallery")
var middleware = require("../middleware");
const dest = __dirname.slice(0, __dirname.length - 7) + '/public/images/';
var fs = require("fs");

router.get("/new", middleware.isLoggedIn, async(req, res) => {
    await Cat.findById(req.params.id, function(err, cat) {
        if (err) {
            console.log(err);
        } else {
            //console.log("cat: " + cat);
            //console.log("id: " + req.params.id);
            //console.log("catid: " + cat.id);

            res.render("posts/new", { cat: req.params.id });
        }
    });
});



router.post("/", middleware.isLoggedIn, async(req, res) => {
    await Cat.findById(req.params.id, function(err, cat) {
        if (err) console.log(err);

        else {
            if (cat.tmp.length == 0) {
                console.log('no imgs to post!!');
                res.redirect('/');
            }


            //console.log("cat tmp: " + cat.tmp);
            var imgs = cat.tmp;
            //console.log("imgs: " + imgs);
            var time = new Date().toString();
            var posting = {
                    images: imgs,
                    content: req.body.content,
                    likes: 0,
                    time: time,
                }
                //console.log("posting: " + posting);

            cat.tmp = [];

            Post.create(posting, function(err, posting) {

                if (err) console.log(err);

                else {
                    cat.postings.push(posting);
                    console.log("cat: " + cat);

                    var gallery = {
                        images: imgs,
                    }

                    Gallery.create(gallery, function(err, gallery) {
                        if (err) console.log(err);

                        else {

                            posting.galleries.push(gallery);
                            posting.save();
                            cat.galleries.push(gallery);
                            cat.save();

                            gallery.cat = cat;
                            gallery.posting = posting;
                            gallery.save();
                            console.log("posting: " + posting);
                            //console.log("gallery: " + gallery);
                            res.redirect('/cats/' + req.params.id);
                        }
                    });
                }


            });

        }

    });

});

router.get("/:pid", async(req, res) => {

    await Cat.findById(req.params.id, function(err, cat) {
        if (err) console.log(err);

        else {
            Post.findById(req.params.pid, function(err, post) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('posts/postIndex', { cat: cat, post: post });
                }

            });
        }

    });

});

router.delete("/:pid", async(req, res) => {

    await Post.findById(req.params.pid, function(err, post) {
        if (err) {
            console.log(err);
        } else {
            var imgs = post.images;

            for (var i = 0; i < imgs.length; i++) {
                fs.unlink(dest + imgs[i], function(err) {
                    if (err) console.log(err); //throw err;
                    // if no error, file has been deleted successfully
                    console.log('File deleted!');
                });
            }

            post.remove();
            res.send('post deleted!');
        }

    });



});

router.put("/:pid/likes", async(req, res) => {

    await Post.findById(req.params.pid, function(err, post) {
        if (err) console.log(err);

        else {
            post.likes = post.likes + 1;
            post.save();
            console.log("likes: " + post.likes);
            res.redirect('back');
        }
    });
});


module.exports = router;