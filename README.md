# DeckGL Numeric Data Layer

[Demo with Web Optimized Zarr](https://ds-numeric-data-layer.netlify.app/)

## Overview

DeckGL layers and helpers to visualize numeric data. The example of the numeric data can be such as Zarr V3 data containing GeoZarr compliant multiscales, numpy arrays.

`NumericDataLayer` is meant to be used as a subLayer of DeckGL's TileLayer. This means that input data should conform to tilesize×tilesize dimensions (e.g., 256×256, 512×512) to ensure proper rendering and optimization within the tiling system.

## Running a development environment

1. Clone the repo

```
git clone https://github.com/your-org/your-repo.git
cd your-repo

```

2. Run Local Dev Environment

```
npm install
npm run dev
```

The example app will then be accessible at http://localhost:5173.
