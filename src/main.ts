import './style.css'
import * as THREE from 'three'

import studio from '@theatre/studio'
import {getProject, types} from '@theatre/core'
import state from './state.json'

/**
 * Theatre.js */

// Initialize the studio
studio.initialize()

// Create a project for the animation
const project = getProject('THREE.js x Theatre.js', {state})

// Create a sheet
const sheet = project.sheet('Animated scene')

/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  10,
  200,
)

camera.position.z = 50

/**
 * Scene
 */

const scene = new THREE.Scene()

/*
 * TorusKnot
 */
const geometry = new THREE.TorusKnotGeometry(10, 3, 300, 16)
const material = new THREE.MeshStandardMaterial()
material.color = new THREE.Color('#049ef4')
material.roughness = 0.5

const mesh = new THREE.Mesh(geometry, material)
mesh.castShadow = true
mesh.receiveShadow = true
scene.add(mesh)

const torusKnotObj = sheet.object('Torus Knot', {
  // Note that the rotation is in radians
  // (full rotation:  2 * Math.PI)
  rotation: types.compound({
    x: types.number(mesh.rotation.x, {range: [-2, 2]}),
    y: types.number(mesh.rotation.y, {range: [-2, 2]}),
    z: types.number(mesh.rotation.z, {range: [-2, 2]}),
  }),
})

torusKnotObj.onValuesChange((values) => {
  const {x, y, z} = values.rotation

  mesh.rotation.set(x * Math.PI, y * Math.PI, z * Math.PI)
})

/*
 * Lights
 */

// Ambient Light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// Point light
const directionalLight = new THREE.DirectionalLight('#ff0000')
directionalLight.intensity = 30
directionalLight.position.y = 20
directionalLight.position.z = 20

directionalLight.castShadow = true

directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.far = 50
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.right = 20
directionalLight.shadow.camera.bottom = -20
directionalLight.shadow.camera.left = -20

scene.add(directionalLight)

// RectAreaLight
const rectAreaLight = new THREE.RectAreaLight('#ff0', 1, 50, 50)

rectAreaLight.position.z = 10
rectAreaLight.position.y = -40
rectAreaLight.position.x = -20
rectAreaLight.lookAt(new THREE.Vector3(0, 0, 0))

scene.add(rectAreaLight)

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({antialias: true})

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)

document.body.appendChild(renderer.domElement)

/**
 * Update the screen
 */
function tick(): void {
  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}

tick()

/**
 * Handle `resize` events
 */
window.addEventListener(
  'resize',
  function () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  },
  false,
)

// Play the animation on repeat
project.ready.then(() => sheet.sequence.play({iterationCount: Infinity}))
