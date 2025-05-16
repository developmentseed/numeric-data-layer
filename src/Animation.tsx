import { useState, useEffect } from "react";
import {
  Map as GLMap,
  NavigationControl,
  useControl,
} from "react-map-gl/maplibre";
import { TileLayer } from "@deck.gl/geo-layers";
import type { _TileLoadProps } from "@deck.gl/geo-layers";

import { MapboxOverlay as DeckOverlay } from "@deck.gl/mapbox";

import ZarrReader from "./zarr";
import NumericDataAnimationLayer from "@/layers/NumericDataAnimationLayer";
import type { NumericDataPickingInfo } from "@/layers/NumericDataLayer/types";
import Panel from "@/components/Panel";
import Description from "@/components/Description";
import Dropdown from "@/components/ui/Dropdown";
import RangeSlider from "@/components/ui/RangeSlider";
import SingleSlider from "@/components/ui/Slider";
import CheckBox from "@/components/ui/Checkbox";

import "maplibre-gl/dist/maplibre-gl.css";
import "./App.css";

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 0,
  maxZoom: 1,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const BASE_URL = import.meta.env.VITE_ZARR_BASE_URL ?? window.location.origin;

const ZARR_STORE_NAME =
  "20020601090000-JPL-L4_GHRSST-SSTfnd-MUR-GLOB-v02.0-fv04.1_multiscales.zarr";

const VAR_NAME = "analysed_sst";

const zarrReader = await ZarrReader.initialize({
  zarrUrl: `${BASE_URL}/${ZARR_STORE_NAME}`,
  varName: VAR_NAME,
});

const timestampUnit = 1;
const maxTimestamp = 2;

const quickCache = new Map();

//@ts-expect-error ignoring for now
function DeckGLOverlay(props) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

function App() {
  const [selectedColormap, setSelectedColormap] = useState<string>("viridis");
  const [minMax, setMinMax] = useState<{ min: number; max: number }>(
    zarrReader.scale
  );
  const [timestamp, setTimestamp] = useState<number>(0.0);
  const timestampStart = Math.floor(timestamp);
  const timestampEnd = Math.min(
    Math.floor(timestamp + timestampUnit),
    maxTimestamp
  );
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  async function fetchOneTimeStamp({ timestamp, index }) {
    const { x, y, z } = index;
    const keyName = `tile${timestamp}${x}${y}${z}`;
    const chunkData = await zarrReader.getTileData({
      ...index,
      timestamp,
    });
    quickCache.set(keyName, chunkData);
    return chunkData;
  }

  async function getTileData({ index, signal }: _TileLoadProps) {
    if (signal?.aborted) {
      console.error("Signal aborted: ", signal);
      return null;
    }
    const scale = zarrReader.scale;

    const { min, max } = scale;
    const { x, y, z } = index;
    let chunkDataStart;
    let chunkDataEnd;
    const timestampKeyStart = `tile${timestampStart}${x}${y}${z}`;
    const timestampKeyEnd = `tile${timestampEnd}${x}${y}${z}`;
    // Make it synchronous when there the value is cached
    if (quickCache.get(timestampKeyStart) && quickCache.get(timestampKeyEnd)) {
      return {
        imageDataStart: quickCache.get(timestampKeyStart),
        imageDataEnd: quickCache.get(timestampKeyEnd),
        min,
        max,
      };
    }

    const oneMoreStamp = Math.min(timestampEnd + 1, maxTimestamp);
    await fetchOneTimeStamp({ timestamp: oneMoreStamp, index });

    if (!quickCache.get(timestampKeyStart)) {
      chunkDataStart = await fetchOneTimeStamp({
        index,
        timestamp: timestampStart,
      });
    } else {
      chunkDataStart = quickCache.get(timestampKeyStart);
    }

    if (!quickCache.get(timestampKeyEnd)) {
      chunkDataEnd = await fetchOneTimeStamp({
        index,
        timestamp: timestampEnd,
      });
    } else {
      chunkDataEnd = quickCache.get(timestampKeyEnd);
    }

    if (chunkDataStart && chunkDataEnd) {
      return {
        imageDataStart: chunkDataStart,
        imageDataEnd: chunkDataEnd,
        min,
        max,
      };
    } else {
      throw Error("No tile data available");
    }
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
      // maxZoom: 19,
      // minZoom: 0,
      // onTileError: null,
      // onTileLoad: null,
      // onTileUnload: null,
      // onViewportLoad: null,
      // refinementStrategy: 'best-available',
      updateTriggers: {
        getTileData: [timestampStart, timestampEnd],
        renderSubLayers: [selectedColormap, minMax, timestamp],
      },
      renderSubLayers: (props) => {
        const { imageDataStart, imageDataEnd } = props.data;
        const { boundingBox } = props.tile;
        return new NumericDataAnimationLayer(props, {
          data: undefined,
          colormap_image: `/colormaps/${selectedColormap}.png`,
          min: minMax.min,
          max: minMax.max,
          imageDataStart,
          imageDataEnd,
          timestamp: timestamp - timestampStart,
          tileSize: zarrReader.tileSize,
          bounds: [
            boundingBox[0][0],
            boundingBox[0][1],
            boundingBox[1][0],
            boundingBox[1][1],
          ],
          pickable: true,
        });
      },
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

      // visible: true,
      // wrapLongitude: false,
    }),
  ];

  const deckProps = {
    layers,
    getTooltip: (info: NumericDataPickingInfo) => {
      return showTooltip ? info.dataValue && `${info.dataValue}` : null;
    },
  };

  return (
    <>
      <GLMap
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={MAP_STYLE}
        minZoom={0}
      >
        <DeckGLOverlay {...deckProps} />
        <NavigationControl position="top-left" />
      </GLMap>
      <Panel>
        <Description info={zarrReader.metadata} />
        <Dropdown onChange={setSelectedColormap} />
        <RangeSlider
          minMax={[zarrReader.scale.min, zarrReader.scale.max]}
          label="Scale"
          onValueChange={setMinMax}
        />

        <SingleSlider
          minMax={[0, 2]}
          step={0.02}
          label="Timestamp"
          onValueChange={setTimestamp}
        />
      </Panel>
    </>
  );
}

export default App;
