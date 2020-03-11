var mongoose = require("mongoose");
var Cat   = require("./cat");
var GallerySchema = new mongoose.Schema({
	
	image: String,
	cat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Cat"
	}

}); 

//UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Gallery", GallerySchema);