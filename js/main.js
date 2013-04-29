/* jshint browser: true, strict: true, devel: true  */
/* global require: true */
/* global requirejs: true */

requirejs.config({
  paths: {
    'domReady': 'vendor/domReady',
    'text': 'vendor/text',

    'd3': '//d3js.org/d3.v3.min',
    'letter-frequency': 'letter-frequency',
    'prefix-frequency': 'prefix-frequency',
    'pattern-frequency': 'pattern-frequency'
  },
  shim: {
    d3: {
      exports: 'd3'
    }
  }
});

require(
  [
    'd3',
    'letter-frequency',
    'prefix-frequency',
    'pattern-frequency',
    'domReady!'
  ],
  function(d3, letterFrequency, prefixFrequency, patternFrequency) {
    'use strict';
    letterFrequency.load('#letter-frequency');
    prefixFrequency.load('#prefix-frequency');
    patternFrequency.load('#pattern-frequency');
  }
);