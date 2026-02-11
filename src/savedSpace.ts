import { Phases } from './phases.ts';

export class SavedSpace {
  container: HTMLElement | null;
  text: HTMLElement | null;
  obj: HTMLElement | null;
  containerText: HTMLElement | null;
  startAnimation: boolean;
  counter: number;
  phases: Phases;
  startTime: number | null = null;

  stopCounter: number = 2.3 * 1_000_000_000;
  easing: number = 0.01;

  constructor(phases:Phases) {
    this.container = null;
    this.startAnimation = false;
    this.counter = 0;
    this.phases = phases;
    this.text = document.getElementById("saved-space-info");
    this.obj = document.getElementById("saved-space-box");
    this.containerText = document.getElementById("byte-text");
  }

  prettyString(value:number) {
    if (value < 1000) return value + " B";
    if (value < 1000000) return (value / 1000).toFixed(1) + " KB";
    if (value < 1000000000) return (value / 1000000).toFixed(1) + " MB";
    return (value / 1000000000).toFixed(1) + " GB";
  }

animate(timestamp?: number) {
  if (!this.startAnimation || !this.obj) return;

  // If timestamp is not provided, use performance.now()
  if (timestamp === undefined) timestamp = performance.now();

  if (!this.startTime) this.startTime = timestamp;

  const elapsed = timestamp - this.startTime;
  const duration = 3000; // 3 seconds animation
  let progress = Math.min(elapsed / duration, 1);

  // Ease-out quadratic
  progress = 1 - (1 - progress) ** 2;

  // Current counter value
  this.counter = this.stopCounter * progress;

  // Update DOM
  const displayValue = Math.floor(this.counter);
  if (this.containerText && this.containerText.innerHTML !== this.prettyString(displayValue)) {
    this.containerText.innerHTML = this.prettyString(displayValue);
  }
  if (this.text) this.text.classList.add("show");

  // Continue animation
  if (progress < 1) {
    requestAnimationFrame(this.animate.bind(this));
  } else {
    this.counter = this.stopCounter;
  }
}

  move(phase:String, _time:number){
    if(phase === "saved-space") {
      requestAnimationFrame(this.animate.bind(this));
      this.startAnimation = true;
    }
  }
}
