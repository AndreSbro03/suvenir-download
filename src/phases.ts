import * as THREE from 'three';

export enum Phase {
  MAIN = 0,
  SCROLL,
  MOVELEFT,
  STAY,
  ZOOM,
  DELETEINFO,
  PHONEOUT,
  SPACE,
  SIZE
}

export class Phases {

  constructor(){
    this.pageSize = window.innerHeight *0.8;
    this.numOfPages = Phase.SIZE;
    this.debugView = false;
  }

  init() {
    const pages = document.getElementsByClassName("page");
    if(pages.length !== Phase.SIZE) throw "The number of pages doesn't match the number of phases";
    ;
    console.log(pages);
    for(let i = 0; i < pages.length; i++){
      const page = pages[i];
      page.style.height = this.pageSize + "px";
      if(this.debugView){
      if(i % 2 == 0) page.style.backgroundColor = "#AA0000";
      else page.style.background = "#0000AA";
      }
    }
    /* If the device is in mobile view change the canvas from background to static */
    if(this.isMobile()) {
      const back = document.getElementById("bg");
      // back.style.zIndex = "";
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
    const scrollTop = window.scrollY;
    const phase = Math.floor(scrollTop / this.pageSize);
    return {phase, t: THREE.MathUtils.clamp((scrollTop % this.pageSize) / this.pageSize, 0, 1)};
  }

  isMobile() {
    return window.innerWidth < 768;
  }   

}


