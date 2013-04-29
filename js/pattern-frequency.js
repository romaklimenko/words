/* jshint browser: true, strict: true, devel: true  */
/* global define: true */

define(['d3'], function(d3) {
  'use strict';

  function PatternFrequency() {}

  PatternFrequency.load = function(element) {

    d3.json('./json/patterns.json', function(data) {

      var columns = ['pattern', 'count', '%'];

      var total = 0;

      for (var i = 0; i < data.length; i++) {
        total += data[i].count;
      }

      var table = d3.select(element)
        .append('table')
        .style('text-align', 'right');
      var thead = table.append('thead');
      var tbody = table.append('tbody');

      thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function(column) {
          return column;
        });

      var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

      rows.selectAll('td').data(function(row) {

        var result = columns.map(function(column) {
          return {column: column, value: row[column]};
        });

        result[2].value = (
          (result[1].value / total) * 100).toFixed(3) + ' %';

        result[1].value = result[1].value
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        return result;
      })
      .enter()
      .append('td')
      .text(function(d) {
        return d.value;
      });
    });
  }; //

  return PatternFrequency;
});