import type { NumericDataPaintLayerProps } from "../NumericDataPaintLayer/types";
import type { BitmapLayerPickingInfo } from "@deck.gl/layers";
import type { TypedArray, NumberDataType } from "zarrita";

export interface NumericDataLayerProps extends NumericDataPaintLayerProps {
  imageData: TypedArray<NumberDataType>;
}

export interface NumericDataPickingInfo extends BitmapLayerPickingInfo {
  dataValue: NumberDataType | null;
}
