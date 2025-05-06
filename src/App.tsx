import { useState } from "react";
import { Map, NavigationControl, useControl } from "react-map-gl/maplibre";
import { TileLayer } from "@deck.gl/geo-layers";
import type { _TileLoadProps } from "@deck.gl/geo-layers";

import { MapboxOverlay as DeckOverlay } from "@deck.gl/mapbox";

import ZarrReader from "./zarr";
import NumericDataLayer from "@/layers/NumericDataLayer";
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
  const [timestamp, setTimestamp] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);

  async function getTileData({ index, signal }: _TileLoadProps) {
    if (signal?.aborted) {
      console.error("Signal aborted: ", signal);
      return null;
    }
    const scale = zarrReader.scale;

    const { min, max } = scale;
    const chunkData = await zarrReader.getTileData({ ...index, timestamp });
    if (chunkData) {
      return {
        imageData: chunkData,
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
      // Any better way to do this?
      selectedColormap,
      minMax,
      updateTriggers: {
        getTileData: timestamp,
      },
      renderSubLayers: (props) => {
        const { imageData } = props.data;
        const { boundingBox } = props.tile;

        return new NumericDataLayer(props, {
          data: undefined,
          colormap_image: `/colormaps/${selectedColormap}.png`,
          min: minMax.min,
          max: minMax.max,
          tileSize: zarrReader.tileSize,
          imageData,
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
      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={MAP_STYLE}
        minZoom={0}
      >
        <DeckGLOverlay {...deckProps} />
        <NavigationControl position="top-left" />
      </Map>
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
          step={1}
          label="Timestamp"
          onValueChange={setTimestamp}
        />
        <CheckBox onCheckedChange={setShowTooltip} />
      </Panel>
    </>
  );
}

export default App;
