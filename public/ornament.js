import * as THREE from 'https://unpkg.com/three@0.123.0/build/three.module.js';

class Ornament {
    constructor(radius, color, shape) {
        this.radius = radius;
        this.color = color;
        switch (shape) {
            case 'Circle':
                this.ornamentGeometry = new THREE.SphereGeometry(radius, 50, 50);
                break;
            case 'Cube':
                this.ornamentGeometry = new THREE.BoxGeometry(radius * 2, radius * 2, radius * 2);
                break;
            default:
                this.ornamentGeometry = new THREE.SphereGeometry(radius, 50, 50);
                break;
        }
        this.ornamentMaterial = new THREE.MeshStandardMaterial({ color: color });
        this.ornamentObject = new THREE.Mesh(this.ornamentGeometry, this.ornamentMaterial);
        this.ornamentObject.name = "ornament";
    }
    
    get geometry() {
        return this.ornamentGeometry;
    } 

    get material() {
        return this.ornamentMaterial;
    }

    get object() {
        return this.ornamentObject;
    }
}

export default Ornament;