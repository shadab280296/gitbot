const helpers = require('../../utils/helpers');
const tools = require('../../utils/tools');
const TaError = require('../../utils/taerror');
const validator = require('../../utils/validator');

var mongoose = require('mongoose'),
Schedule=mongoose.model('Schedule');
let PatrolMan = require('patrolman');
PatrolMan = new PatrolMan(require('../../policies/config')); // eslint-disable-line

const ScheduleController = {
  getSchedule: helpers.async(function* (req, res) {
    console.log(req.query.userid+"_")
    try {
      var schedule = yield Schedule.aggregate([{ $match: { 'schedule.userid':req.query.userid }},{
                  $project:{
                  "number of array": { $size: "$schedule.appointments" },'schedule.appointments.client':1,'schedule.id':1,'schedule.starttime':1,'schedule.endtime':1
                    }}],function (err, result) {
                      console.log(err);
                      console.log(result);
                  if (err)  return res.send(err);
                  if(result.length !=0)
                      return res.status(200).json({ success: true, result });
                  return res.status(200).json({message:"No appointments scheduled"});
        })

      //return res.status(200).json({ success: true, schedule });
    } catch (error) {
      console.error('Unable to verify:', error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),
  addSchedule: helpers.async(function* (req, res) {
    try {
      const { start, end } = req.body.schedule;
      console.log(start);
      console.log(end);
      const paramErrors = new TaError(400);

      const startEpoch = validator.isValidEpoch(start);
      if (!startEpoch) {
        paramErrors.addParamError('Invalid start time');
      }
      const endEpoch = validator.isValidEpoch(end);
      if (!endEpoch) {
        paramErrors.addParamError('Invalid end time');
      }

      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }

      const firstDate = new Date('2018-01-01');
      if (startEpoch < firstDate.getTime()) {
        paramErrors.addParamError('Start time occurs before origination of TaskHuman.');
      }
      if (endEpoch < startEpoch) {
        paramErrors.addParamError('End time occurs before start time');
      }

      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }

      /*const schedule = yield SqlModel.Schedule.build({
        userId: req.currentUser.id,
        start: startEpoch,
        end: endEpoch
      }).save();*///1522842283000
      //1522928275
      /*var schedule =
      {
        schedule:
        {userid:"shub107",starttime:"5",endtime:"7",created_At:"011",updated_At:"7"},
        appointments:
        [
          {client:{id:"shub105",topic:"7",startime:"7",endtime:"7"}},
          {client:{id:"shub106",topic:"7",startime:"7",endtime:"7"}}
        ]
      }*/
      var schedule = "{\"schedule\":{\"userid\":\"shub107\",\"starttime\":\""+start+"\",\"endtime\":\""+end+"\",\"created_At\":\"011\",\"updated_At\":\""+end+"\",\"appointments\":[]}}";
      yield tools.userSchedule(schedule);

  return res.status(200).json({ success: true, schedule });
    } catch (error) {
      console.error('Unable to get all:', error);


      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),
  updateSchedule: helpers.async(function* (req, res) {
    try {
      const scheduleId = req.params.scheduleId;
      console.log(scheduleId);

      const schedule = yield Schedule.find({'schedule.userid':'shub101', '_id':'5ac71d67f2c907151c2ef1f4'
    },function (err, result)
     {
        console.log(err);
        console.log(result);
      if (err)  return res.send(err);

        return result;


      }
  )

      if (!schedule || schedule === undefined) {
        return res.status(400).json(new TaError().addParamError('Invalid schedule id.'));
      }

      const paramErrors = new TaError(400);

      const { start, end } = req.body;
        console.log("start epoch");
      console.log(start);
      console.log("end epoch");
      console.log(end);
      let startEpoch;
      let endEpoch;
      if (start) {
        startEpoch = validator.isValidEpoch(start);
        if (!startEpoch) {
          paramErrors.addParamError('Invalid start time');
        }
      }

      if (end) {
        endEpoch = validator.isValidEpoch(end);
        if (!endEpoch) {
          paramErrors.addParamError('Invalid end time');
        }
      }

      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }

      const firstDate = new Date('2018-01-01');
      if (startEpoch) {
        if (endEpoch) {
          if (startEpoch < endEpoch && startEpoch > firstDate.getTime()) {
            schedule.start = start;
          } else {
            paramErrors.addParamError('Start time must be before end time');
          }
        } else if (startEpoch < schedule.end && startEpoch > firstDate.getTime()) {
          schedule.start = start;
        } else {
          paramErrors.addParamError('Start time must come before end time');
        }
      }


      if (endEpoch) {
        if (startEpoch) {
          if (endEpoch > startEpoch) {
            schedule.end = endEpoch;
          } else {
            paramErrors.addParamError('End time must come after start time');
          }
        } else if (endEpoch > schedule.end) {
          schedule.end = end;
        } else {
          paramErrors.addParamError('End time must come after start time');
        }
      }

      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }
console.log("updating scheduled");
 var ObjectId = require('mongodb').ObjectId;
 var o_id = new ObjectId("5ac71d67f2c907151c2ef1f4");
  var schedule1=yield Schedule.updateOne(
     { '_id':o_id,'schedule.userid':'shub101' },
     {
       $set: { 'schedule.endtime': "1523106658",'schedule.startime': "1523106958"}
     },function (err, result) {
       console.log(err);
       console.log(result);
   if (err)  return res.send(err);

}
  )

      return res.status(200).json({ success: true  });
    } catch (error) {
      console.error('Unable to get one:', error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),
  deleteSchedule: helpers.async(function* (req, res) {
    try {
      const scheduleId = req.params.scheduleId;
      var ObjectId = require('mongodb').ObjectId;
      var o_id = new ObjectId("5ac8b788e30cff7e0608c631");
      const schedule = yield Schedule.remove({'_id':o_id,'schedule.userid':'shub1011'},function(err,data){
        if(err) return res.send(err);
        return res.json(data);
      });


    //  return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Unable to get one:', error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),
};

module.exports = PatrolMan.patrol('provider', ScheduleController);
