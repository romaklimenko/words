/* jshint node: true, strict: true */
var fs = require('fs');

// IO

function writeFile(file, object, replacer, space) {
  "use strict";

  fs.writeFile(
    file, JSON.stringify(object, replacer, space), function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('The file ' + file + ' was saved.');
    }
  });
}

function readFile(file) {
  "use strict";

  return fs.readFileSync(file, 'utf8', function(err, data) {
    if (err) {
      console.log(err);
      return err;
    }
    return data;
  });
}

// tree

function append(node, string) {
  "use strict";

  if (string.length === 0) {
    if (typeof node.end === 'undefined') {
      node.end = 1;
    } else {
      node.end++;
    }
    return;
  }

  if (typeof node.children === 'undefined') {
    node.children = [];
  }

  var first = string[0];
  var rest = string.substring(1, string.length);

  for (var i = 0; i < node.children.length; i++) {
    if (node.children[i].value === first) {
      node.children[i].count++;
      append(node.children[i], rest);
      return;
    }
  }

  node.children.push({ value: first, count: 0 });

  append(node, string);
}

function interpolate(node) {
  "use strict";

  var value = '';

  if (typeof node.value !== 'undefined') {
    value = node.value;
  }

  if (typeof node.children === 'undefined') {
    return;
  }

  for (var i = 0; i < node.children.length; i++) {
    node.children[i].value = value + node.children[i].value;
    interpolate(node.children[i]);
  }
}

function prune(node, min) {
  "use strict";

  if (typeof node.children === 'undefined'){
    return;
  }

  node.children = node.children.filter(function(element) {
    return (element.count >= min);
  });

  for (var i = 0; i < node.children.length; i++) {
    prune(node.children[i], min);
  }

  if (node.children.length === 0) {
    delete node.children;
  }
}

// common

function topValues(object, top, min) {
  "use strict";

  if (Object.keys(object).length > top) {
    var values = [];
    var key;

    for (key in object) {
      values.push(object[key]);
    }

    values.sort(function(a, b) {
      return b - a;
    });

    min = ((values[top - 1] > min) ? values[top - 1] : min);

    for (key in object) {
      if (object[key].count < min) {
        delete object[key];
      }
    }
  }

  return object;
}

// prefixes

function prefixes(length, array, top, min) {
  "use strict";

  var result = {};

  for (var i = 0; i < array.length; i++) {
    var prefix = array[i].substring(0, length);
    if (prefix.length !== length) {
      continue;
    }
    if (result[prefix]) {
      result[prefix].count++;
    }
    else {
      result[prefix] = { count: 1 };
    }
  }

  return topValues(result, top, min);
}

function groupByPrefix(array, length, top, min) {
  "use strict";

  var result = prefixes(1, array, top, min);

  for (var i = 2; i <= length; i++) {
    var _prefixes = prefixes(i, array, top, min);
    for (var key in _prefixes) {
      var node;
      for (var j = 1; j < key.length; j++) {
        if (j === 1) {
          node = result[key.substring(0, j)];
        }
        else {
          node = node[key.substring(0, j)];
        }
      }
      node[key] = { count: _prefixes[key].count };
    }
  }
  return result;
}

// patterns

function patterns(word) {
  "use strict";

  var result = [];
  for (var length = 2; length <= word.length; length++) {
    for (var i = 0; i <= word.length - length; i++) {
      result.push(word.substring(i, i + length));
    }
  }
  return result;
}

function groupByPattern(array, top, min) {
  "use strict";

  var _result = {};
  var result = [];
  var _pattern;

  for (var i = 0; i < array.length; i++) {
    var _patterns = patterns(array[i]);
    for (var j = 0; j < _patterns.length; j++) {
      if (_result[_patterns[j]]) {
        _result[_patterns[j]].count++;
      }
      else {
        _result[_patterns[j]] = { count: 1 };
      }
    }
  }

  var allPatternsCount = 0;

  for (_pattern in _result) {
    allPatternsCount += _result[_pattern].count;
  }

  _result = topValues(_result, top, min);

  var topPatternsCount = 0;

  for (_pattern in _result) {
    topPatternsCount += _result[_pattern].count;
    result.push(
    {
      pattern: _pattern,
      count: _result[_pattern].count
    });
  }

  result.push({
    pattern: "Other",
    count: allPatternsCount - topPatternsCount
  });

  return result.sort(function(a, b) {
    if (a.count < b.count) {
      return 1;
    }
    if (a.count > b.count) {
      return -1;
    }
    return 0;
  });
}

// letters

function groupByLetter(array) {
  "use strict";

  var result = [];

  var letters = {};

  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < array[i].length; j++) {
      if (letters[array[i][j]]) {
        letters[array[i][j]].count++;
      }
      else {
       letters[array[i][j]] = { count: 1 };
      }
    }
  }

  for (var letter in letters) {
    result.push(
      {
        letter: letter,
        count: letters[letter].count
      });
  }

  return result.sort(function(a, b) {
    if (a.count < b.count) {
      return 1;
    }
    if (a.count > b.count) {
     return -1;
    }
    return 0;
  });
}

// entry point

var en = readFile(__dirname + '/txt/en.txt');

var wordsArray = en.match(/[^\r\n]+/g);

var tree = {
  children: []
};

for (var i = 0; i < wordsArray.length; i++) {
  append(tree, wordsArray[i]);
}

prune(tree, 2000);
interpolate(tree);
tree.value = 'All';
tree.count = wordsArray.length;

writeFile('./json/letters.json', groupByLetter(wordsArray), null, 1);

writeFile('./json/tree.json', tree, null, 1);
writeFile('./json/tree.min.json', tree);

writeFile('./json/prefixes.json', groupByPrefix(wordsArray, 10, 10, 20), null, 1);
writeFile('./json/patterns.json', groupByPattern(wordsArray, 20, 17000), null, 1);