// 빔 라이트 생성
const beam = document.createElement("div");
beam.classList.add("beam");
document.body.appendChild(beam);

// 초기 위치
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// 모바일 여부 체크
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// 모바일이면 처음에는 숨김
if (isMobile) {
    beam.style.display = "none";
}

// 마우스 이동 이벤트 (PC)
if (!isMobile) {
    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
}

// 터치 이동 이벤트 (모바일)
if (isMobile) {
    document.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;

        // 터치 시작 시 빔 라이트 보이기
        if (beam.style.display === "none") {
            beam.style.display = "block";
            beam.style.width = "120px";   // 모바일에서 작게
            beam.style.height = "120px";
        }
    });
}

// 화면 섬광 (클릭/터치용)
function screenStrobe() {
    const strobe = document.createElement("div");
    strobe.style.position = "fixed";
    strobe.style.top = "0";
    strobe.style.left = "0";
    strobe.style.width = "100%";
    strobe.style.height = "100%";
    strobe.style.backgroundColor = "white";
    strobe.style.opacity = "0.9";
    strobe.style.zIndex = "9999";
    strobe.style.pointerEvents = "none";
    strobe.style.transition = "opacity 0.05s ease-out";
    document.body.appendChild(strobe);
    setTimeout(() => {
        strobe.style.opacity = "0";
        setTimeout(() => strobe.remove(), 100);
    }, 50);
}
document.addEventListener("click", screenStrobe);
document.addEventListener("touchstart", screenStrobe);

// 빔 라이트 애니메이션
function animateBeam() {
    // 위치 따라다니기
    const x = mouseX - beam.offsetWidth / 2;
    const y = mouseY - beam.offsetHeight / 2;
    beam.style.transform = `translate(${x}px, ${y}px)`;

    // 밝기 플리커링
    const flicker = 0.7 + Math.random() * 0.3; // 0.7~1.0 밝기
    beam.style.filter = isMobile 
        ? `blur(40px) brightness(${flicker * 3})` // 모바일: 블러 낮게
        : `blur(60px) brightness(${flicker * 3})`; // PC: 기본 블러

    requestAnimationFrame(animateBeam);
}

// 애니메이션 시작
requestAnimationFrame(animateBeam);
