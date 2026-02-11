import { Phases } from '/src/phases.ts';

export class SavedSpace {
  container: HTMLElement | null;
  text: HTMLElement | null;
  obj: HTMLElement | null;
  containerText: HTMLElement | null;
  startAnimation: boolean;
  counter: number;
  phases: Phases;

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

  animate(){
    if(this.obj && this.startAnimation){
      // 1. Calcolo dell'interpolazione (Easing)
      // La distanza tra il valore attuale e il target si riduce gradualmente
      let dist = this.stopCounter - this.counter;

      if (dist > 0.1) { 
        this.counter += dist * this.easing;
      } else {
        this.counter = this.stopCounter; // Forza il valore finale preciso
      }

      // 2. Formattazione e "Throttling" visivo
      // Usiamo Math.floor per evitare decimali che ballano e creano sfocatura
      const displayValue = Math.floor(this.counter);
      if(this.containerText) this.containerText.innerHTML = this.prettyString(displayValue); 
      if(this.text) this.text.classList.add("show");
    }
  }

  move(phase:String, _time:number){
    if(phase === "saved-space") {
      this.startAnimation = true;
    }
  }
}
