const Policies = require('./index');

module.exports = {
  admin: {
    '*': [Policies.isLoggedIn, Policies.isAdmin]
  },
  ai: {
    '*': [Policies.isLoggedIn, Policies.isAdmin],
    getSuggestions: [Policies.isLoggedIn],
    autocomplete: [Policies.isLoggedIn]
  },
  auth: {
    signup: [Policies.all],
    login: [Policies.all],
    validate: [Policies.all],
  },
  provider: {
    '*': [Policies.all],
  },
  social: {
    '*': [Policies.all],
  },
  twilio: {
    '*': [Policies.isLoggedIn],
    voice: [Policies.all],
  },
  user: {
    '*': [Policies.isLoggedIn],
    verify: [Policies.all],
    newsletter: [Policies.all],
  },
  userBio: {
    '*': [Policies.isLoggedIn],
  },
  userSkills: {
    '*': [Policies.isLoggedIn],
  }
};
