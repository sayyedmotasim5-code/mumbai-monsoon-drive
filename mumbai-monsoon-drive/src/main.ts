import * as THREE from "three";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bd5ff);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4.5, -12);

const clock = new THREE.Clock();

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x2f3d4d, 1.1);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
dirLight.position.set(-18, 24, 16);
scene.add(dirLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.35);
ambient.position.set(5, 8, 7);
scene.add(ambient);

const roadMaterial = new THREE.MeshStandardMaterial({
  color: 0x222222,
  roughness: 0.95,
  metalness: 0.15
});

const road = new THREE.Mesh(new THREE.BoxGeometry(50, 0.3, 420), roadMaterial);
road.position.y = -0.15;
road.position.z = -70;
scene.add(road);

const roadLeft = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 420), new THREE.MeshStandardMaterial({ color: 0x8b93a7 }));
roadLeft.position.set(-15, -0.05, -70);
scene.add(roadLeft);

const roadRight = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 420), new THREE.MeshStandardMaterial({ color: 0x8b93a7 }));
roadRight.position.set(15, -0.05, -70);
scene.add(roadRight);

const laneMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xf8f1a1 });
const laneMarkerGeometry = new THREE.BoxGeometry(0.15, 0.02, 3.5);

for (let i = -20; i <= 20; i += 4) {
  const marker = new THREE.Mesh(laneMarkerGeometry, laneMarkerMaterial);
  marker.position.set(0, 0.12, i * 5 - 90);
  scene.add(marker);
}

const sea = new THREE.Mesh(
  new THREE.BoxGeometry(180, 0.8, 420),
  new THREE.MeshStandardMaterial({ color: 0x1d75d3, roughness: 0.5, metalness: 0.15 })
);
sea.position.set(-80, -0.8, -70);
scene.add(sea);

const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x5e7387 });
for (let i = 0; i < 10; i++) {
  const mountain = new THREE.Mesh(new THREE.ConeGeometry(8 + Math.random() * 8, 20 + Math.random() * 14, 6), mountainMaterial);
  mountain.position.set(-45 + i * 11, 6 + Math.random() * 5, -150 - i * 10);
  mountain.rotation.z = Math.PI;
  scene.add(mountain);
}

const skylineMaterial = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.9 });
for (let i = 0; i < 24; i++) {
  const building = new THREE.Mesh(new THREE.BoxGeometry(3 + Math.random() * 3, 10 + Math.random() * 30, 3 + Math.random() * 3), skylineMaterial);
  building.position.set(22 + (i % 6) * 8, building.geometry.parameters.height / 2, -120 - Math.floor(i / 6) * 12);
  scene.add(building);
}

const player = new THREE.Group();

const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 3.4), new THREE.MeshStandardMaterial({ color: 0xff3f3f, emissive: 0x3b0b0b, metalness: 0.45, roughness: 0.45 }));
body.position.y = 0.7;
player.add(body);

const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 1.8), new THREE.MeshStandardMaterial({ color: 0xb3d7ff, transparent: true, opacity: 0.5 }));
cabin.position.set(0, 1.05, -0.2);
player.add(cabin);

const wheelGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 16);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 });
const wheelPositions = [
  [-0.9, 0.35, 1.1],
  [0.9, 0.35, 1.1],
  [-0.9, 0.35, -1.1],
  [0.9, 0.35, -1.1]
];

for (const [x, y, z] of wheelPositions) {
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(x, y, z);
  player.add(wheel);
}

player.position.set(0, 0.3, 18);
scene.add(player);

const traffic = [];

