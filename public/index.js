import * as THREE from 'https://unpkg.com/three@0.123.0/build/three.module.js';
const scene = new THREE.Scene();

import { OrbitControls } from 'https://unpkg.com/three@0.123.0/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://unpkg.com/three@0.123.0/examples/jsm/libs/dat.gui.module.js'
import { GLTFExporter } from 'https://unpkg.com/three@0.123.0/examples/jsm/exporters/GLTFExporter.js'
import { GLTFLoader } from 'https://unpkg.com/three@0.123.0/examples/jsm/loaders/GLTFLoader.js'

import Ornament from '/ornament.js';
import Tree from '/tree.js';
import Light from '/light.js';

const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMappingExposure = 1.0;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color('lightblue');

//INIT CAMERA CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);

controls.maxPolarAngle = Math.PI * (100/180);
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

function onMouseMove(event) {
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
    undo: undoOrnament,
    delete: deleteOrnament,
    export: exportOrnaments,
    import: function() {
        document.getElementById('file-loader').click();
    },
};

const gui = new GUI();
gui.add(params, 'radius', 1, 10, 0.1).name('Ornament Radius').onChange(tracerUpdate).addResizeHandle;
gui.addColor(params, 'color').name('Ornament Color');
gui.add(params, 'shape', ['Circle', 'Cube']).name('Ornament Shape').onChange(tracerUpdate);
gui.add(params, 'undo').name('Undo Ornament');
gui.add(params, 'delete').name('Clear All Ornaments');
const folder1 = gui.addFolder('Export/Import');
folder1.add(params, 'export').name('Export (.glb)');
folder1.add(params, 'import').name('Import (.glb/.gltf)');

//RAYCAST OBJECTS
let raycastObjects = [];

//MAKE THE TREE
const tree = new Tree();
raycastObjects.push(tree.leaves, tree.trunk, tree.ground);
scene.add(tree.leaves, tree.trunk, tree.ground);

//ADD LIGHT
const light = new Light();
scene.add(light.lights);

scene.traverse(object => {
    if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
    }
});

//ADD SNOW SOURCE => https://codepen.io/tksiiii/pen/MRjWzv
//I copied and pasted the snow code!! Sorry!
const particleAmt = 10000;
const maxRange = 1000
const minRange = maxRange / 2;

const drawRadialGradation = (ctx, canvasRadius, canvasW, canvasH) => {
    ctx.save();
    const gradient = ctx.createRadialGradient(canvasRadius, canvasRadius, 0, canvasRadius, canvasRadius, canvasRadius);
    gradient.addColorStop(0, 'rgba(255,255,255,1.0)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
}

const getTexture = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const diameter = 64.0;
    canvas.width = diameter;
    canvas.height = diameter;
    const canvasRadius = diameter / 2;

    drawRadialGradation(ctx, canvasRadius, canvas.width, canvas.height);

    const texture = new THREE.Texture(canvas);
    texture.type = THREE.FloatType;
    texture.needsUpdate = true;
    return texture;
}

const pointGeometry = new THREE.Geometry();
for (let i = 0; i < particleAmt; i++) {
    const x = Math.floor(Math.random() * maxRange - minRange);
    const y = Math.floor(Math.random() * maxRange - minRange);
    const z = Math.floor(Math.random() * maxRange - minRange);
    const particle = new THREE.Vector3(x , y, z);
    pointGeometry.vertices.push(particle);
}

const pointMaterial = new THREE.PointsMaterial({
    size: 4,
    color: 0xffffff,
    vertexColors: false,
    map: getTexture(),
    transparent: true,
    fog: true,
    depthWrite: false
})

const velocities = [];
for (let i = 0; i < particleAmt; i++) {
    const x = Math.floor(Math.random() * 6 - 3) * 0.1;
    const y = Math.floor(Math.random() * 10 + 3) * - 0.05;
    const z = Math.floor(Math.random() * 6 - 3) * 0.1;
    const particle = new THREE.Vector3(x, y, z);
    velocities.push(particle);
}

const particles = new THREE.Points(pointGeometry, pointMaterial);
particles.geometry.velocities = velocities;
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

        const x = i * 3;
        const y = i * 3 + 1;
        const z = i * 3 + 2;

        const velX = Math.sin(1 * 0.001 * velocity.x) * 0.1;
        const velZ = Math.cos(1 * 0.0015 * velocity.z) * 0.1;

        vertex.x += velX;
        vertex.y += velocity.y;
        vertex.z += velZ;

        if (vertex.y < -minRange) {
            vertex.y = minRange;
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

//EXPORT SCENE
const exporter = new GLTFExporter();
const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);
function exportOrnaments() {
    exporter.parse(ornamentArray, result => {
        if (result instanceof ArrayBuffer) {
            link.href = URL.createObjectURL(new Blob([result], { type: 'application/octet-stream' }));
            link.download = 'ornaments.glb';
            link.click();
        }
    }, { binary: true });
}

//EVENT LISTENERS
window.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('click', onMouseClick, false);

window.addEventListener('touchstart', onTouchStart, {passive: false});
window.addEventListener('touchend', onTouchEnd, false);

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
        }, 1000);
    });
}

fileLoader.addEventListener('change', event => {
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
