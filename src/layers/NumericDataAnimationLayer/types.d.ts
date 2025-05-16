import type { NumericDataAnimationPaintLayerProps } from "../NumericDataAnimationPaintLayer/types";
import type { TypedArray, NumberDataType } from "zarrita";

export interface NumericDataAnimationLayerProps
  extends NumericDataAnimationPaintLayerProps {
  imageDataFrom: TypedArray<NumberDataType>;
  imageDataTo: TypedArray<NumberDataType>;
}
