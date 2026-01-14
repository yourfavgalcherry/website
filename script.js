// 이전 위치 저장 (드래그 시 간격 조절)
let lastX = 0;
let lastY = 0;
let minDistance = 15; // 입자 생성 최소 거리(px)

// 입자 생성 함수
function createParticle(x, y) {
    const particle = document.createElement("span");
    particle.classList.add("particle");

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
}

// 화면 전체 스트로브 효과 함수
function screenStrobe() {
    const strobe = document.createElement("div");
    strobe.style.position = "fixed";
    strobe.style.top = "0";
    strobe.style.left = "0";
    strobe.style.width = "100%";
    strobe.style.height = "100%";
    strobe.style.backgroundColor = "white";
    strobe.style.opacity = "0.8"; // 밝기 조절
    strobe.style.zIndex = "9999";
    strobe.style.pointerEvents = "none"; // 클릭 방해 안됨
    strobe.style.transition = "opacity 0.1s ease-out";

    document.body.appendChild(strobe);

    // 잠깐 후 점점 사라지게
    setTimeout(() => {
        strobe.style.opacity = "0";
        setTimeout(() => strobe.remove(), 100);
    }, 50);
}

// 마우스 이동 시 입자 생성 (드래그 시 간격 적용)
document.addEventListener("mousemove", (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const distance = Math.sqrt(dx*dx + dy*dy);

    if(distance > minDistance){
        createParticle(e.clientX, e.clientY);
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

// 클릭 시 입자 + 화면 섬광
document.addEventListener("click", (e) => {
    screenStrobe();
    for(let i=0; i<4; i++){
        createParticle(e.clientX + Math.random()*10 - 5, e.clientY + Math.random()*10 - 5);
    }
});

// 모바일 터치 이동 시 입자 생성
document.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - lastX;
    const dy = touch.clientY - lastY;
    const distance = Math.sqrt(dx*dx + dy*dy);

    if(distance > minDistance){
        createParticle(touch.clientX, touch.clientY);
        lastX = touch.clientX;
        lastY = touch.clientY;
    }
});

// 터치 시작 시 입자 + 화면 섬광
document.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    screenStrobe();
    for(let i=0; i<4; i++){
        createParticle(touch.clientX + Math.random()*10 - 5, touch.clientY + Math.random()*10 - 5);
    }
});
