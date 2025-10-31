var express = require("express");
var mongoose = require("mongoose");
var DataModel = require("./models/Data");

const Data = require('./Data');

let myDatabase = function() {
//not needed for MongoDB
//    this.data = [];
}

myDatabase.prototype.initializeData = function(res) {
  DataModel.find({}, function(err, list) {
    if (err) {
    } else {
      if (list.length != 10){
        for (let x=0;x<10;x++){
          DataModel.create({
            ident: x,
            name: 'Unclaimed',
            score: 0
          });
        }

        return res.json({istrue:false});
      }
      return res.json({istrue:true,list:list});
    }
  });
}

myDatabase.prototype.putData = function(_data) {
  DataModel.findOneAndUpdate({ident:_data.ident},{name:_data.name,score:_data.score},function(error,obj) {
    if (error) {
          return;
      }
      return;
  })
}

module.exports = myDatabase;