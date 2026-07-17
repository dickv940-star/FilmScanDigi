/*
=========================================================
 KliseApp
 Film Engine V3
 Epson Perfection V370 Emulator

 Version : 3.0
 Author  : AppDIGI
=========================================================
*/

"use strict";

class FilmEngine {

    constructor(canvas, ctx, options = {}) {

        this.canvas = canvas;
        this.ctx = ctx;

        this.width = canvas.width;
        this.height = canvas.height;

        // Image Data
        this.imageData = null;
        this.originalData = null;
        this.pixels = null;

        // Histogram
        this.histogram = {

            red: new Uint32Array(256),
            green: new Uint32Array(256),
            blue: new Uint32Array(256),
            luminance: new Uint32Array(256)

        };

        // Statistics
        this.stats = {};

        // Film Information
        this.isNegative = false;
        this.orangeMaskStrength = 0;
        this.dynamicRange = 0;

        // Scanner Profile
        this.profile = "EPSON_V370";

        // Processing Options
        this.options = Object.assign({

            autoDetect: true,

            removeOrangeMask: true,

            invert: true,

            whiteBalance: true,

            exposure: true,

            toneCurve: true,

            colorRecovery: true,

            highlightProtection: true,

            shadowRecovery: true,

            noiseReduction: true,

            sharpen: true

        }, options);

    }

    /*
    =====================================================
    MAIN PROCESS
    =====================================================
    */

  process() {

    console.group("Film Engine");

    this.loadPixels();

    this.analyzeHistogram();

    this.detectNegative();

    if (this.options.removeOrangeMask)
        this.removeOrangeMask();

    if (this.options.invert)
        this.invertNegative();

    this.normalizeChannels();

    this.applyBlackPoint();

    this.applyWhitePoint();

    if (this.options.whiteBalance)
        this.grayWorldWhiteBalance();

    if (this.options.exposure)
        this.autoExposure();

    if (this.options.toneCurve)
        this.applyToneCurve();

    if (this.options.colorRecovery)
        this.recoverNaturalColor();

    if (this.options.highlightProtection)
        this.protectHighlights();

    if (this.options.shadowRecovery)
        this.recoverShadows();

    this.applyEpsonProfile();

    if (this.options.noiseReduction)
        this.reduceNoise();

    if (this.options.sharpen)
        this.unsharpMask();

    this.render();

    console.groupEnd();

}

    /*
    =====================================================
    CORE
    =====================================================
    */

    loadPixels() {

        this.imageData = this.ctx.getImageData(
            0,
            0,
            this.width,
            this.height
        );

        this.originalData =
            new Uint8ClampedArray(
                this.imageData.data
            );

        this.pixels =
            this.imageData.data;

    }

    render() {

        this.ctx.putImageData(
            this.imageData,
            0,
            0
        );

    }

    forEachPixel(callback) {

        const p = this.pixels;

        for (let i = 0; i < p.length; i += 4) {

            callback(p, i);

        }

    }

    clamp(value) {

        return Math.min(
            255,
            Math.max(
                0,
                value
            )
        );

    }

    luminance(r, g, b) {

        return (
            0.2126 * r +
            0.7152 * g +
            0.0722 * b
        );

    }

    lerp(a, b, t) {

        return a + (b - a) * t;

    }

    map(value, inMin, inMax, outMin, outMax) {

        return (
            (value - inMin) *
            (outMax - outMin) /
            (inMax - inMin)
        ) + outMin;

    }

    resetHistogram() {

        this.histogram.red.fill(0);

        this.histogram.green.fill(0);

        this.histogram.blue.fill(0);

        this.histogram.luminance.fill(0);

    }
    /*
    =====================================================
    HISTOGRAM ANALYZER
    =====================================================
    */

    analyzeHistogram() {

        console.log("Analyze Histogram");

        this.resetHistogram();

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;

        let shadow = 0;
        let midtone = 0;
        let highlight = 0;

        let minLum = 255;
        let maxLum = 0;

        const totalPixels = this.width * this.height;

        this.forEachPixel((p, i) => {

            const r = p[i];
            const g = p[i + 1];
            const b = p[i + 2];

            this.histogram.red[r]++;
            this.histogram.green[g]++;
            this.histogram.blue[b]++;

            const lum = Math.round(
                this.luminance(r, g, b)
            );

            this.histogram.luminance[lum]++;

            totalR += r;
            totalG += g;
            totalB += b;

            if (lum < minLum)
                minLum = lum;

            if (lum > maxLum)
                maxLum = lum;

            if (lum < 45)
                shadow++;

            else if (lum > 210)
                highlight++;

            else
                midtone++;

        });

        this.dynamicRange = maxLum - minLum;

        this.stats = {

            meanR:
                totalR / totalPixels,

            meanG:
                totalG / totalPixels,

            meanB:
                totalB / totalPixels,

            meanL:
                this.averageLuminance(),

            shadow:
                (shadow / totalPixels) * 100,

            midtone:
                (midtone / totalPixels) * 100,

            highlight:
                (highlight / totalPixels) * 100,

            minLum,

            maxLum,

            dynamicRange:
                this.dynamicRange,

            redPeak:
                this.findPeak(
                    this.histogram.red
                ),

            greenPeak:
                this.findPeak(
                    this.histogram.green
                ),

            bluePeak:
                this.findPeak(
                    this.histogram.blue
                )

        };

        console.table(this.stats);

    }

