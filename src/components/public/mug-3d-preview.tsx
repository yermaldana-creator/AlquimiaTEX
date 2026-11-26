"use client";

import * as React from "react";
import * as THREE from "three";
import { RotateCw, Flame, Snowflake, Image as ImageIcon, Box } from "lucide-react";

export type Mug3DVariant = "standard" | "magic" | "stackable";

interface Mug3DPreviewProps {
  imageUrl: string;
  isMagic?: boolean;
  mugVariant?: Mug3DVariant;
  alt?: string;
}

export default function Mug3DPreview({
  imageUrl,
  isMagic = false,
  mugVariant,
  alt = "Vista previa 3D de taza",
}: Mug3DPreviewProps) {
  const resolvedVariant: Mug3DVariant = mugVariant || (isMagic ? "magic" : "standard");
  const isMagicMug = resolvedVariant === "magic";
  const isStackable = resolvedVariant === "stackable";

  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = React.useState<"3d" | "2d">("3d");
  const [webglFailed, setWebglFailed] = React.useState(false);
  const [isHot, setIsHot] = React.useState<boolean>(!isMagicMug);

  // Ref para animar la capa térmica negra sin reconstruir la escena
  const isHotRef = React.useRef<boolean>(!isMagicMug);
  React.useEffect(() => {
    isHotRef.current = isHot;
  }, [isHot]);

  // Si cambia a Taza Mágica, iniciar en estado Fría para lucir el efecto
  React.useEffect(() => {
    setIsHot(!isMagicMug);
    isHotRef.current = !isMagicMug;
  }, [isMagicMug]);

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
    camera.position.set(0, 0.62, isStackable ? 4.75 : 4.95);
    camera.lookAt(0, -0.06, 0);

    // Iluminación limpia, cálida y ligera de estudio (sin shadow maps ni HDRIs)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfffaf0, 0xd8b890, 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.92);
    keyLight.position.set(3.5, 4.8, 4.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfff3dc, 0.48);
    rimLight.position.set(-4, 2.2, -3);
    scene.add(rimLight);

    // Registro centralizado de geometrías, materiales y texturas para dispose() limpio
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];
    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      materials.push(m);
      return m;
    };
    const trackTex = <T extends THREE.Texture>(t: T): T => {
      textures.push(t);
      return t;
    };

    // Grupo de escenario (mesa + sombra + taza) para que al inclinar la vista la taza nunca se despegue de la mesa
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const mugGroup = new THREE.Group();
    stageGroup.add(mugGroup);

    // =========================================================================
    // BASE DE MESA PROCEDURAL (MADERA CLARA CÁLIDA) + SOMBRA DE CONTACTO (0 KB)
    // =========================================================================
    const baseBottomY = isStackable ? -0.83 : -0.96;

    // Textura procedural ligera de madera clara de estudio (256x256)
    const woodCanvas = document.createElement("canvas");
    woodCanvas.width = 256;
    woodCanvas.height = 256;
    const wctx = woodCanvas.getContext("2d");
    if (wctx) {
      const wg = wctx.createRadialGradient(128, 128, 12, 128, 128, 128);
      wg.addColorStop(0, "#EFE0C9");
      wg.addColorStop(0.65, "#E2C9A4");
      wg.addColorStop(1, "#D4B284");
      wctx.fillStyle = wg;
      wctx.fillRect(0, 0, 256, 256);

      wctx.strokeStyle = "rgba(135, 90, 42, 0.11)";
      wctx.lineWidth = 1.5;
      for (let y = 6; y < 256; y += 9) {
        wctx.beginPath();
        wctx.moveTo(0, y);
        wctx.bezierCurveTo(85, y + Math.sin(y * 0.15) * 4, 170, y - Math.cos(y * 0.12) * 4, 256, y);
        wctx.stroke();
      }
    }
    const woodTexture = trackTex(new THREE.CanvasTexture(woodCanvas));
    woodTexture.colorSpace = THREE.SRGBColorSpace;

    const tableGeo = trackGeo(new THREE.CircleGeometry(3.8, 48));
    const tableMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.78,
        metalness: 0.02,
      })
    );
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.rotation.x = -Math.PI / 2;
    tableMesh.position.y = baseBottomY;
    stageGroup.add(tableMesh);

    // Textura radial suave de sombra de contacto pegada a la base
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext("2d");
    if (sctx) {
      const sg = sctx.createRadialGradient(64, 64, 14, 64, 64, 62);
      sg.addColorStop(0, "rgba(38, 22, 8, 0.42)");
      sg.addColorStop(0.55, "rgba(38, 22, 8, 0.22)");
      sg.addColorStop(1, "rgba(38, 22, 8, 0)");
      sctx.fillStyle = sg;
      sctx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = trackTex(new THREE.CanvasTexture(shadowCanvas));

    const shadowRadius = isStackable ? 1.12 : 1.18;
    const shadowGeo = trackGeo(new THREE.CircleGeometry(shadowRadius, 36));
    const shadowMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      })
    );
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(-0.08, baseBottomY + 0.004, -0.05);
    stageGroup.add(shadowMesh);

    const ceramicMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.16,
        metalness: 0.04,
        flatShading: false,
      })
    );

    const innerCeramicMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf7f7f7,
        roughness: 0.26,
        metalness: 0.02,
        side: THREE.BackSide,
        flatShading: false,
      })
    );

    const printMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.03,
        transparent: true,
        flatShading: false,
      })
    );

    let magicMat: THREE.MeshStandardMaterial | null = null;

    if (isStackable) {
      // =========================================================================
      // GEOMETRÍA REAL DE TAZA APILABLE (73% cuerpo liso + 27% base acanalada + asa circular)
      // =========================================================================
      const totalHeight = 1.66;
      const upperHeight = totalHeight * 0.73; // ~1.212
      const baseHeight = totalHeight * 0.27; // ~0.448
      const upperRadius = 0.9;
      const wallThickness = 0.075;

      const topY = totalHeight / 2;
      const stepY = topY - upperHeight;
      const botY = -totalHeight / 2;
      const upperCenterY = stepY + upperHeight / 2;
      const baseCenterY = botY + baseHeight / 2;

      const baseTopR = upperRadius * 0.84;
      const baseBotR = upperRadius * 0.76;

      // 1. Cuerpo superior liso cerámico (64 segmentos radiales + flatShading: false)
      const upperGeo = trackGeo(
        new THREE.CylinderGeometry(upperRadius, upperRadius, upperHeight, 64, 1, true)
      );
      const upperMesh = new THREE.Mesh(upperGeo, ceramicMat);
      upperMesh.position.y = upperCenterY;
      mugGroup.add(upperMesh);

      // 2. Interior cerámico
      const innerGeo = trackGeo(
        new THREE.CylinderGeometry(
          upperRadius - wallThickness,
          baseBotR - wallThickness * 0.7,
          totalHeight - 0.1,
          48,
          1,
          true
        )
      );
      const innerMesh = new THREE.Mesh(innerGeo, innerCeramicMat);
      innerMesh.position.y = 0.04;
      mugGroup.add(innerMesh);

      // 3. Borde superior redondeado (labio)
      const rimGeo = trackGeo(
        new THREE.TorusGeometry(upperRadius - wallThickness / 2, wallThickness / 2, 16, 64)
      );
      const rimMesh = new THREE.Mesh(rimGeo, ceramicMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = topY;
      mugGroup.add(rimMesh);

      // 4. Escalón horizontal + bisel redondeado conectando cuerpo liso con base acanalada
      const stepRingGeo = trackGeo(new THREE.RingGeometry(baseTopR - 0.02, upperRadius, 64));
      const stepRingMesh = new THREE.Mesh(stepRingGeo, ceramicMat);
      stepRingMesh.rotation.x = Math.PI / 2;
      stepRingMesh.position.y = stepY;
      mugGroup.add(stepRingMesh);

      const stepBevelGeo = trackGeo(new THREE.TorusGeometry(upperRadius - 0.02, 0.022, 10, 64));
      const stepBevelMesh = new THREE.Mesh(stepBevelGeo, ceramicMat);
      stepBevelMesh.rotation.x = Math.PI / 2;
      stepBevelMesh.position.y = stepY + 0.015;
      mugGroup.add(stepBevelMesh);

      // 5. Base apilable acanalada (32 estrías verticales reales en cerámica blanca)
      const flutedBaseGeo = trackGeo(
        new THREE.CylinderGeometry(baseTopR, baseBotR, baseHeight, 160, 1, false)
      );
      const posAttr = flutedBaseGeo.attributes.position;
      const flutes = 32;
      const fluteAmp = 0.018;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const vz = posAttr.getZ(i);
        const r = Math.hypot(vx, vz);
        // Solo modular la pared lateral (no los centros de las tapas)
        if (r > 0.1) {
          const angle = Math.atan2(vz, vx);
          const ridge = Math.cos(angle * flutes) * fluteAmp;
          const factor = (r + ridge) / r;
          posAttr.setXYZ(i, vx * factor, vy, vz * factor);
        }
      }
      flutedBaseGeo.computeVertexNormals();
      const flutedBaseMesh = new THREE.Mesh(flutedBaseGeo, ceramicMat);
      flutedBaseMesh.position.y = baseCenterY;
      mugGroup.add(flutedBaseMesh);

      // Fondo interior
      const innerBottomGeo = trackGeo(new THREE.CircleGeometry(baseBotR - wallThickness, 36));
      const innerBottomMesh = new THREE.Mesh(innerBottomGeo, ceramicMat);
      innerBottomMesh.rotation.x = -Math.PI / 2;
      innerBottomMesh.position.y = botY + 0.09;
      mugGroup.add(innerBottomMesh);

      // 6. Asa circular compacta (aro/toroide centrado en la zona media-alta del cuerpo liso)
      const handleGeo = trackGeo(new THREE.TorusGeometry(0.31, 0.088, 16, 36));
      const handleMesh = new THREE.Mesh(handleGeo, ceramicMat);
      handleMesh.position.set(upperRadius + 0.24, upperCenterY + 0.06, 0);
      mugGroup.add(handleMesh);

      // 7. Manga envolvente de sublimación ÚNICAMENTE sobre el cuerpo superior liso
      const wrapGap = 0.24;
      const wrapThetaLength = Math.PI * 2 - wrapGap;
      const wrapThetaStart = Math.PI / 2 + wrapGap / 2;
      const printHeight = upperHeight * 0.94;

      const printGeo = trackGeo(
        new THREE.CylinderGeometry(
          upperRadius + 0.005,
          upperRadius + 0.005,
          printHeight,
          64,
          1,
          true,
          wrapThetaStart,
          wrapThetaLength
        )
      );
      const printMesh = new THREE.Mesh(printGeo, printMat);
      printMesh.position.y = upperCenterY;
      mugGroup.add(printMesh);

      // Vista inicial 3/4 dejando el asa circular claramente visible al costado derecho
      mugGroup.rotation.y = -0.55;
      stageGroup.rotation.x = 0.08;
    } else {
      // =========================================================================
      // GEOMETRÍA CLÁSICA 11oz (Taza Normal Blanca y Taza Mágica)
      // =========================================================================
      const mugRadius = 0.82;
      const mugHeight = 1.92;
      const wallThickness = 0.075;

      const outerGeo = trackGeo(
        new THREE.CylinderGeometry(mugRadius, mugRadius, mugHeight, 64, 1, true)
      );
      mugGroup.add(new THREE.Mesh(outerGeo, ceramicMat));

      const innerGeo = trackGeo(
        new THREE.CylinderGeometry(
          mugRadius - wallThickness,
          mugRadius - wallThickness,
          mugHeight - 0.08,
          44,
          1,
          true
        )
      );
      const innerMesh = new THREE.Mesh(innerGeo, innerCeramicMat);
      innerMesh.position.y = 0.04;
      mugGroup.add(innerMesh);

      const rimGeo = trackGeo(
        new THREE.TorusGeometry(mugRadius - wallThickness / 2, wallThickness / 2, 16, 64)
      );
      const rimMesh = new THREE.Mesh(rimGeo, ceramicMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = mugHeight / 2;
      mugGroup.add(rimMesh);

      const bottomGeo = trackGeo(new THREE.CircleGeometry(mugRadius, 44));
      const bottomMesh = new THREE.Mesh(bottomGeo, ceramicMat);
      bottomMesh.rotation.x = Math.PI / 2;
      bottomMesh.position.y = -mugHeight / 2;
      mugGroup.add(bottomMesh);

      const innerBottomGeo = trackGeo(new THREE.CircleGeometry(mugRadius - wallThickness, 36));
      const innerBottomMesh = new THREE.Mesh(innerBottomGeo, ceramicMat);
      innerBottomMesh.rotation.x = -Math.PI / 2;
      innerBottomMesh.position.y = -mugHeight / 2 + 0.08;
      mugGroup.add(innerBottomMesh);

      const handleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(mugRadius - 0.04, 0.56, 0),
        new THREE.Vector3(mugRadius + 0.42, 0.54, 0),
        new THREE.Vector3(mugRadius + 0.52, 0.0, 0),
        new THREE.Vector3(mugRadius + 0.42, -0.54, 0),
        new THREE.Vector3(mugRadius - 0.04, -0.56, 0),
      ]);
      const handleGeo = trackGeo(new THREE.TubeGeometry(handleCurve, 28, 0.095, 14, false));
      const handleMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: isMagicMug ? 0x161616 : 0xffffff,
          roughness: isMagicMug ? 0.42 : 0.18,
          metalness: 0.04,
          flatShading: false,
        })
      );
      mugGroup.add(new THREE.Mesh(handleGeo, handleMat));

      const wrapGap = 0.22;
      const wrapThetaLength = Math.PI * 2 - wrapGap;
      const wrapThetaStart = Math.PI / 2 + wrapGap / 2;
      const printHeight = mugHeight * 0.97;

      const printGeo = trackGeo(
        new THREE.CylinderGeometry(
          mugRadius + 0.005,
          mugRadius + 0.005,
          printHeight,
          64,
          1,
          true,
          wrapThetaStart,
          wrapThetaLength
        )
      );
      mugGroup.add(new THREE.Mesh(printGeo, printMat));

      if (isMagicMug) {
        const magicGeo = trackGeo(
          new THREE.CylinderGeometry(
            mugRadius + 0.01,
            mugRadius + 0.01,
            mugHeight * 0.99,
            64,
            1,
            true
          )
        );
        magicMat = trackMat(
          new THREE.MeshStandardMaterial({
            color: 0x141414,
            roughness: 0.48,
            metalness: 0.06,
            transparent: true,
            opacity: isHotRef.current ? 0.0 : 0.98,
            depthWrite: false,
            flatShading: false,
          })
        );
        mugGroup.add(new THREE.Mesh(magicGeo, magicMat));
      }

      mugGroup.rotation.y = -Math.PI * 0.35;
      stageGroup.rotation.x = 0.06;
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
        setWebglFailed(true);
      }
    );

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
      stageGroup.rotation.x = Math.max(-0.04, Math.min(0.32, stageGroup.rotation.x + dy * 0.005));
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

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 270;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let animId = 0;
    const animate = () => {
      animId = window.requestAnimationFrame(animate);

      if (!userInteracted) {
        mugGroup.rotation.y += 0.0045;
      }

      if (magicMat) {
        const targetOpacity = isHotRef.current ? 0.0 : 0.98;
        magicMat.opacity += (targetOpacity - magicMat.opacity) * 0.09;
        magicMat.visible = magicMat.opacity > 0.015;
      }

      renderer?.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      domElem.removeEventListener("pointerdown", onPointerDown);
      domElem.removeEventListener("pointermove", onPointerMove);
      domElem.removeEventListener("pointerup", onPointerUp);
      domElem.removeEventListener("pointercancel", onPointerUp);

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      loadedTexture?.dispose();

      renderer?.dispose();
      if (container.contains(domElem)) {
        container.removeChild(domElem);
      }
    };
  }, [imageUrl, isMagicMug, isStackable, viewMode, webglFailed]);

  const titleLabel = isMagicMug
    ? "Vista previa Taza Mágica 3D"
    : isStackable
    ? "Vista previa Taza Apilable 3D"
    : "Vista previa Taza 11oz 3D";

  return (
    <div className="rounded-xl border-2 border-black bg-[#FAF7F0] p-3 space-y-2.5 shadow-[3px_3px_0px_#0A0A0A]">
      {/* Cabecera con toggle Vista 3D / Imagen plana */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-mono text-[10px] font-black uppercase text-[#0A0A0A] flex items-center gap-1.5">
          <Box className="h-3.5 w-3.5 text-[#0891B2]" />
          <span>{titleLabel}</span>
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

      {/* Área del visor 3D (fondo cálido alegre de estudio) o fallback 2D */}
      {viewMode === "3d" && !webglFailed ? (
        <div
          className="relative h-[265px] sm:h-[290px] w-full rounded-lg border-2 border-black/20 overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 50% 32%, #FFFDF7 0%, #FDECC8 55%, #F3D4A0 100%)",
          }}
        >
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
      {isMagicMug && viewMode === "3d" && !webglFailed && (
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
        {isStackable
          ? "* Simulación 3D de Taza Apilable (el estampado cubre solo el cuerpo superior liso; la base acanalada queda blanca)."
          : "* Simulación 3D interactiva. Tu imagen original plana se envía intacta al taller para sublimación."}
      </p>
    </div>
  );
}
