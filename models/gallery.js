var mongoose = require("mongoose");
var Post = require("./post");

var GallerySchema = new mongoose.Schema({

    images: [String],

    posting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }

});


module.exports = mongoose.model("Gallery", GallerySchema);