import { useState, useEffect } from "react";
import {
  Map as GLMap,
  NavigationControl,
  useControl,
} from "react-map-gl/maplibre";
import { TileLayer } from "@deck.gl/geo-layers";
import type { _TileLoadProps } from "@deck.gl/geo-layers";

import { MapboxOverlay as DeckOverlay } from "@deck.gl/mapbox";

import { ZarrReader, NumericDataAnimationLayer } from "@developmentseed/numeric-data-layer";
import Panel from "./components/Panel";
import Description from "./components/Description";
import Dropdown from "./components/ui/Dropdown";
import RangeSlider from "./components/ui/RangeSlider";
import SingleSlider from "./components/ui/Slider";
import PlayButton from "./components/ui/PlayButton";

import { usePausableAnimation } from "./components/ui/utils";

import { INITIAL_VIEW_STATE } from "./App";

import "maplibre-gl/dist/maplibre-gl.css";
import "./App.css";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const BASE_URL = import.meta.env.VITE_ZARR_BASE_URL ?? window.location.origin;

const ZARR_STORE_NAME =
  "200206-JPL-L4_GHRSST-SSTfnd-MUR-GLOB-v02.0-fv04.1_multiscales.zarr";

const VAR_NAME = "analysed_sst";

const zarrReader = await ZarrReader.initialize({
  zarrUrl: `${BASE_URL}/${ZARR_STORE_NAME}`,
  varName: VAR_NAME,
});

export type TileIndex = { x: number; y: number; z: number };

const TIME_UNIT = 1;
const MAX_TIMESTAMP = 2;
const SPEED = 0.01;

const quickCache = new Map();

function DeckGLOverlay(props: any) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

async function fetchOneTimeStamp({
  timestamp,
  index,
}: {
  timestamp: number;
  index: TileIndex;
}) {
  const { x, y, z } = index;
  const keyName = `tile${timestamp}${x}${y}${z}`;

  if (quickCache.get(keyName)) {
    return quickCache.get(keyName);
  }
  const chunkData = await zarrReader.getTileData({
    ...index,
    timestamp,
  });
  quickCache.set(keyName, chunkData);
  return chunkData;
}

// Helper function to pre-fetch the next timestamp for all visible tiles
async function prefetchNextTimestamp(
  currentTimestamp: number,
  visibleTiles: TileIndex[]
) {
  const nextTimestamp =
    (Math.floor(currentTimestamp + TIME_UNIT) % MAX_TIMESTAMP) + 1;

  // Pre-fetch data for all visible tiles
  for (const tile of visibleTiles) {
    await fetchOneTimeStamp({
      timestamp: nextTimestamp,
      index: tile,
    });
  }
}

// Evict cache entries for a specific tile (when tiles are unloaded)
function evictTileFromCache(index: TileIndex) {
  const { x, y, z } = index;

  for (let t = 0; t < MAX_TIMESTAMP; t++) {
    const tileKey = `tile${t}${x}${y}${z}`;
    if (quickCache.has(tileKey)) {
      quickCache.delete(tileKey);
    }
  }
}

