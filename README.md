# DeckGL Numeric Data Layer

[Demo with Web Optimized Zarr](https://ds-numeric-data-layer.netlify.app/)

## Overview

DeckGL layers and helpers to visualize numeric data. The example of the numeric data can be such as Zarr V3 data containing GeoZarr compliant multiscales, numpy arrays.
`NumericDataLayer` is meant to be used as a subLayer of DeckGL's TileLayer. This means that input data should conform to tilesize×tilesize dimensions (e.g., 256×256, 512×512) to ensure proper rendering and optimization within the tiling system.

The repo is organized into multiple packages to provide both Javascript and Python bindings for Numeric Data Layer.

The packages included in this repo are

1. **Core Library** (`packages/numeric-data-layer/`) - TypeScript/JavaScript DeckGL layers. This package includes helpers to parse numeric data foramt such as zarr and numpty tiles.
2. **Examples Application** (`packages/examples/`) - React demo application 
3. **Python Widget** (`packages/python-widget/`) - Jupyter notebook widget


## Local Development Setup

### Prerequisites

- **Node.js** 
- **PNPM** (preferred package manager for workspace management)
- **Python** 

### Getting Started

1. **Clone the Repository**
  ```bash
  git clone https://github.com/developmentseed/geozarr-numeric-data-layer.git
  cd geozarr-numeric-data-layer
  ```

2. **Install dependencies**
The command below will install all dependencies in all the projects. 

```bash
pnpm install
```

### Development Commands

#### Hot Reloading

If you want to see the change you are making to the core package from the other package (ex. from one of the example) in real time, the commands below are your friend.

```bash
# Terminal 1: Core library in watch mode
pnpm dev:core

# Terminal 2: Examples application  
pnpm dev:examples

# Terminal 3: Python widget (if developing)
pnpm dev:widgets
```

#### Package specific set up

See each package's readme and package.json file for package-specific commands.
