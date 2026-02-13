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
// ✅ 스트로브 컬러
// - 기본: White (시작은 화이트)
// - PC: 스크롤하면 Neon Green ↔ Cyan 토글
// - Mobile: 흔들면 Neon Green ↔ Cyan 토글
// - ✅ 추가: 다시 "클릭(=mousedown)" 하면 즉시 White로 리셋 (다음 스트로브부터 화이트)
// ============================
let strobeMode = "white"; // "white" | "toggle"
let toggleIndex = 0;

// Neon Green / Cyan
const TOGGLE_COLORS = [
  { r: 57, g: 255, b: 20 },  // Neon Green
  { r: 0,  g: 255, b: 255 }  // Cyan
];

function toggleStrobeColor() {
  // 스크롤/쉐이크가 "처음" 발생하면 화이트에서 토글 모드로 전환
  if (strobeMode === "white") strobeMode = "toggle";
  toggleIndex = (toggleIndex + 1) % TOGGLE_COLORS.length;
}

function resetStrobeToWhite() {
  strobeMode = "white";
}

function getStrobeRGB() {
  if (strobeMode === "white") return { r: 255, g: 255, b: 255 };
  return TOGGLE_COLORS[toggleIndex];
}

// 데스크탑: 스크롤하면 컬러 토글
if (!isMobile) {
  window.addEventListener("wheel", () => {
    toggleStrobeColor();
  }, { passive: true });
}
// ============================
// ✅ 모바일: 흔들기 감지 (권한 포함)
// ============================
let lastShakeTime = 0;
let lastMagnitude = 0;
const SHAKE_THRESHOLD = 14;   // ✅ 좀 더 민감하게 (16 → 14)
const SHAKE_COOLDOWN = 450;

function onDeviceMotion(e) {
  const acc = e.accelerationIncludingGravity;
  if (!acc) return;

  const x = acc.x || 0;
  const y = acc.y || 0;
  const z = acc.z || 0;

  const magnitude = Math.sqrt(x * x + y * y + z * z);
  const delta = Math.abs(magnitude - lastMagnitude);
  lastMagnitude = magnitude;

  const now = Date.now();
  if (delta > SHAKE_THRESHOLD && now - lastShakeTime > SHAKE_COOLDOWN) {
    toggleStrobeColor();
    lastShakeTime = now;
  }
}

let motionPermissionGranted = false;
let motionPermissionRequested = false;

async function requestMotionPermission() {
  if (motionPermissionRequested) return;
  motionPermissionRequested = true;

  // iOS
  if (typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function") {
    try {
      const state = await DeviceMotionEvent.requestPermission();
      if (state === "granted") {
        motionPermissionGranted = true;
        window.addEventListener("devicemotion", onDeviceMotion, { passive: true });
      }
    } catch (e) {
      // denied or error
    }
  } else {
    // Android etc
    motionPermissionGranted = true;
    window.addEventListener("devicemotion", onDeviceMotion, { passive: true });
  }
}

// ✅ 핵심: 첫 "진짜" 탭에서 권한 요청 (preventDefault 없이)
if (isMobile) {
  window.addEventListener("pointerdown", () => {
    requestMotionPermission();
  }, { once: true });
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

document.addEventListener("touchstart", e => {
  if (e.target.closest(".navbar a")) return;

  e.preventDefault();
  pressStartTime = Date.now();
  isDragging = false;
  isStrobing = false;

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
}, { passive: false });

document.addEventListener("touchmove", e => {
  e.preventDefault();
  const touch = e.touches[0];
  if (!touch) return;

  mouseX = touch.clientX;
  mouseY = touch.clientY;
  isDragging = true;
}, { passive: false });

document.addEventListener("touchend", () => {
  isDragging = false;
  isStrobing = false;

  beam.style.display = "none";
  clearTimeout(longPressTimeout);
}, { passive: false });



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
        window.location.href = "about.html"; // 실제 About 페이지 연결
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

        if (distance < 150) {
            aboutBtn.classList.add("beam-hover");
        } else {
            aboutBtn.classList.remove("beam-hover");
        }
    }

    handleStrobe(timestamp);
    requestAnimationFrame(animateBeam);
}




requestAnimationFrame(animateBeam);


function createMotionButton() {
  const btn = document.createElement("button");
  btn.textContent = "Enable Motion";
  btn.style.position = "fixed";
  btn.style.left = "50%";
  btn.style.top = "50%";
  btn.style.transform = "translate(-50%, -50%)";
  btn.style.zIndex = "20000";
  btn.style.padding = "10px 14px";
  btn.style.fontSize = "14px";
  btn.style.background = "rgba(255,255,255,0.08)";
  btn.style.color = "white";
  btn.style.border = "1px solid rgba(255,255,255,0.25)";
  btn.style.backdropFilter = "blur(10px)";

  btn.addEventListener("click", async () => {
    await requestMotionPermission(); // 너 코드에 있는 함수 그대로 사용
    if (motionPermissionGranted) btn.remove();
  });

  document.body.appendChild(btn);
}

// 모바일이면 버튼 띄우기
if (isMobile) createMotionButton();
