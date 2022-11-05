import * as THREE from './three.module.js'
import {OrbitControls} from './OrbitControls.js'
import { PCDLoader } from './PCDLoader.js'

var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.setSize(canvas.clientWidth,canvas.clientHeight);

var width = window.screen.availWidth
var height = window.screen.availHeight

var camera = new THREE.PerspectiveCamera(1,width/height,1,50000000);
camera.position.set(0,0,12000);
var loader = new PCDLoader();

var controls = new OrbitControls(camera,renderer.domElement);
var points_geometry = undefined
var points_geometry2 = undefined
var load_pcd =  function(){
    loader.load('./arma_Blue.pcd',function(points){
        var buffer_geo = new THREE.BufferGeometry()
        buffer_geo.setAttribute('position',new THREE.Float32BufferAttribute(points.geometry.attributes.position.array,3))
        var pts_mat = new THREE.PointsMaterial({color: 0xff00ff})
        points_geometry = new THREE.Points(buffer_geo,pts_mat)
        points_geometry.geometry.center()
        scene.add(points_geometry)
    })

    loader.load('./arma_Red.pcd',function(points){
        var buffer_geo = new THREE.BufferGeometry()
        buffer_geo.setAttribute('position',new THREE.Float32BufferAttribute(points.geometry.attributes.position.array,3))
        var pts_mat = new THREE.PointsMaterial({color: 0xff00ff})
        points_geometry2 = new THREE.Points(buffer_geo,pts_mat)
        points_geometry2.geometry.translate(100,0,0)
        scene.add(points_geometry2)
    })


}

const sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const spheres = []
var toggle = 0
for ( let i = 0; i < 40; i ++ ) {

    const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    scene.add( sphere );
    spheres.push( sphere );

}


let INTERSECTED;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let clock = new THREE.Clock()

raycaster.params.Points.threshold = 4;

function onPointerMove( event ) {

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

document.addEventListener( 'mousemove', onPointerMove );

var intersection = null
var counter = 0
var spheresIndex = 0
var animate = function(){
    renderer.render(scene,camera)
    controls.update()
    requestAnimationFrame(animate)
    // console.log(scene.children)
    raycaster.setFromCamera( pointer, camera );
    var pts_arr1=scene.children[0].geometry.attributes.position
    // console.log(pts_arr1
    const intersects = raycaster.intersectObjects( scene.children, false );
    // console.log(intersects)
    intersection = ( intersects.length ) > 0 ? intersects[ 0 ] : null;
    // if ( intersects.length > 0 ) {

    //     if ( INTERSECTED != intersects[ 0 ].object ) {

    //         if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

    //         INTERSECTED = intersects[ 0 ].object;
    //         // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
    //         INTERSECTED.material.color.setHex( 0xffffff );

    //     }

    // } else {

    //     if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

    //     INTERSECTED = null;

    // }
    if ( toggle > 0.02 && intersection !== null ) {

        spheres[ spheresIndex ].position.copy( intersection.point );
        spheres[ spheresIndex ].scale.set( 1, 1, 1 );
        spheresIndex = ( spheresIndex + 1 ) % spheres.length;

        toggle = 0;

    }

    for ( let i = 0; i < spheres.length; i ++ ) {

        const sphere = spheres[ i ];
        sphere.scale.multiplyScalar( 0.98 );
        sphere.scale.clampScalar( 0.01, 1 );

    }

    toggle += clock.getDelta();

    points_geometry.rotation.y += 0.01
    points_geometry2.rotation.z += 0.01*Math.cosh(0.5)
    counter +=1
    if (counter == 10){
        points_geometry.material.color.setHex(Math.random() * 0xffffff)
        points_geometry2.material.color.setHex(Math.random() * 0xffffff)
        counter = 0
    }
}

load_pcd()
animate()