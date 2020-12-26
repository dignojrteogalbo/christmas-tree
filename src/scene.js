import { DirectionalLight, AmbientLight, HemisphereLight, ConeBufferGeometry, CylinderBufferGeometry, PlaneBufferGeometry, Mesh, MeshStandardMaterial, Group } from 'three';

const color = 0xffffff;
const light = new DirectionalLight(color, 1.2 * Math.PI);
light.position.set(0.5, 100, 0.866);
const light2 = new AmbientLight(color, 0.3);
const light3 = new HemisphereLight();

var lights = new Group();
lights.add(light);
lights.add(light2);
lights.add(light3);

lights.children[0].castShadow = true;

const leavesGeometry = new ConeBufferGeometry(5, 10, 50);
const leavesMaterial = new MeshStandardMaterial({ color: 0x2c493f });

const trunkGeometry = new CylinderBufferGeometry(2, 2, 2.5, 50);
const trunkMaterial = new MeshStandardMaterial({ color: 0xa56406 });

const leaves = new Mesh(leavesGeometry, leavesMaterial);
const trunk = new Mesh(trunkGeometry, trunkMaterial);

trunk.position.y -= 6;

const groundGeometry = new PlaneBufferGeometry(250, 250);
const groundMaterial = new MeshStandardMaterial({ color: 0xfffafa });
const ground = new Mesh(groundGeometry, groundMaterial);

ground.position.y -= 7;
ground.rotation.x -= Math.PI * 0.5;

var environment = new Group();
environment.add(leaves, trunk, ground);
environment.traverse(object => {
    object.castShadow = true;
    object.receiveShadow = true;
});

export { environment, lights };

