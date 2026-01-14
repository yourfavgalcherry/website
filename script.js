// 빔 라이트 생성
const beam = document.createElement("div");
beam.classList.add("beam");
document.body.appendChild(beam);

// 마우스 위치 초기값
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// 마우스 이동 이벤트
document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// 터치 이동 이벤트
document.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
});

// 화면 섬광 (클릭용)
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

// ==========================
// 빔 라이트 플리커링 애니메이션
// ==========================
function animateBeam() {
    // 위치 따라다니기
    const x = mouseX - beam.offsetWidth / 2;
    const y = mouseY - beam.offsetHeight / 2;
    beam.style.transform = `translate(${x}px, ${y}px)`;

    // 밝기 플리커링 (처음부터 항상 적용)
    const flicker = 0.4 + Math.random() * 0.3; // 0.4~0.7 밝기
    beam.style.filter = `blur(120px) brightness(${flicker * 4})`;

    requestAnimationFrame(animateBeam);
}

// 페이지 로드와 동시에 애니메이션 시작
requestAnimationFrame(animateBeam);
