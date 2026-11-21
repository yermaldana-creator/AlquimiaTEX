"use client";

import * as React from "react";
import * as THREE from "three";
import { RotateCw, Flame, Snowflake, Image as ImageIcon, Box } from "lucide-react";

interface Mug3DPreviewProps {
  imageUrl: string;
  isMagic: boolean;
  alt?: string;
}

export default function Mug3DPreview({
  imageUrl,
  isMagic,
  alt = "Vista previa 3D de taza",
}: Mug3DPreviewProps) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = React.useState<"3d" | "2d">("3d");
  const [webglFailed, setWebglFailed] = React.useState(false);
  const [isHot, setIsHot] = React.useState<boolean>(!isMagic);

  // Ref para animar la capa térmica negra sin reconstruir la escena
  const isHotRef = React.useRef<boolean>(!isMagic);
  React.useEffect(() => {
    isHotRef.current = isHot;
  }, [isHot]);

  // Si cambia de Normal a Mágica, iniciar en estado Fría para lucir el efecto
  React.useEffect(() => {
    setIsHot(!isMagic);
    isHotRef.current = !isMagic;
  }, [isMagic]);

  React.useEffect(() => {
    if (viewMode !== "3d" || webglFailed) return;
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 270;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    camera.position.set(0, 0.45, 4.1);
    camera.lookAt(0, 0, 0);

    // Iluminación limpia y ultra-ligera (sin shadow maps ni HDRIs)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
    keyLight.position.set(3.5, 4.5, 4.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xeef6ff, 0.45);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // Grupo principal de la taza 11oz
    const mugGroup = new THREE.Group();
    scene.add(mugGroup);

    const mugRadius = 0.82;
    const mugHeight = 1.92;
    const wallThickness = 0.075;

    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.04,
    });

    const innerCeramicMat = new THREE.MeshStandardMaterial({
      color: 0xf8f8f8,
      roughness: 0.28,
      metalness: 0.02,
      side: THREE.BackSide,
    });

    // 1. Cuerpo exterior cerámico
    const outerGeo = new THREE.CylinderGeometry(mugRadius, mugRadius, mugHeight, 44, 1, true);
    const outerMesh = new THREE.Mesh(outerGeo, ceramicMat);
    mugGroup.add(outerMesh);

    // 2. Interior cerámico
    const innerGeo = new THREE.CylinderGeometry(
      mugRadius - wallThickness,
      mugRadius - wallThickness,
      mugHeight - 0.08,
      36,
      1,
      true
    );
    const innerMesh = new THREE.Mesh(innerGeo, innerCeramicMat);
    innerMesh.position.y = 0.04;
    mugGroup.add(innerMesh);

    // 3. Borde superior redondeado (labio)
    const rimGeo = new THREE.TorusGeometry(
      mugRadius - wallThickness / 2,
      wallThickness / 2,
      14,
      44
    );
    const rimMesh = new THREE.Mesh(rimGeo, ceramicMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = mugHeight / 2;
    mugGroup.add(rimMesh);

    // 4. Base inferior (exterior e interior)
    const bottomGeo = new THREE.CircleGeometry(mugRadius, 36);
    const bottomMesh = new THREE.Mesh(bottomGeo, ceramicMat);
    bottomMesh.rotation.x = Math.PI / 2;
    bottomMesh.position.y = -mugHeight / 2;
    mugGroup.add(bottomMesh);

    const innerBottomGeo = new THREE.CircleGeometry(mugRadius - wallThickness, 32);
    const innerBottomMesh = new THREE.Mesh(innerBottomGeo, ceramicMat);
    innerBottomMesh.rotation.x = -Math.PI / 2;
    innerBottomMesh.position.y = -mugHeight / 2 + 0.08;
    mugGroup.add(innerBottomMesh);

    // 5. Asa curva realista (en el lado +X)
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(mugRadius - 0.04, 0.56, 0),
      new THREE.Vector3(mugRadius + 0.42, 0.54, 0),
      new THREE.Vector3(mugRadius + 0.52, 0.0, 0),
      new THREE.Vector3(mugRadius + 0.42, -0.54, 0),
      new THREE.Vector3(mugRadius - 0.04, -0.56, 0),
    ]);
    const handleGeo = new THREE.TubeGeometry(handleCurve, 28, 0.095, 12, false);
    const handleMat = new THREE.MeshStandardMaterial({
      color: isMagic ? 0x161616 : 0xffffff,
      roughness: isMagic ? 0.42 : 0.22,
      metalness: 0.04,
    });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    mugGroup.add(handleMesh);

    // 6. Manga envolvente de sublimación borde a borde (~21 cm reales, 97% de altura)
    // En CylinderGeometry, theta = 0 está en +Z, theta = PI/2 está en +X (asa).
    const wrapGap = 0.22; // Margen pequeño realista junto a la raíz del asa
    const wrapThetaLength = Math.PI * 2 - wrapGap;
    const wrapThetaStart = Math.PI / 2 + wrapGap / 2;
    const printHeight = mugHeight * 0.97;

    const printGeo = new THREE.CylinderGeometry(
      mugRadius + 0.005,
      mugRadius + 0.005,
      printHeight,
      48,
      1,
      true,
      wrapThetaStart,
      wrapThetaLength
    );

    const printMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.03,
      transparent: true,
    });
    const printMesh = new THREE.Mesh(printGeo, printMat);
    mugGroup.add(printMesh);

    // 7. Capa térmica negra para Taza Mágica (cubre el exterior en estado Fría)
    let magicGeo: THREE.CylinderGeometry | null = null;
    let magicMat: THREE.MeshStandardMaterial | null = null;
    if (isMagic) {
      magicGeo = new THREE.CylinderGeometry(
        mugRadius + 0.01,
        mugRadius + 0.01,
        mugHeight * 0.99,
        48,
        1,
        true
      );
      magicMat = new THREE.MeshStandardMaterial({
        color: 0x141414,
        roughness: 0.48,
        metalness: 0.06,
        transparent: true,
        opacity: isHotRef.current ? 0.0 : 0.98,
        depthWrite: false,
      });
      const magicMesh = new THREE.Mesh(magicGeo, magicMat);
      mugGroup.add(magicMesh);
    }

    // Cargar textura del diseño del cliente (compatible con base64, blob: y Supabase Storage)
    let loadedTexture: THREE.Texture | null = null;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    textureLoader.load(
      imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() || 1, 4);
        loadedTexture = tex;
        printMat.map = tex;
        printMat.needsUpdate = true;
      },
      undefined,
      () => {
        // Si la textura falla (CORS o archivo inválido), fallback automático a 2D
        setWebglFailed(true);
      }
    );

    // Orientación inicial mostrando el frente del diseño (opuesto al asa)
    mugGroup.rotation.y = -Math.PI * 0.35;
    mugGroup.rotation.x = 0.08;

    // Interacción táctil y con mouse (sin bloquear scroll vertical en móvil)
    let isDragging = false;
    let userInteracted = false;
    let prevX = 0;
    let prevY = 0;

    const domElem = renderer.domElement;
    domElem.style.touchAction = "pan-y";
    domElem.style.cursor = "grab";

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      userInteracted = true;
      prevX = e.clientX;
      prevY = e.clientY;
      domElem.style.cursor = "grabbing";
      try {
        domElem.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      mugGroup.rotation.y += dx * 0.012;
      mugGroup.rotation.x = Math.max(-0.35, Math.min(0.45, mugGroup.rotation.x + dy * 0.006));
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      domElem.style.cursor = "grab";
      try {
        domElem.releasePointerCapture(e.pointerId);
      } catch {}
    };

    domElem.addEventListener("pointerdown", onPointerDown);
    domElem.addEventListener("pointermove", onPointerMove);
    domElem.addEventListener("pointerup", onPointerUp);
    domElem.addEventListener("pointercancel", onPointerUp);

    // Resize responsive
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 270;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Loop de renderizado ligero
    let animId = 0;
    const animate = () => {
      animId = window.requestAnimationFrame(animate);

      if (!userInteracted) {
        mugGroup.rotation.y += 0.0045;
      }

      // Transición suave térmica en Taza Mágica
      if (magicMat) {
        const targetOpacity = isHotRef.current ? 0.0 : 0.98;
        magicMat.opacity += (targetOpacity - magicMat.opacity) * 0.09;
        magicMat.visible = magicMat.opacity > 0.015;
      }

      renderer?.render(scene, camera);
    };
    animate();

    // Limpieza estricta de memoria WebGL al desmontar
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      domElem.removeEventListener("pointerdown", onPointerDown);
      domElem.removeEventListener("pointermove", onPointerMove);
      domElem.removeEventListener("pointerup", onPointerUp);
      domElem.removeEventListener("pointercancel", onPointerUp);

      outerGeo.dispose();
      innerGeo.dispose();
      rimGeo.dispose();
      bottomGeo.dispose();
      innerBottomGeo.dispose();
      handleGeo.dispose();
      printGeo.dispose();
      magicGeo?.dispose();

      ceramicMat.dispose();
      innerCeramicMat.dispose();
      handleMat.dispose();
      printMat.dispose();
      magicMat?.dispose();
      loadedTexture?.dispose();

      renderer?.dispose();
      if (container.contains(domElem)) {
        container.removeChild(domElem);
      }
    };
  }, [imageUrl, isMagic, viewMode, webglFailed]);

  return (
    <div className="rounded-xl border-2 border-black bg-[#FAF7F0] p-3 space-y-2.5 shadow-[3px_3px_0px_#0A0A0A]">
      {/* Cabecera con toggle Vista 3D / Imagen plana */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-mono text-[10px] font-black uppercase text-[#0A0A0A] flex items-center gap-1.5">
          <Box className="h-3.5 w-3.5 text-[#0891B2]" />
          <span>{isMagic ? "Vista previa Taza Mágica 3D" : "Vista previa Taza 11oz 3D"}</span>
        </span>

        {!webglFailed && (
          <div className="inline-flex rounded-lg border border-black bg-white p-0.5 font-mono text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === "3d"
                  ? "bg-black text-[#FACC15]"
                  : "text-slate-700 hover:text-black"
              }`}
            >
              <Box className="h-3 w-3" />
              <span>Vista 3D</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("2d")}
              className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === "2d"
                  ? "bg-black text-[#FACC15]"
                  : "text-slate-700 hover:text-black"
              }`}
            >
              <ImageIcon className="h-3 w-3" />
              <span>Plana</span>
            </button>
          </div>
        )}
      </div>

      {/* Área del visor 3D o fallback 2D */}
      {viewMode === "3d" && !webglFailed ? (
        <div className="relative h-[265px] sm:h-[290px] w-full rounded-lg border-2 border-black/20 bg-gradient-to-b from-white via-[#F3EFE6] to-[#E6DFD3] overflow-hidden">
          <div ref={mountRef} className="h-full w-full" />
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full border border-black/30 bg-white/90 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#0A0A0A] shadow-xs whitespace-nowrap">
            <RotateCw className="h-3 w-3 text-[#0891B2]" />
            <span>Arrastra para girar 360°</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border-2 border-black/20 bg-white p-3 h-[220px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            className="max-h-full w-auto object-contain rounded"
          />
        </div>
      )}

      {/* Switch Térmico Exclusivo para Taza Mágica */}
      {isMagic && viewMode === "3d" && !webglFailed && (
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => setIsHot(false)}
            className={`flex items-center justify-center gap-1.5 rounded-lg border-2 border-black px-2.5 py-2 font-mono text-[11px] font-black transition-all ${
              !isHot
                ? "bg-black text-white shadow-[2px_2px_0px_#06B6D4]"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Snowflake className="h-3.5 w-3.5 text-[#06B6D4] shrink-0" />
            <span>Fría (Negra)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHot(true)}
            className={`flex items-center justify-center gap-1.5 rounded-lg border-2 border-black px-2.5 py-2 font-mono text-[11px] font-black transition-all ${
              isHot
                ? "bg-[#FACC15] text-[#0A0A0A] shadow-[2px_2px_0px_#E11D48]"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-[#E11D48] shrink-0" />
            <span>Con agua caliente</span>
          </button>
        </div>
      )}

      <p className="text-[10px] text-slate-600 text-center leading-snug">
        * Simulación 3D interactiva. Tu imagen original plana se envía intacta al taller para sublimación.
      </p>
    </div>
  );
}
