import './style.css'

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181818);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth * 0.5 / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
})


const width = window.innerWidth * 0.5;
const height = window.innerHeight;

renderer.setSize(width, height);

camera.aspect = width / height;
camera.updateProjectionMatrix();
renderer.setPixelRatio(window.devicePixelRatio);

camera.position.setZ(30);

renderer.render( scene, camera );

/* DEFINE OBJECT IN THE SCENE */
const name = "Screen_Wallpaper_0";
const apple_logo = "Apple_Logo";

const meshLoader = new THREE.TextureLoader();
const texture = await meshLoader.loadAsync( '../assets/suvenir_screen.jpg' );
texture.colorSpace = THREE.SRGBColorSpace;

const loader = new GLTFLoader();
const glb = await loader.loadAsync( "../assets/iphone_12_pro.glb");

console.log("iPhone 12 Pro (https://skfb.ly/6WoUB) by DatSketch is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).")

const model = glb.scene;
const scale = 1;
    model.scale.set(scale, scale, scale);
    model.position.z = -58;
    model.position.y = -50;
    model.rotation.y = 0.6;
    model.rotation.z = 0.1;

    scene.add(model);
    glb.scene.traverse((child) => {

      if(child.name == "iPhone12_Pro") console.log(child);

      if(child.name == apple_logo) {
        child.children = [];
      }

      if (child.isMesh) {
        console.log("Mesh:", child.name);
        if(child.name == name) {
          child.material = new THREE.MeshBasicMaterial( { map:texture } );
        }
      }
    });

// scene.add(torus);

const light = new THREE.AmbientLight( 0xFFFFFF );
scene.add( light );

const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// const controls = new OrbitControls(camera, renderer.domElement);

const radV = 0.001;
let dir = 1;

/* GAME LOOP */
function animate() {
  requestAnimationFrame( animate );

  if(model.rotation.y > 0.8 ){
    dir = -1; 
  } 
  else if(model.rotation.y < -0.4){
    dir = +1;
  }

  model.rotation.y += dir * radV;

  // controls.update();
  renderer.render( scene, camera );

}

animate();
