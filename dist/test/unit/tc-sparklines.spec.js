(function() {
  describe('d3.toucan.sparklines', function() {
    var SAMPLE_DATA, SAMPLE_DATA_WITH_DATES, SAMPLE_DATA_WITH_UNORDERED_DATES, SAMPLE_UNIT, clickSparklineWithIndex, createSparklinesSelection;
    SAMPLE_DATA = [
      {
        label: 'A',
        date: 1,
        val: 10
      }, {
        label: 'A',
        date: 2,
        val: 20
      }, {
        label: 'A',
        date: 3,
        val: 7
      }, {
        label: 'A',
        date: 4,
        val: 12
      }, {
        label: 'A',
        date: 5,
        val: 7
      }, {
        label: 'A',
        date: 6,
        val: 10
      }, {
        label: 'B',
        date: 1,
        val: 11
      }, {
        label: 'B',
        date: 2,
        val: 22
      }, {
        label: 'B',
        date: 5,
        val: 19
      }, {
        label: 'B',
        date: 6,
        val: 14
      }
    ];
    SAMPLE_UNIT = '%';
    SAMPLE_DATA_WITH_DATES = [];
    _.merge(SAMPLE_DATA_WITH_DATES, SAMPLE_DATA, [
      {
        date: new Date(2015, 8, 1)
      }, {
        date: new Date(2015, 9, 1)
      }, {
        date: new Date(2015, 10, 1)
      }, {
        date: new Date(2015, 11, 1)
      }, {
        date: new Date(2016, 0, 1)
      }, {
        date: new Date(2016, 1, 1)
      }, {
        date: new Date(2015, 8, 1)
      }, {
        date: new Date(2015, 9, 1)
      }, {
        date: new Date(2016, 0, 1)
      }, {
        date: new Date(2016, 1, 1)
      }
    ]);
    SAMPLE_DATA_WITH_UNORDERED_DATES = [];
    _.merge(SAMPLE_DATA_WITH_UNORDERED_DATES, SAMPLE_DATA, SAMPLE_DATA_WITH_DATES, [
      {
        date: new Date(2015, 9, 1)
      }, {
        date: new Date(2015, 8, 1)
      }, {}, {}, {}, {}, {}, {}, {}, {}
    ]);
    createSparklinesSelection = function(parentElement, data) {
      var gSelection, nestedData, svgElement;
      nestedData = d3.nest().key(function(d) {
        return d.label;
      }).entries(data);
      svgElement = d3.select(parentElement).append('svg').classed('sparklines-test-case', true);
      gSelection = svgElement.selectAll('g').data(nestedData, function(d) {
        return d != null ? d.key : void 0;
      });
      gSelection.enter().append('g').classed('sparklines-test-case__group', true).attr('transform', function(d, i) {
        return "translate(0, " + (i * 50) + ")";
      }).append('g').classed('sparklines-test-case__sparkline', true).datum(function(d) {
        return d != null ? d.values : void 0;
      });
      return svgElement.selectAll('.sparklines-test-case__sparkline');
    };
    clickSparklineWithIndex = function(sparklinesSelection, index) {
      var clickEvent, selectedSparkline, touchRect;
      selectedSparkline = sparklinesSelection.filter(function(d, i) {
        return i === index;
      });
      touchRect = selectedSparkline.select('.touch-rect').node();
      clickEvent = new MouseEvent('click');
      touchRect.dispatchEvent(clickEvent);
      return selectedSparkline;
    };
    beforeEach(function() {
      this.sparklines = d3.toucan.sparklines({
        dateSelector: 'date',
        valueSelector: 'val',
        unit: SAMPLE_UNIT,
        selectionTimeout: 0
      });
    });
    describe('when data is valid', function() {
      beforeEach(function() {
        this.sparklinesSelection = createSparklinesSelection(this.DOMElement, SAMPLE_DATA);
        return this.sparklinesSelection.call(this.sparklines);
      });
      it('should add path to each element of this selection', function() {
        this.sparklinesSelection.select('path').size().should.be.eql(2);
        return this.sparklinesSelection.select('path').each(function(d) {
          return d3.select(this).attr('d').should.be.defined;
        });
      });
      it('should add the sparkline class to each element', function() {
        return this.sparklinesSelection.each(function(d) {
          return d3.select(this).classed('sparkline').should.be["true"];
        });
      });
      it('should add the area class to each path element', function() {
        return this.sparklinesSelection.each(function(d) {
          return d3.select(this).select('path').classed('sparkline__area').should.be["true"];
        });
      });
      it('should have a transparent touch/hover-enabled area', function() {
        var expectedHeight, expectedWidth;
        expectedHeight = this.sparklines.height();
        expectedWidth = this.sparklines.width();
        return this.sparklinesSelection.each(function(d) {
          var rect;
          rect = d3.select(this).select('rect');
          rect.classed('touch-rect').should.be.eql(true);
          rect.height = expectedHeight;
          return rect.width = expectedWidth;
        });
      });
      return describe('on selection', function() {
        beforeEach(function() {
          this.assertSelectionIndicators = function(selection) {
            selection.select('line').size().should.be.eql(1);
            selection.select('circle').size().should.be.eql(1);
            return selection.select('.sparkline__tooltip').size().should.be.eql(1);
          };
          return this.selectedSparkline = clickSparklineWithIndex(this.sparklinesSelection, 0);
        });
        it('should draw a line, a circle and a tooltip on the correct sparkline', function() {
          this.assertSelectionIndicators(this.sparklinesSelection);
          return this.assertSelectionIndicators(this.selectedSparkline);
        });
        it('should update the selection if another sparkline is clicked', function() {
          this.anotherSelectedSparkline = clickSparklineWithIndex(this.sparklinesSelection, 1);
          this.assertSelectionIndicators(this.sparklinesSelection);
          return this.assertSelectionIndicators(this.anotherSelectedSparkline);
        });
        return it('should display the correct unit', function() {
          return this.sparklinesSelection.select('.sparkline__tooltip-unit').text().should.contain(SAMPLE_UNIT);
        });
      });
    });
    describe('with dates instead of ordinal axis', function() {
      beforeEach(function() {
        return this.dateSparklines = this.sparklines.dateFormat('%B %Y');
      });
      return describe('when dates are ordered', function() {
        beforeEach(function() {
          this.sparklinesSelection = createSparklinesSelection(this.DOMElement, SAMPLE_DATA_WITH_DATES);
          return this.sparklinesSelection.call(this.dateSparklines);
        });
        describe('on selection', function() {
          beforeEach(function() {
            return this.selectedSparkline = clickSparklineWithIndex(this.sparklinesSelection, 0);
          });
          return it('should display the date according to the specified format', function() {
            return this.sparklinesSelection.select('.sparkline__tooltip').text().should.contain('September 2015');
          });
        });
        return describe('when unordered', function() {
          beforeEach(function() {
            this.sparklinesSelection = createSparklinesSelection(this.DOMElement, SAMPLE_DATA_WITH_UNORDERED_DATES);
            return this.sparklinesSelection.call(this.dateSparklines);
          });
          return it('should display dates in the correct order', function() {
            return this.sparklinesSelection.selectAll('path.sparkline__area').each(function(sparklineAreaData) {
              return _(sparklineAreaData).pluck('date').every(function(d, i, array) {
                if (i > 0) {
                  return d >= array[i - 1];
                } else {
                  return true;
                }
              }).should.be["true"];
            });
          });
        });
      });
    });
    it('should raise error when data is not valid', function() {
      var SAMPLE_INVALID_DATA, sparklinesSelection;
      SAMPLE_INVALID_DATA = SAMPLE_DATA + [
        {
          label: 'B',
          date: 2,
          val: 'blabla'
        }
      ];
      sparklinesSelection = createSparklinesSelection(this.DOMElement, SAMPLE_INVALID_DATA);
      return (function() {
        return sparklinesSelection.call(this.sparklines);
      }).should["throw"](Error);
    });
  });

}).call(this);
