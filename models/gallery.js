var mongoose = require("mongoose");
var Post = require("./post");
var Cat = require("./cat");

var GallerySchema = new mongoose.Schema({

    images: [String],
    posting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    cat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cat"
    }

});


module.exports = mongoose.model("Gallery", GallerySchema);