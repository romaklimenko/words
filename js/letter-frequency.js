/* jshint browser: true, strict: true, devel: true  */
/* global define: true */

define(['d3'], function(d3) {
  'use strict';

  function LetterFrequency() {}

  LetterFrequency.load = function(element) {

    var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 70
    };

    var width = 800 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient('bottom');
    var yAxis = d3.svg.axis().scale(y).orient('left');

    var svg = d3
      .select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr(
        'transform',
        'translate(' + margin.left + ',' + margin.top + ')');

    d3.json('./json/letters.json', function(error, data) {

      x.domain(data.map(function(d) {
        return d.letter;
      }));

      y.domain([0, d3.max(data, function(d) {
        return d.count;
      })]);

      svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      svg
        .append('g')
        .attr('class', 'y axis')
        .call(yAxis);

      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) {
          return x(d.letter);
        })
        .attr('width', x.rangeBand())
        .attr('y', function(d) {
          return y(d.count);
        })
        .attr('height', function(d) {
          return height - y(d.count);
        });
    });
  };

  return LetterFrequency;

});