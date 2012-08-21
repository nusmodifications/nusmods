// https://developer.mozilla.org/en/JavaScript/Guide/Values,_Variables,_and_Literals#Extra_commas_in_array_literals
module.exports = function(grunt) {
  grunt.registerMultiTask('denull', 'Remove null from arrays.', function() {
    var files = grunt.file.expandFiles(this.file.src),
        max = grunt.helper('concat', files, {separator: this.data.separator}),
        min = max.replace(/([\[,])null(?=[,\]])/g, '$1');
    grunt.file.write(this.file.dest, min);
    if (this.errorCount) { return false; }
    grunt.log.writeln('File "' + this.file.dest + '" created.');
    grunt.helper('min_max_info', min, max);
  });
};