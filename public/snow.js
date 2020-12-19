//SOURCE => https://codepen.io/tksiiii/pen/MRjWzv
import { Texture, Geometry, Vector3, PointsMaterial, Points, FloatType } from 'https://unpkg.com/three@0.123.0/build/three.module.js';

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

    const texture = new Texture(canvas);
    texture.type = FloatType;
    texture.needsUpdate = true;
    return texture;
}

const pointGeometry = new Geometry();
for (let i = 0; i < particleAmt; i++) {
    const x = Math.floor(Math.random() * maxRange - minRange);
    const y = Math.floor(Math.random() * maxRange - minRange);
    const z = Math.floor(Math.random() * maxRange - minRange);
    const particle = new Vector3(x, y, z);
    pointGeometry.vertices.push(particle);
}

const pointMaterial = new PointsMaterial({
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
    const particle = new Vector3(x, y, z);
    velocities.push(particle);
}

var particles = new Points(pointGeometry, pointMaterial);
particles.geometry.velocities = velocities;

export { particles, maxRange, minRange };