'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScheduleSchema = new Schema({
    schedule: {

        userid: {
            type: String,
            required: "Kindly Enter email"
        },

        consumerid: {
            type: String

        },

        starttime: {
            type: String,
            required: "starttime must be present"
        },
        endtime: {
            type: String,
            required: "End time must be there"
        },

        Created_At: {
            type: Date,
            default:Date.now
        },
        Updated_At: {
            type: Date
        },
        appointments:[
          {
            client:{
              id:String,
              topic:String,
              startime:String,
              endtime:String,
            }
          }
        ]
    }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
