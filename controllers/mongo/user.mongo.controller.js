const helpers = require('../../utils/helpers');
const MongoModel = require('../../models/mongo/mongo');
const TaError = require('../../utils/taerror'); // eslint-disable-line
const validator = require('../../utils/validator');
let PatrolMan = require('patrolman');
const emailer = require('../../utils/email');
const crypto = require('crypto');
var mongoose = require('mongoose'),
  Users = mongoose.model('Users');
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://localhost/UsersDB');
PatrolMan = new PatrolMan(require('../../policies/config')); // eslint-disable-line

const UserController = {
  verify: helpers.async(function* (req, res) {
    try {
      const { id } = req.query;

      // Check validations
      const paramErrors = new TaError(400);
      if (!id || !validator.isValidEmailHash(id)) {
        paramErrors.addParamError('Invalid email verification id');
      }

      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }

      // Find email hash in database
      const user = yield Users.findOne({'users.emailHash':id},{'users.password':1,'users.salt':1,'users.emailHash':1});


      if (!user || !user.id) {
        return res.status(400).json({ success: false, message: 'Invalid verification ID' });
      }

      const updatedUser = yield user.updateAttributes({
        verified: true
      });

      if (!updatedUser.verified) {
        return res.status(400).json(new TaError(500).addServerError('Unable to set user to verified'));
      }

      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Unable to verify:', error);
      return res.status(500).json(new TaError(500).addServerError(error.message));
    }
  }),
  getAll: helpers.async(function* (req, res) {
    try {
      // TODO: Create API Call
      return res.status(200).json({});
    } catch (error) {
      console.error('Unable to get all:', error);
      return res.status(500).json(new TaError(500).addServerError(error.message));
    }
  }),
  getOne: helpers.async(function* (req, res) {
    try {
      // TODO: Create API Call
      return res.status(200).json({});
    } catch (error) {
      console.error('Unable to get one:', error);
      return res.status(500).json(new TaError(500).addServerError(error.message));
    }
  }),
  newsletter: helpers.async(function* (req, res) {
    try {
      const { email } = req.body;

      if (!email || !validator.isValidEmail(email)) {
        return res.status(400).json(new TaError(400).addParamError('Missing or invalid email.'));
      }

      const existing = yield SqlModel.User.find({
        where: {
          email
        }
      });

      if (existing && existing.id) {
        return res.status(400).json(new TaError().addSQLError('User already exists.'));
      }

      const emailHash = crypto.randomBytes(20).toString('hex');
      const userNewsletter = yield SqlModel.User.build(
        {
          email,
          emailHash,
          type: 3
        }
      ).save();

      if (!userNewsletter || userNewsletter === undefined) {
        return res.status(400).json(new TaError().addSQLError('Unable to add user.'));
      }

      const verifyOpts = {
        email,
        emailHash
      };
      emailer.verificationEmail(verifyOpts);

      return res.status(200).json({ success: true, newsletter: userNewsletter });


}catch (error) {
  console.error('Unable to verify:', error);
  return res.status(500).json(new TaError(500).addServerError(error.message));
}
}),
}
module.exports = PatrolMan.patrol('user', UserController);
