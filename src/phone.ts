import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Phone {
  constructor() {
    this.path = "../assets/iphone_12_pro.glb";
    this.initScale = 0.4;
    this.initYRot = 0.6;
    this.initXPos = 22;
    this.radV = 0.001;
    this.dir = 1;
  }

  async init() {
    const loader = new GLTFLoader();
    const glb = await loader.loadAsync(this.path);
    const scale = this.initScale;
    this.model = glb.scene;
    this.model.scale.set(scale, scale, scale);
    this.model.position.set(this.initXPos, -20, 0);
    this.model.rotation.y = this.initYRot;
    this.model.rotation.z = 0.1;
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
    // Optional rotation
    if(this.model.rotation.y > 0.8) this.dir = -1;
    else if(this.model.rotation.y < -0.4) this.dir = +1;

    this.model.rotation.y += this.radV * this.dir;
  }

  move(time) {
    
    /* Spin until half of the height*/
    if(time < 0.5) {
      this.model.position.x = this.initXPos + THREE.MathUtils.lerp(0, this.initXPos * -2.5, time * 2);
    } else {
      const scale = THREE.MathUtils.lerp(this.initScale, 1, (time - 0.5) * 2);
      this.model.scale.set(scale, scale, scale);
    }
  }
}
