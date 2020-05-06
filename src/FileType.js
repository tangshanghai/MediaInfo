class FileType{
    constructor(){

    }

    getFileType(dataView){
        // const dataView = new DataView(buffer);
        // let boxLen = dataView.getInt32(0);
        // const headIntArray = new Int8Array(buffer.slice(0,boxLen));
        let ftyp = '',major_brand='';//,minor_version=dataView.getInt32(12);
        for(let i=4;i<8;i++){
            ftyp += String.fromCharCode(dataView.getInt8(i));
        }
        for(let i=8;i<12;i++){
            major_brand += String.fromCharCode(dataView.getInt8(i));
        }
        let header = new Uint8Array(dataView.buffer.slice(0,8));
        let type = 'other';// && major_brand.indexOf('mp4')>-1
        if(ftyp == 'ftyp'){
            type = 'mp4'
        }else if(header[0] == 0x89 &&
            header[1] == 0x50 && // P
            header[2] == 0x4E && // N
            header[3] == 0x47 && // G
            header[4] == 0x0D &&
            header[5] == 0x0A &&
            header[6] == 0x1A &&
            header[7] == 0x0A){
            type = 'png';

        }else if(header[0] == 0xFF && header[1] == 0xD8){
            type = 'jpg';
        }else if (header[0] == 0x47 &&   // G
            header[1] == 0x49 &&    // I
            header[2] == 0x46 &&    // F
            header[3] == 0x38 &&    // 8
            (header[4] == 0x39 ||   // 9
            header[4] == 0x37) &&   // 7
            header[5] == 0x61){
            type = 'gif';
        }else if (header[0] == 0x42 && header[1] == 0x4D) {
            type = 'bmp';
        }else if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46) {
            type = 'wav';
        }else if (header[0] == 0x49 && header[1] == 0x44 && header[2] == 0x33) {
            type = 'mp3_id3v2';
        }else{
            let pos = dataView.byteLength - 128;
            let b1 = dataView.getUint8(pos) == 0x54 && dataView.getUint8(pos+1) == 0x41 && dataView.getUint8(pos+2) == 0x47;
            let b2 = header[0] == 0xFF && header[1] == 0xFB;
            if(b1 || b2){
                type = 'mp3_id3v1';
            }
        }
        return type;
    }

    getASCII(buffer){
        const int8 = new Uint8Array(buffer);
        let str = '';
        for(let i=0;i<int8.length;i++){
            str += String.fromCharCode(int8[i]);
        }
        return str;
    }
}

export default FileType;