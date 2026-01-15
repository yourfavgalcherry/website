// ============================
// 빔 라이트 생성
// ============================
const beam = document.createElement("div");
beam.classList.add("beam");
document.body.appendChild(beam);

// 초기 위치
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// 모바일 체크
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// 모바일: 기본 숨김
if (isMobile) beam.style.display = "none";

// ============================
// 공통 상태
// ============================
let pressStartTime = 0;
let lastStrobeTime = 0;

// ============================
// PC 제어
// ============================
let isMouseDown = false;

if (!isMobile) {
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener("mousedown", () => {
        isMouseDown = true;
        pressStartTime = Date.now();
        lastStrobeTime = 0;
    });

    document.addEventListener("mouseup", () => {
        isMouseDown = false;
    });
}

// ============================
// 모바일 터치 제어
// ============================
let isDragging = false;
let isStrobing = false;
let longPressTimeout = null;

const LONG_PRESS_DELAY = 500;

document.addEventListener(
    "touchstart",
    (e) => {
        e.preventDefault();

        pressStartTime = Date.now();
        isDragging = false;
        isStrobing = false;

        longPressTimeout = setTimeout(() => {
            isStrobing = true;
            lastStrobeTime = 0;
        }, LONG_PRESS_DELAY);
    },
    { passive: false }
);

document.addEventListener(
    "touchmove",
    (e) => {
        e.preventDefault();

        const touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;

        isDragging = true;
        beam.style.display = "block";
    },
    { passive: false }
);

document.addEventListener(
    "touchend",
    () => {
        isDragging = false;
        isStrobing = false;
        beam.style.display = "none";

        clearTimeout(longPressTimeout);
    },
    { passive: false }
);

// ============================
// 스트로브 처리 (PC + 모바일 공통)
// ============================
function handleStrobe(timestamp) {
    const active =
        (!isMobile && isMouseDown) ||
        (isMobile && isStrobing);

    if (!active) return;

    const heldTime = Date.now() - pressStartTime;

    // 🔥 점진적 가속
    const minInterval = 50;
    const maxInterval = 300;
    const interval = Math.max(
        minInterval,
        maxInterval - heldTime / 5
    );

    if (!lastStrobeTime || timestamp - lastStrobeTime > interval) {
        screenStrobe();
        lastStrobeTime = timestamp;
    }
}

// ============================
// 화면 스트로브
// ============================
function screenStrobe() {
    const strobe = document.createElement("div");
    strobe.style.position = "fixed";
    strobe.style.top = "0";
    strobe.style.left = "0";
    strobe.style.width = "100%";
    strobe.style.height = "100%";
    strobe.style.backgroundColor = "white";
    strobe.style.opacity = "0.85";
    strobe.style.zIndex = "9999";
    strobe.style.pointerEvents = "none";
    strobe.style.transition = "opacity 0.05s linear";

    document.body.appendChild(strobe);

    requestAnimationFrame(() => {
        strobe.style.opacity = "0";
    });

    setTimeout(() => strobe.remove(), 120);
}

// ============================
// 빔 애니메이션 루프
// ============================
function animateBeam(timestamp) {
    if (!isMobile || isDragging) {
        const x = mouseX - beam.offsetWidth / 2;
        const y = mouseY - beam.offsetHeight / 2;
        beam.style.transform = `translate(${x}px, ${y}px)`;

        const flicker = 0.8 + Math.random() * 0.2;

        beam.style.filter = isMobile
            ? `blur(40px) brightness(${flicker})`
            : `blur(60px) brightness(${flicker})`;
    }

    handleStrobe(timestamp);
    requestAnimationFrame(animateBeam);
}

requestAnimationFrame(animateBeam);
