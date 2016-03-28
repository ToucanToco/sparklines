# Sparklines
Trendy graphs

[![Circle CI](https://circleci.com/gh/ToucanToco/sparklines.svg?style=svg)](https://circleci.com/gh/ToucanToco/sparklines)

Called on a selection of element, this component creates a sparkline for each
member of the selection, based on data already bind to it.

The whole selection behaves like a group, which means the scales and the
selection are coherent.

## Example

See this [CodePen](http://codepen.io/davinov/pen/BKZveR/)
> <p data-height="404" data-theme-id="0" data-slug-hash="BKZveR" data-default-tab="result" data-user="davinov" class="codepen">See the Pen <a href="http://codepen.io/davinov/pen/BKZveR/">d3 sparklines</a> by David Nowinsky (<a href="http://codepen.io/davinov">@davinov</a>) on <a href="http://codepen.io">CodePen</a>.</p>
> <script async src="//assets.codepen.io/assets/embed/ei.js"></script>

## Requirements
`d3.js` and `lodash`
``` html
<!-- Dependencies -->
<script src="lodash.js"></script>
<script src="d3.js"></script>
```

## Usage

Import the library
```html
<link href="dist/tc-sparklines.css" rel="stylesheet">
<script src="tc-sparklines.js"></script>
```

Generate your sparkline creator
```javascript
var sparklines = d3.toucan.sparklines()
  .setSomeOptions(...);
```

Apply it to some d3 selection that have it's data already bound
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
