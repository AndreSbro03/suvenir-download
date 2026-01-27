import { Phases } from '/src/phases.ts';

export class SavedSpace {


  constructor(phases:Phases) {
    this.container = null;
    this.info = null;
    this.containerText = null;
    this.startAnimation = false;
    this.counter = 0;
    this.stopCounter = 2.3 * 1_000_000_000;
    this.easing = 0.01;
    this.phases = phases;
    const parent = document.getElementById("saved-space");
    this.text = document.getElementById("saved-space-info");
    this.obj = document.getElementById("saved-space-box");
    this.containerText = document.getElementById("byte-text");
  }

  prettyString(value) {
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
      this.containerText.innerHTML = this.prettyString(displayValue); 

      this.text.classList.add("show");
    }
  }

  move(phase, time){
    if(phase === "saved-space") {
      this.startAnimation = true;
    }
  }
}
