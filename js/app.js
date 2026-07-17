/*
=========================================================
KliseApp
Application Controller
Version 3.0
=========================================================
*/

"use strict";

class KliseApp {

    constructor() {

        console.log("KliseApp Started");

        // Canvas
        this.canvas =
            document.getElementById("viewer");

        this.ctx =
            this.canvas.getContext("2d");

        // Input
        this.fileInput =
            document.getElementById("fileInput");

        // Buttons
        this.btnProcess =
            document.getElementById("btnProcess");

        this.btnReset =
            document.getElementById("btnReset");

        this.btnJPEG =
            document.getElementById("btnJPEG");

        this.btnPNG =
            document.getElementById("btnPNG");

        this.btnWEBP =
            document.getElementById("btnWEBP");

        // Engine

        this.viewer =
            new Viewer(this.canvas);

        this.exporter =
            new ExportEngine(this.canvas);

        this.engine = null;

        this.currentFile = null;

        this.bindEvents();

        this.viewer.attachEvents();

    }

    /*
    ======================================
    EVENTS
    ======================================
    */

    bindEvents() {

        this.fileInput.addEventListener(

            "change",

            (e)=>{

                if(e.target.files.length){

                    this.openFile(

                        e.target.files[0]

                    );

                }

            }

        );

        this.btnProcess?.addEventListener(

            "click",

            ()=>{

                this.processImage();

            }

        );

        this.btnReset?.addEventListener(

            "click",

            ()=>{

                this.reset();

            }

        );

        this.btnJPEG?.addEventListener(

            "click",

            ()=>{

                this.exporter.export("jpeg");

            }

        );

        this.btnPNG?.addEventListener(

            "click",

            ()=>{

                this.exporter.export("png");

            }

        );

        this.btnWEBP?.addEventListener(

            "click",

            ()=>{

                this.exporter.export("webp");

            }

        );

    }

    /*
    ======================================
    OPEN IMAGE
    ======================================
    */

    async openFile(file){

        this.currentFile = file;

        await this.viewer.load(file);

        console.log(

            "Loaded",

            file.name

        );

    }

    /*
    ======================================
    PROCESS IMAGE
    ======================================
    */

    processImage(){

        if(!this.viewer.image){

            alert("Pilih foto terlebih dahulu.");

            return;

        }

        this.engine =

            new FilmEngine(

                this.canvas,

                this.ctx

            );

        this.engine.process();

        console.log(

            this.engine.getStatistics()

        );

    }

    /*
    ======================================
    RESET
    ======================================
    */

    reset(){

        if(!this.currentFile)

            return;

        this.openFile(

            this.currentFile

        );

    }
/*
==========================================
START
==========================================
*/

window.addEventListener(

    "load",

    ()=>{

        window.app =

            new KliseApp();

    }

);
}
