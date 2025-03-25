import { BitmapLayer, BitmapLayerProps } from "deck.gl";

import type { Texture } from "@luma.gl/core";
import type { ShaderModule } from "@luma.gl/shadertools";

const uniformBlock = `\
  uniform wozUniforms {
    float currentTime;
  } woz;
`;

export type WOZProps = {
  currentTime: number;
  colormap_texture: Texture;
};

const customPolygonUniforms = {
  name: "woz",
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    currentTime: "f32",
  },
} as const satisfies ShaderModule<WOZProps>;

const defaultProps = {
  ...BitmapLayer.defaultProps,
  colormap_image: {
    type: "image",
    value: null,
    async: true,
  },
};
// Define an interface for your custom state
interface TestLayerProps extends BitmapLayerProps {
  colormap_image: string | Texture;
}
export default class TestLayer extends BitmapLayer<TestLayerProps> {
  static layerName = "test-bitmap-layer";
  static defaultProps = defaultProps;

  getShaders() {
    return {
      ...super.getShaders(),
      inject: {
        "fs:#decl": `
            uniform sampler2D colormap_texture; 
            const float RED_SCALE = pow(255.0, 3.0);
            const float GREEN_SCALE = pow(255.0, 2.0);
            const float BLUE_SCALE = pow(255.0, 1.0);
            const float MAX_ENCODED_VALUE = RED_SCALE + GREEN_SCALE + BLUE_SCALE;

            float getDecodedValue(vec4 color) {
              float rValue = color.r * RED_SCALE;
              float gValue = color.g * GREEN_SCALE;
              float bValue = color.b * BLUE_SCALE;
              return (rValue + gValue + bValue) / MAX_ENCODED_VALUE;
            }
         `,
        "fs:DECKGL_FILTER_COLOR": `
            if (color.a > 0.) {
              float value = getDecodedValue(color);
              vec4 bitmapColor = texture(colormap_texture, vec2(value, 0.0));
              color = bitmapColor;
            }
        `,
      },
      modules: [...super.getShaders().modules, customPolygonUniforms],
    };
  }
  // @ts-expect-error no opts type available
  draw(opts) {
    const { colormap_image } = this.props;
    const sModels = super.getModels();

    if (colormap_image)
      for (const m of sModels) {
        m.shaderInputs.setProps({
          woz: {
            colormap_texture: colormap_image,
          },
        });
      }
    super.draw({ ...opts });
  }
}