    /*
    =====================================================
    HISTOGRAM HELPERS
    =====================================================
    */

    averageLuminance() {

        let total = 0;
        let count = 0;

        for (
            let i = 0;
            i < 256;
            i++
        ) {

            total +=
                this.histogram.luminance[i] * i;

            count +=
                this.histogram.luminance[i];

        }

        if (count === 0)
            return 0;

        return total / count;

    }

    findPeak(channel) {

        let peak = 0;
        let value = 0;

        for (
            let i = 0;
            i < 256;
            i++
        ) {

            if (channel[i] > value) {

                value = channel[i];
                peak = i;

            }

        }

        return peak;

    }

    percentile(channel, percent) {

        const target =
            (this.width * this.height) *
            percent;

        let sum = 0;

        for (
            let i = 0;
            i < 256;
            i++
        ) {

            sum += channel[i];

            if (sum >= target)
                return i;

        }

        return 255;

    }

    histogramLow() {

        return this.percentile(
            this.histogram.luminance,
            0.01
        );

    }

    histogramHigh() {

        return this.percentile(
            this.histogram.luminance,
            0.99
        );

    }

    calculateContrast() {

        return (
            this.histogramHigh() -
            this.histogramLow()
        );

    }

    histogramSpread() {

        return (
            this.stats.dynamicRange /
            255
        );

    }

    isLowContrast() {

        return (
            this.calculateContrast() <
            120
        );

    }

    isHighContrast() {

        return (
            this.calculateContrast() >
            210
        );

    }

    printHistogramInfo() {

        console.log({

            MeanRed:
                this.stats.meanR,

            MeanGreen:
                this.stats.meanG,

            MeanBlue:
                this.stats.meanB,

            MeanLuminance:
                this.stats.meanL,

            DynamicRange:
                this.dynamicRange,

            Contrast:
                this.calculateContrast(),

            LowContrast:
                this.isLowContrast(),

            HighContrast:
                this.isHighContrast()

        });

    }
      /*
    =====================================================
    NEGATIVE DETECTOR
    =====================================================
    */

    detectNegative() {

        console.log("Negative Detection");

        const score = this.calculateNegativeScore();

        this.stats.negativeScore = score;

        this.isNegative = score >= 60;

        console.table({

            NegativeScore: score,

            IsNegative: this.isNegative

        });

        if(this.isNegative){

            this.orangeMaskStrength =
                this.estimateOrangeMask();

        }

    }

    calculateNegativeScore(){

        let score = 0;

        /*
        ------------------------------------
        Mean RGB
        ------------------------------------
        */

        if(this.stats.meanR > this.stats.meanG)
            score += 15;

        if(this.stats.meanG > this.stats.meanB)
            score += 10;

        /*
        ------------------------------------
        Highlight Distribution
        ------------------------------------
        */

        if(this.stats.highlight > 15)
            score += 15;

        /*
        ------------------------------------
        Dynamic Range
        ------------------------------------
        */

        if(this.dynamicRange > 170)
            score += 10;

        /*
        ------------------------------------
        Contrast
        ------------------------------------
        */

        const contrast =
            this.calculateContrast();

        if(
            contrast > 120 &&
            contrast < 240
        ){
            score += 10;
        }

        /*
        ------------------------------------
        Orange Mask
        ------------------------------------
        */

        const orange =
            this.detectOrangeMask();

        score += orange;

        /*
        ------------------------------------
        Histogram Peak
        ------------------------------------
        */

        if(
            this.stats.redPeak >
            this.stats.greenPeak
        ){
            score += 5;
        }

        if(
            this.stats.greenPeak >
            this.stats.bluePeak
        ){
            score += 5;
        }

        return Math.min(score,100);

    }

    /*
    =====================================================
    ORANGE MASK ESTIMATION
    =====================================================
    */