function App() {
  const [selectedColormap, setSelectedColormap] = useState<string>("viridis");
  const [minMax, setMinMax] = useState<{ min: number; max: number }>(
    zarrReader.scale
  );
  const [timestamp, setTimestamp] = useState<number>(0.0);
  const [visibleTiles, setVisibleTiles] = useState<TileIndex[]>([]);
  const [lastPrefetchedTimestamp, setLastPrefetchedTimestamp] =
    useState<number>(-1);

  const timestampStart = Math.floor(timestamp);
  const timestampEnd = Math.min(
    Math.floor(timestamp + TIME_UNIT),
    MAX_TIMESTAMP
  );
  const step = timestamp - timestampStart;

  // When step crosses 0.5, fetch one more timestamp

  useEffect(() => {
    const nextTimestamp =
      (Math.floor(timestamp + TIME_UNIT) + 1) % MAX_TIMESTAMP;

    // Only pre-fetch if we have visible tiles and step has crossed 0.5
    // and we haven't pre-fetched this timestamp yet
    if (
      step > 0.5 &&
      visibleTiles.length > 0 &&
      lastPrefetchedTimestamp !== nextTimestamp
    ) {
      prefetchNextTimestamp(timestamp, visibleTiles);
      setLastPrefetchedTimestamp(nextTimestamp);
    }
  }, [timestamp, step, visibleTiles, lastPrefetchedTimestamp]);

  const { isRunning, toggleAnimation } = usePausableAnimation(() => {
    setTimestamp((prev) => (prev + SPEED) % MAX_TIMESTAMP);
  });

  async function getTileData({ index, signal }: _TileLoadProps) {
    if (signal?.aborted) {
      console.error("Signal aborted: ", signal);
      return null;
    }
    const scale = zarrReader.scale;

    const { min, max } = scale;
    const { x, y, z } = index;

    // Add this tile to visible tiles if not already there
    setVisibleTiles((prevTiles) => {
      if (
        !prevTiles.some((tile) => tile.x === x && tile.y === y && tile.z === z)
      ) {
        return [...prevTiles, { x, y, z }];
      }
      return prevTiles;
    });

    const timestampKeyStart = `tile${timestampStart}${x}${y}${z}`;
    const timestampKeyEnd = `tile${timestampEnd}${x}${y}${z}`;
    // Make it synchronous when there are values cached
    if (quickCache.get(timestampKeyStart) && quickCache.get(timestampKeyEnd)) {
      return {
        imageDataFrom: quickCache.get(timestampKeyStart),
        imageDataTo: quickCache.get(timestampKeyEnd),
        min,
        max,
      };
    }

    const chunkDataStart = await fetchOneTimeStamp({
      index,
      timestamp: timestampStart,
    });

    const chunkDataEnd = await fetchOneTimeStamp({
      index,
      timestamp: timestampEnd,
    });

    if (chunkDataStart && chunkDataEnd) {
      return {
        imageDataFrom: chunkDataStart,
        imageDataTo: chunkDataEnd,
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
      maxZoom: zarrReader.maxZoom,
      minZoom: zarrReader.minZoom,
      // onTileError: null,
      // onTileLoad: null,
      onTileUnload: (tile) => {
        // Remove unloaded tiles from the visibleTiles array
        const { x, y, z } = tile.index;
        // Also get rid of them from cache
        evictTileFromCache({ x, y, z });
        setVisibleTiles((prevTiles) =>
          prevTiles.filter((t) => !(t.x === x && t.y === y && t.z === z))
        );
      },
      // onViewportLoad: null,
      // refinementStrategy: 'best-available',
      updateTriggers: {
        getTileData: [timestampStart],
        renderSubLayers: [selectedColormap, minMax, timestamp],
      },
      renderSubLayers: (props) => {
        const { imageDataFrom, imageDataTo } = props.data;
        const { boundingBox } = props.tile;
        return new NumericDataAnimationLayer(props, {
          data: undefined,
          colormap_image: `/colormaps/${selectedColormap}.png`,
          min: minMax.min,
          max: minMax.max,
          imageDataFrom,
          imageDataTo,
          step,
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
        <Dropdown<string> onChange={setSelectedColormap} />
        <RangeSlider
          minMax={[zarrReader.scale.min, zarrReader.scale.max]}
          label="Scale"
          onValueChange={setMinMax}
        />

        <SingleSlider
          minMax={[0, MAX_TIMESTAMP]}
          step={SPEED}
          currentValue={timestamp}
          label="Timestamp"
          onValueChange={setTimestamp}
        />
        <PlayButton onPlay={isRunning} onClick={toggleAnimation} />
      </Panel>
    </>
  );
}

export default App;
