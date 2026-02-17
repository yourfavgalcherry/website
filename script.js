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
