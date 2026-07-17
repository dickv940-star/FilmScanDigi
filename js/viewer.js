/*
=========================================================
KliseApp
Viewer Engine V3
=========================================================
*/

"use strict";

class Viewer {

    constructor(canvas) {

        this.canvas = canvas;

        this.ctx = canvas.getContext("2d");

        this.image = null;

        this.scale = 1;

        this.minScale = 0.2;

        this.maxScale = 10;

        this.offsetX = 0;

        this.offsetY = 0;

        this.dragging = false;

        this.lastX = 0;

        this.lastY = 0;

    }

    /*
    ===================================
    LOAD IMAGE
    ===================================
    */

    load(file) {

        return new Promise((resolve) => {

            const img = new Image();

            img.onload = () => {

                this.image = img;

                this.fit();

                resolve();

            };

            img.src =
                URL.createObjectURL(file);

        });

    }

    /*
    ===================================
    FIT SCREEN
    ===================================
    */

    fit() {

        if (!this.image)
            return;

        const sx =
            this.canvas.width /
            this.image.width;

        const sy =
            this.canvas.height /
            this.image.height;

        this.scale =
            Math.min(sx, sy);

        this.offsetX =
            (this.canvas.width -
                this.image.width *
                this.scale) / 2;

        this.offsetY =
            (this.canvas.height -
                this.image.height *
                this.scale) / 2;

        this.render();

    }

    /*
    ===================================
    RENDER
    ===================================
    */

    render() {

        if (!this.image)
            return;

        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        ctx.drawImage(

            this.image,

            this.offsetX,

            this.offsetY,

            this.image.width *
            this.scale,

            this.image.height *
            this.scale

        );

    }
        /*
    ===================================
    ZOOM
    ===================================
    */

    zoom(factor, centerX = null, centerY = null) {

        if (!this.image) return;

        if (centerX === null)
            centerX = this.canvas.width / 2;

        if (centerY === null)
            centerY = this.canvas.height / 2;

        const oldScale = this.scale;

        this.scale *= factor;

        this.scale = Math.max(
            this.minScale,
            Math.min(this.maxScale, this.scale)
        );

        const ratio = this.scale / oldScale;

        this.offsetX =
            centerX -
            (centerX - this.offsetX) * ratio;

        this.offsetY =
            centerY -
            (centerY - this.offsetY) * ratio;

        this.render();

    }

    /*
    ===================================
    RESET VIEW
    ===================================
    */

    reset() {

        this.fit();

    }

    /*
    ===================================
    PAN
    ===================================
    */

    startPan(x, y) {

        this.dragging = true;

        this.lastX = x;

        this.lastY = y;

    }

    movePan(x, y) {

        if (!this.dragging)
            return;

        this.offsetX +=
            x - this.lastX;

        this.offsetY +=
            y - this.lastY;

        this.lastX = x;

        this.lastY = y;

        this.render();

    }

    endPan() {

        this.dragging = false;

    }

    /*
    ===================================
    MOUSE EVENTS
    ===================================
    */

    attachEvents() {

        this.canvas.addEventListener(

            "wheel",

            (e) => {

                e.preventDefault();

                const factor =
                    e.deltaY < 0
                    ? 1.10
                    : 0.90;

                this.zoom(

                    factor,

                    e.offsetX,

                    e.offsetY

                );

            }

        );

        this.canvas.addEventListener(

            "mousedown",

            (e) => {

                this.startPan(

                    e.clientX,

                    e.clientY

                );

            }

        );

        window.addEventListener(

            "mousemove",

            (e) => {

                this.movePan(

                    e.clientX,

                    e.clientY

                );

            }

        );

        window.addEventListener(

            "mouseup",

            () => {

                this.endPan();

            }

        );

        this.canvas.addEventListener(

            "dblclick",

            () => {

                this.reset();

            }

        );

    }

    /*
    ===================================
    IMAGE INFO
    ===================================
    */

    getInfo() {

        if (!this.image)
            return null;

        return {

            width:
                this.image.width,

            height:
                this.image.height,

            zoom:
                this.scale,

            offsetX:
                this.offsetX,

            offsetY:
                this.offsetY

        };

    }

}
