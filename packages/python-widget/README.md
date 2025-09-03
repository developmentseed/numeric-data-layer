# GeoZarr Numeric Data Layer Python Widget

A Python widget for visualizing numeric data from Zarr sources using DeckGL in Jupyter notebooks.

## Usage

```python
from geozarr_numeric_data_layer import NumericDataLayerWidget

# Create a widget instance
widget = NumericDataLayerWidget(
    zarr_url="https://example.com/data.zarr",
    var_name="temperature",
    colormap="viridis",
    animation_enabled=True
)

# Display the widget
widget
```

## Development

This widget is built using [anywidget](https://anywidget.dev/) and leverages the `@geozarr/numeric-data-layer` TypeScript library.