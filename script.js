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
if (isMobile) {
    beam.style.display = "none";
}

// ============================
// PC: 마우스 이동
// ============================
if (!isMobile) {
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
}

// ============================
// 모바일 터치 제어
// ============================
let isDragging = false;
let pressStartTime = 0;
let strobeInterval = null;

// 터치 시작 (꾹 누르기 시작)
document.addEventListener("touchstart", (e) => {
    pressStartTime = Date.now();

    // 스트로브 시작 (처음엔 느리게)
    startStrobe(300);
});

// 터치 이동 (드래그 중 → 빔 보이기)
document.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;

    isDragging = true;
    beam.style.display = "block";
});

// 터치 종료
document.addEventListener("touchend", () => {
    isDragging = false;
    beam.style.display = "none";

    stopStrobe();
});

// ============================
// 스트로브 로직
// ============================
function startStrobe(initialSpeed) {
    let speed = initialSpeed;

    strobeInterval = setInterval(() => {
        screenStrobe();

        // 누른 시간에 따라 점점 빨라짐
        const heldTime = Date.now() - pressStartTime;
        speed = Math.max(60, 300 - heldTime / 5);

        clearInterval(strobeInterval);
        startStrobe(speed);
    }, speed);
}

function stopStrobe() {
    clearInterval(strobeInterval);
    strobeInterval = null;
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
// 빔 애니메이션 (공통)
// ============================
function animateBeam() {
    if (!isMobile || isDragging) {
        const x = mouseX - beam.offsetWidth / 2;
        const y = mouseY - beam.offsetHeight / 2;
        beam.style.transform = `translate(${x}px, ${y}px)`;

        const flicker = 0.8 + Math.random() * 0.2;

        beam.style.filter = isMobile
            ? `blur(40px) brightness(${flicker})`
            : `blur(60px) brightness(${flicker})`;
    }

    requestAnimationFrame(animateBeam);
}

requestAnimationFrame(animateBeam);
