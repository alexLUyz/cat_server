var mongoose = require("mongoose");
//var Cat = require("./cat");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String, //needs to be an email
    realusername: String,
    password: String,

    cats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cat"
    }]

});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);