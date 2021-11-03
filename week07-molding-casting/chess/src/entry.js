import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Vector3,
  MeshStandardMaterial,
  Mesh,
  SpotLight,
  MeshLambertMaterial,
  CylinderGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

import peiceJSON from "./bishop.json";
import recording from "./bishop-final.mp3";

peiceJSON = peiceJSON.slice(1000);

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

let allfreqs = [];

const renderer = new WebGLRenderer({
  antialias: true,
});
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
renderer.sortObjects = true;
document.body.appendChild(renderer.domElement);
camera.position.z = 270;
camera.position.y = 100;

var spotLight = new SpotLight(0xffffff);
spotLight.position.set(200, 400, 300);
scene.add(spotLight);

const exporter = new STLExporter();
camera.position.set(6, 3, -10);
camera.lookAt(new Vector3(0, 0, 0));

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff, 1);

document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

const startButton = document.createElement("button");
document.body.appendChild(startButton);
startButton.addEventListener("click", init);

function init() {
  var snd = document.createElement("audio");
  snd.id = "audio-player";
  snd.controls = "controls";
  snd.src = recording;
  snd.type = "audio/mpeg";
  snd.crossOrigin = "anonymous";
  document.body.appendChild(snd);

  var ctx = new AudioContext();
  var sourceNode = ctx.createMediaElementSource(snd);
  var oganalyser = ctx.createAnalyser();
  sourceNode.connect(oganalyser);
  oganalyser.connect(ctx.destination);
  var stuffarray = new Float32Array(oganalyser.fftSize);

  let didStart = false;
  let startBuild = false;
  let counter = 0;

  function render() {
    requestAnimationFrame(render);
    oganalyser.getFloatTimeDomainData(stuffarray);
    const localData = Array.from(stuffarray).filter((o) => o > 0);
    let average = 0;
    if (localData.length > 0)
      average = localData.reduce((a, b) => a + b) / localData.length;
    else average = 0;
    if (average > 0) {
      didStart = true;
      allfreqs.push(localData);
      counter++;
    }
    if (average == 0 && didStart == true && startBuild == false) {
      startBuild = true;
      console.log("download");
      buildVis(allfreqs);
      download(allfreqs, "json.txt", "text/plain");
    }
    renderer.render(scene, camera);
  }

  function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
  render();

  window.addEventListener(
    "resize",
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );

  function buildVis(localData) {
    const allData = localData.flat().filter((num) => num != 0);
    let allMeshes = [];
    for (var i = 0; i < peiceJSON.length; i++) {
      if (i % 100 != 0) continue;
      const play = allData[i];
      const oldRange = [0.001, 0.4];
      const newRange = [7, 19];
      const newCount = scale(play, oldRange, newRange);
      const geometry = new CylinderGeometry(newCount, newCount, 20, 50);
      geometry.translate(0, i / 100 + 1, 0);
      geometry.scale(0.5, 0.5, 0.5);
      const material = new MeshLambertMaterial({ color: 0xffff00 });
      const cube = new Mesh(geometry, material);
      cube.scale.set(0.5, 0.3, 0.5);
      allMeshes.push(cube);
    }

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
    const result = exporter.parse(mesh, { binary: true });
    save(new Blob([result], { type: "application/octet-stream" }), "test.stl");
  }
}

function scale(inputY, yRange, xRange) {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const percent = (inputY - yMin) / (yMax - yMin);
  const outputX = percent * (xMax - xMin) + xMin;
  return outputX;
}

function save(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
