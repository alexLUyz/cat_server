var express = require("express");
var router = express.Router();
var Cat = require("../models/cat");
var Img = require("../models/image");
var Gallery = require("../models/gallery");
var fs = require("fs");
var rimraf = require("rimraf");
//var mkdirp = require('mkdirp');
const multer = require('multer');
const dest = __dirname.slice(0, __dirname.length - 7) + '/public/images/';
const upload = multer({ dest: dest });
//console.log('hehe:' + __dirname.length);
//console.log(__dirname.slice(0, __dirname.length-7) + '/images');


router.get('/', async(req, res) => {
    let cats = await Cat.find();
    return res.status(200).send(cats);
});

router.get('/new', (req, res) => {
    res.render('cats/new')
});

router.post('/', async(req, res) => {

    let cat = await Cat.create(req.body);

    console.log(cat);

    var id = cat._id;
    res.redirect('cats/' + id + '/upload');

});


router.get('/:id', (req, res) => {
    console.log(req.params.id);
    Cat.findById(req.params.id, function(err, cat) {
        if (err) {
            console.log(err);
            res.redirect('/cats');
        } else {
            res.render('cats/index', { cat: cat });
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

    let cat = await Cat.findById(req.params.id);
    let imgs = cat.image;


    for (var i = 0; i < imgs.length; i++) {
        fs.unlink(dest + imgs[i], function(err) {
            if (err) //throw err;
            // if no error, file has been deleted successfully
                console.log('File deleted!');
        });
    }


    await Cat.findById(req.params.id, function(err, cat) {
        if (err) return next(err);

        cat.remove();
        res.redirect('/cats');

    });

    // return res.status(202).send({
    //   error: false,s
    //   cat
    // })

});

//router.get('/:id')

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
        console.log("done");
        fs.mkdirSync(dest, { recursive: true })

    });

    return res.status(202).send({
        error: false,
        cat
    })

});



router.get('/:id/upload', async(req, res) => {

    let cat = await Cat.findById(req.params.id);
    let catid = await cat._id;

    console.log(cat);

    res.render("cats/imgUpload", { catid: catid });
});


router.post('/:id/upload', upload.single('photo'), async(req, res) => {

    if (req.file) {

        var filename = req.file.filename;
        fs.rename(dest + filename,
            dest + filename + '.png',
            function(err) {
                if (err) console.log('ERROR: ' + err);
            });

        let cat = await Cat.findById(req.params.id);
        let d = await filename + '.png';

        await cat.image.push(d);
        await cat.save();

        let img = await filename + '.png';

        let gallery = await Gallery.create({
            image: img,
            cat: cat
        }, function(err, pic) {
            //pic.cat = cat._id;	
            // console.log('3: ' + pic);
            // console.log('4: ' + cat);

            cat.gallery.push(pic);
            //console.log('5: ' + cat);
            cat.save();
        });


        res.redirect('/cats/' + req.params.id + '/upload');
    } else throw 'error';
});


router.delete('/:id/upload/:img', async(req, res) => {

    //console.log('dest: ' + dest)
    let cat = await Cat.findById(req.params.id);
    let img = await cat.image;
    let imgName = req.params.img;

    for (var i = 0; i < img.length; i++) {
        if (img[i] === imgName) { img.splice(i, 1); }
    }

    await cat.save();

    fs.unlink(dest + imgName, function(err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
    });

    console.log(cat);
    console.log(img);

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

router.get('/gallery/:hehe', function(req, res) {

    Gallery.find({}, function(err, galler) {
        if (err) {
            console.log("err");
            res.redirect('/cats');
        } else {
            console.log("gallery");
            res.render('cats/gallery');
        }
    });
});

// router.get('/img',  (req, res) => {

// 	var a = Img.find({});

// 	console.log(a);

// });


module.exports = router;