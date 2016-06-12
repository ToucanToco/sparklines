beforeEach ->
  @id = _.uniqueId 'test-'
  @DOMElement = d3.select document.body
    .append 'div'
    .classed 'test-dom-container', true
    .classed "#{@id}", true
    .node()

afterEach ->
  testsReportsElements = document.getElementsByClassName 'test'
  testReport = testsReportsElements[testsReportsElements.length - 1]
  return unless testReport

  testReport
  .appendChild @DOMElement
