import { DirectionalLight, AmbientLight, HemisphereLight, Group } from 'https://unpkg.com/three@0.123.0/build/three.module.js';

class Light {
    constructor(scene) {
        const color = 0xffffff;
        const light = new DirectionalLight(color, 1.2 * Math.PI);
        light.position.set(0.5, 100, 0.866);
        const light2 = new AmbientLight(color, 0.3);
        const light3 = new HemisphereLight();

        this.lights = new Group();
        this.lights.add(light);
        this.lights.add(light2);
        this.lights.add(light3);

        this.lights.children[0].castShadow = true;
    }
}

export default Light;