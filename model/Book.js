const mongoose = require('mongoose');

var BookSchema = new mongoose.Schema({
    name:{type:String},
    auther:{type:String}
})
mongoose.model("Book",BookSchema)