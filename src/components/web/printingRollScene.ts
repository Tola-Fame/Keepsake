// "Every page, printed for real": a paper roll that follows the pointer and lays
// printed Keepsake pages on the floor behind it. Loaded only when visible.
import * as THREE from "three";

export interface RollScene {
  setPaused(p: boolean): void;
  setRunning(r: boolean): void;
  dispose(): void;
}

interface Options {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  reducedMotion: boolean;
  onPrinted: (count: number) => void;
}

// sizes in world units
const SHEET_W = 1.7; // across the path
const SHEET_L = 1.275; // along the path (4:3 pages)
const SHEET_GAP = 0.07;
const ROLL_R = 0.95;
const ROLL_W = SHEET_W * 1.08;
const POOL = 90;
const PAGES = 8;
const PAPER = 0xfbf7f3;

// ---------- page artwork (drawn once into one texture) ----------

function loadImg(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function drawAtlas() {
  const CW = 512;
  const CH = 384;
  const cv = document.createElement("canvas");
  cv.width = CW * PAGES;
  cv.height = CH;
  const g = cv.getContext("2d")!;
  try {
    await document.fonts.load("800 40px Nunito");
    await document.fonts.load("700 20px Nunito");
  } catch {
    /* fall back to system fonts */
  }
  const photos = await Promise.all(Array.from({ length: 11 }, (_, i) => loadImg(`/brand/ribbon/${String(i + 1).padStart(2, "0")}.jpg`)));
  const ph = (i: number) => photos[i % photos.length];

  const font = (w: number, size: number) => `${w} ${size}px Nunito, system-ui, sans-serif`;
  const photo = (i: number, x: number, y: number, w: number, h: number, frame = 8, rot = 0) => {
    g.save();
    g.translate(x + w / 2, y + h / 2);
    g.rotate((rot * Math.PI) / 180);
    g.shadowColor = "rgba(46,43,48,0.18)";
    g.shadowBlur = 10;
    g.shadowOffsetY = 3;
    g.fillStyle = "#fff";
    g.fillRect(-w / 2 - frame, -h / 2 - frame, w + frame * 2, h + frame * 2);
    g.shadowColor = "transparent";
    const im = ph(i);
    if (im) {
      // cover-crop
      const s = Math.max(w / im.width, h / im.height);
      const sw = w / s;
      const sh = h / s;
      g.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, -w / 2, -h / 2, w, h);
    } else {
      g.fillStyle = "#e9dfd4";
      g.fillRect(-w / 2, -h / 2, w, h);
    }
    g.restore();
  };
  const text = (t: string, x: number, y: number, size: number, color: string, weight = 800, align: CanvasTextAlign = "left") => {
    g.fillStyle = color;
    g.font = font(weight, size);
    g.textAlign = align;
    g.fillText(t, x, y);
    g.textAlign = "left";
  };
  const bars = (x: number, y: number, w: number, n: number, color: string) => {
    g.fillStyle = color;
    for (let r = 0; r < n; r++) g.fillRect(x, y + r * 14, w * (r === n - 1 ? 0.55 : 0.9), 6);
  };

  const pages: ((x: number) => void)[] = [
    // cover
    (x) => {
      g.fillStyle = "#fbd5c5";
      g.fillRect(x, 0, CW, CH);
      text("LISBON & PORTO", x + CW / 2, 74, 40, "#2e2b30", 800, "center");
      text("July 3 – 5, 2026", x + CW / 2, 106, 18, "#6e6870", 700, "center");
      photo(4, x + 136, 138, 240, 180, 10, -2);
    },
    // day opener
    (x) => {
      g.fillStyle = "#cdeedd";
      g.fillRect(x, 0, CW, CH);
      photo(1, x + 36, 40, 270, 300, 0);
      text("Day 1", x + 336, 120, 40, "#2e2b30");
      text("Friday, July 3", x + 336, 152, 18, "#3d6e57", 700);
      bars(x + 336, 184, 140, 3, "rgba(46,43,48,0.18)");
    },
    // two photos + caption
    (x) => {
      g.fillStyle = "#fffdf9";
      g.fillRect(x, 0, CW, CH);
      photo(3, x + 34, 42, 210, 220, 8, -1.5);
      photo(9, x + 270, 42, 210, 220, 8, 1.5);
      text("Pastéis de nata every morning", x + CW / 2, 330, 22, "#c41f63", 800, "center");
    },
    // scrapbook collage
    (x) => {
      g.fillStyle = "#e3d9f6";
      g.fillRect(x, 0, CW, CH);
      photo(6, x + 40, 50, 190, 140, 10, -6);
      photo(2, x + 270, 40, 190, 140, 10, 5);
      photo(0, x + 150, 200, 210, 140, 10, 2);
    },
    // grid
    (x) => {
      g.fillStyle = "#fff0b8";
      g.fillRect(x, 0, CW, CH);
      [0, 1, 2, 3].forEach((k) => photo(k + 5, x + 40 + (k % 2) * 222, 34 + Math.floor(k / 2) * 162, 210, 150, 0));
    },
    // full photo + caption
    (x) => {
      g.fillStyle = "#cfe6f8";
      g.fillRect(x, 0, CW, CH);
      photo(10, x + 36, 32, 440, 260, 0);
      text("Wish you were here", x + 40, 344, 24, "#24507a");
    },
    // day two
    (x) => {
      g.fillStyle = "#f9d3df";
      g.fillRect(x, 0, CW, CH);
      text("Day 2", x + 40, 76, 40, "#2e2b30");
      text("Saturday, July 4", x + 40, 106, 18, "#a3355e", 700);
      photo(7, x + 40, 136, 200, 200, 8, -2);
      photo(8, x + 272, 60, 200, 276, 8, 2);
    },
    // closing
    (x) => {
      g.fillStyle = "#353234";
      g.fillRect(x, 0, CW, CH);
      photo(1, x + 316, 92, 150, 150, 8, 4);
      text("Until the", x + 44, 150, 38, "#fbf7f3");
      text("next trip", x + 44, 194, 38, "#ff6fae");
      text("KEEPSAKE", x + 44, 330, 14, "rgba(251,247,243,0.6)");
    },
  ];
  pages.forEach((draw, i) => {
    const x = i * CW;
    g.save();
    g.beginPath();
    g.rect(x, 0, CW, CH);
    g.clip();
    draw(x);
    // soft paper edge
    g.strokeStyle = "rgba(46,43,48,0.08)";
    g.lineWidth = 2;
    g.strokeRect(x + 1, 1, CW - 2, CH - 2);
    g.restore();
  });
  return cv;
}

