
import '/src/css/style.css';
import { Phases } from '/src/phases.ts';

import * as THREE from 'three';

import { Phone } from './phone.ts';
import { SavedSpace } from './savedSpace.ts';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';


const phases = new Phases();
const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 500);
const canvas = document.querySelector('#bg');

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});

let delete_info;
let saved_space;
let app_info = document.getElementById("app-info");

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
  keyLight.position.set(-10, 10, 30);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1);
  rimLight.position.set(-10, 5, -10);
  scene.add(rimLight);

  let width = window.innerWidth; 
  let height =  window.innerHeight;

  if(phases.isMobile()){

    const par = document.getElementById("bg-par");
    const bouds = par.getBoundingClientRect();
    width = bouds.width;
    height = bouds.height;
  }

  const pixelRatio = window.devicePixelRatio; 
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(pixelRatio);
  camera.position.setZ(80);
}

async function main() {

  await init();

  let phone = new Phone(phases.isMobile());
  await phone.init();
  phone.addToScene(scene);

  let saved_space = new SavedSpace(phases);

  function animate() {
    requestAnimationFrame(animate);
    phone.animate();
    saved_space.animate();
    renderer.render(scene, camera);
  }

  // Scroll interaction
  function move() {
    const {page, t} = phases.getPhase();
    console.log(page, t);
    phone.move(page, t);
    saved_space.move(page, t);


    if(page === "delete-info" && !delete_info) {
      delete_info = document.querySelector("#delete-info");
      delete_info.style.display = "flex";
      delete_info.style.top = phases.getCorrPos()+'px';   
      delete_info.classList.add("show");
    }

    if(page === "app-info"){
      app_info.style.display = "flex";
      app_info.style.top = phases.getCorrPos()+"px";
      app_info.classList.add("show");
    }
  }

  document.body.onscroll = move;
  move();
  animate();
}

main();
