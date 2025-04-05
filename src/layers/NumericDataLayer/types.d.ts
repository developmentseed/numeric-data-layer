import type { BitmapLayerProps } from "deck.gl";
import type { BitmapLayerPickingInfo } from "@deck.gl/layers";
import type { TypedArray, NumberDataType } from "zarrita";

export interface NumericDataPaintLayerProps extends BitmapLayerProps {
  colormap_image: string | Texture;
  min: number;
  max: number;
  tileSize: number;
}

export interface NumericDataLayerProps extends NumericDataPaintLayerProps {
  imageData: TypedArray<NumberDataType>;
}

export interface NumericDataPickingInfo extends BitmapLayerPickingInfo {
  dataValue: NumberDataType | null;
}
