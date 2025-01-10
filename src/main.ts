import "./style.css"
import * as THREE from 'three';
import { OrbitControls, RoomEnvironment } from "three/examples/jsm/Addons.js";
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
gsap.registerPlugin(ScrollTrigger);

// init scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1200);
camera.position.set(15, 1.2, 9);

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

const shape = new THREE.Shape();
shape.moveTo(-0.25, -1.25);
shape.lineTo(0.25, -1.25);
shape.lineTo(0.25, 1.25);
shape.lineTo(-0.25, 1.25);
shape.lineTo(-0.25, -1.25);

// Create an oval path with different x and z radius
const radiusX = 15; // Wider radius
const radiusZ = 10; // Shorter radius
const segments = 100;
const path: THREE.CurvePath<THREE.Vector3> = new THREE.CurvePath();
const curve = new THREE.EllipseCurve(
    0, 0,            // center
    radiusX, radiusZ,  // xRadius, zRadius
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
    color: 0xf6f6f6,
    metalness: 1,
    roughness: 0.25,
    side: THREE.DoubleSide
});

const ring = new THREE.Mesh(geometry, material);
scene.add(ring);

const loader = new FontLoader();
loader.load('RajdHani.json', function (font) {
    const textGeometry = new TextGeometry("Hi, my name is vargha\nand I'm a frontend developer\nwith experience in react, next js and three js.", {
        font: font,
        size: 0.3,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 5
    });

    const textGeometry2 = new TextGeometry("PotatoHut\nJungleJuice\n", {
        font: font,
        size: 0.3,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 5
    });

    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-10, 2, 0); // Adjust position as needed
    scene.add(textMesh);
    const textMesh2 = new THREE.Mesh(textGeometry2, textMaterial);
    textMesh2.position.set(0, 2, -5); // Adjust position as needed
    textMesh2.rotation.y = Math.PI
    scene.add(textMesh2);
});

// Create vectors for camera management
const cameraPosition = new THREE.Vector3();
const lookAtTarget = new THREE.Vector3();
const upVector = new THREE.Vector3(0, 1, 0);

// Calculate camera path parameters
const driverOffsetX = radiusX - 0.5;
const driverOffsetZ = radiusZ - 0.5;

// Create a container div for scroll content
const scrollContainer = document.createElement('div');
scrollContainer.style.height = '500vh'; // Make it 5 times the viewport height
scrollContainer.style.position = 'absolute';
scrollContainer.style.width = '100%';
scrollContainer.style.top = '0';
scrollContainer.style.left = '0';
document.querySelector("main")?.appendChild(scrollContainer);
ScrollTrigger.refresh();

// Create the scroll-based animation
gsap.to({}, {
    scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Smooth scrolling animation
        id: "scrollTrigger",
        onUpdate: (self) => {
            // Calculate the progress based on scroll position (0 to 1)
            const progress = self.progress;
            const angle = progress * Math.PI * 2;

            // Calculate camera position on oval path
            cameraPosition.set(
                Math.cos(angle) * driverOffsetX,
                1.2,
                Math.sin(angle) * driverOffsetZ
            );
            camera.position.copy(cameraPosition);

            // Calculate look-at point ahead on the oval
            const lookAheadAngle = angle + 0.2;
            lookAtTarget.set(
                Math.cos(lookAheadAngle) * driverOffsetX,
                1.2,
                Math.sin(lookAheadAngle) * driverOffsetZ
            );

            // Calculate banking angle based on curve and speed
            const bankAngle = Math.PI * 0.08 * (1 + Math.sin(angle * 2)) * 0.5;

            upVector.set(
                Math.cos(angle) * Math.sin(bankAngle),
                Math.cos(bankAngle),
                Math.sin(angle) * Math.sin(bankAngle)
            );

            // Apply the camera orientation
            camera.up.copy(upVector);
            camera.lookAt(lookAtTarget);
        }
    }
});

// Programmatically trigger scroll
gsap.delayedCall(0.01, () => {
    const trigger = ScrollTrigger.getById('scrollTrigger'); // Ensure your ScrollTrigger has an ID
    if (trigger) {
        const top: any = { top: 2 }
        // Smoothly scroll the window to simulate animation start
        gsap.to(window, {
            scrollTo: top,
            duration: 0.1,
            onComplete: () => ScrollTrigger.refresh(), // Refresh triggers
        });
    }
});

// Optional: Add content sections
const sections = [
    'Welcome to my portfolio Scroll to see more',
    'About me',
    'My projects',
    'Contact me<br/>Telegram: @Vargha11<br/>Email: vargha.rahavi@gmail.com'
];

sections.forEach((text, index) => {
    const section = document.createElement('div');
    section.style.height = `${100 + index * 35}vh`;
    section.style.display = 'flex';
    section.style.alignItems = 'center';
    section.style.justifyContent = 'center';
    section.style.color = 'white';
    section.style.fontSize = '2rem';
    section.style.fontFamily = 'Rajdhani, sans-serif';
    section.style.position = 'sticky';
    section.style.top = `${index * 3}`;
    section.innerHTML = text;
    scrollContainer.appendChild(section);
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