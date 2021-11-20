import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  scene: [MainScene],
};

export default new Phaser.Game(config);
