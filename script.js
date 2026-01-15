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
if (!isMobile) {
    document.addEventListener("mousemove", e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    document.addEventListener("mousedown", () => {
        isMouseDown = true;
        pressStartTime = Date.now();
        lastStrobeTime = 0;
    });
    document.addEventListener("mouseup", () => isMouseDown = false);
}

// 모바일 터치
let isDragging = false;
let isStrobing = false;
let longPressTimeout = null;
const LONG_PRESS_DELAY = 500;
const STROBE_DELAY_AFTER_DRAG = 400;
const MIN_STROBE_INTERVAL = 80;   // 최소 간격 약간 늘림 → 너무 빨라보이지 않게
const MAX_STROBE_INTERVAL = 400;  // 느리게 시작

document.addEventListener("touchstart", e => {
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
}, { passive: false });

document.addEventListener("touchmove", e => {
    e.preventDefault();
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;

    isDragging = true;
    beam.style.display = "block";
    beam.style.width = "100px";
    beam.style.height = "100px";
}, { passive: false });

document.addEventListener("touchend", () => {
    isDragging = false;
    isStrobing = false;
    beam.style.display = "none";
    clearTimeout(longPressTimeout);
}, { passive: false });

// ============================
// 스트로브
// ============================
function handleStrobe(timestamp) {
    const active = (!isMobile && isMouseDown) || (isMobile && isStrobing);
    if (!active) return;

    const heldTime = Date.now() - pressStartTime;

    // 클릭시 점진적 가속, 너무 빠르지 않게 MIN_STROBE_INTERVAL 조정
    let interval = MAX_STROBE_INTERVAL - heldTime / 4;
    interval = Math.max(interval, MIN_STROBE_INTERVAL);

    if (!lastStrobeTime || timestamp - lastStrobeTime > interval) {
        screenStrobe();
        lastStrobeTime = timestamp;
    }
}

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

    requestAnimationFrame(() => strobe.style.opacity = "0");
    setTimeout(() => strobe.remove(), 120);
}

// ============================
// ABOUT 버튼 빔 반응
// ============================
const aboutBtn = document.getElementById("about");

function animateBeam(timestamp) {
    if (!isMobile || isDragging) {
        const x = mouseX - beam.offsetWidth / 2;
        const y = mouseY - beam.offsetHeight / 2;
        beam.style.transform = `translate(${x}px, ${y}px)`;

        const flicker = 0.8 + Math.random() * 0.2;
        beam.style.filter = isMobile
            ? `blur(40px) brightness(${flicker})`
            : `blur(60px) brightness(${flicker})`;

        if (aboutBtn) {
            const rect = aboutBtn.getBoundingClientRect();
            const btnX = rect.left + rect.width / 2;
            const btnY = rect.top + rect.height / 2;
            const distance = Math.hypot(mouseX - btnX, mouseY - btnY);

            // 150px 이내면 글로우 적용
            if (distance < 150) {
                aboutBtn.style.color = "white";
                aboutBtn.style.textShadow = "0 0 10px white, 0 0 20px white, 0 0 40px white";
            } else {
                aboutBtn.style.color = "gray";
                aboutBtn.style.textShadow = "none";
            }
        }
    }

    handleStrobe(timestamp);
    requestAnimationFrame(animateBeam);
}

requestAnimationFrame(animateBeam);
