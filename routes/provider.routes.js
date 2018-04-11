const express = require('express');
const ProviderController = require('../controllers/mongo/provider.mongo.controller');
const ScheduleController = require('../controllers/mongo/schedule.mongo.controller');

const router = express.Router();

//router.route('/provider/online')
//  .get(ProviderController.getAvailable);

router.route('/provider/schedule')
  .get(ScheduleController.getSchedule)
  .post(ScheduleController.addSchedule);

router.route('/provider/schedule/:scheduleId')
  .put(ScheduleController.updateSchedule)
  .delete(ScheduleController.deleteSchedule);

module.exports = router;
