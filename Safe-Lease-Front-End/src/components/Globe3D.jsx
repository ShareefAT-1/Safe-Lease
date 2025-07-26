// src/components/Globe3D.jsx

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import earthDayMap from '../assets/textures/earth_daymap.jpg';
import earthClouds from '../assets/textures/earth_clouds.jpg';

/**
 * Converts latitude and longitude to 3D x,y,z coordinates on a sphere of given radius
 * Latitude and longitude are in degrees
 */
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
    // Log imported asset URLs to verify bundler resolves them
    console.log('Earth Day Map URL:', earthDayMap);
    console.log('Earth Clouds URL:', earthClouds);

    if (!mountRef.current) return;

    // === THREE.js Setup ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a202c); // nice dark bg

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

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Texture loader
    const textureLoader = new THREE.TextureLoader();

    // Load textures from imported assets
    const earthTexture = textureLoader.load(earthDayMap);
    const cloudTexture = textureLoader.load(earthClouds);

    // Earth Sphere
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 25,
      specular: new THREE.Color(0xaafaff),
    });
    const globe = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(globe);

    // Cloud Sphere (slightly larger for layering)
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

    // === Add Location Marker === //
    const { x, y, z } = latLonToXYZ(latitude, longitude, 1.05);
    const markerGeometry = new THREE.SphereGeometry(0.03, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff3040 }); // Bright red marker
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, z);
    scene.add(marker);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.10;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 4;

    // Animation loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      globe.rotation.y += 0.0012;
      clouds.rotation.y += 0.0017;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Cleanup on unmount
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
      {/* 3D Globe renders here */}
    </div>
  );
};

export default Globe3D;
