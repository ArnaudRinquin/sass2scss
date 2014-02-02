(function(root, undefined) {

  "use strict";


/* sass2scss main */
var mixinAliasRegex = /(^\s*)=(\s*)/;
var includeAliasRegex = /(^\s*)\+(\s*)/;

var replaceIncludeAlias = function(line){
  return line.replace(includeAliasRegex, function(match, spacesBefore, spacesAfter){
    return spacesBefore + '@include' + (spacesAfter !== '' ? spacesAfter : ' ');
  });
};

var replaceMixinAlias = function(line){
  return line.replace(mixinAliasRegex, function(match, spacesBefore, spacesAfter){
    return spacesBefore + '@mixin' + (spacesAfter !== '' ? spacesAfter : ' ');
  });
};

var insertBeforeComment = function(inserted, text){
  var index = text.indexOf('//');

  if(index > -1) {
    return text.slice(0, index) + inserted + text.substr(index);
  } else {
    return text + inserted;
  }
};

var splitBefore = function(before, text){
  var index = text.indexOf(before);

  if(index > -1) {
    return [text.slice(0, index), text.substr(index)];
  } else {
    return [text];
  }
};

var insertBeforeClosingBrackets = function(inserted, text){

  var match = text.match(/.*(#{([*+\-\$\w\s\d])*})/);
  var start = '';
  var end = text;

  if(match){
    start = match[0];
    end = text.substr(start.length);
  }

  var splittedBeforeComments = splitBefore('//', end);
  var beforeComments = splittedBeforeComments[0];
  var splittedBeforeBrackets = splitBefore('}', beforeComments);
  var beforeBrackets = splittedBeforeBrackets[0];

  var value = beforeBrackets + inserted;

  if (splittedBeforeBrackets[1]) {
    value += splittedBeforeBrackets[1];
  }
  if (splittedBeforeComments[1]) {
    value += splittedBeforeComments[1];
  }

  return start + value;
};

var sass2scss = function(input){

  var lines, lastBlockLineIndex;

  if (input) {

    lines = [];

    input.split('\n').forEach(function(line){
      // reject empty or \* *\ comment only lines
      if(! line.match(/^\s*(\/\*.*\*\/.*)?(\/{2}.*)?$/) ){

        line = replaceIncludeAlias(line);
        line = replaceMixinAlias(line);

        var match = line.match(/^\s+/);

        lines.push({
          indentation: match ? match[0].length : 0,
          text: line
        });
      }
    });

    for (var idx in lines) {

      idx = parseInt(idx, 10);
      var line = lines[idx];

      if (line.text.match(/[a-z>~*]+/)) {

        var followingLines = lines.slice(idx + 1);
        lastBlockLineIndex = idx;

        for(var idx2 in followingLines) {
          var followingLine = followingLines[idx2];
          if (followingLine.indentation > line.indentation) {
            lastBlockLineIndex++;
          } else {
            break;
          }
        }

        if (lastBlockLineIndex !== idx) {

          lines[idx].text = insertBeforeComment('{', lines[idx].text);
          lines[lastBlockLineIndex].text = insertBeforeComment('}', lines[lastBlockLineIndex].text);
        } else {

          lines[idx].text = insertBeforeClosingBrackets(';', lines[idx].text );
        }
      }
    }

    // Return lines content joined in a single string
    var linesContent = [];
    lines.forEach(function(it){
      linesContent.push(it.text);
    });

    return linesContent.join('\n');
  }
};

// Version.
sass2scss.VERSION = '0.0.0';


// Export to the root, which is probably `window`.
root.sass2scss = sass2scss;


}(this));
