document.addEventListener("mousemove", function (e) {
    let particle = document.createElement("span");
    particle.classList.add("particle");

    particle.style.left = `${e.clientX}px`;
    particle.style.top = `${e.clientY}px`;

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 1000);
});

/* 모바일에서도 터치 이벤트 적용 */
document.addEventListener("touchmove", function (e) {
    let touch = e.touches[0];
    let particle = document.createElement("span");
    particle.classList.add("particle");

    particle.style.left = `${touch.clientX}px`;
    particle.style.top = `${touch.clientY}px`;

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 1000);
});
