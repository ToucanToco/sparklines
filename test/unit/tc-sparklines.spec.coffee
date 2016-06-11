describe 'd3.toucan.sparklines', ->
  DOMElement = undefined

  SAMPLE_DATA = [
    label: 'A'
    date: 1
    val: 10
  ,
    label: 'A'
    date: 2
    val: 20
  ,
    label: 'B'
    date: 1
    val: 11
  ,
    label: 'B'
    date: 2
    val: 22
  ]
  SAMPLE_UNIT = '%'

  SAMPLE_DATA_WITH_DATES = []
  _.merge SAMPLE_DATA_WITH_DATES, SAMPLE_DATA, [
    date: new Date 2015, 8, 1
  ,
    date: new Date 2015, 10, 1
  ,
    date: new Date 2015, 8, 1
  ,
    date: new Date 2015, 11, 1
  ]

  SAMPLE_DATA_WITH_UNORDERED_DATES = []
  _.merge SAMPLE_DATA_WITH_UNORDERED_DATES, SAMPLE_DATA, [
    date: new Date 2015, 10, 1
  ,
    date: new Date 2015, 8, 1
  ,
    date: new Date 2015, 11, 1
  ,
    date: new Date 2015, 8, 1
  ]

  createSparklinesSelection = (data) ->
    nestedData = d3.nest()
      .key (d) -> d.label
      .entries data

    svgElement = d3.select document.body
      .append 'svg'
      .classed 'sparklines-test-case', true

    gSelection = svgElement.selectAll 'g'
      .data nestedData, (d) -> d?.key

    gSelection
      .enter()
      .append 'g'
      .classed 'sparklines-test-case__group', true
      .attr 'transform', (d, i) -> "translate(0, #{i * 50})"
      .append 'g'
      .classed 'sparklines-test-case__sparkline', true
      .datum (d) -> d?.values

    return svgElement.selectAll '.sparklines-test-case__sparkline'

  clickSparklineWithIndex = (sparklinesSelection, index) ->
    selectedSparkline = sparklinesSelection
    .filter (d, i) -> i is index

    touchRect = selectedSparkline
    .select '.touch-rect'
    .node()

    clickEvent = new MouseEvent 'click'
    touchRect.dispatchEvent clickEvent

    return selectedSparkline

  beforeEach ->
    @sparklines = d3.toucan.sparklines
      dateSelector: 'date'
      valueSelector: 'val'
      unit: SAMPLE_UNIT
      selectionTimeout: 0

    return

  afterEach ->
    d3.select '.sparklines-test-case'
    .remove()

  describe 'when data is valid', ->
    beforeEach ->
      @sparklinesSelection = createSparklinesSelection SAMPLE_DATA
      @sparklinesSelection.call @sparklines

    it 'should add path to each element of this selection', ->
      @sparklinesSelection.select 'path'
      .size()
      .should.be.eql 2

      @sparklinesSelection.select 'path'
      .each (d) ->
        d3.select @
        .attr 'd'
        .should.be.defined

    it 'should add the sparkline class to each element', ->
      @sparklinesSelection
      .each (d) ->
        d3.select @
        .classed 'sparkline'
        .should.be.true

    it 'should add the area class to each path element', ->
      @sparklinesSelection
      .each (d) ->
        d3.select @
        .select 'path'
        .classed 'sparkline__area'
        .should.be.true

    it 'should have a transparent touch/hover-enabled area', ->
      expectedHeight = @sparklines.height()
      expectedWidth = @sparklines.width()

      @sparklinesSelection
      .each (d) ->
        rect = d3.select @
          .select 'rect'

        rect.classed 'touch-rect'
        .should.be.eql true

        rect.height = expectedHeight
        rect.width = expectedWidth

    describe 'on selection', ->
      beforeEach ->
        @assertSelectionIndicators = (selection) ->
          selection.select 'line'
          .size().should.be.eql 1

          selection.select 'circle'
          .size().should.be.eql 1

          selection.select '.sparkline__tooltip'
          .size().should.be.eql 1

        @selectedSparkline = clickSparklineWithIndex @sparklinesSelection, 0

      it 'should draw a line, a circle and a tooltip on the correct sparkline', ->
        @assertSelectionIndicators @sparklinesSelection
        @assertSelectionIndicators @selectedSparkline

      it 'should update the selection if another sparkline is clicked', ->
        @anotherSelectedSparkline = clickSparklineWithIndex @sparklinesSelection, 1

        @assertSelectionIndicators @sparklinesSelection
        @assertSelectionIndicators @anotherSelectedSparkline

      it 'should display the correct unit', ->
        @sparklinesSelection.select '.sparkline__tooltip-unit'
        .text().should.contain SAMPLE_UNIT

  describe 'with dates instead of ordinal axis', ->
    beforeEach ->
      @dateSparklines = @sparklines.dateFormat '%B %Y'

    describe 'when dates are ordered', ->
      beforeEach ->
        @sparklinesSelection = createSparklinesSelection SAMPLE_DATA_WITH_DATES
        @sparklinesSelection.call @dateSparklines

      describe 'on selection', ->
        beforeEach ->
          @selectedSparkline = clickSparklineWithIndex @sparklinesSelection, 0

        it 'should display the date according to the specified format', ->
          @sparklinesSelection.select '.sparkline__tooltip'
          .text().should.contain 'September 2015'

      describe 'when unordered', ->
        beforeEach ->
          @sparklinesSelection = createSparklinesSelection SAMPLE_DATA_WITH_UNORDERED_DATES
          @sparklinesSelection.call @dateSparklines

        it 'should display dates in the correct order', ->
          @sparklinesSelection
          .selectAll 'path.sparkline__area'
          .each (sparklineAreaData) ->
            _ sparklineAreaData
            .pluck 'date'
            .every (d, i, array) -> if i > 0 then d >= array[i - 1] else true
            .should.be.true

  it 'should raise error when data is not valid', ->
    SAMPLE_INVALID_DATA = SAMPLE_DATA + [
      label: 'B'
      date: 2
      val: 'blabla'
    ]
    sparklinesSelection = createSparklinesSelection SAMPLE_INVALID_DATA
    (-> sparklinesSelection.call @sparklines)
    .should.throw Error
  return
