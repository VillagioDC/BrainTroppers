document.addEventListener("DOMContentLoaded", () => {
    const imgElement = document.querySelector(".hero-image img");
    const canvas = document.getElementById("brain-overlay");
    const ctx = canvas.getContext("2d");

    if (!imgElement || !canvas) {
        console.error("[brain-overlay] Hero image or canvas not found");
        return;
    }

    let dots = [];

    function isBrightDot(r, g, b, a) {
        return a > 128 && r > 200 && g > 160 && b < 50;
    }

    function floodFill(startX, startY, width, height, data, visited) {
        const stack = [{ x: startX, y: startY }];
        const blob = [];
        const index = (x, y) => y * width + x;

        while (stack.length) {
            const p = stack.pop();
            const idx = index(p.x, p.y);

            if (visited[idx]) continue;
            visited[idx] = true;

            const pixelIdx = idx * 4;
            if (isBrightDot(data[pixelIdx], data[pixelIdx + 1], data[pixelIdx + 2], data[pixelIdx + 3])) {
                blob.push(p);

                if (p.x > 0) stack.push({ x: p.x - 1, y: p.y });
                if (p.x < width - 1) stack.push({ x: p.x + 1, y: p.y });
                if (p.y > 0) stack.push({ x: p.x, y: p.y - 1 });
                if (p.y < height - 1) stack.push({ x: p.x, y: p.y + 1 });
            }
        }

        return blob;
    }

    function detectDots() {
        const analysisCanvas = document.createElement("canvas");
        analysisCanvas.width = imgElement.naturalWidth;
        analysisCanvas.height = imgElement.naturalHeight;
        const actx = analysisCanvas.getContext("2d");
        actx.drawImage(imgElement, 0, 0);

        try {
            const imageData = actx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
            const data = imageData.data;
            const width = analysisCanvas.width;
            const height = analysisCanvas.height;

            const visited = new Array(width * height).fill(false);
            dots = [];

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    if (isBrightDot(data[idx], data[idx + 1], data[idx + 2], data[idx + 3]) && !visited[y * width + x]) {
                        const blob = floodFill(x, y, width, height, data, visited);
                        if (blob.length > 5) {
                            let sumX = 0, sumY = 0;
                            blob.forEach(p => {
                                sumX += p.x;
                                sumY += p.y;
                            });
                            const count = blob.length;
                            const cx = sumX / count / width;
                            const cy = sumY / count / height;
                            const radius = Math.sqrt(count / Math.PI) / width * 1.5;

                            dots.push({
                                x: cx,
                                y: cy,
                                r: radius,
                                pulseSpeed: 0.5 + Math.random() * 1.5,
                                pulsePhase: Math.random() * Math.PI * 2,
                                color: 'rgba(255, 215, 0, 1)'
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Security error or failed to get image data:", e);
            // Fallback: Use predefined dots if detection fails (e.g., from original data)
            dots = [
                {x:0.2633,y:0.065,r:0.0025},
                {x:0.4110,y:0.1243,r:0.0092},
                {x:0.2061,y:0.1388,r:0.0010},
                // ... (add more from original list if needed)
            ].map(dot => ({
                ...dot,
                pulseSpeed: 0.5 + Math.random() * 1.5,
                pulsePhase: Math.random() * Math.PI * 2,
                color: 'rgba(255, 215, 0, 1)'
            }));
        }
    }

    function resizeCanvas() {
        canvas.width = imgElement.clientWidth;
        canvas.height = imgElement.clientHeight;
    }

    function draw(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const t = time / 1000;

        dots.forEach(dot => {
            const baseRadius = dot.r * canvas.width;
            const scale = 1 + 0.3 * Math.sin((t + dot.pulsePhase) * (Math.PI * 2 / dot.pulseSpeed));
            const r = baseRadius * scale;

            const grad = ctx.createRadialGradient(
                dot.x * canvas.width,
                dot.y * canvas.height,
                r * 0.2,
                dot.x * canvas.width,
                dot.y * canvas.height,
                r
            );
            grad.addColorStop(0, dot.color);
            grad.addColorStop(1, "rgba(0,0,0,0)");

            ctx.beginPath();
            ctx.fillStyle = grad;
            ctx.arc(dot.x * canvas.width, dot.y * canvas.height, r, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    const startAnimation = () => {
        detectDots();
        resizeCanvas();
        requestAnimationFrame(draw);
    };

    if (imgElement.complete) {
        startAnimation();
    } else {
        imgElement.addEventListener("load", startAnimation);
    }

    window.addEventListener("resize", resizeCanvas);
});