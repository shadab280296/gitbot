'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

  var SocialLogin = new Schema({
      userId: {
        type: String,
      },
      email:{
        type:String
      },
      type: {
        type: Number,
      },
      bio: {
        type: String,
      },
      age: {
        type: String,
      },
      coverPhoto: {
        type: String,
      },
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      gender: {
        type: String
      },
      link: {
        type: String,
      },
      website: {
        type: String
      },
      locale: {
        type: String,
      },
      location: {
        type: String
      },
      profilePicture: {
        type: String,
      },
      timezone: {
        type: String,
      },
      verified: {
        type: String,
      },
      firstCreated: {
        type: Date
      },
      lastUpdate: {
        type: Date,
      }
    });


module.exports = mongoose.model('SocialLogin', SocialLogin);
