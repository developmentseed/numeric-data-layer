import * as zarr from "zarrita";
import type { Location, FetchStore, TypedArray, NumberDataType } from "zarrita";
import { findMinMax } from "./utils";

// export async function exploreZarr() {
//   const store = new zarr.FetchStore(BASE_URL + ZARR_STORE_NAME);

//   const root = zarr.root(store);
//   const arr = await zarr.open.v3(root.resolve(`0/${VAR_NAME}`), {
//     kind: "array",
//   });
//   const group = await zarr.open.v3(root.resolve(`/`), {
//     kind: "group",
//   });
//   // console.log(store);
//   // console.log(arr);
//   // console.log("group attrs");
//   // console.log(group.consolidated_metadata);

//   // const arr = await zarr.open.v3(store);
//   // const chunk = await arr.getChunk([0, 0, 0]); // t, x, y

//   // const arr = await zarr.open(store, { kind: "group" }); // zarr.Array<DataType, FetchStore>
//   return arr;
//   // console.log(chunk);
// }

interface ZarrReaderProps {
  zarrUrl: string;
  varName: string;
}

interface TileIndex {
  x: number;
  y: number;
  z: number;
}

export default class ZarrReader {
  private root!: Location<FetchStore>;

  private _varName: string;
  private _scale: { min: number; max: number };
  private _dtype: string;
  private _tileSize: number = 256;
  // @TODO: hard coding for now
  private _t: number = 0;

  private constructor() {}

  static async initialize({
    zarrUrl,
    varName,
  }: ZarrReaderProps): Promise<ZarrReader> {
    const reader = new ZarrReader();
    reader.root = zarr.root(new zarr.FetchStore(zarrUrl));
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
    // How to get actual min/max?
    const minMax = await findMinMax(arr);
    if (minMax) {
      this._scale = {
        max: minMax.max,
        min: minMax.min,
      };
    }
  }

  get scale() {
    return this._scale;
  }
  get dtype() {
    return this._dtype;
  }
  get tileSize() {
    return this._tileSize;
  }

  async getTileData({
    x,
    y,
    z,
  }: TileIndex): Promise<TypedArray<NumberDataType> | undefined> {
    const arr = await zarr.open.v3(this.root.resolve(`${z}/${this._varName}`), {
      kind: "array",
    });
    if (arr.is("number")) {
      const { data } = await arr.getChunk([this._t, y, x]);
      return data;
    } else {
      return undefined;
    }
  }
}
