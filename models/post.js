var mongoose = require("mongoose");
var Cat = require("./cat");
var Gallery = require("./gallery");

var PostSchema = new mongoose.Schema({
    images: [String],
    content: String,
    time: String,
    location: String,
    likes: Number,
    galleries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gallery"
    }]

});


PostSchema.pre('remove', async function(next) {
    try {
        await Gallery.remove({
            "_id": {
                $in: this.galleries
            }
        });
        console.log('Galleries deleted!!');

        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("Post", PostSchema);