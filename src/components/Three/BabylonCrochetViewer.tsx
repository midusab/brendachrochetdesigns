import React, { useRef, useEffect } from 'react';
import { 
  Engine, 
  Scene, 
  ArcRotateCamera, 
  Vector3, 
  HemisphericLight, 
  PointLight, 
  Color3, 
  MeshBuilder, 
  StandardMaterial, 
  PBRMaterial,
  GPUParticleSystem,
  Texture,
  ParticleSystem,
  Animation,
  GlowLayer
} from '@babylonjs/core';
import "@babylonjs/loaders";

export function BabylonCrochetViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color3(0, 0, 0).toColor4(0); // Transparent background

    // Camera setup
    const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 30, Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 50;
    camera.useAutoRotationBehavior = true;

    // Premium Clustered Lighting Setup
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.5;
    light.groundColor = new Color3(0.1, 0, 0);

    // Dynamic Point Lights for "Studio" feel
    const p1 = new PointLight("p1", new Vector3(10, 10, 10), scene);
    p1.diffuse = new Color3(1, 0.2, 0.2); // Premium Red
    p1.intensity = 0.8;

    const p2 = new PointLight("p2", new Vector3(-10, -10, -10), scene);
    p2.diffuse = new Color3(0.2, 0.2, 1); // Subdued Blue for contrast
    p2.intensity = 0.4;

    // Main Crochet-like Mesh (Abstract Knot)
    const torusKnot = MeshBuilder.CreateTorusKnot("knot", {
      radius: 8,
      tube: 2.5,
      radialSegments: 256,
      tubularSegments: 64,
      p: 3,
      q: 2
    }, scene);

    const mat = new PBRMaterial("mat", scene);
    mat.albedoColor = new Color3(1, 0.1, 0.1);
    mat.metallic = 0.1;
    mat.roughness = 0.8;
    mat.wireframe = true;
    mat.emissiveColor = new Color3(0.4, 0, 0);
    torusKnot.material = mat;

    // "Yarn Particles" System (Leveraging Babylon's high-performance particle tech)
    // We use a GPU system if supported, otherwise standard
    const particleSystem = GPUParticleSystem.IsSupported ? 
      new GPUParticleSystem("yarnParticles", { capacity: 5000 }, scene) :
      new ParticleSystem("yarnParticles", 2000, scene);

    particleSystem.particleTexture = new Texture("https://www.babylonjs.com/assets/gradient.png", scene);
    particleSystem.particleTexture.onLoadObservable.add(() => {
      console.log('Particle texture loaded');
    });
    particleSystem.particleTexture.onDisposeObservable.add(() => {
      console.warn('Particle texture disposed');
    });
    particleSystem.emitter = torusKnot; // The knot itself emits particles
    particleSystem.minEmitBox = new Vector3(-1, -1, -1);
    particleSystem.maxEmitBox = new Vector3(1, 1, 1);

    particleSystem.color1 = new Color3(1, 0.3, 0.3).toColor4(0.8);
    particleSystem.color2 = new Color3(0.6, 0, 0).toColor4(0.5);
    particleSystem.colorDead = new Color3(0, 0, 0).toColor4(0);

    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.2;
    particleSystem.minLifeTime = 1;
    particleSystem.maxLifeTime = 3;
    particleSystem.emitRate = 500;
    particleSystem.gravity = new Vector3(0, -0.5, 0);
    particleSystem.addVelocityGradient(0, 1, 2);
    particleSystem.start();

    // Post-processing for Premium Glow
    const glow = new GlowLayer("glow", scene);
    glow.intensity = 0.6;

    // Animation Loop
    scene.registerBeforeRender(() => {
      torusKnot.rotation.y += 0.01;
      torusKnot.rotation.x += 0.005;
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <canvas ref={canvasRef} className="w-full h-full outline-none" />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: 'inset 0 0 100px rgba(255,0,0,0.05)'
        }} 
      />
    </div>
  );
}
