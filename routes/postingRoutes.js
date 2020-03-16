const AWS_ACCESS_KEY_ID = 'AKIAJS4R2IFRZKHIIK7A';
const AWS_SECRET_ACCESS_KEY = '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';
const S3_BUCKET = '391imgs';
const aws = require('aws-sdk');
var express = require("express");
var router = express.Router({ mergeParams: true });
var Cat = require("../models/cat"),
    Post = require("../models/post"),
    Gallery = require("../models/gallery")
var middleware = require("../middleware");

/*********************************************************/
router.get("/new", middleware.checkCatOwnership, async(req, res) => {
    await Cat.findById(req.params.id, function(err, cat) {
        if (err) {
            console.log(err);
        } else {
            res.render("posts/newPost", { cat: cat });
        }
    });
});

router.post("/pics", middleware.checkCatOwnership, async(req, res) => {
    await Cat.findById(req.params.id, function(err, cat) {

        if (err) console.log(err);

        else {
            cat.tmp.push(req.body.img);
            cat.save();

            console.log("tmp: " + cat.tmp);
            res.redirect('back');

        }
    });
});

router.delete("/pics", middleware.checkCatOwnership, async(req, res) => {
    await Cat.findById(req.params.id, function(err, cat) {

        if (err) console.log(err);

        else {
            const s3 = new aws.S3({
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            });

            var imgs = cat.tmp;
            imgs.forEach(img => {
                s3.deleteObject({
                    Bucket: S3_BUCKET,
                    Key: middleware.returnKey(img)
                }, function(err, data) {
                    if (err) console.log(err);
                })
            });

            cat.tmp = [];
            cat.save();

            console.log("cats tmp cleared: " + cat.tmp);
            res.redirect('back');

        }
    });
});

router.post("/", middleware.checkCatOwnership, async(req, res) => {
    await Cat.findById(req.params.id, function(err, cat) {
        if (err) console.log(err);

        else {

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

            cat.tmp = [];

            Post.create(posting, function(err, posting) {

                if (err) console.log(err);

                else {
                    cat.postings.push(posting);
                    //console.log("cat: " + cat);

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


/*********************************************************/

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
            const s3 = new aws.S3({
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            });

            var imgs = post.images;
            imgs.forEach(img => {
                s3.deleteObject({
                    Bucket: S3_BUCKET,
                    Key: middleware.returnKey(img)
                }, function(err, data) {
                    if (err) console.log(err);
                })
            });

            post.remove();
            console.log('Post deleted!');
            res.redirect('/cats/' + req.params.id);
        }

    });
    s
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