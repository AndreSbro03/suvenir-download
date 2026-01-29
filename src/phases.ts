import * as THREE from 'three';

export class Phases {

  constructor(){
    this.pageFactor = 0.8;
    if(this.isMobile()) this.pageFactor = 1.0;

    this.pageSize = window.innerHeight * this.pageFactor;
    this.debugView = false;
    this.pages = [];
    this.init();
  }

  init() {
    const pages = document.getElementsByClassName("page");
   
    let x = 0;
    for(let i = 0; i < pages.length; i++){
      const page = pages[i];

      if(this.isMobile() && page.classList.contains("transition")) {
        page.style.display = "none";
        continue;
      }

      this.pages.push(page.id);
      page.style.height = this.pageSize + "px";
      if(this.debugView){
      if(x % 2 == 0) page.style.backgroundColor = "#AA0000";
      else page.style.background = "#0000AA";
      }
      x++;
    }

    console.log(this.pages);
    /* If the device is in mobile view change the canvas from background to static */
    if(this.isMobile()) {
      const back = document.getElementById("bg");
      back.style.zIndex = "auto";
      back.style.position = "relative";
    }
    
  }

  getCorrPos() {
    // const halfWindowHeight = window.innerHeight / 2;
    // return window.scrollY + halfWindowHeight;
    const scrollTop = window.scrollY;
    const phase = Math.floor(scrollTop / this.pageSize);
    return phase * this.pageSize + this.pageSize * 0.5;
  }

  getPagePosition(page:Phase) {
    return page * this.pageSize + this.pageSize * 0.5;
  }

  getPhase() {
    const scrollTop = window.scrollY + window.innerHeight * 0.5;
    const phase = Math.floor(scrollTop / this.pageSize);
    const page = this.pages[phase];
    console.log({
      "page" : page,
      "phase" : phase,
      "scrollTop" : scrollTop,
      "pageSize" : this.pageSize,
    });
    return {page, t: THREE.MathUtils.clamp((scrollTop % this.pageSize) / this.pageSize, 0, 1)};
  }

  isMobile() {
    return window.innerWidth < 768;
  }   

}


