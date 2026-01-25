import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Phase } from '/src/phases.ts';

export class Phone {
  constructor() {
    this.path = "../assets/iphone_12_pro.glb";
    this.initScale = 0.45;
    this.initYRot = -0.6;
    this.initZRot = -0.1;
    this.initXPos = 22;
    this.initYPos = -22;
    this.leaveInitXPos = -1 * this.initXPos;
    this.radV = 0.001;
    this.dir = 1;
    this.anim = true;
    this.modelRotationWhenMoved = 0;
    this.texturesPaths = [];
    const frames = 60;
    for(let i = 1; i <= 60; i++){
      this.texturesPaths.push(this.getFramePath(i));
    }
  }

  async init() {
    const loader = new GLTFLoader();
    const glb = await loader.loadAsync(this.path);
    const scale = this.initScale;
    this.model = glb.scene;
    this.model.scale.set(scale, scale, scale);
    this.model.position.set(this.initXPos, this.initYPos, 0);
    this.model.rotation.set(0, this.initYRot, this.initZRot);
    this.screenMat = this.findScreenMat();
    this.screenTextures = {};
    await this.preloadScreens(this.texturesPaths);
    this.generateScreenMaterial(this.getFramePath(1));
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

  async generateScreenMaterial(i){
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
      if(this.model.rotation.y > 0.4) this.dir = -1;
      else if(this.model.rotation.y < -0.4) this.dir = +1;

      this.model.rotation.y += this.radV * this.dir;

    }
  }

  moveToMiddle(t) {
    this.model.position.x = THREE.MathUtils.lerp(this.initXPos, 0, t);
    this.model.rotation.z = THREE.MathUtils.lerp(this.initZRot, 0, t);
    this.model.rotation.y = THREE.MathUtils.lerp(this.modelRotationWhenMoved, 0, t);
  }

  moveToLeft(t) {
    this.model.position.x = THREE.MathUtils.lerp(0, this.initXPos * -1, t);
    this.model.rotation.z = THREE.MathUtils.lerp(0, -1 * this.initZRot, t);

  }

  zoom(t) {
    const scale = THREE.MathUtils.lerp(this.initScale, 1, t);
    this.model.scale.set(scale, scale, scale);
  }

  moveOut(t) {
    this.model.position.x = this.leaveInitXPos + THREE.MathUtils.lerp(0, -50, t);
    const scale = THREE.MathUtils.lerp(1, this.initScale, t);
    this.model.scale.set(scale, scale, scale);
  }

  getFramePath(frame:int){
    return "/assets/frames/ezgif-frame-0" + frame.toString().padStart(2, '0') + ".jpg";
  }

  async scroll(t){
    const numberOfFrame = 60;
    const frame = Math.ceil(THREE.MathUtils.lerp(1, numberOfFrame, t * 0.5));
    await this.generateScreenMaterial(this.getFramePath(frame));

  }

  async move(phase, time) {
    // console.log(phase, time);
    this.anim = false;
    if(!this.modelRotationWhenMoved) this.modelRotationWhenMoved = this.model.rotation.y;
    switch (phase) {
      case Phase.MAIN:
        await this.generateScreenMaterial(this.getFramePath(1));
      this.moveToMiddle(time); 
      break;

      case Phase.SCROLL:
        this.scroll(time);
      break

      case Phase.MOVELEFT:
        this.moveToLeft(time);
      break;

      case Phase.ZOOM:
        this.zoom(time);
      this.leaveInitXPos = this.model.position.x;
      break; 

      case Phase.PHONEOUT:
        this.moveOut(time);
      break;

      default:
        break;
    }

  }
}
