/* ==========================================================
   Logo 3D: poste de barbeiro com asas (Three.js)
   Listras giram, asas batem de leve, arraste para girar.
   Pausa quando sai da tela.
   ========================================================== */
(function () {
  "use strict";

  const canvas = document.getElementById("pole3d");
  const root = document.documentElement;
  if (!canvas) return;

  const fail = () => root.classList.add("no-webgl");
  if (typeof THREE === "undefined") return fail();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return fail();
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.2, 14);

  /* ---------- Ambiente para reflexos cromados ---------- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0x0c0c0c, side: THREE.BackSide })));
  const panel = (color, w, h, x, y, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    envScene.add(m);
  };
  panel(0xffffff, 6, 14, -8, 0, 2, Math.PI / 2);
  panel(0x2f5bea, 4, 10, 8, 1, -2, -Math.PI / 2);
  panel(0xffffff, 10, 2, 0, 8, 0, 0);
  panel(0xffffff, 12, 3, 0, 2, 9, Math.PI);
  panel(0xe0312b, 4, 8, 3, -2, -9, 0);
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;

  /* ---------- Textura listrada ---------- */
  const tex = (() => {
    const s = 512;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const g = c.getContext("2d");
    const colors = ["#d8241e", "#f4f1ea", "#1b3c97", "#f4f1ea"];
    const band = 64; // 4 faixas = 256px, divide 512 => emenda perfeita
    for (let x = -s * 2, i = 0; x < s * 2; x += band, i++) {
      g.fillStyle = colors[((i % 4) + 4) % 4];
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + band, 0);
      g.lineTo(x + band + s, s);
      g.lineTo(x + s, s);
      g.closePath();
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 2.2);
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.encoding = THREE.sRGBEncoding;
    return t;
  })();

  /* ---------- Conjunto (poste + asas) ---------- */
  const logo = new THREE.Group();
  scene.add(logo);

  /* ---------- Poste ---------- */
  const pole = new THREE.Group();
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdedede, metalness: 1, roughness: 0.18 });
  const darkChrome = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.3 });
  const H = 3.6;

  pole.add(new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.46, H, 64, 1, true),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.05 })
  ));
  pole.add(new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.54, H, 64, 1, true),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 })
  ));

  const cap = (dir) => {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.16, 64), chrome);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.22, 64), darkChrome);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.6, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), chrome);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 16), chrome);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.25, 24), chrome);
    ring.position.y = 0.08;
    band.position.y = 0.27;
    dome.position.y = 0.38;
    neck.position.y = 1.0;
    knob.position.y = 1.18;
    g.add(ring, band, dome, neck, knob);
    g.position.y = dir * (H / 2);
    if (dir < 0) g.rotation.x = Math.PI;
    return g;
  };
  pole.add(cap(1), cap(-1));
  logo.add(pole);

  /* ---------- Asas ---------- */
  // Pena: folha alongada com ponta, extrudada com chanfro para pegar reflexo.
  const featherGeo = (L, w) => {
    const s = new THREE.Shape();
    s.moveTo(0, -w * 0.22);
    s.quadraticCurveTo(L * 0.35, -w, L * 0.82, -w * 0.62);
    s.quadraticCurveTo(L * 0.98, -w * 0.35, L, 0.02);
    s.quadraticCurveTo(L * 0.96, w * 0.45, L * 0.78, w * 0.66);
    s.quadraticCurveTo(L * 0.35, w * 0.95, 0, w * 0.22);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.025, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 2, curveSegments: 10,
    });
    g.translate(0, 0, -0.0125);
    return g;
  };

  const featherMats = [
    new THREE.MeshStandardMaterial({ color: 0xa9abae, metalness: 0.9, roughness: 0.32 }), // rêmiges (fundo)
    new THREE.MeshStandardMaterial({ color: 0xcfd1d4, metalness: 0.9, roughness: 0.26 }), // coberteiras médias
    new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.85, roughness: 0.22 }), // coberteiras pequenas
  ];
  const lerp = (a, b, t) => a + (b - a) * t;
  const deg = Math.PI / 180;

  const buildWing = () => {
    const wing = new THREE.Group();
    // borda de ataque: do ombro (junto ao poste) subindo e abrindo até a ponta
    const edge = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.0, 0),
      new THREE.Vector3(0.75, 0.9, 0.05),
      new THREE.Vector3(1.6, 1.75, 0.1),
      new THREE.Vector3(2.5, 2.25, 0.05),
      new THREE.Vector3(3.15, 2.2, -0.05),
    ]);

    // rêmiges longas atrás, coberteiras menores na frente (como no logo)
    const layers = [
      { n: 15, len: [1.0, 2.5], w: 0.22, z: -0.14, ang: [-100, -42], t: [0.0, 1.0], mat: 0 },
      { n: 12, len: [0.75, 1.4], w: 0.21, z: -0.02, ang: [-96, -52], t: [0.0, 0.85], mat: 1 },
      { n: 10, len: [0.42, 0.75], w: 0.19, z: 0.1, ang: [-92, -60], t: [0.0, 0.7], mat: 2 },
    ];

    layers.forEach((layer) => {
      for (let i = 0; i < layer.n; i++) {
        const k = i / (layer.n - 1);
        const t = lerp(layer.t[0], layer.t[1], k);
        const p = edge.getPoint(t);
        const L = lerp(layer.len[0], layer.len[1], Math.pow(k, 0.85));
        const f = new THREE.Mesh(featherGeo(L, layer.w), featherMats[layer.mat]);
        f.position.set(p.x, p.y, p.z + layer.z + i * 0.006);
        f.rotation.order = "ZYX";
        f.rotation.z = lerp(layer.ang[0], layer.ang[1], k) * deg;
        f.rotation.x = 0.25 - k * 0.15; // gira a pena no próprio eixo: sobreposição em leque
        f.rotation.y = -0.12 * k;      // pontas curvam levemente pra trás
        wing.add(f);
      }
    });

    // osso da asa (borda superior)
    const bone = new THREE.Mesh(new THREE.TubeGeometry(edge, 64, 0.075, 12, false), featherMats[2]);
    bone.position.z = 0.16;
    wing.add(bone);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), featherMats[2]);
    tip.position.copy(edge.getPoint(1)).z += 0.16;
    wing.add(tip);
    return wing;
  };

  // Pivô no ombro, atrás do poste, na metade de cima (igual ao logo)
  const makeSide = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.35, 0.25, -0.3);
    const wing = buildWing();
    if (side < 0) wing.scale.x = -1;
    pivot.add(wing);
    logo.add(pivot);
    return pivot;
  };
  const wingR = makeSide(1);
  const wingL = makeSide(-1);

  /* ---------- Partículas ---------- */
  const count = 160;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2 + Math.random() * 4;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = Math.sin(a) * r - 2;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  // partículas metade vermelhas, metade azuis
  const pCol = new Float32Array(count * 3);
  const red = new THREE.Color(0xff4a50), blue = new THREE.Color(0x5b85ff);
  for (let i = 0; i < count; i++) (i % 2 ? red : blue).toArray(pCol, i * 3);
  pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ vertexColors: true, size: 0.04, transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(particles);

  /* ---------- Luzes ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-4, 5, 6);
  scene.add(key);
  const rimBlue = new THREE.PointLight(0x2f6bff, 2.6, 16);
  rimBlue.position.set(4, 1.5, 1.5);
  scene.add(rimBlue);
  const rimRed = new THREE.PointLight(0xe0312b, 1.4, 14);
  rimRed.position.set(-4, -2.5, 1);
  scene.add(rimRed);

  /* ---------- Tamanho: enquadra largura (asas) e altura (poste) ---------- */
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
    const distH = 6.9 / 2 / tanHalf;
    const distW = 10.2 / 2 / (tanHalf * camera.aspect);
    camera.position.z = Math.max(distH, distW, 9);
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  /* ---------- Interação ---------- */
  let dragging = false;
  let lastX = 0;
  let dragYaw = 0;   // giro vindo do arraste, volta devagar pra frente
  let dragVel = 0;
  let targetTiltX = 0, tiltX = 0;

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    dragVel = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    dragYaw += dx * 0.012;
    dragVel = dx * 0.6;
  });
  const endDrag = () => { dragging = false; };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      targetTiltX = (e.clientY / window.innerHeight - 0.5) * 0.3;
    }, { passive: true });
  }

  /* ---------- Loop ---------- */
  let visible = true;
  let raf = 0;
  let last = performance.now();

  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const t = now / 1000;

    if (!dragging) {
      // inércia do arraste, depois volta a encarar a frente (o logo nunca fica de costas por muito tempo)
      dragYaw += dragVel * dt;
      dragVel *= Math.pow(0.04, dt);
      dragYaw *= Math.pow(0.35, dt);
    }

    const sway = reduceMotion ? 0 : Math.sin(t * 0.5) * 0.35;
    logo.rotation.y = sway + dragYaw;

    tiltX += (targetTiltX - tiltX) * 0.06;
    logo.rotation.x = tiltX;

    if (!reduceMotion) {
      pole.rotation.y += dt * 0.6;     // poste gira no próprio eixo
      tex.offset.y -= dt * 0.18;       // listras "subindo"
      logo.position.y = Math.sin(t * 1.1) * 0.08;

      // batida de asa suave: abre pra trás e sobe um pouco
      const flap = Math.sin(t * 1.6);
      wingR.rotation.y = 0.28 + flap * 0.12;
      wingL.rotation.y = -0.28 - flap * 0.12;
      wingR.rotation.z = flap * 0.05;
      wingL.rotation.z = -flap * 0.05;

      particles.rotation.y += dt * 0.05;
      particles.position.y = Math.sin(t * 0.4) * 0.2;
    } else {
      wingR.rotation.y = 0.28;
      wingL.rotation.y = -0.28;
    }

    renderer.render(scene, camera);
    raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  };

  const start = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    }).observe(canvas);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visible) start(); });

  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; fail(); });

  start();
})();
