define(function () {
  'use strict';
  
  String.prototype.insert = function (index, string) {
    if (index > 0) {
      return this.substring(0, index) + string + this.substring(index, this.length);
    } else {
      return string + this;
    }
  };

  return {
    matchModules: function (desc) {
      var re = /[a-zA-Z]{2,3}[\d]{4}[a-zA-Z]{0,1}/g;
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
      var matchedModules = this.matchModules(desc);
      if (desc && matchedModules.length) {
        for (var i = matchedModules.length - 1; i >= 0; i--) {
          var starting_index = matchedModules[i].index;
          var length = matchedModules[i].length;
          var ending_index = starting_index + length;
          desc = desc.insert(ending_index, '</a>');
          desc = desc.insert(starting_index, '<a href="#!/modules/' + matchedModules[i].module + '">');
        }
      }
      return desc;
    }
  }
});
