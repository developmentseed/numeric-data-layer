import { BitmapLayer } from "deck.gl";

export default class TestLayer extends BitmapLayer {
  initializeState() {
    super.initializeState();
    this.setState({
      emptyTexture: this.context.device.createTexture({
        data: new Float32Array(4),
        width: 1,
        height: 1,
      }),
    });
  }
}
