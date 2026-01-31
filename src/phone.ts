import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Phone {
  constructor(phases:Phases) {
    this.phases = phases;
    this.path = "../assets/iphone_12_pro.glb";
    this.dir = 1;
    this.anim = false;
    this.texturesPaths = [];
    this.frames = 255;
    for(let i = 1; i <= this.frames; i++){
      this.texturesPaths.push(this.getFramePath(i));
    }
    this.corrFrame = 0;
    this.updateFrame = 0.1;
    this.scrolling = true;
  }

  async init() {
    const loader = new GLTFLoader();
    const glb = await loader.loadAsync(this.path);
    this.model = glb.scene;
    this.screenMat = this.findScreenMat();
    this.screenTextures = {};
    await this.preloadScreens(this.texturesPaths);
    this.generateScreenMaterial(this.getFramePath(1));
    this.resize();
  }

  resize() {
    this.leaveInitXPos = -1 * this.initXPos;
    this.initScale = 0.45;
    this.initYRot = -0.6;
    this.initZRot = 0;
    this.initXPos = 25;
    this.initYPos = -22;
    this.rotLimits = {"l" : 0.1, "r": -0.5};
    this.radV = 0.001;
    if(this.phases.isMobile()){
      this.initYRot = 0;
      this.initZRot = 0;
      this.initXPos = 0;
      this.initYPos = -22;
      this.initScale = 0.45;
      this.rotLimits = {"l": 0.25, "r": -0.25};
      this.radV = 0.0005;
    } 
    const scale = this.initScale;
    this.model.scale.set(scale, scale, scale);
    this.model.position.set(this.initXPos, this.initYPos, 0);
    this.model.rotation.set(0, this.initYRot, this.initZRot);
  }

  getFramePath(frame:int){
    return "/assets/frames/ezgif-frame-" + frame.toString().padStart(3, '0') + ".jpg";
  }
  
  async preloadScreens(paths) {
    const loader = new THREE.TextureLoader();
    await Promise.all(
      paths.map(async (p) => {
        const tex = await loader.loadAsync(p);
        tex.colorSpace = THREE.SRGBColorSpace;
        this.screenTextures[p] = tex;
      })
    );
  }


  findScreenMat() {
    let material;
    this.model.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
        materials.forEach((mat) => {
          if (!mat) return;
          if (mat.name.toLowerCase() === "wallpaper") {
            console.log("Found screen material");
            mat.emissive = new THREE.Color(0xffffff);
            mat.emissiveIntensity = 0.3;
            material = mat;
            return;
          }
        });
    });
    return material;
  }

  generateScreenMaterial(i){
    const tex = this.screenTextures[i];
    if (!tex) return;

    this.screenMat.map = tex;
    this.screenMat.emissiveMap = tex;
    this.screenMat.needsUpdate = true; 
  }

  addToScene(scene) {
    scene.add(this.model);
  }

  animate() {
    if(this.anim) {
      if(this.model.rotation.y > this.rotLimits["l"]) this.dir = -1;
      else if(this.model.rotation.y < this.rotLimits["r"]) this.dir = +1;

      this.model.rotation.y += this.radV * this.dir;
    }
    if(this.scrolling) {
      const frame = Math.ceil(this.corrFrame) % this.frames;
      this.generateScreenMaterial(this.getFramePath(frame));
      this.corrFrame += this.updateFrame
    }
  }

  /*
  moveToMiddle(t) {
    this.model.position.x = THREE.MathUtils.lerp(this.initXPos, 0, t);
    this.model.rotation.z = THREE.MathUtils.lerp(this.initZRot, 0, t);
    this.model.rotation.y = THREE.MathUtils.lerp(this.modelRotationWhenMoved, 0, t);
  }

  async scroll(t){
    const frame = Math.ceil(THREE.MathUtils.lerp(1, this.frames, t * 0.5));
    await this.generateScreenMaterial(this.getFramePath(frame));
  }
  */

  moveToLeft(t) {
    /** Prev changes **/

    /** New changes **/
    this.model.position.x = THREE.MathUtils.lerp(this.initXPos, this.initXPos * -1, t);
    this.model.rotation.y = THREE.MathUtils.lerp(this.initYRot, this.initYRot * -1, t);
  }

  zoom(t) {
    /** Prev changes **/
    this.moveToLeft(1);
      
    /** New changes **/
    this.model.rotation.z = THREE.MathUtils.lerp(0, 0.6, t);
    const scale = THREE.MathUtils.lerp(this.initScale, 1, t);
    this.model.scale.set(scale, scale, scale);
  }

  moveOut(t) {
    /** Prev changes **/
    this.zoom(1); 

    /** New changes **/
    this.model.position.x = this.leaveInitXPos + THREE.MathUtils.lerp(0, -50, t);
    const scale = THREE.MathUtils.lerp(1, this.initScale, t);
    this.model.scale.set(scale, scale, scale);
  }

 

  async move(phase, time) {
    this.anim = false;
    let _time = time;
    switch (phase) {
      case "phone-out":
        this.moveOut(_time);
      break;

      case "zoom":
        this.zoom(_time);
        this.leaveInitXPos = this.model.position.x;
      break;

      case "move-left":
        // this.scrolling = false;
        this.moveToLeft(_time);
      break;

      case "main":
        // this.anim = true;
        // if(!this.mobileView) this.scrolling = true;
        // await this.generateScreenMaterial(this.getFramePath(1));
        break;

      default:
        if(phase == "") return;
        const prev = this.phases.getClosestTransitionPage(phase);
        console.log("Didn't found " + phase + " executing " + prev);
        this.move(prev, 1);
        break;
    }

  }
}
