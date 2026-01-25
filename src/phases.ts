import * as THREE from 'three';

export enum Phase {
  MAIN = 0,
  SCROLL,
  MOVELEFT,
  ZOOM,
  DELETEINFO,
  PHONEOUT,
  SPACE,
  SPACEANIMATION,
  SIZE
}

export class Phases {

  constructor(){
    this.pageSize = window.innerHeight;
    this.numOfPages = Phase.SIZE;
  }

  init() {
    const body = document.body;
    body.style.height = (this.pageSize * this.numOfPages + window.innerHeight) + "px";
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

}


