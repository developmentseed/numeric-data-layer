import * as zarr from "zarrita";
import type {
  Attributes,
  Location,
  FetchStore,
  TypedArray,
  NumberDataType,
} from "zarrita";
import { findMinMax } from "./utils";
type ZarrReaderProps = {
  zarrUrl: string;
  varName: string;
};

type TileIndex = {
  x: number;
  y: number;
  z: number;
};

type Multiscale = {
  tile_matrix_set: "WebMercatorQuad";
  resampling_method: string;
  tile_matrix_limits: Record<string, unknown>;
};

export default class ZarrReader {
  private root!: Location<FetchStore>;

  private _metadata!: Attributes;
  private _varName!: string;
  private _scale!: { min: number; max: number };
  private _dtype!: string;
  private _tileSize: number = 256;
  // @TODO: hard coding for now
  private _t: number = 0;
  private _zooms!: { min: number; max: number };

  get scale() {
    return this._scale;
  }
  get dtype() {
    return this._dtype;
  }
  get tileSize() {
    return this._tileSize;
  }
  get metadata() {
    return this._metadata;
  }
  get minZoom() {
    return this._zooms.min;
  }
  get maxZoom() {
    return this._zooms.max;
  }

  private constructor() {}

  static async initialize({
    zarrUrl,
    varName,
  }: ZarrReaderProps): Promise<ZarrReader> {
    const reader = new ZarrReader();
    reader.root = zarr.root(new zarr.FetchStore(zarrUrl));
    const group = await zarr.open.v3(reader.root.resolve(`/`), {
      kind: "group",
    });
    reader._metadata = group.attrs;
    await reader.setVariable(varName);
    return reader;
  }

  async setVariable(varName: string) {
    this._varName = varName;
    const arr = await zarr.open.v3(this.root.resolve(`0/${varName}`), {
      kind: "array",
    });

    this._dtype = arr.dtype;
    this._tileSize = arr.shape[1];
    // @TODO: This is a temporary solution getting min max out of zoom 0 data.
    const minMax = await findMinMax(arr);
    if (minMax) {
      this._scale = {
        max: minMax.max,
        min: minMax.min,
      };
    }

    const zarrMetadata = await zarr.open.v3(this.root.resolve(`${varName}`), {
      kind: "array",
    });
    const multiscale = zarrMetadata.attrs.multiscales as Multiscale;

    if (multiscale?.tile_matrix_limits) {
      this._zooms = {
        min: Math.min(
          ...Object.keys(multiscale.tile_matrix_limits).map((e) => Number(e))
        ),
        max: Math.max(
          ...Object.keys(multiscale.tile_matrix_limits).map((e) => Number(e))
        ),
      };
    }
  }

  async getTileData({
    x,
    y,
    timestamp,
  }: TileIndex & { timestamp: number }): Promise<
    TypedArray<NumberDataType> | undefined
  > {
    const arr = await zarr.open.v3(this.root.resolve(`${z}/${this._varName}`), {
      kind: "array",
    });

    if (arr.is("number")) {
      const { data } = await arr.getChunk([timestamp, y, x]);
      // @TODO : remove once the data has actual timestamps
      if (timestamp == 1) {
        return new Float32Array(this.tileSize * this.tileSize);
      }

      return data;
    } else {
      return undefined;
    }
  }
}
