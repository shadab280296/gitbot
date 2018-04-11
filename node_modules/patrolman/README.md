# PatrolMan

A controller level middleware for express.


Example:

Use top level routes as naming convention so in the example below all /listing/* routes will be covered based on controller level policies.

"*" applies to all routes within that top level ( eg /listing )
the object's key is the name of the controller function
'''
// config.js
const Policies = require('./index');

module.exports = {
  "listing": {
    "*" : [Policies.isLoggedIn],
    "get": [Policies.canGet],
    "create": [Policies.isCoolEnough, Policies.isPrettyGirl],
  },
  "match": {
    "*" : [Policies.isLoggedIn],
  }
}

'''

Then in your controller instantiate a new PatrolMan object and feed it the path to your above config file.

'''
let PatrolMan           = require('../police');
PatrolMan               = new PatrolMan(require('../policies/config'));

const ListingController = {
  get: function(req,res,next){
    // whatever
  },
  create: function(req,res,next){
    // whatever
  }
}

// pass top level route again and the controller instance
module.exports = PatrolMan.patrol("listing", ListingController)
'''


That's it!.
