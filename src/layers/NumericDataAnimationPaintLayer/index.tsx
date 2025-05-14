import { BitmapLayer } from "deck.gl";

import type { Texture } from "@luma.gl/core";
import type { ShaderModule } from "@luma.gl/shadertools";

import type { NumericDataAnimationPaintLayerProps } from "./types";

const uniformBlock = `\
  uniform ndUniforms {
    float min;
    float max;
    float step;
  } nd;
`;

export type NDProps = {
  min: number;
  max: number;
  step: number;
  colormap_texture: Texture;
  image_to: Texture;
};

const numericDataAnimationUniforms = {
  name: "nd",
  vs: uniformBlock,
  fs: uniformBlock,
  // @?: not float data?
  uniformTypes: {
    min: "f32",
    max: "f32",
    step: "f32",
  },
} as const satisfies ShaderModule<NDProps>;

const defaultProps = {
  ...BitmapLayer.defaultProps,
  min: 0,
  max: 0,
  tileSize: 256,
  step: 0.0,
  imageData: [],
  imageTo: [],
  colormap_image: {
    type: "image",
    value: null,
    async: true,
  },
};

export class NumericDataAnimationPaintLayer extends BitmapLayer<NumericDataAnimationPaintLayerProps> {
  static layerName = "numeric-paint-animation-layer";
  static defaultProps = defaultProps;

  getShaders() {
    return {
      ...super.getShaders(),
      inject: {
        "fs:#decl": `
          uniform sampler2D colormap_texture; // texture is not included in ubo
          uniform sampler2D image_to; 
        `,
        "fs:DECKGL_FILTER_COLOR": `
          float start_value = color.r;
          vec4 end_image = texture(image_to, geometry.uv);
          float end_value = end_image.r;
          float value = mix(start_value, end_value, nd.step);
            if (isnan(value)) {
              discard;
            } else {
              float normalized = (value - nd.min)/(nd.max - nd.min);
              vec4 color_val = texture(colormap_texture, vec2(normalized, 0.));
              color = color_val;
            }
          `,
      },
      modules: [...super.getShaders().modules, numericDataAnimationUniforms],
    };
  }

  // @ts-expect-error no opts type available
  draw(opts) {
    const { colormap_image, imageTo, step, min, max } = this.props;

    const sModels = super.getModels();
    if (colormap_image)
      for (const m of sModels) {
        m.shaderInputs.setProps({
          nd: {
            colormap_texture: colormap_image,
            image_to: imageTo,
            step,
            min,
            max,
          },
        });
      }
    super.draw({ ...opts });
  }
}
