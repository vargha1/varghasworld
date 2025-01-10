
import * as THREE from 'three';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a ring geometry
const curve = new THREE.EllipseCurve(
    0, 0,            // Center x, y
    5, 5,            // x radius, y radius
    0, 2 * Math.PI,  // Start angle, end angle
    false,           // Clockwise
    0               // Rotation
);

const points = curve.getPoints(50);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const ring = new THREE.Line(geometry, material);

scene.add(ring);
camera.position.z = 10;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    ring.rotation.x += 0.01;
    ring.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});