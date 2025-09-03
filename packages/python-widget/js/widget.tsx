
import React, { useState } from 'react';
import { createRender, useModelState } from "@anywidget/react";

import { DeckGL } from '@deck.gl/react';
import { Map, NavigationControl, useControl } from "react-map-gl/maplibre";

import { parseNpy, NumericDataLayer } from "@developmentseed/numeric-data-layer";

import { TileLayer } from "@deck.gl/geo-layers";
import type { _TileLoadProps } from "@deck.gl/geo-layers";
import "maplibre-gl/dist/maplibre-gl.css";

const INITIAL_VIEW_STATE = {
  latitude: 1.3567,
  longitude: 172.933,
  zoom: 15,
  maxZoom: 20,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";


function App() {
  const [selectedColormap, setSelectedColormap] = useState<string>("viridis");
  const [minMax, setMinMax] = useState<{ min: number; max: number }>({
    min: 3000,
    max: 18000,
  });
  const [bandRange, setBandRange] = useState<Option<number>[]>([
    { value: 0, label: "0" },
  ]);
  const [selectedBand, setSelectedBand] = useState<number>(0);

  const [showTooltip, setShowTooltip] = useState<boolean>(true);

  

  async function getTileData({ index, signal }: _TileLoadProps) {
    if (signal?.aborted) {
      console.error("Signal aborted: ", signal);
      return null;
    }
    const { z, x, y } = index;
    // using the same output from https://openlayers.org/en/latest/examples/numpytile.html
    const url = `https://titiler.xyz/cog/tiles/WebMercatorQuad/${z}/${x}/${y}@1x?format=npy&url=https://storage.googleapis.com/open-cogs/stac-examples/20201211_223832_CS2_analytic.tif`;
    const resp = await fetch(url);
    if (!resp.ok) {
      return null;
    }

    const { dtype, data, header } = parseNpy(await resp.arrayBuffer());

    if (bandRange !== header.shape[0])
      setBandRange(
        new Array(header.shape[0])
          .fill(0)
          .map((_, idx) => ({ label: idx.toString(), value: idx }))
      );
    return { dtype, data };
  }

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
      maxZoom: 16,
      minZoom: 0,
    //       renderSubLayers: props => {
    //   const {boundingBox} = props.tile;

    //   return new BitmapLayer(props, {
    //     data: null,
    //     image: props.data,
    //     bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
    //   });
    // },
      // onTileError: null,
      // onTileLoad: null,
      // onTileUnload: null,
      // onViewportLoad: null,
      // refinementStrategy: 'best-available',
      // Any better way to do this?
      // updateTriggers: {
      //   renderSubLayers: [selectedColormap, minMax, selectedBand],
      // },
      renderSubLayers: (props) => {
        const { data } = props.data;
        const { boundingBox } = props.tile;
        // Cast into float32 (?? integer texture)
        const slicedData = new Float32Array(
          data.slice(256 * 256 * selectedBand, 256 * 256 * (selectedBand + 1))
        );
        return new NumericDataLayer(props, {
          data: undefined,
          colormap_image: `https://raw.githubusercontent.com/kylebarron/deck.gl-raster/refs/heads/master/assets/colormaps/viridis.png`,
          min: minMax.min,
          max: minMax.max,
          tileSize: 256,
          imageData: slicedData,
          bounds: [
            boundingBox[0][0],
            boundingBox[0][1],
            boundingBox[1][0],
            boundingBox[1][1],
          ],
          pickable: true,
        });
      },
      tileSize: 256,
      // zRange: null,
      // zoomOffset: 0,

      /* props inherited from Layer class */

      // autoHighlight: false,
      // coordinateOrigin: [0, 0, 0],
      // coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
      // highlightColor: [0, 0, 128, 128],
      // modelMatrix: null,
      // opacity: 1,

      // visible: true,
      // wrapLongitude: false,
    }),
  ];

  const deckProps = {
    layers,
    initialViewState: INITIAL_VIEW_STATE,
    controller: true
  };

  return (
    <div style={{width: '800px', height: '500px'}}>
      <DeckGL {...deckProps} >
        <Map
          mapStyle={MAP_STYLE}
          reuseMaps
        />
      </DeckGL>
    </div>
  );
}
//-------

function Counter() {
	const [value, setValue] = useModelState("value");
	return <button onClick={() => setValue(value + 1)}>count is {value}</button>;
}




const render = createRender(App);

export default { render };