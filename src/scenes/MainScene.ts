import Phaser from "phaser";
import { IPosition } from "../types/position.interface";
import Card from "./Card";

// this.sys.game.config

const ROWS = 2;
const COLS = 5;
const CARDS = [1, 2, 3, 4, 5];
const TIMEOUT = 3;
const VOLUME = 0.1;

export default class MainScene extends Phaser.Scene {
  private cards: Card[] = [];
  private openedCard: Card | null = null;
  private openedPairs = 0;
  public timeoutText: Phaser.GameObjects.Text;
  public timeout = TIMEOUT;
  public sounds: Record<string, Phaser.Sound.BaseSound>;

  constructor() {
    super("main");
  }

  preload(): void {
    this.load.image("bg", "assets/background.png");
    this.load.image("card", "assets/card.png");
    this.load.image("card1", "assets/card1.png");
    this.load.image("card2", "assets/card2.png");
    this.load.image("card3", "assets/card3.png");
    this.load.image("card4", "assets/card4.png");
    this.load.image("card5", "assets/card5.png");

    this.load.audio("theme", "assets/sounds/theme.mp3");
    this.load.audio("card", "assets/sounds/card.mp3");
    this.load.audio("complete", "assets/sounds/complete.mp3");
    this.load.audio("success", "assets/sounds/success.mp3");
    this.load.audio("timeout", "assets/sounds/timeout.mp3");
  }

  create(): void {
    this.createTimer();
    this.createSounds();
    this.createBackground();
    this.createText();
    this.createCards();
    this.start();
  }

  createSounds(): void {
    this.sounds = {
      theme: this.sound.add("theme"),
      card: this.sound.add("card"),
      complete: this.sound.add("complete"),
      success: this.sound.add("success"),
      timeout: this.sound.add("timeout"),
    };

    this.sounds.theme.play({ volume: 0.05 });
  }

  createTimer(): void {
    this.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      callbackScope: this,
      loop: true,
    });
  }

  onTimerTick(): void {
    this.timeoutText.setText("Time: " + this.timeout);

    if (this.timeout <= 0) {
      this.sounds.timeout.play({ volume: VOLUME });
      this.start();
    } else {
      --this.timeout;
    }
  }

  createText(): void {
    this.timeoutText = this.add.text(8, 340, `Time: ${this.timeout}`, {
      font: "32px Arial",
    });
  }

  start(): void {
    this.timeout = TIMEOUT;
    this.openedCard = null;
    this.openedPairs = 0;
    this.initCards();
  }

  initCards(): void {
    const positions = this.getCardsPositions();

    this.cards.forEach((card) => {
      const position = positions.pop();
      card.close();
      card.setPosition(position?.x, position?.y);
    });
  }

  createBackground(): void {
    this.add.sprite(0, 0, "bg").setOrigin(0, 0);
  }

  createCards(): void {
    for (const cardIdx of CARDS) {
      for (let i = 0; i < 2; i++) {
        this.cards.push(new Card(this, cardIdx));
      }
    }

    this.input.on("gameobjectdown", this.onCardClicked, this);
  }

  onCardClicked(pointer: unknown, card: Card): void {
    if (card.isOpened) {
      return;
    }

    this.sounds.card.play({ volume: VOLUME });

    if (this.openedCard) {
      if (this.openedCard.value === card.value) {
        // Картинки одинаковые, запомнить
        this.openedCard = null;
        this.openedPairs++;
        this.sounds.success.play({ volume: VOLUME });
      } else {
        // Картинки разные, закрыть
        this.openedCard.close();
        this.openedCard = card;
      }
    } else {
      this.openedCard = card;
    }
    card.open();

    if (this.openedPairs === this.cards.length / 2) {
      this.sounds.complete.play({ volume: VOLUME });
      this.start();
    }
  }

  getCardsPositions(): IPosition[] {
    const cardTexture = this.textures.get("card").getSourceImage();
    const cardWidth = cardTexture.width + 4;
    const cardHeight = cardTexture.height + 4;
    const positions: IPosition[] = [];

    const offSetX =
      ((this.sys.game.config.width as number) - cardWidth * COLS) / 2 +
      cardWidth / 2;
    const offSetY =
      ((this.sys.game.config.height as number) - cardHeight * ROWS) / 2 +
      cardHeight / 2;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        positions.push({
          x: col * cardWidth + offSetX,
          y: row * cardHeight + offSetY,
        });
      }
    }

    return Phaser.Utils.Array.Shuffle(positions);
  }
}
