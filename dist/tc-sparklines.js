
/*
Sparklines

Notes:
`...Managers` are internal components we use at Toucan Toco
Sparklines are designed to work with or without them.
 */

(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (d3.toucan == null) {
    d3.toucan = {};
  }

  d3.toucan.sparklines = function(bulkOptions) {
    var _computeScales, _selectDate, commonScatter, dateFormat, dateSelector, forceLexicalOrder, height, selectionTimeout, tcSparklines, tooltipYOffset, transitionDuration, unit, valueFormat, valueSelector, width;
    if (bulkOptions == null) {
      bulkOptions = {};
    }
    dateFormat = bulkOptions.dateFormat || void 0;
    forceLexicalOrder = bulkOptions.forceLexicalOrder || true;
    dateSelector = bulkOptions.dateSelector || 'date';
    valueSelector = bulkOptions.valueSelector || 'value';
    height = bulkOptions.height || 32;
    width = bulkOptions.width || 120;
    transitionDuration = bulkOptions.transitionDuration || 500;
    unit = bulkOptions.unit || '';
    valueFormat = bulkOptions.valueFormat || void 0;
    commonScatter = bulkOptions.commonScatter || false;
    selectionTimeout = bulkOptions.selectionTimeout || 2000;
    tooltipYOffset = bulkOptions.tooltipYOffset || 0;
    _computeScales = function(d3Selection) {
      var allSparklinesData, xDomain, xDomainExtent, xDomainValues, xRange, xScale, yExtents, yScales, yScatter;
      allSparklinesData = d3Selection.data();
      xDomainValues = _(allSparklinesData).flatten().pluck(dateSelector).value();
      xDomainExtent = d3.extent(xDomainValues);
      xRange = [0, width];
      if (_.all(xDomainExtent, function(d) {
        return d instanceof Date;
      })) {
        xScale = d3.time.scale().domain(xDomainExtent).rangeRound(xRange).nice();
        xScale.type = 'time';
      } else {
        xDomain = _(_(allSparklinesData).max(function(d) {
          return d.length;
        })).pluck(dateSelector).value();
        if (forceLexicalOrder) {
          xDomain = _.sortBy(xDomain);
        }
        xScale = d3.scale.ordinal().domain(xDomain).rangeRoundPoints(xRange);
        xScale.type = 'ordinal';
      }
      yExtents = _(allSparklinesData).map(function(oneSparklineData) {
        var oneSparklineValues;
        oneSparklineValues = _.pluck(oneSparklineData, valueSelector);
        return [_.min(oneSparklineValues), _.max(oneSparklineValues)];
      }).value();
      yScatter = _(yExtents).map(function(yExtent) {
        return yExtent[1] - yExtent[0];
      }).max();
      if ((yScatter === Infinity) || (yScatter === -Infinity)) {
        throw 'Sparklines values are not valid';
      }
      yScales = _(yExtents).map(function(yExtent) {
        var center;
        if (commonScatter) {
          center = (+yExtent[0] + +yExtent[1]) / 2;
          return [center - yScatter / 2, center + yScatter / 2];
        } else {
          return yExtent;
        }
      }).map(function(yDomain) {
        return d3.scale.linear().domain(yDomain).range([height, 0]);
      }).value();
      return {
        x: xScale,
        y: yScales
      };
    };
    _selectDate = function(d3Selection, sparklineScale, sparklineElement) {
      return function() {
        var dateFormatter, datePositionX, getSelectedPoint, leftBisectedDateIndex, positionX, rightBisectedDateIndex, selectedPoint, selectedPointDate, sparklineDates, tooltip, valueFormatter;
        if (d3.touches(this) && d3.touches(this).length > 0) {
          positionX = d3.touches(this)[0][0];
        } else if (d3.mouse(this)) {
          positionX = d3.event.clientX - this.getBoundingClientRect().left;
        }
        if (sparklineScale.x.type === 'time') {
          sparklineDates = _(sparklineElement.data()[0]).pluck(dateSelector).sortBy().value();
          datePositionX = sparklineScale.x.invert(positionX);
          rightBisectedDateIndex = d3.bisectLeft(sparklineDates, datePositionX);
          leftBisectedDateIndex = rightBisectedDateIndex - 1;
          if (rightBisectedDateIndex > sparklineDates.length || datePositionX - sparklineDates[rightBisectedDateIndex] > datePositionX - sparklineDates[leftBisectedDateIndex]) {
            selectedPointDate = sparklineDates[leftBisectedDateIndex];
          } else {
            selectedPointDate = sparklineDates[rightBisectedDateIndex];
          }
        } else {
          selectedPointDate = sparklineScale.x.domain()[d3.bisect(sparklineScale.x.range(), positionX) - 1];
          if (indexOf.call(sparklineScale.x.domain(), selectedPointDate) < 0) {
            return;
          }
        }
        getSelectedPoint = function(d) {
          return _.find(d, function(p) {
            return p[dateSelector] === selectedPointDate;
          });
        };
        d3Selection.selectAll('.sparkline__selection').remove();
        selectedPoint = {
          x: sparklineScale.x(selectedPointDate),
          y: function(d) {
            return sparklineScale.y(getSelectedPoint(d)[valueSelector]);
          }
        };
        if (!sparklineElement.filter(getSelectedPoint).size()) {
          return;
        }
        sparklineElement.append('line').classed('sparkline__selection', true).attr({
          x1: selectedPoint.x,
          y1: height,
          x2: selectedPoint.x,
          y2: selectedPoint.y
        });
        sparklineElement.append('circle').classed('sparkline__selection', true).attr({
          cx: selectedPoint.x,
          cy: selectedPoint.y,
          r: 3
        });
        tooltip = sparklineElement.append('foreignObject').classed('sparkline__selection', true).classed('sparkline__tooltip-container', true).attr({
          width: width,
          height: height,
          x: 0,
          y: tooltipYOffset
        }).datum(getSelectedPoint).append('xhtml:div').classed('sparkline__tooltip', true).append('div').classed('sparkline__tooltip-box', true);
        if (dateFormat) {
          dateFormatter = d3.time.format(dateFormat);
        } else {
          dateFormatter = _.identity;
        }
        tooltip.append('span').classed('text', true).text(function(d) {
          return dateFormatter(d[dateSelector]);
        });
        if (valueFormat) {
          valueFormatter = d3.format(valueFormat);
        }
        tooltip.append('span').classed('value', true).text(function(d) {
          return (typeof PrecisionManager !== "undefined" && PrecisionManager !== null ? PrecisionManager.format(d, valueSelector) : void 0) || (typeof valueFormatter === "function" ? valueFormatter(d[valueSelector]) : void 0) || d[valueSelector];
        });
        return tooltip.append('span').classed('unit', true).text(function(d) {
          return (typeof UnitManager !== "undefined" && UnitManager !== null ? UnitManager.get(d, valueSelector) : void 0) || unit || d.unit;
        });
      };
    };
    tcSparklines = function(d3Selection) {
      var emptySparklineArea, scales, sparklineArea;
      if (!d3Selection) {
        return tcSparklines;
      }
      d3Selection.classed('sparkline', true);
      _.each(d3Selection.data(), function(_data) {
        if (_data.length > width) {
          return _data.splice(0, _data.length - width);
        }
      });
      scales = _computeScales(d3Selection);
      sparklineArea = function(sparklineIndex) {
        return d3.svg.area().x(function(d) {
          return scales.x(d[dateSelector]);
        }).y0(height).y1(function(d) {
          return scales.y[sparklineIndex](d[valueSelector]);
        });
      };
      emptySparklineArea = d3.svg.area().x(function(d) {
        return scales.x(d[dateSelector]);
      }).y0(height).y1(height);
      d3Selection.each(function(d, i) {
        var endPointerHandler, pointerHandler, sparklineAreas, sparklineElement;
        sparklineElement = d3.select(this);
        if (!sparklineElement.select('.sparkline__area').size()) {
          sparklineElement.append('path').classed('sparkline__area', true).attr('d', emptySparklineArea);
          sparklineElement.append('rect').attr('height', height).attr('width', width).classed('touch-rect', true).style('fill', 'transparent');
        }
        sparklineAreas = sparklineElement.select('.sparkline__area');
        if (forceLexicalOrder || scales.x.type === 'time') {
          sparklineAreas.datum(function(d) {
            return _.sortBy(d, dateSelector);
          });
        }
        sparklineAreas.transition().duration(transitionDuration).attr('d', sparklineArea(i));
        pointerHandler = _selectDate(d3Selection, {
          x: scales.x,
          y: scales.y[i]
        }, sparklineElement);
        endPointerHandler = function(d) {
          return setTimeout(function() {
            return d3Selection.selectAll('.sparkline__selection').remove();
          }, selectionTimeout);
        };
        sparklineElement.select('.touch-rect').on('click', pointerHandler).on('mousemove', pointerHandler).on('touchmove', pointerHandler);
        if (selectionTimeout) {
          return sparklineElement.select('.touch-rect').on('mouseleave', endPointerHandler).on('touchend', endPointerHandler);
        }
      });
    };
    tcSparklines.dateSelector = function(val) {
      if (!arguments.length) {
        return dateSelector;
      }
      dateSelector = val;
      return tcSparklines;
    };
    tcSparklines.forceLexicalOrder = function(val) {
      if (!arguments.length) {
        return forceLexicalOrder;
      }
      forceLexicalOrder = val;
      return tcSparklines;
    };
    tcSparklines.dateFormat = function(val) {
      if (!arguments.length) {
        return dateFormat;
      }
      dateFormat = val;
      return tcSparklines;
    };
    tcSparklines.valueSelector = function(val) {
      if (!arguments.length) {
        return valueSelector;
      }
      valueSelector = val;
      return tcSparklines;
    };
    tcSparklines.height = function(val) {
      if (!arguments.length) {
        return height;
      }
      height = val;
      return tcSparklines;
    };
    tcSparklines.width = function(val) {
      if (!arguments.length) {
        return width;
      }
      width = val;
      return tcSparklines;
    };
    tcSparklines.transitionDuration = function(val) {
      if (!arguments.length) {
        return transitionDuration;
      }
      transitionDuration = val;
      return tcSparklines;
    };
    tcSparklines.unit = function(val) {
      if (!arguments.length) {
        return unit;
      }
      unit = val;
      return tcSparklines;
    };
    tcSparklines.valueFormat = function(val) {
      if (!arguments.length) {
        return valueFormat;
      }
      valueFormat = val;
      return tcSparklines;
    };
    tcSparklines.commonScatter = function(val) {
      if (!arguments.length) {
        return commonScatter;
      }
      commonScatter = val;
      return tcSparklines;
    };
    tcSparklines.selectionTimeout = function(val) {
      if (!arguments.length) {
        return selectionTimeout;
      }
      selectionTimeout = val;
      return tcSparklines;
    };
    tcSparklines.tooltipYOffset = function(val) {
      if (!arguments.length) {
        return tooltipYOffset;
      }
      tooltipYOffset = val;
      return tcSparklines;
    };
    return tcSparklines;
  };

}).call(this);
