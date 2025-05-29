import type { BitmapLayerProps } from "deck.gl";

export interface NumericDataPaintLayerProps extends BitmapLayerProps {
  colormap_image: string | Texture;
  min: number;
  max: number;
  timestamp: number;
  tileSize: number;
}
