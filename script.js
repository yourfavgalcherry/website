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

document.addEventListener("mousemove", e => {
    customCursor.style.left = e.clientX + "px";
    customCursor.style.top = e.clientY + "px";
});



// ============================
// PC 마우스 제어
// ============================
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

// 터치 시작
document.addEventListener("touchstart", e => {
    if (e.target.closest(".navbar a")) return; // 링크 터치 시 무시

    e.preventDefault();
    pressStartTime = Date.now();
    isDragging = false;
    isStrobing = false;

    beam.style.display = "block"; // 터치 시작 시만 보이게

    // 롱프레스 시 스트로브
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

// 터치 이동
document.addEventListener("touchmove", e => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;

    mouseX = touch.clientX;
    mouseY = touch.clientY;

    isDragging = true;
    // 여기서는 display 변경하지 않음! 이미 touchstart에서 block 처리
}, { passive: false });

// 터치 종료
document.addEventListener("touchend", () => {
    isDragging = false;
    isStrobing = false;

    beam.style.display = "none"; // 터치 끝나면 숨김
    clearTimeout(longPressTimeout);
}, { passive: false });

// ============================
// 전체 화면 스트로브
// ============================
function handleStrobe(timestamp) {
    const active = (!isMobile && isMouseDown) || (isMobile && isStrobing);
    if (!active) return;

    const heldTime = Date.now() - pressStartTime;

    // 점진적 가속 + 랜덤 템포
    let interval = MAX_STROBE_INTERVAL - heldTime / 5;
    interval = Math.max(interval, MIN_STROBE_INTERVAL);
    interval += Math.random() * 60; // 약간 랜덤하게

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
    strobe.style.pointerEvents = "none";
    strobe.style.zIndex = "9999";

    // 초기 상태: 투명 + 밑에서 위로 밝아지는 그라데이션
    strobe.style.background = `
        linear-gradient(to top,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0.7) 30%,
        rgba(255,255,255,1) 50%,
        rgba(255,255,255,0.7) 70%,
        rgba(255,255,255,0) 100%)`;
    strobe.style.opacity = "0";
    strobe.style.transition = "opacity 0.1s linear, background-position 0.1s linear";

    document.body.appendChild(strobe);

    // 플래시 시작: opacity 증가
    requestAnimationFrame(() => strobe.style.opacity = "1");

    // 배경 위치를 살짝 위로 이동시키면서 밑→위 그라데이션 느낌 강화
    setTimeout(() => {
        strobe.style.backgroundPosition = "0 -50%";
    }, 50);

    // 중간 구간에서는 전체 화면 화이트
    setTimeout(() => {
        strobe.style.background = "rgba(255,255,255,1)";
    }, 70);

    // 끝나면서 서서히 사라짐
    setTimeout(() => strobe.style.opacity = "0", 100);

    // 제거
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

            if (distance < 150) {
                aboutBtn.classList.add("beam-hover");
            } else {
                aboutBtn.classList.remove("beam-hover");
            }
        }
    }

    handleStrobe(timestamp);
    requestAnimationFrame(animateBeam);
}

requestAnimationFrame(animateBeam);


