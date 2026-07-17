/*
===========================================
KliseApp
Film Engine V2
Epson V370 Style
Part 1
===========================================
*/

"use strict";

const FilmEngine = {

    canvas: null,
    ctx: null,

    width: 0,
    height: 0,

    imageData: null,
    pixels: null,

    stats: {},

    init(canvas, ctx) {

        this.canvas = canvas;
        this.ctx = ctx;

        this.width = canvas.width;
        this.height = canvas.height;

    },

    process(canvas, ctx) {

        this.init(canvas, ctx);

        this.imageData = ctx.getImageData(
            0,
            0,
            this.width,
            this.height
        );

        this.pixels = this.imageData.data;

        console.log("========== Film Engine ==========");

        this.stats = this.analyzeHistogram();

        console.table(this.stats);

        // Part 2
        this.detectNegative();

        // Part 2
        this.removeOrangeMask();

        // Part 3
        this.invert();

        // Part 3
        this.autoWhiteBalance();

        // Part 3
        this.autoExposure();

        // Part 3
        this.toneCurve();

        // Part 4
      this.colorRecovery();

this.protectHighlights();

// Part 5
this.denoise();

        // Part 5
        this.sharpen();

        ctx.putImageData(
            this.imageData,
            0,
            0
        );

        console.log("Film Engine Finished");

    },

    analyzeHistogram() {

        let r = 0;
        let g = 0;
        let b = 0;

        let shadow = 0;
        let highlight = 0;

        const total = this.width * this.height;

        for (let i = 0; i < this.pixels.length; i += 4) {

            const rr = this.pixels[i];
            const gg = this.pixels[i + 1];
            const bb = this.pixels[i + 2];

            r += rr;
            g += gg;
            b += bb;

            const lum =
                (rr + gg + bb) / 3;

            if (lum < 40)
                shadow++;

            if (lum > 215)
                highlight++;

        }

        return {

            meanR: r / total,

            meanG: g / total,

            meanB: b / total,

            shadow:

                (shadow / total) * 100,

            highlight:

                (highlight / total) * 100

        };

    },

    forEachPixel(callback) {

        for (let i = 0; i < this.pixels.length; i += 4) {

            callback(
                this.pixels,
                i
            );

        }

    },

    clamp(v) {

        if (v < 0)
            return 0;

        if (v > 255)
            return 255;

        return v;

    },
  softCurve(value) {

    const x = value / 255;

    /*
        Soft Film Curve

        Shadow naik sedikit

        Midtone natural

        Highlight diproteksi
    */

    const y =
        x < 0.5

        ? (2 * x * x)

        : (1 - Math.pow(-2 * x + 2, 2) / 2);

    return this.clamp(
        y * 255
    );
protectHighlights() {

    console.log("Highlight Protection...");

    this.forEachPixel((p, i) => {

        p[i] = this.highlightCurve(p[i]);
        p[i + 1] = this.highlightCurve(p[i + 1]);
        p[i + 2] = this.highlightCurve(p[i + 2]);

    });
highlightCurve(v) {

    if (v < 210)
        return v;

    return 210 + (v - 210) * 0.45;

}
}
}
averageLuminance() {

    let total = 0;

    const pixels = this.width * this.height;

    this.forEachPixel((p, i) => {

        total +=
            (
                p[i] +
                p[i + 1] +
                p[i + 2]
            ) / 3;

    });

    return total / pixels;
averageLuminance() {

    let total = 0;

    const pixels = this.width * this.height;

    this.forEachPixel((p, i) => {

        total += (
            p[i] +
            p[i + 1] +
            p[i + 2]
        ) / 3;

    });

    return total / pixels;

}
}
  detectNegative() {

    console.log("Detect Negative...");

    const s = this.stats;

    this.isNegative = false;

    /*
        Negative biasanya memiliki:

        R > G > B
        Highlight cukup tinggi
        Shadow rendah
    */

    if (
        s.meanR > s.meanG &&
        s.meanG > s.meanB &&
        s.highlight > 15
    ) {

        this.isNegative = true;

    }

    console.log(
        "Negative:",
        this.isNegative
    );

}

   removeOrangeMask() {

    if (!this.isNegative)
        return;

    console.log("Removing Orange Mask...");

    const avgR = this.stats.meanR;
    const avgG = this.stats.meanG;
    const avgB = this.stats.meanB;

    /*
        Hitung dominasi orange.

        Nilai ini adaptif,
        bukan angka tetap.
    */

    const redBias = avgR - avgG;
    const greenBias = avgG - avgB;

    this.forEachPixel((p, i) => {

        let r = p[i];
        let g = p[i + 1];
        let b = p[i + 2];

        /*
            Kurangi dominasi orange
            secara bertahap
        */

        r -= redBias * 0.60;

        g -= greenBias * 0.35;

        /*
            Biru sedikit dinaikkan
            agar netral
        */

        b += (redBias * 0.20);

        p[i]     = this.clamp(r);
        p[i + 1] = this.clamp(g);
        p[i + 2] = this.clamp(b);

    });

}

   invert() {

    if (!this.isNegative)
        return;

    console.log("Invert...");

    this.forEachPixel((p, i) => {

        p[i]     = 255 - p[i];
        p[i + 1] = 255 - p[i + 1];
        p[i + 2] = 255 - p[i + 2];

    });

}

    autoWhiteBalance() {

    console.log("Auto White Balance...");

    let rTotal = 0;
    let gTotal = 0;
    let bTotal = 0;

    const totalPixels = this.width * this.height;

    this.forEachPixel((p, i) => {

        rTotal += p[i];
        gTotal += p[i + 1];
        bTotal += p[i + 2];

    });

    const avgR = rTotal / totalPixels;
    const avgG = gTotal / totalPixels;
    const avgB = bTotal / totalPixels;

    const gray = (avgR + avgG + avgB) / 3;

    const rGain = gray / Math.max(avgR, 1);
    const gGain = gray / Math.max(avgG, 1);
    const bGain = gray / Math.max(avgB, 1);

    this.forEachPixel((p, i) => {

        p[i]     = this.clamp(p[i]     * rGain);
        p[i + 1] = this.clamp(p[i + 1] * gGain);
        p[i + 2] = this.clamp(p[i + 2] * bGain);

    });

}
    autoExposure() {

    console.log("Auto Exposure...");

    const target = 140;

    const current = this.averageLuminance();

    const gain = target / Math.max(current, 1);

    this.forEachPixel((p, i) => {

        p[i]     = this.clamp(p[i]     * gain);
        p[i + 1] = this.clamp(p[i + 1] * gain);
        p[i + 2] = this.clamp(p[i + 2] * gain);

    });

}

    toneCurve() {

    console.log("Soft Tone Curve...");

    this.forEachPixel((p, i) => {

        p[i]     = this.softCurve(p[i]);
        p[i + 1] = this.softCurve(p[i + 1]);
        p[i + 2] = this.softCurve(p[i + 2]);

    });

}

   colorRecovery() {

    console.log("Natural Color Recovery...");

    this.forEachPixel((p, i) => {

        let r = p[i];
        let g = p[i + 1];
        let b = p[i + 2];

        const hsl = this.rgbToHsl(r, g, b);

        let h = hsl.h;
        let s = hsl.s;
        let l = hsl.l;
rgbToHsl(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h;
    let s;
    const l = (max + min) / 2;

    if (max === min) {

        h = 0;
        s = 0;

    } else {

        const d = max - min;

        s =
            l > 0.5
                ? d / (2 - max - min)
                : d / (max + min);

        switch (max) {

            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;

            case g:
                h = (b - r) / d + 2;
                break;

            default:
                h = (r - g) / d + 4;

        }

        h *= 60;

    }

    return { h, s, l };

}
        /*
        ====================================
        Skin Tone
        ====================================
        */

        if (h >= 10 && h <= 45) {

            s *= 1.08;
            l *= 1.04;

        }

        /*
        ====================================
        Green
        ====================================
        */

        if (h >= 70 && h <= 150) {

            s *= 1.05;

        }

        /*
        ====================================
        Sky
        ====================================
        */

        if (h >= 180 && h <= 250) {

            s *= 1.08;

        }

        const rgb = this.hslToRgb(h, s, l);

        p[i] = this.clamp(rgb.r);
        p[i + 1] = this.clamp(rgb.g);
        p[i + 2] = this.clamp(rgb.b);
hslToRgb(h, s, l) {

    h /= 360;

    let r;
    let g;
    let b;

    if (s === 0) {

        r = g = b = l;

    } else {

        const hue2rgb = (p, q, t) => {

            if (t < 0) t += 1;
            if (t > 1) t -= 1;

            if (t < 1 / 6)
                return p + (q - p) * 6 * t;

            if (t < 1 / 2)
                return q;

            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;

            return p;

        };

        const q =
            l < 0.5
                ? l * (1 + s)
                : l + s - l * s;

        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);

    }

    return {

        r: r * 255,
        g: g * 255,
        b: b * 255

    };

}
    });

}

    denoise() {

        console.log(
            "Denoise..."
        );

    },

    sharpen() {

        console.log(
            "Sharpen..."
        );

    }

};
