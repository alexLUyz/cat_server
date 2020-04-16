const AWS_ACCESS_KEY_ID = 'ID';
const AWS_SECRET_ACCESS_KEY = 'KEY';
const S3_BUCKET = '391imgs';
const DB = 'cloud_391Module2';
const aws = require('aws-sdk');
var crypto = require('crypto');
var express = require("express");
var router = express.Router();
var Cat = require("../models/cat"),
    Post = require("../models/post"),
    Gallery = require("../models/gallery")
var middleware = require("../middleware");



router.get('/', async(req, res) => {
    let cats = await Cat.find();
    //var time = new Date().toString();
    //console.log(time);
    return res.status(200).send(cats);
});


/********************************************************************* */

// new cat form 
router.get('/new', (req, res) => {
    res.render('cats/newCat')
});

/*
 * Respond to GET requests to /sign-s3.
 * Upon request, return JSON containing the temporarily-signed S3 request and
 * the anticipated URL of the image.
 */
router.get('/sign-s3', (req, res) => {
    const s3 = new aws.S3({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    });;
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];

    var t = Date.now();
    var hash = crypto.createHash('md5').update(t + fileName).digest('hex');
    hash = 'images/' + DB + '/' + hash + '.png';

    const s3Params = {
        Bucket: S3_BUCKET,
        Key: hash,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/${hash}`
        };
        res.write(JSON.stringify(returnData));
        res.end();
    });
});

/*
 * Respond to POST requests to /submit_form.
 * This function needs to be completed to handle the information in
 * a way that suits your application.
 */
router.post('/', async(req, res) => {

    //console.log(req.body);
    await Cat.create(req.body, function(err, cat) {
        if (err) console.log(err);
        else {
            cat.owner.id = req.user._id;
            cat.owner.ownername = req.user.realusername;
            cat.save();
            req.user.cats.push(cat);
            req.user.save();
            var id = cat._id;
            console.log("Cat create Succedded " + cat);
            res.redirect('cats/' + id);
        }
    });

});

/************************************************************* */

// cat index route
router.get('/:id', (req, res) => {

    Cat.findById(req.params.id).populate("postings").exec(function(err, cat) {
        if (err) console.log(err);

        else {
            res.render('cats/index', { cat: cat, posts: cat.postings });
        }
    });

});

//cat edit route
router.put('/:id', async(req, res) => {

    const { id } = req.params;
    let cat = await Cat.findByIdAndUpdate(id, req.body);

    console.log(cat);
    return res.status(201).send({
        error: false,
        cat
    });
});

//cat delete route
router.delete('/:id', async(req, res, next) => {

    await Cat.findById(req.params.id).populate("postings").exec(function(err, cat) {

        if (err) console.log(err);

        else {
            const s3 = new aws.S3({
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            });;

            //delete cat profile pic
            s3.deleteObject({
                Bucket: S3_BUCKET,
                Key: middleware.returnKey(cat.profilepic) //to be changed
            }, function(err, data) {
                if (err) console.log(err);
            })

            //remove all the posting pics
            for (var a = 0; a < cat.postings.length; a++) {
                var imgs = cat.postings[a].images;
                imgs.forEach(img => {
                    s3.deleteObject({
                        Bucket: S3_BUCKET,
                        Key: middleware.returnKey(img)
                    }, function(err, data) {
                        if (err) console.log(err);
                    })
                });
            }

            cat.remove();
            console.log("Cat removed!!");
            res.redirect('back');
        }

    });

});

// delete all cat 
router.delete('/', async(req, res) => {
    let cat = await Cat.remove({}, function(err) {
        if (err) {
            console.log(err);
        } else {

            Post.remove({}, function(err) {
                if (err) console.log(err);

                else {
                    console.log("Post removed!");
                }
            })

            Gallery.remove({}, function(err) {
                if (err) console.log(err);

                else {
                    console.log("Gallery removed!");
                }
            })

            console.log("Cats removed!");
        }
    });

    return res.status(202).send({
        error: false,
        cat
    })

});

//cat follow route
router.post('/:id/follows', async(req, res) => {

    await Cat.findById(req.params.id, function(err, cat) {
        if (err) console.log(err);
        else {
            req.user.follows.push(cat)
            req.user.save();
            console.log('Follows ' + cat.name);
            res.redirect('cats/' + id);
        }
    });

});


//cat gallery route
router.get('/gallery/:m', function(req, res) {

    Gallery.find({}, function(err, galleries) {
        if (err) {
            console.log(err);
            res.redirect('/cats');
        } else {

            var pics = [];
            galleries.forEach((gallery) => {
                imgs = gallery.images;
                imgs.forEach((img) => {
                    pics.push({
                        img: img,
                        cat: gallery.cat,
                        post: gallery.posting
                    })
                });
            });

            //console.log(pics);
            res.render("cats/gallery", { pics: pics });
        }
    });
});



module.exports = router;
