import FileType from "./FileType";
import Mp4Analysis from "./analysis/Mp4Analysis";
import JPGAnalysis from "./analysis/JPGAnalysis";
import PNGAnalysis from "./analysis/PNGAnalysis";
import GIFAnalysis from "./analysis/GIFAnalysis";
import BMPAnalysis from "./analysis/BMPAnalysis";
import MP3Analysis from "./analysis/MP3Analysis";
import WAVAnalysis from "./analysis/WAVAnalysis";

class MediaInfo{
    constructor(){
        this.fileType = new FileType();
        this.mp4Analysis = new Mp4Analysis();
        this.jpgAnalysis = new JPGAnalysis();
        this.pngAnalysis = new PNGAnalysis();
        this.gifAnalysis = new GIFAnalysis();
        this.bmpAnalysis = new BMPAnalysis();
        this.mp3Analysis = new MP3Analysis();
        this.wavAnalysis = new WAVAnalysis();
    }

    getInfo(buffer,_type){
        const dataView = new DataView(buffer);
        let type = _type || this.fileType.getFileType(dataView);
        let info = {
            type:type,
            info:null
        };
        if(type == 'mp4'){
            info.info = this.mp4Analysis.getInfo(dataView);
        }else if(type == 'jpg'){
            info.info = this.jpgAnalysis.getInfo(dataView);
        }else if(type == 'png'){
            info.info = this.pngAnalysis.getInfo(dataView);
        }else if(type == 'gif'){
            info.info = this.gifAnalysis.getInfo(dataView);
        }else if(type == 'bmp'){
            info.info = this.bmpAnalysis.getInfo(dataView);
        }else if(type == 'wav'){
            info.info = this.wavAnalysis.getInfo(dataView);
        }else if(type.indexOf('mp3') == 0){
            info.info = this.mp3Analysis.getInfo(dataView,type);
            info.type = 'mp3';
        }

        return info;
    }

}
export default MediaInfo;
