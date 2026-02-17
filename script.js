// ============================
// 빔 라이트 생성
// ============================
const beam = document.createElement("div");
beam.classList.add("beam");
document.body.appendChild(beam);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
if (isMobile) beam.style.display = "none";

let pressStartTime = 0;
let lastStrobeTime = 0;
let isMouseDown = false;

const customCursor = document.querySelector(".cursor");
if (customCursor) {
  document.addEventListener("mousemove", e => {
    customCursor.style.left = e.clientX + "px";
    customCursor.style.top = e.clientY + "px";
  });
}

// ============================
// ✅ 스트로브 컬러 (요청 반영)
// - 기본: White (시작은 화이트)
// - PC: 스크롤하면 Aurora pastel 팔레트 순환
// - Mobile: 터치 움직임 "커지면" 팔레트 / "작아지면" 화이트 복귀
// - ✅ 클릭/터치 시작 시: 화이트 리셋
// ============================
let strobeMode = "white"; // "white" | "palette"
let paletteIndex = 1;     // 0은 white, 1부터 팔레트

// Aurora pastel palette (중간에 살짝 네온끼 파스텔 핑크/그린 포함)
// Aurora pastel palette (핑크 제거 + 네온그린 살짝 + 남색 포함)
const PALETTE = [
  { r: 255, g: 255, b: 255 }, // Open White (기본)
  { r: 20,  g: 110, b: 255 }, // Deep Electric Blue
  { r: 0,   g: 200, b: 170 }, // Teal Mint
  { r: 10,  g: 60,  b: 200 }  // Darker Blue (더 묵직)
];


function nextPaletteColor() {
  if (strobeMode === "white") strobeMode = "palette";
  paletteIndex += 1;
  if (paletteIndex >= PALETTE.length) paletteIndex = 1; // 1~끝 순환
}

function resetStrobeToWhite() {
  strobeMode = "white";
  paletteIndex = 1;
}

function getStrobeRGB() {
  if (strobeMode === "white") return PALETTE[0];
  return PALETTE[paletteIndex];
}

// 데스크탑: 스크롤하면 컬러 순환
if (!isMobile) {
  window.addEventListener(
    "wheel",
    () => {
      nextPaletteColor();
    },
    { passive: true }
  );
}

// ============================
// PC 마우스 제어
// ============================
if (!isMobile) {
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener("mousedown", () => {
    // ✅ 클릭 시작할 때마다 화이트로 리셋
    resetStrobeToWhite();

    isMouseDown = true;
    pressStartTime = Date.now();
    lastStrobeTime = 0;
  });

  document.addEventListener("mouseup", () => (isMouseDown = false));
}

// ============================
// 모바일 터치 제어
// ============================
let isDragging = false;
let isStrobing = false;
let longPressTimeout = null;

const LONG_PRESS_DELAY = 500;
const STROBE_DELAY_AFTER_DRAG = 400;
const MIN_STROBE_INTERVAL = 80;
const MAX_STROBE_INTERVAL = 400;

// ✅ 모바일 움직임 강도 기반 컬러 전환
let lastTouchX = null;
let lastTouchY = null;
let lastMoveTime = 0;

// "커짐" 임계 (px/ms). 값이 작을수록 민감해짐.
const MOBILE_INTENSITY_ON = 0.9;
// "작아짐" 임계 (px/ms). ON보다 낮게 두면 히스테리시스 생겨서 깜빡임 줄어듦.
const MOBILE_INTENSITY_OFF = 0.35;

// 작아진 상태가 이 시간(ms) 유지되면 화이트로 복귀
const MOBILE_CALM_HOLD_MS = 140;
let calmSince = null;

function mobileUpdateColorByIntensity(intensity) {
  // intensity가 충분히 크면 -> 팔레트 (컬러는 순환)
  if (intensity >= MOBILE_INTENSITY_ON) {
    calmSince = null;
    // 팔레트 모드 진입 + 다음 컬러로 넘김
    nextPaletteColor();
    return;
  }

  // intensity가 충분히 작으면 -> 일정 시간 유지 후 화이트 복귀
  if (intensity <= MOBILE_INTENSITY_OFF) {
    const now = Date.now();
    if (calmSince === null) calmSince = now;

    if (now - calmSince >= MOBILE_CALM_HOLD_MS) {
      // ✅ “작아지면 화이트” 복귀
      resetStrobeToWhite();
    }
    return;
  }

  // 중간 구간: 상태 유지 (깜빡임 방지)
  calmSince = null;
}

