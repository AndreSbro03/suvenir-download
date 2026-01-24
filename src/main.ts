
import './style.css'

import * as THREE from 'three';

import { Phone } from './phone.ts';
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

/* ---------- Main async setup ---------- */
async function init() {
  // Load EXR environment
  const exl = new EXRLoader();
  exl.load("../assets/brown_photostudio_02_4k.exr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.LinearSRGBColorSpace;
    scene.environmentIntensity = 0.3;
    scene.environment = texture;
  });

  // Lights
  const keyLight = new THREE.DirectionalLight(0xffffff, 1);
  keyLight.position.set(-10, 2, 30);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1);
  rimLight.position.set(-10, 5, -10);
  scene.add(rimLight);

}

/* ---------- Animate ---------- */
async function main() {
  await init();

  let phone = new Phone();
  await phone.init();
  phone.addToScene(scene);


  function animate() {
    requestAnimationFrame(animate);
    phone.animate();
    renderer.render(scene, camera);
  }

  function getScrollProgress(){
    const scrollTop = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    return THREE.MathUtils.clamp(scrollTop / maxScroll, 0, 1);
  }

  // Scroll interaction
  function move() {
    const t = getScrollProgress();  
    phone.move(t);
  }

  document.body.onscroll = move;
  animate();
}

main();
