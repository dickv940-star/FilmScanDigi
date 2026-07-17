/*
===========================================
KliseApp
Viewer Engine v1.0
Canvas Viewer
===========================================
*/

"use strict";

const Viewer = {

    canvas: null,
    ctx: null,

    image: null,

    zoom: 1,
    minZoom: 0.1,
    maxZoom: 5,

    offsetX: 0,
    offsetY: 0,

    dragging: false,
    lastX: 0,
    lastY: 0,

    init(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d", {
            willReadFrequently: true
        });

        this.registerEvents();

    },

    registerEvents() {

        this.canvas.addEventListener("wheel", e => {

            e.preventDefault();

            const delta = e.deltaY < 0 ? 1.1 : 0.9;

            this.zoom *= delta;

            this.zoom = Math.max(
                this.minZoom,
                Math.min(this.maxZoom, this.zoom)
            );

            this.render();

        });

        this.canvas.addEventListener("mousedown", e => {

            this.dragging = true;

            this.lastX = e.offsetX;
            this.lastY = e.offsetY;

        });

        window.addEventListener("mouseup", () => {

            this.dragging = false;

        });

        this.canvas.addEventListener("mousemove", e => {

            if (!this.dragging) return;

            this.offsetX += e.offsetX - this.lastX;
            this.offsetY += e.offsetY - this.lastY;

            this.lastX = e.offsetX;
            this.lastY = e.offsetY;

            this.render();

        });

    },

    load(img) {

        this.image = img;

        this.fit();

    },

    fit() {

        if (!this.image) return;

        const scaleX = this.canvas.width / this.image.width;
        const scaleY = this.canvas.height / this.image.height;

        this.zoom = Math.min(scaleX, scaleY);

        this.offsetX = (this.canvas.width - this.image.width * this.zoom) / 2;
        this.offsetY = (this.canvas.height - this.image.height * this.zoom) / 2;

        this.render();

    },

    reset() {

        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.fit();

    },

    render() {

        if (!this.image) return;

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.ctx.save();

        this.ctx.translate(
            this.offsetX,
            this.offsetY
        );

        this.ctx.scale(
            this.zoom,
            this.zoom
        );

        this.ctx.drawImage(
            this.image,
            0,
            0
        );

        this.ctx.restore();

    },

    getImageData() {

        return this.ctx.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

    },

    putImageData(imageData) {

        this.ctx.putImageData(
            imageData,
            0,
            0
        );

    }

};
