// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import { useState, useEffect } from "react";
import { Map, NavigationControl, useControl } from "react-map-gl/maplibre";
import { BitmapLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import type { _TileLoadProps } from "@deck.gl/geo-layers";

import { MapboxOverlay as DeckOverlay } from "@deck.gl/mapbox";
import type { TypedArray, NumberDataType } from "zarrita";

import ZarrReader from "./zarr";
import TestLayer from "./TestBitmapLayer";
import "maplibre-gl/dist/maplibre-gl.css";
import "./App.css";

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const BASE_URL = "http://localhost:5173/";
const ZARR_STORE_NAME =
  "20020601090000-JPL-L4_GHRSST-SSTfnd-MUR-GLOB-v02.0-fv04.1_multiscales.zarr";

const VAR_NAME = "analysed_sst";

const zarrReader = await ZarrReader.initialize({
  zarrUrl: BASE_URL + ZARR_STORE_NAME,
  varName: VAR_NAME,
});

function DeckGLOverlay(props) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

// Helper function to map a single value from [minInput, maxInput] to [0, 255]
function numberArrayToUint8ClampedArray(
  arr: TypedArray<NumberDataType>,
  minVal: number,
  maxVal: number
) {
  const visualResult = new Uint8ClampedArray(arr.length * 4);

  for (let i = 0; i < arr.length; i++) {
    const dv = arr[i];
    const offset = i * 4;

    if (isNaN(dv)) {
      // nodata value
      visualResult[offset] = 0; // R
      visualResult[offset + 1] = 0; // G
      visualResult[offset + 2] = 0; // B
      visualResult[offset + 3] = 0; // A
    } else {
      // Normalize, clamp to [0, 255] and round
      const normalized = ((dv - minVal) / (maxVal - minVal)) * 255;
      const r = Math.max(0, Math.min(255, Math.round(normalized)));

      visualResult[offset] = r;
      visualResult[offset + 1] = 0;
      visualResult[offset + 2] = 0;
      visualResult[offset + 3] = 255;
    }
  }
  // Create a Uint8ClampedArray from the mapped array
  return visualResult;
}

async function getTileData({ index, signal }: _TileLoadProps) {
  if (signal?.aborted) {
    console.error("Signal aborted: ", signal);
    return null;
  }
  const scale = zarrReader.scale;

  const { min, max } = scale;
  const chunkData = await zarrReader.getTileData(index);
  if (chunkData) {
    const clampedData = numberArrayToUint8ClampedArray(chunkData, min, max);

    return {
      imageData: new ImageData(
        clampedData,
        zarrReader.tileSize,
        zarrReader.tileSize
      ),
    };
  }
}

function App() {
  useEffect(() => {}, []);

  const layers = [
    new TileLayer({
      id: "TileLayer",
      // data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',

      /* props from TileLayer class */

      // TilesetClass: null,
      // debounceTime: 0,
      // extent: null,
      getTileData,
      // maxCacheByteSize: null,
      // maxCacheSize: null,
      // maxRequests: 6,
      // maxZoom: 19,
      // minZoom: 0,
      // onTileError: null,
      // onTileLoad: null,
      // onTileUnload: null,
      // onViewportLoad: null,
      // refinementStrategy: 'best-available',
      renderSubLayers: (props) => {
        const { imageData } = props.data;
        const { boundingBox } = props.tile;

        return new BitmapLayer(props, {
          data: undefined,
          image: {
            width: zarrReader.tileSize,
            height: zarrReader.tileSize,
            data: imageData,
          },
          bounds: [
            boundingBox[0][0],
            boundingBox[0][1],
            boundingBox[1][0],
            boundingBox[1][1],
          ],
        });
      },
      // @TODO: where should I bring this data?
      tileSize: zarrReader.tileSize,
      // zRange: null,
      // zoomOffset: 0,

      /* props inherited from Layer class */

      // autoHighlight: false,
      // coordinateOrigin: [0, 0, 0],
      // coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
      // highlightColor: [0, 0, 128, 128],
      // modelMatrix: null,
      // opacity: 1,
      pickable: true,
      // visible: true,
      // wrapLongitude: false,
    }),
    new TestLayer(),
  ];

  return (
    <Map initialViewState={INITIAL_VIEW_STATE} mapStyle={MAP_STYLE} minZoom={0}>
      <DeckGLOverlay layers={layers} />
      <NavigationControl position="top-left" />
    </Map>
  );
}

export default App;
