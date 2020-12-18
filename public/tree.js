import { ConeGeometry, CylinderGeometry, PlaneGeometry, Mesh, MeshStandardMaterial } from 'https://unpkg.com/three@0.123.0/build/three.module.js';

class Tree {
    constructor() {
        const leavesGeometry = new ConeGeometry(5, 10, 50);
        const leavesMaterial = new MeshStandardMaterial({ color: 0x2c493f });

        const trunkGeometry = new CylinderGeometry(2, 2, 2.5, 50);
        const trunkMaterial = new MeshStandardMaterial({ color: 0xa56406 });

        const leaves = new Mesh(leavesGeometry, leavesMaterial);
        const trunk = new Mesh(trunkGeometry, trunkMaterial);

        trunk.position.y -= 6;

        this.leaves = leaves;
        this.trunk = trunk;

        const groundGeometry = new PlaneGeometry(250, 250);
        const groundMaterial = new MeshStandardMaterial({ color: 0xfffafa });
        const ground = new Mesh(groundGeometry, groundMaterial);

        ground.position.y -= 7;
        ground.rotation.x -= Math.PI * 0.5;

        this.ground = ground;
    }
}

export default Tree;