'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    users: {
        id: {
            type: String,
            //required: "Kindly Enter the user_id"
        },
        firstName:{
          type:String,
        },
        lastName:{
          type:String
        },
        gender:{
          type:String
        },
        mobileNumber:{
          type:Number
        }
        email: {
            type: String,
            //required: "Kindly Enter email"
        },
        emailHash:{
            type:String
        },
        password: {
            type: String,
            //required: "Enter the password"
        },
        salt: {
            type: String,
          //  required: "Enter the salt"
        },
        verified: {
            type: String,
            //required: "Enter the verified"
        },
        type: {
            type: String,
            //required: "Enter the type"
        },
        Created_At: {
            type: Date,
            default:Date.now
        },
        Updated_At: {
            type: Date
        }
    }
});


module.exports = mongoose.model('Users', UserSchema);
