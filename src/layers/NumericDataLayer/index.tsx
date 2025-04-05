import {
  CompositeLayer,
  Layer,
  LayersList,
  LayerContext,
  GetPickingInfoParams,
} from "deck.gl";
import type { BitmapLayerPickingInfo } from "@deck.gl/layers";
import type { Texture } from "@luma.gl/core";

import { NumericDataPaintLayer } from "../NumericDataPaintLayer";
import type { NumericDataLayerProps, NumericDataPickingInfo } from "./types";

export default class NumericDataLayer extends CompositeLayer<NumericDataLayerProps> {
  static layerName: string = "numeric-data-layer";

  initializeState(context: LayerContext): void {
    const { tileSize, textureParameters } = this.props;
    const dataTexture = context.device.createTexture({
      data: this.props.imageData,
      format: "r32float",
      width: tileSize,
      height: tileSize,
      sampler: {
        minFilter: "linear",
        magFilter: "linear",
        mipmapFilter: "linear",
        addressModeU: "clamp-to-edge",
        addressModeV: "clamp-to-edge",
        ...textureParameters,
      },
    });
    this.setState({
      dataTexture,
    });
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
