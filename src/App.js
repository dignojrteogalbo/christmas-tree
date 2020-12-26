import React from 'react';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import Ornament from './ornament.js';
import { environment, lights } from './scene.js';
import { particles, maxRange, minRange } from './snow.js';
import './App.css';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = { publish: false };
  }

  componentDidMount() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 1000);
    const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;
    this.mount.appendChild(renderer.domElement);

    scene.background = new THREE.Color('lightblue');

    //INIT CAMERA CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.maxPolarAngle = Math.PI * (100 / 180);
    controls.minDistance = 5.5;
    controls.maxDistance = 30;

    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.DOLLY
    };
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY
    };

    camera.position.set(0, 0, 25);
    camera.updateMatrix();
    controls.update();

    //MOUSE RAYCASTER
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    raycaster.params.Points.threshold = 0.1;

    let mouseDetected = false;

    const onMouseMove = (event) => {
      event.preventDefault();

      mouseDetected = true;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    //GUI
    const params = {
      radius: 3,
      color: 0xff0000,
      shape: 'Circle',
      name: '',
      undo: undoOrnament,
      delete: deleteOrnament,
      export: exportOrnaments,
      import: () => { document.getElementById('file-loader').click() },
      publish: () => { 
        saveImage();
        toggleVisible();
      } 
    }

    const gui = new GUI({autoPlace: false});
    this.mount.appendChild(gui.domElement);
    gui.domElement.id = 'gui';
    
    gui.add(params, 'radius', 1, 10, 0.1).name('Radius').onFinishChange(tracerUpdate);
    gui.addColor(params, 'color').name('Color');
    gui.add(params, 'shape', ['Circle', 'Cube']).name('Shape').onChange(tracerUpdate);
    gui.add(params, 'undo').name('Undo');
    gui.add(params, 'delete').name('Clear All');

    const folder1 = gui.addFolder('Export/Import File');
    folder1.add(params, 'name').name('Name');
    folder1.add(params, 'export').name('Export (.glb)');
    folder1.add(params, 'import').name('Import (.glb/.gltf)');

    gui.add(params, 'publish').name('Publish Tree');

    const toggleVisible = () => {
      if (this.mount.style.display !== 'none') {
        this.mount.style.display = 'none';
      } else {
        this.mount.style.display = 'block';
      }
    }

    //SETUP SCENE, LIGHTS, AND SNOW
    let raycastObjects = [];

    scene.add(lights);
    scene.add(environment);
    scene.traverse(object => {
      if (object.isMesh) {
        raycastObjects.push(object);
      }
    });
    scene.add(particles);

    //EVENT FUNCTIONS
    function onMouseClick(event) {
      event.preventDefault();
      addOrnament();
    }

    const touchPos = new THREE.Vector2(0, 0);

    function onTouchStart(event) {
      touchPos.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      touchPos.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(touchPos, camera);
      leavesRaycast = raycaster.intersectObjects(raycastObjects);
      addOrnament();
    }

    function onTouchEnd() {
      touchPos.x = -10000;
      touchPos.y = -10000;
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    //UNDO ORNAMENT
    let ornamentArray = [];
    function undoOrnament() {
      if (ornamentArray.length > 0) {
        let lastOrnament = ornamentArray[ornamentArray.length - 1];
        lastOrnament.geometry.dispose();
        lastOrnament.material.dispose();
        scene.remove(lastOrnament);
        ornamentArray.splice(ornamentArray.length - 1, 1);
      }
    }

    //DELETE ORNAMENTS
    function deleteOrnament() {
      ornamentArray.forEach(element => {
        element.geometry.dispose();
        element.material.dispose();
        scene.remove(element);
      });
      ornamentArray = [];
    }

    //ADD ORNAMENT
    function addOrnament() {
      if (leavesRaycast.length > 0) {
        let ornament = new Ornament(params.radius * 0.15, params.color, params.shape);
        ornamentArray.push(ornament.object);
        scene.add(ornament.object);
        ornament.object.position.copy(leavesRaycast[0].point);
        ornament.object.castShadow = true;
        ornament.object.receiveShadow = true;
      }
    }

    //TRACER
    let tracerGeometry = new THREE.SphereGeometry(params.radius * 0.15, 50, 50);
    const tracerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
    let tracer = new THREE.Mesh(tracerGeometry, tracerMaterial);
    scene.add(tracer);

    let leavesRaycast = null;

    function tracerUpdate() {
      scene.remove(tracer);
      let ornament = new Ornament(params.radius * 0.15, 0xffffff, params.shape);
      tracerGeometry = ornament.geometry;
      tracer = new THREE.Mesh(tracerGeometry, tracerMaterial);
      scene.add(tracer);
    }

    //ANIMATE
    function animate() {
      camera.updateMatrixWorld();

      const posArr = particles.geometry.vertices;
      const velArr = particles.geometry.velocities;

      posArr.forEach((vertex, i) => {
        const velocity = velArr[i];

        const velX = Math.sin(100 * 0.001 * velocity.x) * 0.1;
        const velZ = Math.cos(100 * 0.0015 * velocity.z) * 0.1;

        vertex.x += velX;
        vertex.y += velocity.y;
        vertex.z += velZ;

        if (vertex.y < -minRange) {
          vertex.y = minRange;
        }

        if (vertex.x > minRange || vertex.x < -minRange) {
          vertex.x = Math.floor(Math.random() * maxRange - minRange);
        }
        if (vertex.z > minRange || vertex.z < -minRange) {
          vertex.z = Math.floor(Math.random() * maxRange - minRange);
        }
      })

      particles.geometry.verticesNeedUpdate = true;

      if (mouseDetected) {
        raycaster.setFromCamera(mouse, camera);
        leavesRaycast = raycaster.intersectObjects(raycastObjects);

        if (leavesRaycast.length > 0) {
          tracer.position.copy(leavesRaycast[0].point);
        }
      }

      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    //SCREENSHOT
    function saveImage() {
      let img = document.createElement('img');
      img.id = 'snapshot';
      const strMime = 'image/jpeg';
      try {
        tracer.visible = false;
        renderer.render(scene, camera);
        let imgData = renderer.domElement.toDataURL(strMime);
        img.src = imgData;
        document.getElementById('frame').appendChild(img);
        tracer.visible = true;
      } catch(e) {
        console.log(e);
        return;
      }
    }

    //EXPORT SCENE
    const exporter = new GLTFExporter();

    const onprogress = document.createElement('div');
    onprogress.id = 'onprogress';
    this.mount.appendChild(onprogress);

    function exportOrnaments() {
      let link = document.createElement('a');
      exporter.parse(ornamentArray, result => {
        if (result instanceof ArrayBuffer) {
          if (params.name !== '') {
            document.body.appendChild(link);

            link.href = URL.createObjectURL(new Blob([result], { type: 'application/octet-stream' }));
            link.download = `${params.name}.glb`;
            link.click();

            document.body.removeChild(link);
          }
        }
      }, { binary: true });
    }

    //EVENT LISTENERS
    const canvas = document.getElementsByTagName('canvas')[0];

    canvas.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click', onMouseClick, false);

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, false);

    //IMPORT SCENE
    const loader = new GLTFLoader();
    const fileLoader = document.getElementById('file-loader');

    function addObjects(group) {
      group.children.forEach(child => {
        setTimeout(() => {
          if (child.isMesh) {
            ornamentArray.push(child);
            scene.add(child);
            child.castShadow = true;
            child.receiveShadow = true;
          }
        }, 500);
      });
      setTimeout(() => {
        onprogress.style.display = 'none';
      }, 1000);
    }

    fileLoader.addEventListener('change', event => {
      onprogress.style.display = 'block';
      let file = event.target.files[0];
      let reader = new FileReader();

      reader.readAsArrayBuffer(file);

      reader.onload = event => {
        loader.parse(event.target.result, '', gltf => {
          addObjects(gltf.scene);
        },
        err => {
          console.log(err);
        });
      };

      fileLoader.value = '';
    });

    window.addEventListener('resize', onWindowResize, false);
    animate();
  }

  render() {
    return (
      <div id="App" ref={ ref => (this.mount = ref) }/>
    );
  }
} 