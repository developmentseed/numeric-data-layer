import {
  CompositeLayer,
  BitmapLayer,
  BitmapLayerProps,
  Layer,
  LayersList,
  LayerContext,
  Attribute,
  GetPickingInfoParams,
} from "deck.gl";
import type { BitmapLayerPickingInfo } from "@deck.gl/layers";

import type { TypedArray, NumberDataType, Float32 } from "zarrita";
import type { Texture } from "@luma.gl/core";
import type { ShaderModule } from "@luma.gl/shadertools";

const uniformBlock = `\
  uniform wozUniforms {
    float min;
    float max;
  } woz;
`;

export type WOZProps = {
  min: number;
  max: number;
  colormap_texture: Texture;
};

const numericDataUniforms = {
  name: "woz",
  vs: uniformBlock,
  fs: uniformBlock,
  // @?: not float data?
  uniformTypes: {
    min: "f32",
    max: "f32",
  },
} as const satisfies ShaderModule<WOZProps>;

const defaultProps = {
  ...BitmapLayer.defaultProps,
  min: 0,
  max: 0,
  tileSize: 256,
  imageData: [],
  colormap_image: {
    type: "image",
    value: null,
    async: true,
  },
};

interface NumericDataPaintLayerProps extends BitmapLayerProps {
  colormap_image: string | Texture;
  min: number;
  max: number;
  tileSize: number;
}

interface NumericDataLayerProps extends NumericDataPaintLayerProps {
  imageData: TypedArray<NumberDataType>;
}

export type NumericDataPickingInfo = BitmapLayerPickingInfo & {
  dataValue: NumberDataType | null;
};
export class NumericDataPaintLayer extends BitmapLayer<NumericDataPaintLayerProps> {
  static layerName = "numeric-paint-layer";
  static defaultProps = defaultProps;

  initializeState() {
    super.initializeState();
  }

  getShaders() {
    return {
      ...super.getShaders(),
      inject: {
        "fs:#decl": `
          uniform sampler2D colormap_texture; // texture is not included in ubo
        `,
        "fs:DECKGL_FILTER_COLOR": `
          float value = color.r;
          vec3 pickingval = vec3(value, 0., 0.);
            if (isnan(value)) {
              discard;
            } else {
              float normalized = (value - woz.min)/(woz.max - woz.min);
              vec4 color_val = texture(colormap_texture, vec2(normalized, 0.));
              color = color_val;
            }
          `,
      },
      modules: [...super.getShaders().modules, numericDataUniforms],
    };
  }

  // @ts-expect-error no opts type available
  draw(opts) {
    const { colormap_image, min, max } = this.props;
    const sModels = super.getModels();
    if (colormap_image)
      for (const m of sModels) {
        m.shaderInputs.setProps({
          woz: {
            colormap_texture: colormap_image,
            min,
            max,
          },
        });
      }
    super.draw({ ...opts });
  }
}

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
