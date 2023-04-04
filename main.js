import * as th from 'three'
import GUI from 'lil-gui'
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import gsap from 'gsap'

// GLTF Loader
const gltfLoader = new GLTFLoader()


const setup = {
    fov: 35,
    width: window.innerWidth,
    height: window.innerHeight,
    canvas: document.querySelector('.webgl'),
    particleNumber: 1000,
    sectionHeight: 4,
    sectionsNumber: 2
}
const parallax = {
    x: 0,
    y: 0
}
const scroll = {
    y: 0
}
document.addEventListener('mousemove', (event) => {
    parallax.x = (event.clientX / setup.width) - .5
    parallax.y = (event.clientY / setup.height) -.5
})
document.addEventListener('resize', () => {
    setup.width = window.innerWidth
    setup.height = window.innerHeight
    camera.aspect = setup.width / setup.height
    camera.updateProjectionMatrix()
    renderer.setSize(setup.width, setup.height)
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
})
document.addEventListener('scroll', () => {
    scroll.y = window.scrollY / setup.height
})
// Debug
const gui = new GUI()
//Scene
const scene = new th.Scene()
// Particles

const particlesPositions = new Float32Array(setup.particleNumber * 3)

for(let i = 0; i < setup.particleNumber; i++){
    particlesPositions[i * 3] = (Math.random() - .5) * 15
    particlesPositions[i * 3 + 1] = (Math.random() - .5) * 15
    particlesPositions[i * 3 + 2] = (Math.random() - .5) * setup.sectionsNumber * setup.sectionHeight
}

const particlesGeometry = new th.BufferGeometry()
particlesGeometry.setAttribute('position', new th.BufferAttribute(particlesPositions, 3))
const particles = new th.Points(
    particlesGeometry,
    new th.PointsMaterial({
        size: .15,
        sizeAttenuation: true
    })
)
scene.add(particles)


//Sphere / planet model
let sphere
gltfLoader.load('/Models/Planet1/scene.gltf', (gltf) => {
    gsap.fromTo(gltf.scene.scale, {
        x: 0, y: 0, z: 0
    }, {
        x: 3, y: 3, z: 3
    })
    // gltf.scene.scale.set(3, 3, 3)
    sphere = gltf.scene
    scene.add(gltf.scene)
})


// Lights
const ambientLight = new th.AmbientLight('0xffffff', .35)
scene.add(ambientLight)
const directionalLight = new th.DirectionalLight('0xffffff', 1)
directionalLight.position.set(3, 2, 0)
scene.add(directionalLight)

gui.add(ambientLight, 'intensity').min(0).max(1).step(.001)
gui.add(directionalLight, 'intensity').min(0).max(1).step(.001)

//Camera
const camera = new th.PerspectiveCamera(setup.fov, setup.width / setup.height)
const cameraGroup = new th.Group()
camera.position.z = 10


cameraGroup.add(camera)
scene.add(cameraGroup)
//Renderer
const renderer = new th.WebGLRenderer({
    canvas: setup.canvas
})
renderer.setClearColor(0x0d0d0d, 1)
renderer.setSize(setup.width, setup.height)
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

const clock = new th.Clock()
let prevTime = 0
const loop = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevTime
    prevTime = elapsedTime
    if(sphere) {
        sphere.rotation.y = elapsedTime * .4
        sphere.rotation.z = elapsedTime * .2
    }
    // Parallax
    // Lerp it
    cameraGroup.position.x += (parallax.x - cameraGroup.position.x) * deltaTime * .5
    cameraGroup.position.y += (parallax.y - cameraGroup.position.y) * deltaTime * .4
    // Scroll camera
    // LERP That crazy guy!
    camera.rotation.z += (scroll.y - camera.rotation.z) * deltaTime * .4
    // camera.lookAt(new th.Vector3())
    // camera.rotation.z = scroll.y
    // directionalLight.position.x = Math.sin(elapsedTime)
    // directionalLight.position.z = Math.cos(elapsedTime)

    renderer.render(scene, camera)
    requestAnimationFrame(loop)
}
loop()