const helpers = require('../../utils/helpers');
const SqlModel = require('../../models/mongo/mongo');
const TaError = require('../../utils/taerror');
const validator = require('../../utils/validator');
let PatrolMan = require('patrolman');

PatrolMan = new PatrolMan(require('../../policies/config')); // eslint-disable-line

const UserSkillsController = {
  getSkills: helpers.async(function* (req, res) {
    try {
      const userId = req.currentUser.id;

      const userSkills = yield SqlModel.UsersSkills.findAll({
        where: {
          userId
        }
      });

      if (!userSkills || !Array.isArray(userSkills)) {
        return res.status(400).json(new TaError().addServerError('Unable to get user skills.'));
      }

      return res.status(200).json({ success: true, skills: userSkills });
    } catch (error) {
      console.error('Unable to get user skills:', error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),
  addSkill: helpers.async(function* (req, res) {
    try {
      const userId = req.currentUser.id;

      const paramError = new TaError(400);

      if (!validator.isValidString(req.body.skill)) {
        paramError.addParamError('Invalid value for skill.');
      }

      if (paramError.isErrors()) {
        return res.status(paramError.code).json(paramError);
      }

      const findSkill = yield SqlModel.UsersSkills.find({
        where: {
          userId,
          skill: req.body.skill
        }
      });

      if (findSkill && findSkill.id) {
        return res.status(400).json(new TaError().addSQLError('Skill already added.'));
      }

      const userSkill = yield SqlModel.UsersSkills.build({
        userId,
        skill: req.body.skill
      }).save();

      if (!userSkill || userSkill.id === undefined) {
        return res.status(400).json(new TaError().addServerError('Unable to create user skill'));
      }

      return res.status(200).json({ success: true, skill: userSkill });
    } catch (error) {
      console.error('Unable to add user skill:', error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),
  deleteSkill: helpers.async(function* (req, res) {
    try {
      const userId = req.currentUser.id;

      const paramError = new TaError(400);

      if (!req.params.skillId || !validator.isValidId(req.params.skillId)) {
        paramError.addParamError('Invalid skill ID.');
      }

      if (paramError.isErrors()) {
        return res.status(paramError.code).json(paramError);
      }

      const deletedSkill = yield SqlModel.UsersSkills.find({
        where: {
          id: req.params.skillId,
          userId
        }
      });

      const userSkill = yield SqlModel.UsersSkills.destroy({
        where: {
          id: req.params.skillId,
          userId,
        }
      });

      if (!userSkill || userSkill === undefined || userSkill === 0) {
        return res.status(400).json(new TaError().addParamError('Invalid skill id.'));
      }

      return res.status(200).json({ success: true, deletedSkill });
    } catch (error) {
      console.error('Unable to delete skill:', error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),
};

module.exports = PatrolMan.patrol('userSkills', UserSkillsController);
