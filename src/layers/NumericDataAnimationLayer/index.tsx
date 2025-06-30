import { CompositeLayer, Layer, LayersList } from "deck.gl";
import type { CompositeLayerProps, UpdateParameters } from "deck.gl";
import type { Texture } from "@luma.gl/core";

import { NumericDataAnimationPaintLayer } from "../NumericDataAnimationPaintLayer";
import type { NumericDataAnimationLayerProps } from "./types";

const textureDefaultOption = {
  format: "r32float" as const,
  dimension: "2d" as const,
};

const textureSamplerDefaultOption = {
  minFilter: "linear" as const,
  magFilter: "linear" as const,
  mipmapFilter: "linear" as const,
  addressModeU: "clamp-to-edge" as const,
  addressModeV: "clamp-to-edge" as const,
};

export default class NumericDataAnimationLayer extends CompositeLayer<NumericDataAnimationLayerProps> {
  static layerName: string = "numeric-data-animation-layer";
  updateState(
    params: UpdateParameters<
      Layer<NumericDataAnimationLayerProps & Required<CompositeLayerProps>>
    >
  ): void {
    const { props, oldProps, context } = params;
    const { imageDataFrom, imageDataTo } = props;
    const { imageDataFrom: oldImageDataFrom, imageDataTo: oldImageDataTo } =
      oldProps;
    if (imageDataFrom !== oldImageDataFrom && imageDataTo !== oldImageDataTo) {
      const { tileSize, textureParameters } = props;
      const dataTextureFrom = context.device.createTexture({
        data: this.props.imageDataFrom,
        width: tileSize,
        height: tileSize,
        ...textureDefaultOption,
        sampler: {
          ...textureSamplerDefaultOption,
          ...textureParameters,
        },
      });
      const dataTextureTo = context.device.createTexture({
        data: this.props.imageDataTo,
        width: tileSize,
        height: tileSize,
        ...textureDefaultOption,
        sampler: {
          ...textureSamplerDefaultOption,
          ...textureParameters,
        },
      });
      this.setState({
        dataTextureFrom,
        dataTextureTo,
      });
    }
  }

  renderLayers(): Layer | null | LayersList {
    return new NumericDataAnimationPaintLayer(this.props, {
      id: `${this.props.id}-data`,
      image: this.state.dataTextureFrom as Texture,
      imageTo: this.state.dataTextureTo as Texture,
    });
  }
}
