var PatrolMan = function( config ) {
  this.config = config;
}

PatrolMan.prototype.patrol = function(route, controller){
  for (const key in controller)
  {
    let _policies = [];
    for (const _key in this.config[route])
    {
      if (_key === '*') _policies = _policies.concat(this.config[route][_key])
      if (key.toLowerCase() === _key.toLowerCase()) _policies = this.config[route][_key];
    }
    controller[key] = [ _policies ,  controller[key] ];
  }
  return controller;
}

module.exports = PatrolMan;
