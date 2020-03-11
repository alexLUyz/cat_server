var mongoose = require("mongoose");

var ImgSchema = new mongoose.Schema({
	data: Buffer, 
	contentType: String
}); 



module.exports = mongoose.model("Img", ImgSchema);