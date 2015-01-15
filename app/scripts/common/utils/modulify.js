'use strict';

var NUSMods = require('../../nusmods');

String.prototype.insert = function (index, string) {
  if (index > 0) {
    return this.substring(0, index) + string + this.substring(index, this.length);
  } else {
    return string + this;
  }
};

var re = /[a-zA-Z]{2,3}[\s]?[\d]{4}[a-zA-Z]{0,2}/g;
var allModuleCodes;

module.exports = {
  matchModules: function (desc) {
    var matchPos = [];
    if (!desc) { return matchPos; }
    var match = re.exec(desc);
    while (match) {
      matchPos.push({module: match[0], index: match.index, length: match[0].length});
      match = re.exec(desc);
    }
    return matchPos;
  },
  linkifyModules: function (desc) {
    if (!allModuleCodes) {
      allModuleCodes = NUSMods.getAllModules();
    }

    var matchedModules = this.matchModules(desc);
    if (desc && matchedModules.length && allModuleCodes) {
      for (var i = matchedModules.length - 1; i >= 0; i--) {
        matchedModules[i].module = matchedModules[i].module.replace(/\s/g, '');
        if (allModuleCodes[matchedModules[i].module]) {
          var startingIndex = matchedModules[i].index;
          var length = matchedModules[i].length;
          var endingIndex = startingIndex + length;
          desc = desc.insert(endingIndex, '</a>');
          desc = desc.insert(startingIndex, '<a href="/modules/' + matchedModules[i].module + '">');
        }
      }
    }
    return desc;
  }
};
