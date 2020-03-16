var mongoose = require("mongoose");
var Cat = require("./cat");
var Post = require("./post");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String, //needs to be an email
    password: String,
    realusername: String,
    bio: String,
    cats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cat"
    }],
    follows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cat"
    }],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }]

});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);