import { SphereBufferGeometry, BoxBufferGeometry, MeshStandardMaterial, Mesh } from 'three';

class Ornament {
    constructor(radius, color, shape) {
        this.radius = radius;
        this.color = color;
        switch (shape) {
            case 'Circle':
                this.ornamentGeometry = new SphereBufferGeometry(radius, 50, 50);
                break;
            case 'Cube':
                this.ornamentGeometry = new BoxBufferGeometry(radius * 2, radius * 2, radius * 2);
                break;
            default:
                this.ornamentGeometry = new SphereBufferGeometry(radius, 50, 50);
                break;
        }
        this.ornamentMaterial = new MeshStandardMaterial({ color: color });
        this.ornamentObject = new Mesh(this.ornamentGeometry, this.ornamentMaterial);
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