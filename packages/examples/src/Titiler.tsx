import { useState } from "react";
import { Map, NavigationControl, useControl } from "react-map-gl/maplibre";
import { TileLayer } from "@deck.gl/geo-layers";
import type { _TileLoadProps } from "@deck.gl/geo-layers";

import { MapboxOverlay as DeckOverlay } from "@deck.gl/mapbox";
import { parseNpy, NumericDataLayer } from "@developmentseed/numeric-data-layer";
import type { NumericDataPickingInfo } from "@developmentseed/numeric-data-layer";
import Panel from "./components/Panel";
import Dropdown from "./components/ui/Dropdown";
import type { Option } from "./components/ui/Dropdown";
import RangeSlider from "./components/ui/RangeSlider";
import CheckBox from "./components/ui/Checkbox";

import "maplibre-gl/dist/maplibre-gl.css";
import "./App.css";

const INITIAL_VIEW_STATE = {
  latitude: 1.3567,
  longitude: 172.933,
  zoom: 15,
  maxZoom: 20,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

function DeckGLOverlay(props: any) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

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
      // onTileError: null,
      // onTileLoad: null,
      // onTileUnload: null,
      // onViewportLoad: null,
      // refinementStrategy: 'best-available',
      // Any better way to do this?
      updateTriggers: {
        renderSubLayers: [selectedColormap, minMax, selectedBand],
      },
      renderSubLayers: (props) => {
        const { data } = props.data;
        const { boundingBox } = props.tile;
        // Cast into float32 (?? integer texture)
        const slicedData = new Float32Array(
          data.slice(256 * 256 * selectedBand, 256 * 256 * (selectedBand + 1))
        );
        return new NumericDataLayer(props, {
          data: undefined,
          colormap_image: `/colormaps/${selectedColormap}.png`,
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
        1
        <DeckGLOverlay {...deckProps} />
        <NavigationControl position="top-left" />
      </Map>
      <Panel>
        <Dropdown<string> onChange={setSelectedColormap} />
        <RangeSlider
          minMax={[3000, 18000]}
          label="Scale"
          onValueChange={setMinMax}
        />
        <Dropdown<number>
          label="Select band "
          options={bandRange}
          defaultValue={selectedBand}
          onChange={setSelectedBand}
        />
        <CheckBox onCheckedChange={setShowTooltip} />
      </Panel>
    </>
  );
}

export default App;
