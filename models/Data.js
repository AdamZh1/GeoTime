var mongoose = require("mongoose");

var Data = mongoose.model("Leaderboard",{
    ident: {
        required: true,
        unique: true,
        type:Number
    },
    name: String,
    score: Number
});

//var Data = mongoose.model("Info",{
//    ident: Number,
//    name: String
//});


module.exports = Data;

 