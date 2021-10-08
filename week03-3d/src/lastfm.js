import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Vector3,
  MeshStandardMaterial,
  Mesh,
  SpotLight,
  MeshLambertMaterial,
  TorusGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import json from "./final.json";

const scene = new Scene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

var spotLight = new SpotLight(0xffffff);
spotLight.position.set(200, 400, 300);
scene.add(spotLight);

const exporter = new STLExporter();

// camera
camera.position.set(6, 3, -10);
camera.lookAt(new Vector3(0, 0, 0));

let allMeshes = [];
for (var i = 0; i < json.plays.length; i++) {
  const play = json.plays[i];
  const newCount = scale(play.count, [0, 1000], [1, 9]);
  const geometry = new TorusGeometry(newCount, 10, 40, 100);
  const pos = geometry.attributes.position;
  let v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    pos.setZ(i, Math.abs(v.z) > 0.6 ? Math.sign(v.z) * 0.6 : v.z);
  }
  geometry.translate(0, i, 0);
  geometry.scale(0.5, 0.5, 0.5);
  const material = new MeshLambertMaterial({ color: 0xffff00 });
  const cube = new Mesh(geometry, material);
  cube.scale.set(0.5, 0.5, 0.5);
  allMeshes.push(cube);
}

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff, 1);

const onAnimationFrameHandler = (timeStamp) => {
  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

const windowResizeHanlder = () => {
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
windowResizeHanlder();
window.addEventListener("resize", windowResizeHanlder);

document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

const outMesh = mergeMeshes();
const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

const result = exporter.parse(outMesh, { binary: true });
save(new Blob([result], { type: "application/octet-stream" }), "test.stl");

function save(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function mergeMeshes() {
  const geometries = [];
  const materials = [];
  const mergedMaterial = new MeshStandardMaterial();

  for (const mesh of allMeshes) {
    const geometry = mesh.geometry.clone();
    materials.push(mesh.material);
    geometry.applyMatrix(mesh.matrix);
    console.log(geometry.position);
    geometries.push(geometry);
    scene.add(mesh);
  }
  const buff = BufferGeometryUtils.mergeBufferGeometries(geometries);
  const mesh = new Mesh(buff, mergedMaterial);
  return mesh;
}

const scale = (inputY, yRange, xRange) => {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const percent = (inputY - yMin) / (yMax - yMin);
  const outputX = percent * (xMax - xMin) + xMin;
  return outputX;
};