function createTrafficCar(color, x, z) {
  const car = new THREE.Group();
  const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 3), new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.4 }));
  bodyMesh.position.y = 0.7;
  car.add(bodyMesh);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 1.8), new THREE.MeshStandardMaterial({ color: 0xdce9ff, transparent: true, opacity: 0.52 }));
  roof.position.y = 1.05;
  car.add(roof);

  for (let i = 0; i < 4; i++) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    const offsets = [[-0.8, 0.36, 1.0], [0.8, 0.36, 1.0], [-0.8, 0.36, -1.0], [0.8, 0.36, -1.0]];
    wheel.position.set(offsets[i][0], offsets[i][1], offsets[i][2]);
    car.add(wheel);
  }

  car.position.set(x, 0.2, z);
  scene.add(car);
  traffic.push(car);
  return car;
}

for (let i = 0; i < 10; i++) {
  const lane = i % 3 === 0 ? -4.5 : i % 3 === 1 ? 0 : 4.5;
  const z = -100 - i * 18;
  createTrafficCar(Math.random() * 0xffffff, lane, z);
}

const landmarkGroup = new THREE.Group();
scene.add(landmarkGroup);

function addGatewayLikeArch() {
  const structure = new THREE.Group();
  const main = new THREE.Mesh(new THREE.BoxGeometry(2.8, 5.5, 0.9), new THREE.MeshStandardMaterial({ color: 0xf4c78d, roughness: 0.9 }));
  main.position.y = 2.7;
  structure.add(main);
  const top = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.4, 1.1), new THREE.MeshStandardMaterial({ color: 0xe9b866, roughness: 0.9 }));
  top.position.set(0, 5.1, 0);
  structure.add(top);
  structure.position.set(7, 0, -110);
  landmarkGroup.add(structure);
}

function addSeaLinkTower() {
  const tower = new THREE.Mesh(new THREE.BoxGeometry(1.2, 10, 1.2), new THREE.MeshStandardMaterial({ color: 0xb8c1cb, roughness: 0.8, metalness: 0.42 }));
  tower.position.set(-12, 5, -180);
  landmarkGroup.add(tower);
  const bridgeBar = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 0.8), new THREE.MeshStandardMaterial({ color: 0xcdd6df, roughness: 0.8, metalness: 0.6 }));
  bridgeBar.position.set(-12, 7.2, -180);
  landmarkGroup.add(bridgeBar);
}

function addMarineDriveLamps() {
  for (let i = 0; i < 8; i++) {
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 16), new THREE.MeshStandardMaterial({ color: 0xd4d9df, roughness: 0.8 }));
    lamp.position.set(16 + i * 3.5, 1.2, -34 - i * 7);
    landmarkGroup.add(lamp);
  }
}

addGatewayLikeArch();
addSeaLinkTower();
addMarineDriveLamps();

const rainCount = 1500;
const rainPositions = new Float32Array(rainCount * 3);
for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = (Math.random() - 0.5) * 80;
  rainPositions[i * 3 + 1] = Math.random() * 26 + 8;
  rainPositions[i * 3 + 2] = -200 + Math.random() * 280;
}

const rainGeometry = new THREE.BufferGeometry();
rainGeometry.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));

const rainMaterial = new THREE.PointsMaterial({ color: 0xa6c8ff, size: 0.18, transparent: true, opacity: 0.9 });

const rain = new THREE.Points(rainGeometry, rainMaterial);
rain.visible = false;
scene.add(rain);

let currentWeather = "sunny";
const hudSpeed = document.getElementById("speed") as HTMLDivElement;
const hudWeather = document.getElementById("weather") as HTMLDivElement;
const weatherSunnyButton = document.getElementById("weather-sunny") as HTMLButtonElement;
const weatherRainyButton = document.getElementById("weather-rainy") as HTMLButtonElement;
const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
const menu = document.getElementById("menu") as HTMLDivElement;

function setWeather(next) {
  currentWeather = next;
  hudWeather.textContent = `Weather: ${next === "sunny" ? "Sunny" : "Rainy"}`;
  weatherSunnyButton.classList.toggle("active", next === "sunny");
  weatherRainyButton.classList.toggle("active", next === "rainy");
  rain.visible = next === "rainy";
  if (next === "rainy") {
    scene.background = new THREE.Color(0x6d7d90);
    roadMaterial.color.set(0x1b1d22);
    dirLight.intensity = 0.8;
  } else {
    scene.background = new THREE.Color(0x9bd5ff);
    roadMaterial.color.set(0x222222);
    dirLight.intensity = 1.1;
  }
}