function drawBarrel() {
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#fdfbf7";
  g.fillRect(0, 0, 1024, 256);
  // faint wrapped paper layers
  for (let y = 0; y < 256; y += 3) {
    g.fillStyle = `rgba(110,104,112,${0.02 + (y % 9 === 0 ? 0.03 : 0)})`;
    g.fillRect(0, y, 1024, 1);
  }
  // pink edge bands
  g.fillStyle = "#e2337a";
  g.fillRect(0, 0, 1024, 10);
  g.fillRect(0, 246, 1024, 10);
  g.fillStyle = "rgba(226,51,122,0.18)";
  for (let x = 40; x < 1024; x += 128) g.fillRect(x, 60, 70, 136);
  return cv;
}

function drawCap() {
  const S = 512;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#f6f1ea";
  g.fillRect(0, 0, S, S);
  for (let r = S * 0.24; r < S / 2; r += 3) {
    g.strokeStyle = `rgba(150,138,128,${0.08 + ((r * 7) % 5) * 0.02})`;
    g.lineWidth = 1;
    g.beginPath();
    g.arc(S / 2, S / 2, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#e2337a";
  g.beginPath();
  g.arc(S / 2, S / 2, S * 0.22, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  g.font = "800 64px Nunito, system-ui, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("K", S / 2, S / 2 + 4);
  return cv;
}

// ---------- scene ----------

export async function createRollScene({ canvas, container, reducedMotion, onPrinted }: Options): Promise<RollScene> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAPER);
  scene.fog = new THREE.Fog(PAPER, 16, 34);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 120);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xf2e6dc, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);

  const floorMat = new THREE.MeshStandardMaterial({ color: PAPER, roughness: 1 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // textures
  const atlas = new THREE.CanvasTexture(await drawAtlas());
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const barrelTex = new THREE.CanvasTexture(drawBarrel());
  barrelTex.colorSpace = THREE.SRGBColorSpace;
  barrelTex.wrapS = THREE.RepeatWrapping;
  barrelTex.repeat.set(2, 1);
  const capTex = new THREE.CanvasTexture(drawCap());
  capTex.colorSpace = THREE.SRGBColorSpace;

  // the roll
  const roll = new THREE.Group();
  const spin = new THREE.Group();
  roll.add(spin);
  scene.add(roll);
  const barrelGeo = new THREE.CylinderGeometry(ROLL_R, ROLL_R, ROLL_W, 64, 1, true).rotateZ(Math.PI / 2);
  const barrelMat = new THREE.MeshStandardMaterial({ map: barrelTex, roughness: 0.85 });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrel.castShadow = true;
  spin.add(barrel);
  const capGeo = new THREE.CircleGeometry(ROLL_R, 64);
  const capMat = new THREE.MeshStandardMaterial({ map: capTex, roughness: 0.9 });
  for (const side of [1, -1]) {
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.rotation.y = (side * Math.PI) / 2;
    cap.position.x = (side * ROLL_W) / 2;
    cap.castShadow = true;
    spin.add(cap);
  }

  // printed sheets: a recycled pool, one geometry per page so they share one material
  const sheetMat = new THREE.MeshStandardMaterial({ map: atlas, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1 });
  const pageGeos = Array.from({ length: PAGES }, (_, k) => {
    const geo = new THREE.PlaneGeometry(SHEET_W, SHEET_L).rotateX(-Math.PI / 2);
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setX(i, (k + uv.getX(i)) / PAGES);
    uv.needsUpdate = true;
    return geo;
  });
  const sheets = Array.from({ length: POOL }, () => {
    const m = new THREE.Mesh(pageGeos[0], sheetMat);
    m.receiveShadow = true;
    m.visible = false;
    scene.add(m);
    return { mesh: m, born: -1 };
  });
  let nextSheet = 0;
  let printed = 0;

  // motion state
  const pos = new THREE.Vector2(0, 0);
  const vel = new THREE.Vector2(0, 0);
  const goal = new THREE.Vector2(0, 0);
  let heading = 0;
  let rolled = 0; // total distance
  let sinceSheet = SHEET_L;
  let wander = 0.6;
  let clockT = 0;

  const placeSheet = (t: number) => {
    const s = sheets[nextSheet];
    nextSheet = (nextSheet + 1) % POOL;
    const fx = Math.sin(heading);
    const fz = Math.cos(heading);
    const back = SHEET_L / 2 + ROLL_R * 0.15;
    s.mesh.geometry = pageGeos[printed % PAGES];
    s.mesh.position.set(pos.x - fx * back, 0.004 + (printed % POOL) * 0.00035, pos.y - fz * back);
    s.mesh.rotation.y = heading + Math.PI + (((printed * 37) % 7) - 3) * 0.012;
    s.mesh.scale.set(1, 1, 0.25);
    s.mesh.visible = true;
    s.born = t;
    printed++;
    onPrinted(printed);
  };

  const step = (dt: number, t: number, steer: THREE.Vector2 | null) => {
    if (steer) goal.copy(steer);
    else {
      wander += dt * (0.45 + 0.4 * Math.sin(t * 0.27) + 0.25 * Math.sin(t * 0.09 + 1.3));
      goal.set(pos.x + Math.sin(wander) * 4.5, pos.y + Math.cos(wander) * 4.5);
    }
    // damped spring toward the goal
    const ax = (goal.x - pos.x) * 9 - vel.x * 4.2;
    const az = (goal.y - pos.y) * 9 - vel.y * 4.2;
    vel.x += ax * dt;
    vel.y += az * dt;
    const sp = vel.length();
    if (sp > 6) vel.multiplyScalar(6 / sp);
    const dx = vel.x * dt;
    const dz = vel.y * dt;
    const d = Math.hypot(dx, dz);
    pos.x += dx;
    pos.y += dz;
    rolled += d;
    if (sp > 0.08) {
      const want = Math.atan2(vel.x, vel.y);
      let diff = want - heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      heading += diff * (1 - Math.exp(-6 * dt));
    }
    sinceSheet += d;
    if (sinceSheet >= SHEET_L + SHEET_GAP) {
      sinceSheet = 0;
      placeSheet(t);
    }
  };

  const applyPose = (t: number) => {
    roll.position.set(pos.x, ROLL_R, pos.y);
    roll.rotation.y = heading;
    spin.rotation.x = rolled / ROLL_R;
    for (const s of sheets) {
      if (s.born < 0) continue;
      const a = Math.min(1, (t - s.born) / 0.35);
      s.mesh.scale.z = 0.25 + 0.75 * (1 - Math.pow(1 - a, 3));
    }
    sun.position.set(pos.x + 4, 9, pos.y + 5);
    sun.target.position.set(pos.x, 0, pos.y);
    floor.position.set(pos.x, 0, pos.y);
  };

  // camera follows from above and behind
  const camOffset = new THREE.Vector3(6.5, 7.2, 8.6);
  const camPos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const updateCamera = (dt: number, snap = false) => {
    const k = snap ? 1 : 1 - Math.exp(-2.4 * dt);
    camPos.lerp(new THREE.Vector3(pos.x + camOffset.x, camOffset.y, pos.y + camOffset.z), k);
    look.lerp(new THREE.Vector3(pos.x, 0.6, pos.y), k);
    camera.position.copy(camPos);
    camera.lookAt(look);
  };

  // pre-roll so the floor already has pages on it
  for (let i = 0; i < 420; i++) {
    clockT += 1 / 60;
    step(1 / 60, clockT, null);
  }
  for (const s of sheets) {
    if (s.born < 0) continue;
    s.born = -10;
    s.mesh.scale.z = 1;
  }
  applyPose(clockT);
  updateCamera(0, true);

  // size
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    // keep the roll clear of the text: lower on narrow screens, to the right on wide ones
    camera.fov = w < 640 ? 50 : 34;
    if (w < 640) camera.setViewOffset(w, h, 0, -h * 0.2, w, h);
    else camera.setViewOffset(w, h, -w * 0.14, -h * 0.04, w, h);
    camera.updateProjectionMatrix();
    if (reducedMotion || !running) renderer.render(scene, camera);
  };
  const ro = new ResizeObserver(resize);

  // pointer steering (mouse/pen only, so touch scrolling still works)
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  let steerAt = -1e9;
  const steer = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(floorPlane, hit)) {
      steer.set(hit.x, hit.z);
      steerAt = performance.now();
    }
  };
  canvas.addEventListener("pointermove", onMove);

  // loop
  let running = false;
  let paused = false;
  let raf = 0;
  let last = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.033, (now - (last || now)) / 1000);
    last = now;
    if (paused) return;
    clockT += dt;
    const steering = performance.now() - steerAt < 2500;
    step(dt, clockT, steering ? steer : null);
    applyPose(clockT);
    updateCamera(dt);
    renderer.render(scene, camera);
  };
  const start = () => {
    if (running || reducedMotion) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  ro.observe(container);
  resize();
  onPrinted(printed);

  return {
    setPaused(p) {
      paused = p;
    },
    setRunning(r) {
      if (r) start();
      else stop();
    },
    dispose() {
      stop();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      for (const g of pageGeos) g.dispose();
      barrelGeo.dispose();
      capGeo.dispose();
      floor.geometry.dispose();
      [floorMat, sheetMat, barrelMat, capMat].forEach((m) => m.dispose());
      [atlas, barrelTex, capTex].forEach((t) => t.dispose());
      renderer.dispose();
    },
  };
}
