/* jshint browser: true, strict: true, devel: true  */
/* global define: true */

define(['d3'], function(d3) {
  'use strict';

  function PrefixFrequency() {}

  PrefixFrequency.load = function(element) {
    var node, link, root, text;

    function tick() {
      link
        .attr('x1', function(d) {
          return d.source.x;
        })
        .attr('y1', function(d) {
          return d.source.y;
        })
        .attr('x2', function(d) {
          return d.target.x;
        })
        .attr('y2', function(d) {
          return d.target.y;
        });

      node.attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      });

      text.attr('x', function(d) {
        var _radius = radius(d.count);
        if (_radius > 7) {
          return d.x;
        }
        var dx;
        if (d.x > root.x) {
          dx = 1;
        }
        else {
          dx = -1;
        }
        return d.x + _radius + (10 * dx);
      })
      .attr('y', function(d) {
        var _radius = radius(d.count);
        if (_radius > 7) {
          return d.y;
        }
        var dy;
        if (d.y > root.y) {
          dy = 1;
        }
        else {
          dy = -1;
        }
        return d.y + _radius + (10 * dy);
      });
    }

    var force = d3.layout
      .force()
      .linkDistance(function(d) {
        return d.source.children.length * 5;
      })
      .linkStrength(5)
      .charge(-500)
      .on('tick', tick)
      .size([document.width, 600]);

    var svg = d3.select(element)
      .append('svg:svg')
      .attr('width', document.width)
      .attr('height', 600);

    d3.json('./json/tree.min.json', function(json) {
      root = json;
      update();
    });

    function update() {
      var nodes = flatten(root);
      var links = d3.layout.tree().links(nodes);

      force.nodes(nodes).links(links).start();

      link = svg.selectAll('line.link')
        .data(links, function(d) {
          return d.target.id;
        });

      link
        .enter()
        .insert('svg:line', '.node')
        .attr('class', 'link')
        .attr('x1', function(d) {
          return d.source.x;
        })
        .attr('y1', function(d) {
          return d.source.y;
        })
        .attr('x2', function(d) {
          return d.target.x;
        })
        .attr('y2', function(d) {
          return d.target.y;
        });

      link.exit().remove();

      node = svg.selectAll('circle.node')
        .data(nodes, function(d) {
          return d.id;
        })
        .style('fill', color);

      node
        .enter()
        .append('svg:circle')
        .attr('class', 'node')
        .attr('cx', function(d) {
          return d.x;
        })
        .attr('cy', function(d) {
          return d.y;
        })
        .attr('r', function(d) {
          return radius(d.count);
        })
        .style('fill', color)
        .on('click', click)
        .call(force.drag)
        .append('svg:title').text(function(d) {
          return d.value + ': ' + d.count;
        });

      text = svg.selectAll('text')
        .data(nodes)
        .enter()
        .append('svg:text')
        .style('font-size', '12')
        .style('font-family', 'HelveticaNeue,Helvetica,Arial,sans-serif;')
        .style('fill', 'gray')
        .style('text-anchor', 'middle')
        .style('cursor', 'pointer')
        .style('dominant-baseline', 'middle')
        .text(function(d) {
          if (d === root) {
            return '';
          }
          return d.value;
        })
        .on('click', click);

      node.exit().remove();
    }

    function radius(count) {
      return Math.min(Math.sqrt(count) / 15, 15) || 4.5;
    }

    function color(d) {
      return d._children ? '#05B0FE' : d.children ?
        '#FFFFFF' : '#FE402A';
    }

    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
        text.remove();
      }
      else {
        d.children = d._children;
        d._children = null;
        text.remove();
      }
      update();
    }

    function flatten(root) {
      var nodes = [], i = 0;

      function recurse(node) {
        if (node.children) {
          node.children.forEach(recurse);
        }
        if (!node.id) {
          node.id = ++i;
        }
        nodes.push(node);
      }

      recurse(root);
      return nodes;
    }
  };

  return PrefixFrequency;
});