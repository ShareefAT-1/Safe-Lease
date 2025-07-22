import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Globe3D = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) {
            console.error("mountRef.current is null on effect mount.");
            return;
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x555555); // A clearly visible dark grey background

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 2; // Position the camera to see the cube

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputEncoding = THREE.sRGBEncoding; 
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        mountRef.current.appendChild(renderer.domElement);
        console.log("Renderer canvas appended to DOM:", renderer.domElement);
        console.log("WebGL2 available:", renderer.capabilities.isWebGL2); // Check WebGL2 capability


        // Responsive handling
        const handleResize = () => {
            if (mountRef.current) {
                camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // --- Diagnostic Cube ---
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5); // Larger cube
        // Using MeshBasicMaterial - it does NOT require lights to be visible
        const material = new THREE.MeshBasicMaterial({ color: 0xff00ff }); // Bright magenta color
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // --- Lighting --- (Still included, but MeshBasicMaterial doesn't strictly need it)
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
        directionalLight.position.set(2, 2, 2).normalize();
        scene.add(directionalLight);

        // --- OrbitControls ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // --- Animation loop ---
        const animate = () => {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.005;
            cube.rotation.y += 0.005;
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // --- Cleanup function ---
        return () => {
            if (mountRef.current && renderer.domElement) {
                window.removeEventListener('resize', handleResize);
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            ambientLight.dispose();
            directionalLight.dispose();
            renderer.dispose();
            controls.dispose();
            scene.clear();
        };
    }, []);

    return (
        <div ref={mountRef} className="w-full h-96 rounded-lg overflow-hidden shadow-md" style={{ minHeight: '384px' }}>
            {/* The cube will be rendered inside this div */}
        </div>
    );
};

export default Globe3D;
