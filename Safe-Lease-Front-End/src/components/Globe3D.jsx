import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import earthDayMap from '../assets/textures/earth_daymap.jpg';
import earthClouds from '../assets/textures/earth_clouds.jpg';

function latLonToXYZ(lat, lon, radius = 1.03) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

const Globe3D = ({ latitude = 0, longitude = 0 }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    console.log('Earth Day Map URL:', earthDayMap);
    console.log('Earth Clouds URL:', earthClouds);

    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a202c); 

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 2.7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearAlpha(0);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const textureLoader = new THREE.TextureLoader();

    const earthTexture = textureLoader.load(earthDayMap);
    const cloudTexture = textureLoader.load(earthClouds);

    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 25,
      specular: new THREE.Color(0xaafaff),
    });
    const globe = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(globe);

    const cloudGeometry = new THREE.SphereGeometry(1.02, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    const { x, y, z } = latLonToXYZ(latitude, longitude, 1.05);
    const markerGeometry = new THREE.SphereGeometry(0.03, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff3040 }); 
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, z);
    scene.add(marker);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.10;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 4;

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      globe.rotation.y += 0.0012;
      clouds.rotation.y += 0.0017;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const mountNode = mountRef.current;
    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      controls.dispose();
      earthGeometry.dispose();
      cloudGeometry.dispose();
      markerGeometry.dispose();
      window.removeEventListener('resize', onResize);
      if (mountNode && renderer.domElement.parentNode === mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [latitude, longitude]);

  return (
    <div
      ref={mountRef}
      className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl"
      style={{ minHeight: '384px', backgroundColor: '#1a202c' }}
    >
    </div>
  );
};

export default Globe3D;