// 터치 시작
document.addEventListener(
  "touchstart",
  e => {
    if (e.target.closest(".navbar a")) return;

    // ✅ 다시 터치했을 때도 화이트여야 함
    resetStrobeToWhite();

    e.preventDefault();
    pressStartTime = Date.now();
    isDragging = false;
    isStrobing = false;

    // 이동 강도 측정 리셋
    lastTouchX = null;
    lastTouchY = null;
    lastMoveTime = 0;
    calmSince = null;

    beam.style.display = "block";

    longPressTimeout = setTimeout(() => {
      if (isDragging) {
        setTimeout(() => {
          isStrobing = true;
          lastStrobeTime = 0;
        }, STROBE_DELAY_AFTER_DRAG);
      } else {
        isStrobing = true;
        lastStrobeTime = 0;
      }
    }, LONG_PRESS_DELAY);
  },
  { passive: false }
);

// 터치 이동
document.addEventListener(
  "touchmove",
  e => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;

    mouseX = touch.clientX;
    mouseY = touch.clientY;
    isDragging = true;

    const now = performance.now();

    if (lastTouchX !== null && lastTouchY !== null && lastMoveTime) {
      const dx = mouseX - lastTouchX;
      const dy = mouseY - lastTouchY;
      const dist = Math.hypot(dx, dy);

      const dt = Math.max(now - lastMoveTime, 1); // ms
      const intensity = dist / dt; // px/ms

      // ✅ 커지면 팔레트 / 작아지면 화이트
      mobileUpdateColorByIntensity(intensity);
    }

    lastTouchX = mouseX;
    lastTouchY = mouseY;
    lastMoveTime = now;
  },
  { passive: false }
);

// 터치 종료
document.addEventListener(
  "touchend",
  () => {
    isDragging = false;
    isStrobing = false;

    beam.style.display = "none";
    clearTimeout(longPressTimeout);

    // ✅ 터치 끝나면 화이트로 복귀 (원하면 유지로 바꿀 수도 있음)
    resetStrobeToWhite();

    lastTouchX = null;
    lastTouchY = null;
    lastMoveTime = 0;
    calmSince = null;
  },
  { passive: false }
);

// ============================
// 전체 화면 스트로브
// ============================
function handleStrobe(timestamp) {
  const active = (!isMobile && isMouseDown) || (isMobile && isStrobing);
  if (!active) return;

  const heldTime = Date.now() - pressStartTime;

  let interval = MAX_STROBE_INTERVAL - heldTime / 5;
  interval = Math.max(interval, MIN_STROBE_INTERVAL);
  interval += Math.random() * 60;

  if (!lastStrobeTime || timestamp - lastStrobeTime > interval) {
    screenStrobe();
    lastStrobeTime = timestamp;
  }
}

function screenStrobe() {
  const { r, g, b } = getStrobeRGB();


  // ✅ 여기 추가: strobe가 실제로 터질 때마다 SFX도 같이
  // 에너지는 “눌린 시간” 기반으로 넣으면 속도감 맞음 (아래 예시)
  const heldTime = Date.now() - pressStartTime;
  const energy = Math.min(1, heldTime / 2000); // 0~1
  playStrobeSfx(energy);




  const strobe = document.createElement("div");
  strobe.style.position = "fixed";
  strobe.style.top = "0";
  strobe.style.left = "0";
  strobe.style.width = "100%";
  strobe.style.height = "100%";
  strobe.style.pointerEvents = "none";
  strobe.style.zIndex = "9999";

  strobe.style.background = `
    linear-gradient(to top,
    rgba(${r},${g},${b},0) 0%,
    rgba(${r},${g},${b},0.7) 30%,
    rgba(${r},${g},${b},1) 50%,
    rgba(${r},${g},${b},0.7) 70%,
    rgba(${r},${g},${b},0) 100%)`;
  strobe.style.opacity = "0";
  strobe.style.transition = "opacity 0.1s linear, background-position 0.1s linear";

  document.body.appendChild(strobe);

  requestAnimationFrame(() => (strobe.style.opacity = "1"));

  setTimeout(() => {
    strobe.style.backgroundPosition = "0 -50%";
  }, 50);

  setTimeout(() => {
    strobe.style.background = `rgba(${r},${g},${b},1)`;
  }, 70);

  setTimeout(() => (strobe.style.opacity = "0"), 100);
  setTimeout(() => strobe.remove(), 150);
}

// ============================
// About 버튼 반응 & 클릭
// ============================
const aboutBtn = document.querySelector(".navbar a");

