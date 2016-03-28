###
Sparklines

Notes:
`...Managers` are internal components we use at Toucan Toco
Sparklines are designed to work with or without them.
###

d3.toucan = {} unless d3.toucan?

d3.toucan.sparklines = (bulkOptions = {}) ->
  # Default values
  dateFormat = bulkOptions.dateFormat or undefined
  forceLexicalOrder = bulkOptions.forceLexicalOrder or true
  dateSelector = bulkOptions.dateSelector or 'date'
  valueSelector = bulkOptions.valueSelector or 'value'
  height = bulkOptions.height or 32
  width = bulkOptions.width or 120
  transitionDuration = bulkOptions.transitionDuration or 500
  unit = bulkOptions.unit or ''
  commonScatter = bulkOptions.commonScatter or false
  selectionTimeout = bulkOptions.selectionTimeout or 2000
  tooltipYOffset = bulkOptions.tooltipYOffset or 0

  _computeScales = (d3Selection) ->
    allSparklinesData = d3Selection.data()

    # Check data type to determine scale type
    xDomainValues = _ allSparklinesData
      .flatten()
      .pluck dateSelector
      .value()
    xDomainExtent = d3.extent xDomainValues
    xRange = [0, width]

    if _.all(xDomainExtent, (d) -> d instanceof Date)
      xScale = d3.time.scale()
      .domain xDomainExtent
      .rangeRound xRange
      .nice()
      xScale.type = 'time'

    else
      xDomain = _(_ allSparklinesData
        .max (d) -> d.length)
        .pluck dateSelector
        .value()

      xDomain = _.sortBy xDomain if forceLexicalOrder

      xScale = d3.scale.ordinal()
      .domain xDomain
      .rangeRoundPoints xRange
      xScale.type = 'ordinal'

    yExtents = _ allSparklinesData
      .map (oneSparklineData) ->
        oneSparklineValues = _.pluck oneSparklineData, valueSelector
        [
          _.min oneSparklineValues
          _.max oneSparklineValues
        ]
      .value()

    yScatter = _ yExtents
      .map (yExtent) -> yExtent[1] - yExtent[0]
      .max()

    throw 'Sparklines values are not valid' if (yScatter is Infinity) or (yScatter is -Infinity)

    yScales = _ yExtents
      .map (yExtent) ->
        if commonScatter
          center = (+yExtent[0] + +yExtent[1]) / 2
          return [ # Domains
            center - yScatter / 2
            center + yScatter / 2
          ]
        else
          return yExtent
      .map (yDomain) ->
        d3.scale.linear()
        .domain yDomain
        .range [height, 0]
      .value()

    x: xScale
    y: yScales

  _selectDate = (d3Selection, scales, sparklineElement, sparklineIndex) -> ->
    if d3.touches(@) and d3.touches(@).length > 0
      positionX = d3.touches(@)[0][0]

    else if d3.mouse @
      positionX = d3.event.clientX - @.getBoundingClientRect().left

    if scales.x.type is 'time'
      sparklineDates = _ sparklineElement.data()[0]
        .pluck dateSelector
        .sortBy()
        .value()

      datePositionX = scales.x.invert positionX

      # Find closest data e (http://bl.ocks.org/mbostock/3902569)
      rightBisectedDateIndex = d3.bisectLeft sparklineDates, datePositionX
      leftBisectedDateIndex = rightBisectedDateIndex - 1
      if rightBisectedDateIndex > sparklineDates.length or
      datePositionX - sparklineDates[rightBisectedDateIndex] > datePositionX - sparklineDates[leftBisectedDateIndex]
        selectedPointDate = sparklineDates[leftBisectedDateIndex]
      else
        selectedPointDate = sparklineDates[rightBisectedDateIndex]

    else
      selectedPointDate = scales.x.domain()[d3.bisect(scales.x.range(), positionX) - 1]
      # Handles unprobable case of an invalid date
      return unless selectedPointDate in scales.x.domain()

    getSelectedPoint = (d) -> _.find d, (p) -> p[dateSelector] is selectedPointDate

    d3Selection.selectAll '.sparkline__selection'
    .remove()

    selectedPoint =
      x: scales.x selectedPointDate
      y: (d) -> scales.y[sparklineIndex] getSelectedPoint(d)[valueSelector]

    # Handles the case where this particular sparkline have no data for this date
    return unless sparklineElement.filter(getSelectedPoint).size()

    sparklineElement
    .append 'line'
    .classed 'sparkline__selection', true
    .attr
      x1: selectedPoint.x
      y1: height
      x2: selectedPoint.x
      y2: selectedPoint.y

    sparklineElement
    .append 'circle'
    .classed 'sparkline__selection', true
    .attr
      cx: selectedPoint.x
      cy: selectedPoint.y
      r: 3

    tooltip = sparklineElement
    .append 'foreignObject'
    .classed 'sparkline__selection', true
    .classed 'sparkline__tooltip-container', true
    .attr
      width: width
      height: height
      x: 0
      y: tooltipYOffset
    .datum getSelectedPoint
    .append 'xhtml:div'
    .classed 'sparkline__tooltip', true
    .append 'div'
    .classed 'sparkline__tooltip-box', true

    if dateFormat
      dateFormatter = d3.time.format dateFormat
    else
      dateFormatter = _.identity
    tooltip.append 'span'
    .classed 'text', true
    .text (d) -> dateFormatter d[dateSelector]

    tooltip.append 'span'
    .classed 'value', true
    .text (d) -> (PrecisionManager?.format d, valueSelector) or d[valueSelector]

    tooltip.append 'span'
    .classed 'unit', true
    .text (d) -> (UnitManager?.get d, valueSelector) or unit or d.unit


  tcSparklines = (d3Selection) ->
    return tcSparklines unless d3Selection
    d3Selection
    .classed 'sparkline', true

    scales = _computeScales d3Selection

    sparklineArea = (sparklineIndex) ->
      d3.svg.area()
      .x (d) -> scales.x d[dateSelector]
      .y0 height
      .y1 (d) -> scales.y[sparklineIndex] d[valueSelector]

    emptySparklineArea = d3.svg.area()
      .x (d) -> scales.x d[dateSelector]
      .y0 height
      .y1 height

    d3Selection.each (d, i) ->
      sparklineElement = d3.select @

      unless sparklineElement.select('.sparkline__area').size()
        sparklineElement
        .append 'path'
        .classed 'sparkline__area', true
        .attr 'd', emptySparklineArea

        sparklineElement
        .append 'rect'
        .attr 'height', height
        .attr 'width', width
        .classed 'touch-rect', true
        .style 'fill', 'transparent'

      sparklineAreas = sparklineElement.select '.sparkline__area'
      if forceLexicalOrder or scales.x.type is 'time'
        sparklineAreas.datum (d) -> _.sortBy d, dateSelector
      sparklineAreas.transition()
      .duration transitionDuration
      .attr 'd', sparklineArea i

      pointerHandler = _selectDate d3Selection, scales, sparklineElement, i
      endPointerHandler = (d) ->
        setTimeout ->
          d3Selection.selectAll '.sparkline__selection'
          .remove()
        , selectionTimeout

      sparklineElement.select '.touch-rect'
      .on 'click', pointerHandler
      .on 'mousemove', pointerHandler
      .on 'touchmove', pointerHandler

      if selectionTimeout
        sparklineElement.select '.touch-rect'
        .on 'mouseleave', endPointerHandler
        .on 'touchend', endPointerHandler
    return

  # Getters/setters

  tcSparklines.dateSelector = (val) ->
    return dateSelector unless arguments.length
    dateSelector = val
    return tcSparklines

  tcSparklines.forceLexicalOrder = (val) ->
    return forceLexicalOrder unless arguments.length
    forceLexicalOrder = val
    return tcSparklines

  tcSparklines.dateFormat = (val) ->
    return dateFormat unless arguments.length
    dateFormat = val
    return tcSparklines

  tcSparklines.valueSelector = (val) ->
    return valueSelector unless arguments.length
    valueSelector = val
    return tcSparklines

  tcSparklines.height = (val) ->
    return height unless arguments.length
    height = val
    return tcSparklines

  tcSparklines.width = (val) ->
    return width unless arguments.length
    width = val
    return tcSparklines

  tcSparklines.transitionDuration = (val) ->
    return transitionDuration unless arguments.length
    transitionDuration = val
    return tcSparklines

  tcSparklines.unit = (val) ->
    return unit unless arguments.length
    unit = val
    return tcSparklines

  tcSparklines.commonScatter = (val) ->
    return commonScatter unless arguments.length
    commonScatter = val
    return tcSparklines

  tcSparklines.selectionTimeout = (val) ->
    return selectionTimeout unless arguments.length
    selectionTimeout = val
    return tcSparklines

  tcSparklines.tooltipYOffset = (val) ->
    return tooltipYOffset unless arguments.length
    tooltipYOffset = val
    return tcSparklines

  return tcSparklines
