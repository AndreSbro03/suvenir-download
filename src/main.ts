
import './style.css'

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181818);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 500);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true,
});

const width = window.innerWidth;
const height = window.innerHeight;
renderer.setSize(width, height);
camera.aspect = width / height;
camera.updateProjectionMatrix();
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.setZ(80);

let corrPath = 0;
const texturesPaths = [
"../assets/suvenir_screen.jpg",
"../assets/back.jpg",
]

/* ---------- Material async helper ---------- */
async function generateScreenMaterial(path:String){
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

async function getCorrScreen() {
  const path = texturesPaths[corrPath % texturesPaths.length];
  corrPath += 1;
  return await generateScreenMaterial(path);
}

/* ---------- Main async setup ---------- */
async function init() {

  // Load glb
  const loader = new GLTFLoader();
  const glb = await loader.loadAsync("../assets/iphone_12_pro.glb");
  const model = glb.scene;
  const scale = 0.4;
  const initYRot = 0.6;
  const initXPos = -22;
  let screenObj;

  model.scale.set(scale, scale, scale);
  model.position.set(initXPos, -20, 0);
  model.rotation.y = initYRot;
  model.rotation.z = 0.1;
  scene.add(model);

  // Load EXR environment
  const exl = new EXRLoader();
  exl.load("../assets/brown_photostudio_02_4k.exr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.LinearSRGBColorSpace;
    scene.environmentIntensity = 0.3;
    scene.environment = texture;
  });

  // Traverse meshes
  for (const child of model.children) {
    child.traverse(async (mesh) => {
      if (!mesh.isMesh) return;

      if (mesh.name === "Screen_Wallpaper_0") {
        screenObj = mesh;
        mesh.material = await getCorrScreen();

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
    });
  }

  // Lights
  const keyLight = new THREE.DirectionalLight(0xffffff, 1);
  keyLight.position.set(-10, 2, 30);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1);
  rimLight.position.set(-10, 5, -10);
  scene.add(rimLight);

  return { model, screenObj, initYRot, initXPos };
}

/* ---------- Animate ---------- */
async function main() {
  const { model, screenObj, initYRot } = await init();

  const radV = 0.001;
  let dir = 1;

  function animate() {
    requestAnimationFrame(animate);

    // Optional rotation
    if(model.rotation.y > 0.8) dir = -1;
    else if(model.rotation.y < -0.4) dir = +1;
    // model.rotation.y += dir * radV;

    renderer.render(scene, camera);
  }

  // Scroll interaction
  function move() {
    const t = document.body.getBoundingClientRect().top;
    model.rotation.y = initYRot + t * radV * -4;
    if (model.rotation.y > Math.PI && model.rotation.y < Math.PI + 0.4 && screenObj) {
      getCorrScreen().then(mat => {
        screenObj.material = mat;
      });
    }
  }

  document.body.onscroll = move;
  animate();
}

main();
