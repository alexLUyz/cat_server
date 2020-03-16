var mongoose = require("mongoose");
var User = require("./user"),
    Post = require("./post"),
    Gallery = require("./gallery")


var catSchema = new mongoose.Schema({
    name: String,
    breed: String,
    age: String,
    gender: String,
    profilepic: String,
    description: String,
    tmp: [String],
    postings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    galleries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gallery"
    }],

    owner: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        ownername: String
    },

    followers: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        username: String
    }]
});

catSchema.pre('remove', async function(next) {
    try {

        await Post.remove({
            "_id": {
                $in: this.postings
            }
        });
        console.log('postings deleted!!');

        await Gallery.remove({
            "_id": {
                $in: this.galleries
            }
        });
        console.log('galleries deleted!!');

        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("Cat", catSchema);