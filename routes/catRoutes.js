var express = require("express");
var router = express.Router();
var Cat = require("../models/cat"),
    Post = require("../models/post"),
    Gallery = require("../models/gallery"),
    Img = require("../models/image")
var fs = require("fs");
var rimraf = require("rimraf");
//var mkdirp = require('mkdirp');
const multer = require('multer');
const dest = __dirname.slice(0, __dirname.length - 7) + '/public/images/';
const upload = multer({ dest: dest });
var middleware = require("../middleware");
//console.log('hehe:' + __dirname.length);
//console.log(__dirname.slice(0, __dirname.length-7) + '/images');


router.get('/', async(req, res) => {
    let cats = await Cat.find();
    //var time = new Date().toString();
    //console.log(time);
    return res.status(200).send(cats);
});

router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render('cats/new')
});

router.post('/', middleware.isLoggedIn, async(req, res) => {

    await Cat.create(req.body, function(err, cat) {
        if (err) console.log(err);
        else {
            cat.owner.id = req.user._id;
            cat.save();
            req.user.cats.push(cat);
            req.user.save();
            var id = cat._id;
            //console.log("Cat create Succedded " + cat);
            res.redirect('cats/' + id + '/pic');
        }

    });

});

router.get('/:id/pic', middleware.checkCatOwnership, async(req, res) => {

    Cat.findById(req.params.id, function(err, cat) {
        if (err) console.log(err);

        else {
            res.render('cats/profilepic', { cat: cat });
        }
    });

});

router.post('/:id/pic', middleware.checkCatOwnership, upload.single('photo'), async(req, res) => {

    if (req.file) {

        await Cat.findById(req.params.id, function(err, cat) {
            if (err) console.log(err);

            else {
                var filename = req.file.filename;
                fs.rename(dest + filename, dest + filename + '.png', function(err) {
                    if (err) console.log('ERROR: ' + err);
                });

                cat.profilepic = filename + '.png';
                cat.save();

                res.redirect('/cats/' + req.params.id);

                console.log("cat create succeed: " + cat);

            }
        });

    } else throw 'error';
});





router.get('/:id', (req, res) => {

    Cat.findById(req.params.id).populate("postings").exec(function(err, cat) {
        if (err) console.log(err);

        else {
            res.render('cats/index', { cat: cat, posts: cat.postings });
        }
    });

});


router.put('/:id', async(req, res) => {

    const { id } = req.params;
    let cat = await Cat.findByIdAndUpdate(id, req.body);

    console.log(cat);
    return res.status(201).send({
        error: false,
        cat
    });
});

router.delete('/:id', async(req, res, next) => {

    await Cat.findById(req.params.id).populate("postings").exec(function(err, cat) {

        if (err) console.log(err);

        else {
            fs.unlink(dest + cat.profilepic, function(err) {
                if (err) console.log(err); //throw err;
                // if no error, file has been deleted successfully
                console.log('Profifle pic deleted!');
            });

            for (var a = 0; a < cat.postings.length; a++) {
                var imgs = cat.postings[a].images;
                for (var b = 0; b < imgs.length; b++) {
                    fs.unlink(dest + imgs[b], function(err) {
                        if (err) console.log(err); //throw err;
                        // if no error, file has been deleted successfully
                        console.log('File deleted!');
                    });
                }
            }

            cat.remove();
            res.send("Cat removed!!");
        }

    });

});


router.delete('/', async(req, res) => {
    let cat = await Cat.remove({}, function(err) {
        if (err) {
            console.log(err);
        } else {

            Gallery.remove({}, function(err) {
                if (err) console.log(err);

                else {
                    console.log("Gallery removed!");
                }
            })

            console.log("Cats removed!");
        }
    });

    await rimraf(dest, function() {
        fs.mkdirSync(dest, { recursive: true })
    });

    return res.status(202).send({
        error: false,
        cat
    })

});





router.get('/:id/imgs', middleware.checkCatOwnership, async(req, res) => {

    await Cat.findById(req.params.id, function(err, cat) {

        if (err) console.log(err);

        else {
            res.render("cats/newPosting", { cat: cat });
        }
    });

});



router.post('/:id/imgs', middleware.checkCatOwnership, upload.single('photo'), async(req, res) => {

    if (req.file) {

        await Cat.findById(req.params.id, function(err, cat) {
            if (err) console.log(err);

            else {
                var filename = req.file.filename;
                fs.rename(dest + filename, dest + filename + '.png', function(err) {
                    if (err) console.log('ERROR: ' + err);
                });

                cat.tmp.push(filename + '.png');
                cat.save();

                //console.log("tmp: " + cat.tmp);
                //console.log("cat: " + cat);
                res.redirect('/cats/' + req.params.id + "/imgs");

            }
        });

    } else throw 'error';
});



//upload local files to mongodb
router.post('/img', async(req, res) => {
    var i = {
        data: fs.readFileSync('./cat.png'),
        contentType: "image/png"

    }

    let img = Img.create(i);
    return res.status(201).send({
        error: false,
        img
    });

});

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

            console.log(pics);
            res.render("cats/gallery", { pics: pics });
        }
    });
});



module.exports = router;

// router.delete('/:id/upload/:img', middleware.checkCatOwnership, async(req, res) => {

//     //console.log('dest: ' + dest)
//     let cat = await Cat.findById(req.params.id);
//     let img = await cat.image;
//     let imgName = req.params.img;

//     for (var i = 0; i < img.length; i++) {
//         if (img[i] === imgName) { img.splice(i, 1); }
//     }

//     await cat.save();

//     fs.unlink(dest + imgName, function(err) {
//         if (err) throw err;
//         // if no error, file has been deleted successfully
//         console.log('File deleted!');
//     });

//     console.log(cat);
//     console.log(img);

// });

// router.post('/:id/upload', upload.single('photo'), async(req, res) => {

//     if (req.file) {

//         await Cat.findById(req.params.id, function(err, cat) {
//             if (err) console.log(err);

//             else {
//                 var filename = req.file.filename;
//                 fs.rename(dest + filename, dest + filename + '.png', function(err) {
//                     if (err) console.log('ERROR: ' + err);
//                 });

//                 var time = new Date().toString();
//                 var post = {
//                     image: filename + '.png',
//                     description: req.body.description,
//                     time: time
//                 }

//                 //console.log(Date.now().toString());
//                 cat.posts.push(post);
//                 cat.image.push(filename + '.png');

//                 console.log("des:" + req.body.description);
//                 //cat.save();



//                 Gallery.create({
//                     image: filename + '.png',
//                     cat: cat
//                 }, function(err, pic) {
//                     if (err) console.log("ERRRR: " + err);

//                     else {
//                         cat.gallery.push(pic);
//                         cat.save();
//                     }

//                 });

//                 res.redirect('/cats/' + req.params.id);

//             }
//         });


//     } else throw 'error';
// });

// router.get('/:id/upload', middleware.checkCatOwnership, async(req, res) => {

//     await Cat.findById(req.params.id, function(err, cat) {

//         if (err) console.log(err);

//         else {
//             res.render("cats/imgUpload", { cat: cat });
//         }
//     });

// });