import type { BitmapLayerProps } from "deck.gl";

export interface NumericDataAnimationPaintLayerProps extends BitmapLayerProps {
  colormap_image: string | Texture;
  min: number;
  max: number;
  step: number;
  tileSize: number;
  imageTo: Texture;
}
