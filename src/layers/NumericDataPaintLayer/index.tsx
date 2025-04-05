import { BitmapLayer } from "deck.gl";

import type { Texture } from "@luma.gl/core";
import type { ShaderModule } from "@luma.gl/shadertools";

import type { NumericDataPaintLayerProps } from "./types";

const uniformBlock = `\
  uniform ndUniforms {
    float min;
    float max;
  } nd;
`;

export type NDProps = {
  min: number;
  max: number;
  colormap_texture: Texture;
};

const numericDataUniforms = {
  name: "nd",
  vs: uniformBlock,
  fs: uniformBlock,
  // @?: not float data?
  uniformTypes: {
    min: "f32",
    max: "f32",
  },
} as const satisfies ShaderModule<NDProps>;

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
              float normalized = (value - nd.min)/(nd.max - nd.min);
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
          nd: {
            colormap_texture: colormap_image,
            min,
            max,
          },
        });
      }
    super.draw({ ...opts });
  }
}
