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

import { NumericDataPaintLayer } from "../NumericDataPaintLayer";
import type { NumericDataLayerProps, NumericDataPickingInfo } from "./types";

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

export default class NumericDataLayer extends CompositeLayer<NumericDataLayerProps> {
  static layerName: string = "numeric-data-layer";
  initializeState(context: LayerContext): void {
    const { tileSize, textureParameters } = this.props;
    const dataTexture = context.device.createTexture({
      data: this.props.imageData,
      width: tileSize,
      height: tileSize,
      ...textureDefaultOption,
      sampler: {
        ...textureSamplerDefaultOption,
        ...textureParameters,
      },
    });
    this.setState({
      dataTexture,
    });
  }

  updateState(
    params: UpdateParameters<
      Layer<NumericDataLayerProps & Required<CompositeLayerProps>>
    >
  ): void {
    const { props, oldProps, context } = params;
    const { imageData } = props;
    const { imageData: oldImageData } = oldProps;
    if (imageData !== oldImageData) {
      const { tileSize, textureParameters } = props;
      const dataTexture = context.device.createTexture({
        data: imageData,
        width: tileSize,
        height: tileSize,
        ...textureDefaultOption,
        sampler: {
          ...textureSamplerDefaultOption,
          ...textureParameters,
        },
      });
      this.setState({
        dataTexture,
      });
    }
  }

  getPickingInfo(parmas: GetPickingInfoParams): NumericDataPickingInfo {
    const info = parmas.info as BitmapLayerPickingInfo;
    if (info.bitmap) {
      const [x, y] = info.bitmap.pixel;

      const index = y * this.props.tileSize + x;
      const dataValue = this.props.imageData.at(index);

      return {
        ...info,
        // @ts-expect-error need a proper method to determine which specific numeric type to return
        dataValue,
      };
    } else {
      return {
        ...info,
        dataValue: null,
      };
    }
  }

  renderLayers(): Layer | null | LayersList {
    return new NumericDataPaintLayer(this.props, {
      id: `${this.props.id}-data`,
      image: this.state.dataTexture as Texture,
    });
  }
}
