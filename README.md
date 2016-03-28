# Sparklines
Trendy graphs

[![Circle CI](https://circleci.com/gh/ToucanToco/sparklines.svg?style=svg)](https://circleci.com/gh/ToucanToco/sparklines)

Called on a selection of element, this component creates a sparkline for each
member of the selection, based on data already bind to it.

The whole selection behaves like a group, which means the scales and the
selection are coherent.


## Requirements
- `d3.js`
- `lodash`

``` html
<!-- Dependencies -->
<script src="lodash.js"></script>
<script src="d3.js"></script>
```

## Usage

### Importing the library
```html
<link href="dist/tc-sparklines.css" rel="stylesheet">

<!-- Sparklines -->
<script src="tc-sparklines.js"></script>
```

### Generate your sparklines creator
```javascript
var sparklines = d3.toucan.sparklines()
  .setSomeOptions(...);
```

### Apply it
To some d3 selection that have it's data already bound
```javascript
d3.selectAll('.sparkline-element')
  .call(sparklines);
```

## Customization

### Options
- `dateSelector`
- `valueSelector`
- `width`
- `height`
- `transitionDuration`
- `unit`
- `dateFormat`: optional formatting of dates in tooltip
- `valueFormat`: optional formatting of values in tooltip
- `forceLexicalOrder`: optional, default true, set to false to force lexical
  reordering of ordinal dates
- `commonScatter`: false by default, use the same scatter for all sparklines
  (y axis)
- `selectionTimeout`: default 2000, time before tooltip disappears, 0 to disable
- `tooltipYOffset`: default 0, offset of the tooltip
  :warning: The tooltip must be positioned in the `<svg>` element bounds

### Get/set an option
Options are get/set in d3 style:

Get an option by passing no arguments
```javascript
// Get the dateSelector value
sparklines.dateSelector();
// -> 'date'
```

Setting a value using the setter.
```javascript
// Set the dateSelector value
sparklines.dateSelector('months');
```

The setters returns the object so it's easy to chain options.
```javascript
// Set the dateSelector value
sparklines
  .dateSelector('months')
  .height(80)
  .width(250);
```

### Bulk setting options on creation
Options can also be set once using an object.
```javascript
var sparklines = d3.toucan.sparklines({
  height: 80,
  width: 250
});
```