weatherSunnyButton.addEventListener("click", () => setWeather("sunny"));
weatherRainyButton.addEventListener("click", () => setWeather("rainy"));
startBtn.addEventListener("click", () => { menu.style.display = "none"; });

setWeather("sunny");

const activeKeys = {};

const handleKey = (event, pressed) => { const key = event.key.toLowerCase(); activeKeys[key] = pressed; };
window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("keyup", (event) => handleKey(event, false));

const mobileButtons = {
  accel: document.getElementById("accel"),
  left: document.getElementById("left"),
  right: document.getElementById("right"),
  brake: document.getElementById("brake")
};

function bindTouchButton(button, key) {
  if (!button) return;
  button.addEventListener("touchstart", (event) => { event.preventDefault(); activeKeys[key] = true; });
  button.addEventListener("touchend", (event) => { event.preventDefault(); activeKeys[key] = false; });
  button.addEventListener("touchcancel", (event) => { event.preventDefault(); activeKeys[key] = false; });
}

bindTouchButton(mobileButtons.accel, "arrowup");
bindTouchButton(mobileButtons.left, "arrowleft");
bindTouchButton(mobileButtons.right, "arrowright");
bindTouchButton(mobileButtons.brake, "arrowdown");

let speed = 0;

function updateVehicle(dt) {
  const accelerate = activeKeys["w"] || activeKeys["arrowup"];
  const brake = activeKeys["s"] || activeKeys["arrowdown"];
  const left = activeKeys["a"] || activeKeys["arrowleft"];
  const right = activeKeys["d"] || activeKeys["arrowright"];

  if (accelerate) speed += 36 * dt;
  else speed -= 22 * dt;
  if (brake) speed -= 44 * dt;
  speed = Math.max(0, Math.min(speed, 220));

  const steer = (left ? 1 : 0) - (right ? 1 : 0);
  player.rotation.y += steer * 1.2 * dt * (0.18 + speed / 220);
  const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
  player.position.addScaledVector(forward, -speed * dt * 0.05);

  player.position.x = THREE.MathUtils.clamp(player.position.x, -7.5, 7.5);
  const desiredCamera = player.position.clone().add(new THREE.Vector3(0, 4.6, -10).applyQuaternion(player.quaternion));
  camera.position.lerp(desiredCamera, 0.1);
  const lookAtTarget = player.position.clone().add(new THREE.Vector3(0, 0.8, 8).applyQuaternion(player.quaternion));
  camera.lookAt(lookAtTarget);

  hudSpeed.textContent = `Speed: ${Math.round(speed)} km/h`;
}

function updateTraffic(dt) {
  for (const vehicle of traffic) {
    vehicle.position.z += 18 * dt;
    if (vehicle.position.z > 18) {
      vehicle.position.z = -250 - Math.random() * 120;
      vehicle.position.x = [-4.5, 0, 4.5][Math.floor(Math.random() * 3)];
    }
  }
}

function updateRain(dt) {
  if (!rain.visible) return;
  const positions = rain.geometry.attributes.position;
  for (let i = 0; i < rainCount; i++) {
    positions.array[i * 3 + 1] -= 30 * dt;
    if (positions.array[i * 3 + 1] < 0) {
      positions.array[i * 3 + 1] = 18 + Math.random() * 26;
      positions.array[i * 3 + 0] = (Math.random() - 0.5) * 80;
      positions.array[i * 3 + 2] = -240 + Math.random() * 290;
    }
  }
  positions.needsUpdate = true;
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);
  updateVehicle(dt);
  updateTraffic(dt);
  updateRain(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

animate();
