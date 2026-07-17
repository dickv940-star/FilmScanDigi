/*
=========================================================
KliseApp
Export Engine
Version 3.0
=========================================================
*/

"use strict";

class ExportEngine {

    constructor(canvas) {

        this.canvas = canvas;

        this.defaultQuality = 0.95;

        this.defaultType = "image/jpeg";

    }

    /*
    ============================================
    MAIN EXPORT
    ============================================
    */

    export(type = "jpeg") {

        switch(type.toLowerCase()) {

            case "png":

                this.savePNG();

                break;

            case "webp":

                this.saveWEBP();

                break;

            default:

                this.saveJPEG();

        }

    }

    /*
    ============================================
    JPEG
    ============================================
    */

    saveJPEG(filename = null) {

        if(!filename){

            filename = this.getFilename("jpg");

        }

        this.canvas.toBlob(

            (blob)=>{

                this.download(blob, filename);

            },

            "image/jpeg",

            this.defaultQuality

        );

    }

    /*
    ============================================
    PNG
    ============================================
    */

    savePNG(filename = null){

        if(!filename){

            filename = this.getFilename("png");

        }

        this.canvas.toBlob(

            (blob)=>{

                this.download(blob, filename);

            },

            "image/png"

        );

    }

    /*
    ============================================
    WEBP
    ============================================
    */

    saveWEBP(filename = null){

        if(!filename){

            filename = this.getFilename("webp");

        }

        this.canvas.toBlob(

            (blob)=>{

                this.download(blob, filename);

            },

            "image/webp",

            this.defaultQuality

        );

    }

    /*
    ============================================
    DOWNLOAD
    ============================================
    */

    download(blob, filename){

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

    }

    /*
    ============================================
    FILE NAME
    ============================================
    */

    getFilename(ext){

        const now = new Date();

        const yyyy = now.getFullYear();

        const mm = String(

            now.getMonth()+1

        ).padStart(2,"0");

        const dd = String(

            now.getDate()

        ).padStart(2,"0");

        const hh = String(

            now.getHours()

        ).padStart(2,"0");

        const ii = String(

            now.getMinutes()

        ).padStart(2,"0");

        const ss = String(

            now.getSeconds()

        ).padStart(2,"0");

        return `KliseApp_${yyyy}${mm}${dd}_${hh}${ii}${ss}.${ext}`;

    }

}
