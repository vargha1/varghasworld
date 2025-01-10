import "./style.css"
import * as THREE from 'three';
import { OrbitControls, RoomEnvironment } from "three/examples/jsm/Addons.js";
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


// init scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1200);
camera.position.set(0, 0, 10)

// init renderer
const canvas = document.querySelector("canvas")!;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// create environment
const environment = new RoomEnvironment();
const pmremGenerator = new THREE.PMREMGenerator(renderer);

// apply environment map to the scene and dispose of the environment map
scene.environment = pmremGenerator.fromScene(environment).texture;
environment.dispose();
pmremGenerator.dispose();

// create lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

// init controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.screenSpacePanning = false;
controls.enableZoom = false;
controls.rotateSpeed = 0.3
controls.update()

function addStars() {
    const geometry = new THREE.SphereGeometry(0.15, 0.15, 0.15);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const starsMesh = new THREE.Mesh(geometry, mat)
    starsMesh.name = "rain";

    const [x, z] = Array(2).fill(0).map(() => THREE.MathUtils.randFloatSpread(400))
    const [y] = Array(1).fill(0).map(() => THREE.MathUtils.randFloatSpread(90))

    starsMesh.position.set(x, y, z);
    scene.add(starsMesh);
}

Array(1200).fill(0).forEach(addStars)

// Create a rectangular shape
const shape = new THREE.Shape();
shape.moveTo(-0.25, -1);
shape.lineTo(0.25, -1);
shape.lineTo(0.25, 1);
shape.lineTo(-0.25, 1);
shape.lineTo(-0.25, -1);

// Create a circular path
const radius = 12;
const segments = 100;
const path: THREE.CurvePath<THREE.Vector3> = new THREE.CurvePath();
const curve = new THREE.EllipseCurve(
    0, 0,            // center
    radius, radius,  // xRadius, yRadius
    0, 2 * Math.PI,  // startAngle, endAngle
    false            // clockwise
);

// Convert the curve to 3D points
const points = curve.getPoints(segments);
const vec3Points = points.map(p => new THREE.Vector3(p.x, 0, p.y));
path.add(new THREE.CatmullRomCurve3(vec3Points, true));

// Create the extruded geometry
const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 100,
    bevelEnabled: false,
    extrudePath: path.curves[0]
};

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const material = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    metalness: 0.3,
    roughness: 0.4,
    side: THREE.DoubleSide
});

const ring = new THREE.Mesh(geometry, material);

scene.add(ring);

// GSAP animation for camera movement
gsap.to(camera.position, {
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
    },
    x: 10,
    y: 10,
    z: 10,
    onUpdate: () => {
        camera.lookAt(scene.position);
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();