const canvas = document.getElementById("smokeCanvas");
const ctx = canvas?.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const smoke = {
    width: 0,
    height: 0,
    ratio: Math.min(window.devicePixelRatio || 1, 2),
    particles: []
};

if (canvas && ctx) {
    resize();
    seedParticles();
    window.addEventListener("resize", () => {
        resize();
        seedParticles();
    });
    draw();
}

function resize() {
    smoke.width = window.innerWidth;
    smoke.height = window.innerHeight;
    canvas.width = Math.floor(smoke.width * smoke.ratio);
    canvas.height = Math.floor(smoke.height * smoke.ratio);
    canvas.style.width = `${smoke.width}px`;
    canvas.style.height = `${smoke.height}px`;
    ctx.setTransform(smoke.ratio, 0, 0, smoke.ratio, 0, 0);
}

function seedParticles() {
    const count = Math.max(26, Math.floor(smoke.width / 32));
    smoke.particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * smoke.width,
        y: smoke.height * (0.18 + Math.random() * 0.7),
        radius: 80 + Math.random() * 170,
        alpha: 0.025 + Math.random() * 0.045,
        speed: 0.09 + Math.random() * 0.22,
        drift: -0.18 + Math.random() * 0.36,
        hue: index % 3 === 0 ? 274 : 207,
        phase: Math.random() * Math.PI * 2
    }));
}

function draw(time = 0) {
    ctx.clearRect(0, 0, smoke.width, smoke.height);
    ctx.globalCompositeOperation = "screen";
    ctx.filter = "blur(18px)";

    smoke.particles.forEach((particle) => {
        const wave = Math.sin(time * 0.00022 + particle.phase) * 18;
        const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.radius
        );

        gradient.addColorStop(0, `hsla(${particle.hue}, 92%, 66%, ${particle.alpha})`);
        gradient.addColorStop(0.36, `hsla(${particle.hue}, 90%, 56%, ${particle.alpha * 0.55})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.save();
        ctx.translate(particle.x + wave, particle.y);
        ctx.rotate(Math.sin(time * 0.00012 + particle.phase) * 0.25);
        ctx.scale(1.8, 0.52);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (!reducedMotion) {
            particle.x += particle.drift + particle.speed;
            particle.y -= particle.speed * 0.12;
            particle.phase += 0.002;

            if (particle.x > smoke.width + particle.radius) particle.x = -particle.radius;
            if (particle.x < -particle.radius) particle.x = smoke.width + particle.radius;
            if (particle.y < -particle.radius) particle.y = smoke.height + particle.radius * 0.4;
        }
    });

    ctx.filter = "none";
    ctx.globalCompositeOperation = "source-over";

    if (!reducedMotion) {
        requestAnimationFrame(draw);
    }
}
