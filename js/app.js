/*
=========================================================
KliseApp
Application Controller
Version 3.1
=========================================================
*/

"use strict";


class KliseApp {


    constructor() {


        console.log("KliseApp Started");


        // =========================
        // CANVAS
        // =========================

        this.canvas =
            document.getElementById("viewer");


        if(!this.canvas){

            console.error(
                "Canvas #viewer tidak ditemukan"
            );

            return;

        }


        this.ctx =
            this.canvas.getContext("2d");



        // =========================
        // INPUT
        // =========================

        this.fileInput =
            document.getElementById("fileInput");



        // =========================
        // BUTTON
        // =========================

        this.uploadBtn =
            document.getElementById("uploadBtn");


        this.btnProcess =
            document.getElementById("scanBtn");


        this.btnSave =
            document.getElementById("saveBtn");



        // =========================
        // ENGINE
        // =========================


        this.viewer =
            new Viewer(
                this.canvas
            );


        this.engine =
            null;


        this.exporter =
            new ExportEngine(
                this.canvas
            );


        this.currentFile =
            null;



        this.bindEvents();


        console.log(
            "KliseApp Ready"
        );


    }



    /*
    ======================================
    EVENTS
    ======================================
    */


    bindEvents(){



        // Upload

        this.uploadBtn?.addEventListener(

            "click",

            ()=>{

                this.fileInput.click();

            }

        );




        this.fileInput?.addEventListener(

            "change",

            (e)=>{


                if(
                    e.target.files.length
                ){

                    this.openFile(

                        e.target.files[0]

                    );

                }


            }

        );




        // AUTO SCAN


        this.btnProcess?.addEventListener(

            "click",

            ()=>{

                this.processImage();

            }

        );




        // SAVE JPEG


        this.btnSave?.addEventListener(

            "click",

            ()=>{


                this.exporter.export(
                    "jpeg"
                );


            }

        );



    }




    /*
    ======================================
    OPEN IMAGE
    ======================================
    */


    async openFile(file){


        this.currentFile =
            file;



        await this.viewer.load(

            file

        );



        console.log(

            "Loaded:",
            file.name

        );


    }




    /*
    ======================================
    PROCESS IMAGE
    ======================================
    */


    processImage(){



        if(
            !this.viewer.image
        ){

            alert(
                "Upload negative terlebih dahulu."
            );

            return;

        }



        this.engine =

            new FilmEngine(

                this.canvas,

                this.ctx

            );



        this.engine.process();



        console.log(
            "Scan Complete"
        );



    }





    /*
    ======================================
    RESET
    ======================================
    */


    reset(){


        if(
            !this.currentFile
        ){

            return;

        }



        this.openFile(

            this.currentFile

        );


    }



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
