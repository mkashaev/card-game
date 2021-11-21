import Phaser from "phaser";
import { IPosition } from "../types/position.interface";
import Card from "./Card";

// this.sys.game.config

const ROWS = 2;
const COLS = 5;
const CARDS = [1, 2, 3, 4, 5];
const TIMEOUT = 60; // Seconds
const VOLUME = 0.1;

export default class MainScene extends Phaser.Scene {
  private cards: Card[] = [];
  private openedCard: Card | null = null;
  private openedPairs = 0;
  public timeoutText: Phaser.GameObjects.Text;
  public timeout = TIMEOUT;
  public sounds: Record<string, Phaser.Sound.BaseSound>;
  public positions: IPosition[];

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

  createTimer(): void {
    this.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      callbackScope: this,
      loop: true,
    });
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

  createBackground(): void {
    this.add.sprite(0, 0, "bg").setOrigin(0, 0);
  }

  createText(): void {
    this.timeoutText = this.add.text(8, 340, `Time: ${this.timeout}`, {
      font: "32px Arial",
    });
  }

  createCards(): void {
    for (const cardIdx of CARDS) {
      for (let i = 0; i < 2; i++) {
        this.cards.push(new Card(this, cardIdx));
      }
    }

    this.input.on("gameobjectdown", this.onCardClicked, this);
  }

  onTimerTick(): void {
    this.timeoutText.setText("Time: " + this.timeout);

    if (this.timeout <= 0) {
      this.time.paused = true;
      this.sounds.timeout.play({ volume: VOLUME });
      this.restart();
    } else {
      --this.timeout;
    }
  }

  start(): void {
    // this.timeout = TIMEOUT;
    // this.openedCard = null;
    // this.openedPairs = 0;
    // this.initCards();
    this.initCardsPositions();
    this.timeout = TIMEOUT;
    this.openedCard = null;
    this.openedPairs = 0;
    this.time.paused = false;
    this.initCards();
    this.showCards();
  }

  showCards(): void {
    this.cards.forEach((card: Card) => {
      card.depth = card.position.delay || 100;
      card.move({
        x: card.position.x,
        y: card.position.y,
        delay: card.position.delay || 100,
      });
    });
  }

  restart(): void {
    let count = 0;
    const onCardMoveComplete = () => {
      ++count;
      if (count >= this.cards.length) {
        this.start();
      }
    };

    this.cards.forEach((card: Card) => {
      // card.depth = 1 / card.position.delay / 100;
      card.move({
        x: +this.sys.game.config.width + card.width,
        y: +this.sys.game.config.height + card.height,
        delay: card.position.delay || 100,
        callback: onCardMoveComplete,
      });
    });
  }

  initCards(): void {
    // const positions = this.getCardsPositions();
    const positions = Phaser.Utils.Array.Shuffle(this.positions);

    this.cards.forEach((card) => {
      card.init(positions.pop());
    });
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

    card.open(() => {
      if (this.openedPairs === this.cards.length / 2) {
        this.sounds.complete.play({ volume: VOLUME });
        this.start();
      }
    });
  }

  initCardsPositions(): void {
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

    let id = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        ++id;
        positions.push({
          x: col * cardWidth + offSetX,
          y: row * cardHeight + offSetY,
          delay: id * 100,
        });
      }
    }

    // return Phaser.Utils.Array.Shuffle(positions);
    this.positions = positions;
  }
}
