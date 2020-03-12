var mongoose = require("mongoose");
var User = require("./user");
var Gallery = require("./gallery");

var catSchema = new mongoose.Schema({
    name: String,
    breed: String,
    age: String,
    gender: String,
    image: [String],
    posts: [{
        image: String,
        description: String,
        time: String
    }],
    description: String,
    owner: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        ownername: String
    },

    gallery: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gallery"
    }]
});

catSchema.pre('remove', async function(next) {
    try {
        console.log(this.gallery);

        await Gallery.remove({
            "_id": {
                $in: this.gallery
            }
        });

        console.log('gallery deleted!!');
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("Cat", catSchema);