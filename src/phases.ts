import * as THREE from 'three';

export class Phases {

  debugView: boolean = false;
  pages: HTMLElement[] = [];

  constructor(){
    this.init();
  }

  init() {
    this.pages = [];
    const pages = document.getElementsByClassName("page");
   
    let x = 0;
    for(let i = 0; i < pages.length; i++){
      const page = pages[i];
      if (!(page instanceof HTMLElement)) continue;

      if(this.isMobile() && page.classList.contains("transition")) {
        page.style.display = "none";
        continue;
      }

      page.style.display = "flex";
      this.pages.push(page);
      if(this.debugView){
      if(x % 2 == 0) page.style.backgroundColor = "#AA0000";
      else page.style.background = "#0000AA";
      }
      x++;
    }
  
    
    // for(let i = 0; i < this.pages.length; i++){
    //    console.log(this.pages[i].getBoundingClientRect());
    //}

    /* If the device is in mobile view change the canvas from background to static */
    const back = document.getElementById("bg");
    if(!back) throw new Error('Background not found');
    if(this.isMobile()) {
      back.style.zIndex = "auto";
      back.style.position = "relative";
    }
    else {
      back.style.zIndex = "-1";
      back.style.position = "fixed";
    }

    const descr = document.getElementsByClassName("app-description");
    for(let i = 0; i < descr.length; i++){
      descr[i].innerHTML = "Dive into your gallery to relive moments, organize your memories, and delete the photos and videos that no longer serve you.\
        Suvenir is fast, secure and easy to use.";
    }
  
    /*
    const cloud = document.getElementById("cloud");
    const di = document.getElementById("delete-info");
    const pos = window.scrollY + di.getBoundingClientRect().top + (di.getBoundingClientRect().height - cloud.getBoundingClientRect().height) * 0.5; 
    cloud.style.top = pos + "px";
    console.log(cloud, pos);
    */
    
  }

  getPhase() {
    const pointer = window.innerHeight * 0.5;
    for(let i = 0; i < this.pages.length; i++){
      const page = this.pages[i];
      const pageBoundries = page.getBoundingClientRect();
      if(pointer < pageBoundries.y + pageBoundries.height){
        const relPos = pointer - pageBoundries.y;
        const t = THREE.MathUtils.clamp(relPos / pageBoundries.height, 0, 1);
        return {"page": page.id, t};
      }
    }
    return {};
  }
 
  getClosestTransitionPage(pageId:string) : string {
    let prev = "";
    for(let i = 0; i < this.pages.length; i++){
      const corr_page = this.pages[i]; 
      if(corr_page.classList.contains("transition")){
        prev = corr_page.id;
      }
      if(corr_page.id === pageId){
        break;
      }
    }
    return prev;
  }

  isMobile() {
    // return window.innerWidth < 768;
    return window.innerWidth < 1025;
  }   

}


