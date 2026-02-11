
import '/src/css/style.css';
import { Phases } from '/src/phases.ts';

import * as THREE from 'three';

import { Phone } from './phone.ts';
import { SavedSpace } from './savedSpace.ts';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';


const phases = new Phases();
const phone = new Phone(phases);
const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 500);
const canvas = document.querySelector('#bg') as HTMLElement;
if(!canvas) throw new Error("Canvas not found");


const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});

const delete_info = document.querySelector("#delete-info") as HTMLElement;
const app_info = document.querySelector("#app-info") as HTMLElement;


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
  resize();
 }

function resize() {
  let width = window.innerWidth; 
  let height =  window.innerHeight;

  if(phases.isMobile()){
    const par = document.getElementById("bg-par") as HTMLElement;
    if(!par) throw new Error("No par for bg found");
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
  await phone.init();
  phone.addToScene(scene); 

  if (!delete_info || !app_info) {
    throw new Error("Required elements missing");
  }

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
    if(!page || !t) return;

    console.log(page, t);
    phone.move(page, t);
    saved_space.move(page, t);


    if(page === "delete-info") {
      delete_info.style.display = "flex";
      delete_info.classList.add("show");
    }

    if(page === "app-info"){
      app_info.style.display = "flex";
      app_info.classList.add("show");
    }
  }

  function resizePage() {
    console.log("resizing");
    phases.init();
    resize();
    phone.resize();
    
  }

  document.body.onscroll = move;
  document.body.onresize = resizePage;
  move();
  animate();
}

main();
