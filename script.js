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

const LONG_PRESS_DELAY = 500;           // 롱프레스 판별
const STROBE_DELAY_AFTER_DRAG = 400;    // 빔 보여주고 스트로브 딜레이
const MIN_STROBE_INTERVAL = 80;         // 최소 깜빡임 간격 (너무 빠른 깜빡임 방지)
const MAX_STROBE_INTERVAL = 300;        // 초기 깜빡임 간격

document.addEventListener(
    "touchstart",
    (e) => {
        e.preventDefault();
        pressStartTime = Date.now();
        isDragging = false;
        isStrobing = false;

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

document.addEventListener(
    "touchmove",
    (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;

        isDragging = true;

        // 모바일 빔 크기 작게 + 밝기 조정
        beam.style.display = "block";
        beam.style.width = "100px";
        beam.style.height = "100px";
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
    const active = (!isMobile && isMouseDown) || (isMobile && isStrobing);
    if (!active) return;

    const heldTime = Date.now() - pressStartTime;

    // 점진적 가속, 모바일/PC 공통
    let interval = Math.max(
        MIN_STROBE_INTERVAL,
        MAX_STROBE_INTERVAL - heldTime / 5
    );

    // 최소 interval 제한
    interval = Math.max(interval, MIN_STROBE_INTERVAL);

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

        // 밝기 범위 조정: 모바일 0.8~1.0, PC 0.8~1.0
        const flicker = 0.8 + Math.random() * 0.2;

        beam.style.filter = isMobile
            ? `blur(40px) brightness(${flicker})`
            : `blur(60px) brightness(${flicker})`;
    }

    handleStrobe(timestamp);
    requestAnimationFrame(animateBeam);
}

requestAnimationFrame(animateBeam);
