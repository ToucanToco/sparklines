(function() {
  beforeEach(function() {
    this.id = _.uniqueId('test-');
    return this.DOMElement = d3.select(document.body).append('div').classed('test-dom-container', true).classed("" + this.id, true).node();
  });

  afterEach(function() {
    var testReport, testsReportsElements;
    testsReportsElements = document.getElementsByClassName('test');
    testReport = testsReportsElements[testsReportsElements.length - 1];
    if (!testReport) {
      return;
    }
    return testReport.appendChild(this.DOMElement);
  });

}).call(this);
