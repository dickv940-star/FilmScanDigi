/*
===========================================
KliseApp
Application Controller v2.0
===========================================
*/

"use strict";

const App = {

    canvas: null,
    ctx: null,

    image: null,

    fileInput: null,
    uploadBtn: null,
    scanBtn: null,
    saveBtn: null,
    status: null,

    init() {

        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d", {
            willReadFrequently: true
        });

        this.fileInput = document.getElementById("fileInput");
        this.uploadBtn = document.getElementById("uploadBtn");
        this.scanBtn = document.getElementById("scanBtn");
        this.saveBtn = document.getElementById("saveBtn");
        this.status = document.getElementById("status");

        this.registerEvents();

        this.registerServiceWorker();

        this.setStatus("Ready");

        console.log("KliseApp Started");
    },

    registerEvents() {

        this.uploadBtn.addEventListener("click", () => {

            this.fileInput.click();

        });

        this.fileInput.addEventListener("change", (e) => {

            if (!e.target.files.length) return;

            this.loadImage(e.target.files[0]);

        });

        this.scanBtn.addEventListener("click", () => {

            this.autoScan();

        });

        this.saveBtn.addEventListener("click", () => {

            this.saveImage();

        });

        window.addEventListener("resize", () => {

            this.redraw();

        });

    },

    loadImage(file) {

        this.setStatus("Loading image...");

        const reader = new FileReader();

        reader.onload = (event) => {

            const img = new Image();

            img.onload = () => {

                this.image = img;

                this.fitCanvas(img);

                this.drawImage(img);

                this.setStatus(
                    img.width +
                    " × " +
                    img.height +
                    " loaded"
                );

            };

            img.src = event.target.result;

        };

        reader.readAsDataURL(file);

    },

    fitCanvas(img) {

        const maxWidth = 820;

        const scale = Math.min(
            1,
            maxWidth / img.width
        );

        this.canvas.width = img.width * scale;
        this.canvas.height = img.height * scale;

    },

    drawImage(img) {

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.ctx.drawImage(
            img,
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

    },

    redraw() {

        if (!this.image) return;

        this.fitCanvas(this.image);

        this.drawImage(this.image);

    },

    autoScan() {

        if (!this.image) {

            alert("Upload a negative first.");

            return;

        }

        this.setStatus("Film Engine coming soon...");

        console.log("AUTO SCAN");

        /*
        Nanti akan memanggil:

        FilmEngine.process(
            canvas,
            context
        );

        */

    },

    saveImage() {

        if (!this.image) return;

        this.setStatus("Saving...");

        /*
        export.js nanti
        akan menangani proses export
        */

        const link = document.createElement("a");

        link.download = "KliseApp.jpg";

        link.href = this.canvas.toDataURL(
            "image/jpeg",
            0.98
        );

        link.click();

        this.setStatus("JPEG saved");

    },

    setStatus(text) {

        this.status.textContent = text;

    },

    registerServiceWorker() {

        if (!("serviceWorker" in navigator))
            return;

        window.addEventListener("load", () => {

            navigator.serviceWorker
                .register("sw.js")
                .then(() => {

                    console.log(
                        "Service Worker Registered"
                    );

                })
                .catch((err) => {

                    console.error(err);

                });

        });

    }

};

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.init();

    }
);
