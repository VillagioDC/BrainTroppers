// LANDING PAGE BRAINSTORM MODULE

// Brainstorm animation
(function() {
    const imgElement = document.querySelector(".hero-image img");
    const canvas = document.getElementById("brain-overlay");
    const ctx = canvas ? canvas.getContext("2d") : null;

    if (!imgElement || !canvas || !ctx) {
        console.error("Hero image or canvas not found");
        return;
    }

    // Refined dots with adjusted radii based on image analysis
    const dots = [
        {x: 0.2633, y: 0.065, r: 0.0050},  // Small dot, doubled radius
        {x: 0.4110, y: 0.1243, r: 0.0184}, // Larger circle, doubled and adjusted
        {x: 0.2061, y: 0.1388, r: 0.0020}, // Small dot, doubled radius
        {x: 0.7271, y: 0.1770, r: 0.0082}, // Medium dot, doubled
        {x: 0.7367, y: 0.1825, r: 0.0050}, // Small dot, doubled
        {x: 0.5184, y: 0.1900, r: 0.0050}, // Small dot, doubled
        {x: 0.7304, y: 0.1956, r: 0.0164}, // Larger circle, doubled and adjusted
        {x: 0.5000, y: 0.2088, r: 0.0020}, // Small dot, doubled
        {x: 0.6367, y: 0.3025, r: 0.0050}, // Small dot, doubled
        {x: 0.8443, y: 0.3122, r: 0.0122}, // Medium-large dot, doubled
        {x: 0.3898, y: 0.3212, r: 0.0062}, // Small dot, doubled
        {x: 0.3630, y: 0.3458, r: 0.0164}, // Larger circle, doubled and adjusted
        {x: 0.9260, y: 0.3556, r: 0.0040}, // Small dot, doubled
        {x: 0.4908, y: 0.3600, r: 0.0020}, // Small dot, doubled
        {x: 0.4867, y: 0.3625, r: 0.0020}, // Small dot, doubled
        {x: 0.4908, y: 0.3688, r: 0.0062}, // Small dot, doubled
        {x: 0.6367, y: 0.3700, r: 0.0050}, // Small dot, doubled
        {x: 0.6347, y: 0.3775, r: 0.0050}, // Small dot, doubled
        {x: 0.6568, y: 0.3921, r: 0.0040}, // Small dot, doubled
        {x: 0.1005, y: 0.3969, r: 0.0082}, // Medium dot, doubled
        {x: 0.1806, y: 0.4050, r: 0.0060}, // Small dot, doubled
        {x: 0.5110, y: 0.4275, r: 0.0050}, // Small dot, doubled
        {x: 0.6102, y: 0.4350, r: 0.0090}, // Medium dot, doubled
        {x: 0.7704, y: 0.4525, r: 0.0070}, // Medium dot, doubled
        {x: 0.7980, y: 0.4700, r: 0.0056}, // Small dot, doubled
        {x: 0.2388, y: 0.4880, r: 0.0080}, // Medium dot, doubled
        {x: 0.6780, y: 0.4950, r: 0.0070}, // Medium dot, doubled
        {x: 0.8540, y: 0.5120, r: 0.0084}, // Medium dot, doubled
        {x: 0.3020, y: 0.5200, r: 0.0076}, // Medium dot, doubled
        {x: 0.4080, y: 0.5280, r: 0.0050}, // Small dot, doubled
        {x: 0.5120, y: 0.5380, r: 0.0060}, // Small dot, doubled
        {x: 0.3500, y: 0.5520, r: 0.0090}, // Medium dot, doubled
        {x: 0.6050, y: 0.5650, r: 0.0070}, // Medium dot, doubled
        {x: 0.7100, y: 0.5720, r: 0.0064}, // Small dot, doubled
        {x: 0.2100, y: 0.5800, r: 0.0060}, // Small dot, doubled
        {x: 0.4200, y: 0.5900, r: 0.0060}, // Small dot, doubled
        {x: 0.5150, y: 0.6000, r: 0.0064}, // Small dot, doubled
        {x: 0.7650, y: 0.6100, r: 0.0070}, // Medium dot, doubled
        {x: 0.6120, y: 0.6250, r: 0.0056}, // Small dot, doubled
        {x: 0.3400, y: 0.6400, r: 0.0060}, // Small dot, doubled
        {x: 0.4500, y: 0.6500, r: 0.0070}, // Medium dot, doubled
        {x: 0.5000, y: 0.6600, r: 0.0060}, // Small dot, doubled
        {x: 0.6800, y: 0.6700, r: 0.0064}, // Small dot, doubled
        {x: 0.2900, y: 0.6850, r: 0.0060}, // Small dot, doubled
        {x: 0.3900, y: 0.7000, r: 0.0060}  // Small dot, doubled
    ].map(dot => ({
        ...dot,
        pulseSpeed: 0.5 + Math.random() * 1.5,
        pulsePhase: Math.random() * Math.PI * 2,
        color: 'rgba(255, 215, 0, 1)'
    }));

    function resizeCanvas() {
        canvas.width = imgElement.clientWidth;
        canvas.height = imgElement.clientHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
    }

    function draw(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const t = time / 1000;

        dots.forEach(dot => {
            const baseRadius = Math.max(dot.r * canvas.width, 2);
            const pulseIntensity = 0.5 * Math.sin((t + dot.pulsePhase) * (Math.PI * 2 / dot.pulseSpeed)) + 0.5;
            const r = baseRadius * (1 + 0.5 * pulseIntensity);

            const rColor = 196, gColor = 164 + Math.floor(40 * pulseIntensity), bColor = 128;
            const grad = ctx.createRadialGradient(
                dot.x * canvas.width,
                dot.y * canvas.height,
                r * 0.2,
                dot.x * canvas.width,
                dot.y * canvas.height,
                r
            );
            grad.addColorStop(0, `rgba(${rColor}, ${gColor}, ${bColor}, 0.6)`);
            grad.addColorStop(1, "rgba(0,0,0,0.2)");

            ctx.beginPath();
            ctx.fillStyle = grad;
            ctx.arc(dot.x * canvas.width, dot.y * canvas.height, r, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    const startAnimation = () => {
        resizeCanvas();
        requestAnimationFrame(draw);
    };

    if (imgElement.complete) {
        startAnimation();
    } else {
        imgElement.addEventListener("load", startAnimation);
    }

    window.addEventListener("resize", resizeCanvas);
})();