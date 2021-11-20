import Phaser from "phaser";
// this.sys.game.config

const OPEN_SPEED = 100; // milliseconds

export default class Card extends Phaser.GameObjects.Sprite {
  public value: number;
  public isOpened: boolean;

  constructor(scene: Phaser.Scene, value: number) {
    super(scene, 0, 0, "card");

    this.scene = scene;
    this.value = value;
    this.scene.add.existing(this);
    this.setInteractive();
    this.isOpened = false;
  }

  flip(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      ease: "Linear",
      duration: OPEN_SPEED,
      onComplete: () => this.show(),
    });
  }

  show(): void {
    const texture: string = this.isOpened ? "card" + this.value : "card";
    this.setTexture(texture);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      ease: "Linear",
      duration: OPEN_SPEED,
    });
  }

  open(): void {
    this.isOpened = true;
    this.flip();
  }

  close(): void {
    if (this.isOpened) {
      this.setTexture("card");
      this.isOpened = false;
      this.flip();
    }
  }
}
