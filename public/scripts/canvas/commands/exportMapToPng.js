// CANVAS MODULES
// EXPORT MAP TO PNG MODULE

// Import modules
// No modules

//Exports the full mind map to high-res PNG.
export async function exportMapToPng(filename) {

    // Check filename
    if (!filename) filename = 'map.png';

    try {
        // Prepare SVG
        const prep = braintroop._prepareExportPng();
        if (!prep.svgString || prep.bounds.width <= 0 || prep.bounds.height <= 0) {
            console.warn('No data for export');
        }

        // Create SVG data URL
        const svgDataUrl = createSvgDataUrl(prep.svgString);

        // Rasterize to high-res canvas
        const scale = 2;
        const canvas = await createCanvasFromSvg(svgDataUrl, prep.bounds, scale);

        // Convert to PNG
        const pngDataUrl = canvas.toDataURL('image/png', 1.0);

        // Download
        downloadPng(pngDataUrl, filename);

    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
}

// Prepares SVG data URL from serialized string.
function createSvgDataUrl(svgString) {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
}

// Rasterizes SVG to high-res canvas.
function createCanvasFromSvg(svgDataUrl, bounds, scale) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = bounds.width * scale;
            canvas.height = bounds.height * scale;
            // Draw SVG at full scaled size (handles viewBox mapping, negatives via absolute coords)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        };
        img.onerror = () => reject(new Error('Failed to load SVG for rasterization'));
        img.src = svgDataUrl;
    });
}

//Triggers browser download of PNG.
function downloadPng(pngDataUrl, filename) {
    const a = document.createElement('a');
    a.href = pngDataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