    detectOrangeMask(){

        let score = 0;

        const rg =
            this.stats.meanR -
            this.stats.meanG;

        const gb =
            this.stats.meanG -
            this.stats.meanB;

        /*
        Orange Mask

        Kodak :

        R tinggi

        G sedang

        B rendah
        */

        if(rg > 10)
            score += 15;

        if(gb > 10)
            score += 10;

        if(
            this.stats.meanR >
            this.stats.meanB + 25
        ){
            score += 15;
        }

        return score;

    }

    estimateOrangeMask(){

        const rg =
            this.stats.meanR -
            this.stats.meanG;

        const gb =
            this.stats.meanG -
            this.stats.meanB;

        /*
        Nilai 0.0 - 1.0
        */

        let strength =
            (rg + gb) / 120;

        strength =
            Math.max(
                0,
                Math.min(
                    1,
                    strength
                )
            );

        console.log(
            "Orange Mask Strength:",
            strength
        );

        return strength;

    }

    /*
    =====================================================
    DEBUG
    =====================================================
    */

    printNegativeInfo(){

        console.table({

            MeanRed:
                this.stats.meanR,

            MeanGreen:
                this.stats.meanG,

            MeanBlue:
                this.stats.meanB,

            DynamicRange:
                this.dynamicRange,

            Contrast:
                this.calculateContrast(),

            OrangeMask:
                this.orangeMaskStrength,

            Negative:
                this.isNegative

        });

    }
      /*
    =====================================================
    FILM CONVERSION
    Orange Mask Removal + Film Inversion
    =====================================================
    */

    removeOrangeMask() {

        if (!this.isNegative) {

            console.log("Skip Orange Mask Removal");

            return;

        }

        console.log("Removing Orange Mask");

        /*
        Strength : 0 - 1
        */

        const strength = this.orangeMaskStrength;

        /*
        Adaptive Gain

        Semakin kuat orange mask,
        semakin besar koreksi.
        */

        const redGain =
            1.0 - (0.22 * strength);

        const greenGain =
            1.0 - (0.12 * strength);

        const blueGain =
            1.0 + (0.10 * strength);

        this.forEachPixel((p, i) => {

            p[i] = this.clamp(
                p[i] * redGain
            );

            p[i + 1] = this.clamp(
                p[i + 1] * greenGain
            );

            p[i + 2] = this.clamp(
                p[i + 2] * blueGain
            );

        });

    }

    /*
    =====================================================
    NEGATIVE INVERSION
    =====================================================
    */

    invertNegative() {

        if (!this.isNegative) {

            console.log("Image is Positive");

            return;

        }

        console.log("Invert Negative");

        this.forEachPixel((p, i) => {

            p[i] = 255 - p[i];

            p[i + 1] = 255 - p[i + 1];

            p[i + 2] = 255 - p[i + 2];

        });

    }

    /*
    =====================================================
    CHANNEL NORMALIZATION
    =====================================================
    */

    normalizeChannels() {

        let maxR = 0;
        let maxG = 0;
        let maxB = 0;

        this.forEachPixel((p, i) => {

            if (p[i] > maxR)
                maxR = p[i];

            if (p[i + 1] > maxG)
                maxG = p[i + 1];

            if (p[i + 2] > maxB)
                maxB = p[i + 2];

        });

        const rGain = 255 / Math.max(maxR, 1);
        const gGain = 255 / Math.max(maxG, 1);
        const bGain = 255 / Math.max(maxB, 1);

        this.forEachPixel((p, i) => {

            p[i] = this.clamp(
                p[i] * rGain
            );

            p[i + 1] = this.clamp(
                p[i + 1] * gGain
            );

            p[i + 2] = this.clamp(
                p[i + 2] * bGain
            );

        });

    }

    /*
    =====================================================
    BLACK POINT
    =====================================================
    */

    applyBlackPoint(level = 3) {

        this.forEachPixel((p, i) => {

            p[i] = this.clamp(p[i] - level);

            p[i + 1] = this.clamp(p[i + 1] - level);

            p[i + 2] = this.clamp(p[i + 2] - level);

        });

    }

    /*
    =====================================================
    WHITE POINT
    =====================================================
    */

    applyWhitePoint(level = 252) {

        this.forEachPixel((p, i) => {

            p[i] = this.clamp(
                p[i] >= level ? 255 : p[i]
            );

            p[i + 1] = this.clamp(
                p[i + 1] >= level ? 255 : p[i + 1]
            );

            p[i + 2] = this.clamp(
                p[i + 2] >= level ? 255 : p[i + 2]
            );

        });

    }