if (aboutBtn) {
  aboutBtn.addEventListener("click", () => {
    window.location.href = "about.html";
  });
}

function animateBeam(timestamp) {
  // PC: 항상 마우스 따라감
  if (!isMobile) {
    const x = mouseX - beam.offsetWidth / 2;
    const y = mouseY - beam.offsetHeight / 2;
    beam.style.transform = `translate(${x}px, ${y}px)`;

    const flicker = 0.8 + Math.random() * 0.2;
    beam.style.filter = `blur(60px) brightness(${flicker})`;
  }

  // 모바일: 터치 중일 때만 움직임
  if (isMobile && isDragging) {
    const x = mouseX - beam.offsetWidth / 2;
    const y = mouseY - beam.offsetHeight / 2;
    beam.style.transform = `translate(${x}px, ${y}px)`;

    const flicker = 0.8 + Math.random() * 0.2;
    beam.style.filter = `blur(40px) brightness(${flicker})`;
  }

  // About 버튼 glow 처리 (PC/모바일 공통)
  if (aboutBtn) {
    const rect = aboutBtn.getBoundingClientRect();
    const btnX = rect.left + rect.width / 2;
    const btnY = rect.top + rect.height / 2;
    const distance = Math.hypot(mouseX - btnX, mouseY - btnY);

    if (distance < 150) aboutBtn.classList.add("beam-hover");
    else aboutBtn.classList.remove("beam-hover");
  }

  handleStrobe(timestamp);
  requestAnimationFrame(animateBeam);
}

requestAnimationFrame(animateBeam);


// ============================
// ✅ AUDIO: first-gesture unlock + ambient loop + strobe SFX sync
// ============================
const ambientEl = document.getElementById("ambient");
const sfxEl = document.getElementById("sfx");

let audioUnlocked = false;
let audioCtx = null;
let sfxBuffer = null;
let ambientSource = null;
let ambientGain = null;
let sfxGain = null;

// (선택) 속도에 따라 SFX pitch 약간 변형하고 싶을 때
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

async function unlockAudioOnce() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  // WebAudio가 동기/정밀 타이밍에 훨씬 유리
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // iOS/모바일에서는 resume 필요할 때가 많음
  if (audioCtx.state === "suspended") {
    try { await audioCtx.resume(); } catch(e) {}
  }

  // 앰비언트: HTMLAudio를 WebAudio로 라우팅 (볼륨/필터 제어 쉬움)
  ambientGain = audioCtx.createGain();
  ambientGain.gain.value = 0.35; // 기본 앰비언트 볼륨 (원하는 값으로)
  ambientGain.connect(audioCtx.destination);

  // HTMLAudio를 node로 연결
  if (ambientEl) {
    const ambientNode = audioCtx.createMediaElementSource(ambientEl);
    ambientNode.connect(ambientGain);

    // 재생 시도
    try {
      await ambientEl.play();
    } catch(e) {
      // 그래도 안 되면(브라우저 정책) 유저가 볼 수 있게 UX 처리 필요
      console.log("ambient autoplay blocked:", e);
    }
  }

  // SFX: 버퍼로 로딩 (매 스트로브마다 정확히 재생)
  sfxGain = audioCtx.createGain();
  sfxGain.gain.value = 0.9; // 효과음 볼륨
  sfxGain.connect(audioCtx.destination);

  if (sfxEl?.src) {
    const res = await fetch(sfxEl.src);
    const arr = await res.arrayBuffer();
    sfxBuffer = await audioCtx.decodeAudioData(arr);
  }
}

// ✅ “첫 인터랙션”에서만 오디오 언락
// (너 페이지 컨셉상 Click/Touch가 이미 있으니 자연스럽게 맞음)
window.addEventListener("pointerdown", unlockAudioOnce, { once: true });

// 스트로브 SFX 재생
function playStrobeSfx(energy = 0.5) {
  if (!audioCtx || !sfxBuffer || audioCtx.state !== "running") return;

  const src = audioCtx.createBufferSource();
  src.buffer = sfxBuffer;

  // energy(0~1) 기반으로 살짝 피치 변형하면 “속도 맞는 느낌”이 남
  const playbackRate = 0.95 + clamp(energy, 0, 1) * 0.25; // 0.95~1.20
  src.playbackRate.value = playbackRate;

  // 클릭/팝 방지: 아주 짧게 어택/릴리즈
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);

  src.connect(g);
  g.connect(sfxGain);

  src.start();
}
