import type { NumericDataPaintLayerProps } from "../NumericDataPaintLayer/types";
import type { BitmapLayerPickingInfo } from "@deck.gl/layers";
import type { TypedArray, NumberDataType } from "zarrita";

export interface NumericDataAnimationLayerProps
  extends NumericDataPaintLayerProps {
  imageDataStart: TypedArray<NumberDataType>;
  imageDataEnd: TypedArray<NumberDataType>;
}

export interface NumericDataPickingInfo extends BitmapLayerPickingInfo {
  dataValue: NumberDataType | null;
}
