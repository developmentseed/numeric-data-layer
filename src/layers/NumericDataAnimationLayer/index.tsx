import {
  CompositeLayer,
  Layer,
  LayersList,
  LayerContext,
  GetPickingInfoParams,
} from "deck.gl";
import type { CompositeLayerProps, UpdateParameters } from "deck.gl";
import type { BitmapLayerPickingInfo } from "@deck.gl/layers";
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

  // initializeState(context: LayerContext): void {
  //   const { tileSize, textureParameters } = this.props;
  //   const dataTextureStart = context.device.createTexture({
  //     data: this.props.imageDataStart,
  //     width: tileSize,
  //     height: tileSize,
  //     ...textureDefaultOption,
  //     sampler: {
  //       ...textureSamplerDefaultOption,
  //       ...textureParameters,
  //     },
  //   });
  //   const dataTextureEnd = context.device.createTexture({
  //     data: this.props.imageDataEnd,
  //     width: tileSize,
  //     height: tileSize,
  //     ...textureDefaultOption,
  //     sampler: {
  //       ...textureSamplerDefaultOption,
  //       ...textureParameters,
  //     },
  //   });
  //   this.setState({
  //     dataTextureStart,
  //     dataTextureEnd,
  //   });
  // }
  updateState(
    params: UpdateParameters<
      Layer<NumericDataLayerProps & Required<CompositeLayerProps>>
    >
  ): void {
    const { props, oldProps, context } = params;
    const { imageDataStart, imageDataEnd, timestamp } = props;
    const {
      imageDataStart: oldImageDataStart,
      imageDataEnd: oldImageDataEnd,
      timestamp: oldTimestamp,
    } = oldProps;
    if (
      imageDataStart !== oldImageDataStart &&
      imageDataEnd !== oldImageDataEnd
    ) {
      const { tileSize, textureParameters } = props;
      const dataTextureStart = context.device.createTexture({
        data: this.props.imageDataStart,
        width: tileSize,
        height: tileSize,
        ...textureDefaultOption,
        sampler: {
          ...textureSamplerDefaultOption,
          ...textureParameters,
        },
      });
      const dataTextureEnd = context.device.createTexture({
        data: this.props.imageDataEnd,
        width: tileSize,
        height: tileSize,
        ...textureDefaultOption,
        sampler: {
          ...textureSamplerDefaultOption,
          ...textureParameters,
        },
      });
      this.setState({
        dataTextureStart,
        dataTextureEnd,
      });
    }
  }

  renderLayers(): Layer | null | LayersList {
    return new NumericDataAnimationPaintLayer(this.props, {
      id: `${this.props.id}-data`,
      image: this.state.dataTextureStart as Texture,
      imageEnd: this.state.dataTextureEnd as Texture,
    });
  }
}
