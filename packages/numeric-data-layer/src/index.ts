// Layers
export { default as NumericDataLayer } from './layers/NumericDataLayer';
export { default as NumericDataAnimationLayer } from './layers/NumericDataAnimationLayer';

// Types
export type { NumericDataLayerProps, NumericDataPickingInfo } from './layers/NumericDataLayer/types';
export type { NumericDataAnimationLayerProps } from './layers/NumericDataAnimationLayer/types';
export type { NumericDataPaintLayerProps } from './layers/NumericDataPaintLayer/types';
export type { NumericDataAnimationPaintLayerProps } from './layers/NumericDataAnimationPaintLayer/types';

// Zarr 
export { default as ZarrReader } from './zarr';

// NumPy utilities
export * from './utils/npy.js';