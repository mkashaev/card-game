import Phaser from "phaser";
// this.sys.game.config

export default class Card extends Phaser.GameObjects.Sprite {
  public value: number;
  public isOpened: boolean;

  constructor(scene: Phaser.Scene, value: number) {
    super(scene, 0, 0, "card");

    this.scene = scene;
    this.value = value;
    // this.setOrigin(0.5, 0.5);
    this.scene.add.existing(this);
    this.setInteractive();
    this.isOpened = false;

    // this.flip();

    // this.on("pointerdown", this.open, this);
  }

  open(): void {
    this.flip();
    this.setTexture(`card${this.value}`);
    this.isOpened = true;
  }

  flip(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      ease: "Linear",
      duration: 150,
      onComplete: () => this.show(),
    });
  }

  show(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      ease: "Linear",
      duration: 150,
    });
  }

  close(): void {
    this.setTexture("card");
    this.isOpened = false;
  }
}
