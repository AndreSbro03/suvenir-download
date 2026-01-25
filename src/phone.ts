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
  }

  async init() {
    const loader = new GLTFLoader();
    const glb = await loader.loadAsync(this.path);
    const scale = this.initScale;
    this.model = glb.scene;
    this.model.scale.set(scale, scale, scale);
    this.model.position.set(this.initXPos, this.initYPos, 0);
    this.model.rotation.set(0, this.initYRot, this.initZRot);
    this.screenObj = this.findScreenObj()
  }

  findScreenObj() {
    let screenObj;
    // Traverse meshes
    for (const child of this.model.children) {
      child.traverse(async (mesh) => {
        if (!mesh.isMesh) return;
        if (mesh.name === "Screen_Wallpaper_0") {
          screenObj = mesh;
          mesh.material = await this.generateScreenMaterial("../assets/suvenir_screen.jpg");
        }
      });
    }
    return screenObj;
  }

  addGlassOnScreen() {
    // Glass layer
    const glass = mesh.clone();
    glass.material = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      thickness: 0.02,
      roughness: 0.05,
      metalness: 0,
      envMapIntensity: 0.3,
      transparent: true,
    });
    glass.position.z += 0.001;
    mesh.parent.add(glass);

  }

  async generateScreenMaterial(path:String){
    const texture = await new THREE.TextureLoader().loadAsync(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({
      map: texture,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: texture,
      emissiveIntensity: 0.1,
      roughness: 0.6,
      metalness: 0.0,
    });
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

  move(phase, time) {
    // console.log(phase, time);
    this.anim = false;
    if(!this.modelRotationWhenMoved) this.modelRotationWhenMoved = this.model.rotation.y;
    switch (phase) {
      case Phase.MAIN:
        this.moveToMiddle(time); 
      break;

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
