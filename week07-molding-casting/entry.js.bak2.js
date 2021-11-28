import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Vector3,
  MeshStandardMaterial,
  Mesh,
  BoxGeometry,
  Geometry,
  DirectionalLight,
  SpotLight,
  MeshLambertMaterial,
  CylinderGeometry,
  BufferGeometry,
  AdditiveBlending,
  Points,
  PointsMaterial,
  TextureLoader,
  TorusGeometry,
  Audio,
  AudioLoader,
  AudioListener,
  AudioAnalyser,
  // Vector3
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
// import json from "./final.json";
import song from "./song.mp3";

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// const stats = new Stats();
let allfreqs = [];

const renderer = new WebGLRenderer({
  antialias: true,
});
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
// renderer.setClearColor(0xFF0000);
renderer.sortObjects = true;
document.body.appendChild(renderer.domElement);
// document.body.appendChild(stats.domElement);
camera.position.z = 270;
camera.position.y = 100;

const orbit = new OrbitControls(camera, renderer.domElement);
// create an AudioListener and add it to the camera

// spotlight
var spotLight = new SpotLight(0xffffff);
spotLight.position.set(0, 350, 0);
scene.add(spotLight);
// scene.add( directionalLight );
// spotlight
var spotLight = new SpotLight(0xffffff);
spotLight.position.set(200, 400, 300);
scene.add(spotLight);

const exporter = new STLExporter();

// camera
camera.position.set(6, 3, -10);
camera.lookAt(new Vector3(0, 0, 0));

const scale = (inputY, yRange, xRange) => {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const percent = (inputY - yMin) / (yMax - yMin);
  const outputX = percent * (xMax - xMin) + xMin;

  return outputX;
};

// renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff, 1);

// render loop
// const onAnimationFrameHandler = (timeStamp) => {
//   renderer.render(scene, camera);
//   controls.update();
//   window.requestAnimationFrame(onAnimationFrameHandler);
// };
// window.requestAnimationFrame(onAnimationFrameHandler);

// // resize
// const windowResizeHanlder = () => {
//   const { innerHeight, innerWidth } = window;
//   renderer.setSize(innerWidth, innerHeight);
//   camera.aspect = innerWidth / innerHeight;
//   camera.updateProjectionMatrix();
// };
// windowResizeHanlder();
// window.addEventListener("resize", windowResizeHanlder);

document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

function save(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

const startButton = document.createElement("button");
// playBtn.style.position = 'absolute';
document.body.appendChild(startButton);
startButton.addEventListener("click", init);

function init() {
  
  // console.log(array);
  const listener = new AudioListener();
  console.log("start");
  camera.add(listener);
  // create an Audio source
  const sound = new Audio(listener);

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new AudioLoader();

  let playing = false;
  audioLoader.load(song, function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
    sound.play();
    console.log("play");
    playing = true;
  });

  const analyser = new AudioAnalyser(sound, 32);
  // create an AudioAnalyser, passing in the sound and desired fftSize

  // get the average frequency of the sound
  // const data = analyser.getAverageFrequency();
  // console.log(data)
  let didStart = false;
  let startBuild = false;
  function render() {
    requestAnimationFrame(render);
;

    // // Update the particles
    analyser.getAverageFrequency();
    if (playing) {
      // console.log(analyser.data)
      // console.log(analyser.getAver/ageFrequency())
      const localData = Array.from(analyser.data);
      const average = localData.reduce((a, b) => a + b) / localData.length;
      const max = Math.max(...localData);
      const min = Math.max(...localData);
      // const average2 = localData.slice(4,8).reduce((a, b) => a + b) / localData.slice(4,8).length;
      // console.log(average);
      if (average > 0) {
        didStart = true;
        const newavg = average.slice;
        // console.log(localData);
        // console.log("it worked");
        allfreqs.push(min);
      }
      if (average == 0 && didStart == true && startBuild == false) {
        startBuild = true;
        buildVis(allfreqs);
      }
    }
    orbit.update();
    // stats.update();

    renderer.render(scene, camera);
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
    console.log("building vis", localData.flat());

    const allData = localData.flat().filter((num) => num != 0);
    // localData.flat()
    let allMeshes = [];
    for (var i = 0; i < allData.length; i++) {
      const play = allData[i];
      const newCount = scale(play, [0, 150], [1, 5]);
      // const geometry = new BoxGeometry(10, newCount, 3);
      // const geometry = new TorusGeometry(newCount, 10, 40, 100);
      const geometry = new CylinderGeometry(newCount, newCount, 0.2, 50);
      // var cylinderGeom = new CylinderGeometry(1, 1, 4, 16, 20, true);

      // const pos = geometry.attributes.position;
      // let v = new Vector3();
      // const a = 0.4; // asymmetrically
      // const b = -0.1;
      // for (let i = 0; i < pos.count; i++) {
      //   v.fromBufferAttribute(pos, i);
      //   pos.setZ(i, Math.abs(v.z) > 0.6 ? Math.sign(v.z) * 0.6 : v.z); // symmetrical
      //   // if ( v.z > a ) v.z = a;
      //   // if ( v.z < b ) v.z = b;
      //   // pos.setZ( i, v.z );
      // }

      geometry.translate(0, i * 0.2, 0);

      geometry.scale(0.5, 1, 0.5);
      const material = new MeshLambertMaterial({ color: 0xffff00 });
      const cube = new Mesh(geometry, material);
      // cube.position.set(0, 0, i);
      cube.scale.set(0.5, 1, 0.5);
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
      // geometry.setAttribute( 'position', mesh.position );
      geometries.push(geometry);
      scene.add(mesh);
    }
    const buff = BufferGeometryUtils.mergeBufferGeometries(geometries);
    const mesh = new Mesh(buff, mergedMaterial);
    const result = exporter.parse(mesh, { binary: true });
    save(new Blob([result], { type: "application/octet-stream" }), "test.stl");
  }
}
