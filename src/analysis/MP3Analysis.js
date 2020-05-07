const kbps_table = {
    '0000':[-1,-1,-1,-1,-1],
    '0001':[32,32,32,32,8],
    '0010':[64,48,40,48,16],
    '0011':[96,56,48,56,24],
    '0100':[128,64,56,64,32],
    '0101':[160,80,64,80,40],
    '0110':[192,96,80,96,48],
    '0111':[224,112,96,112,56],
    '1000':[256,128,112,128,64],
    '1001':[288,160,128,144,80],
    '1010':[320,192,160,160,96],
    '1011':[352,224,192,176,112],
    '1100':[384,256,224,192,128],
    '1101':[416,320,256,224,144],
    '1110':[448,384,320,256,160],
    '1111':[-2,-2,-2,-2,-2],
}

const samplingrate_table = {
    '00':[44100,22050,11025],
    '01':[48000,24000,12000],
    '10':[32000,16000,8000],
    '11':[0,0,0,0]
}

const framesize_table = {
    'LayerI_MPEG1':384,
    'LayerI_MPEG2':384,
    'LayerI_MPEG3':384,
    'LayerII_MPEG1':1152,
    'LayerII_MPEG2':1152,
    'LayerII_MPEG3':1152,
    'LayerIII_MPEG1':1152,
    'LayerIII_MPEG2':576,
    'LayerIII_MPEG3':576,
}
class MP3Analysis{
    constructor(){

    }

    getInfo(dataView,type_mark){
        if(type_mark == 'mp3_id3v2'){
            return this.getInfo_id3v2(dataView);
        }else{
            return this.getInfo_id3v1(dataView);
        }
    }

    getInfo_id3v1(dataView){
        let tempPos = 0;
            
        let frameHeader = this.getFrameHeaderMsg(dataView.getUint32(tempPos));
        let frameSize = framesize_table[frameHeader.layer+'_'+frameHeader.coding_version];
        let frameLen = this.getFrameLength(frameHeader,frameSize);
        // console.time('toString');
        let frameStr = this.getASCII(dataView.buffer.slice(tempPos,tempPos+frameLen));
        frameStr = frameStr.toLocaleLowerCase();
        if(frameStr.indexOf('xing')>-1 || frameStr.indexOf('info')>-1 || frameStr.indexOf('vbri')>-1){
            tempPos += frameLen;
            frameHeader = this.getFrameHeaderMsg(dataView.getUint32(tempPos));
            frameSize = framesize_table[frameHeader.layer+'_'+frameHeader.coding_version];
            frameLen = this.getFrameLength(frameHeader,frameSize);
        }
        let f_duration = frameSize / frameHeader.samplingrate;
        let duration = Math.floor((dataView.byteLength - 128)/frameLen) * f_duration;
        return {
            channel:frameHeader.channel,
            bitrate:frameHeader.kbps,
            samplingrate: frameHeader.samplingrate,
            duration: duration,
        }
    }

    getInfo_id3v2(dataView){
        let tempPos = 6;
        let tagLen = (dataView.getUint8(tempPos)&0x7F)*0x200000+
        (dataView.getUint8(tempPos+1)&0x7F)*0x400+
        (dataView.getUint8(tempPos+2)&0x7F)*0x80+
        (dataView.getUint8(tempPos+3)&0x7F);

        tempPos = tagLen+10;
        // console.log(tempPos)
        
        let frameHeader = this.getFrameHeaderMsg(dataView.getUint32(tempPos));
        let frameSize = framesize_table[frameHeader.layer+'_'+frameHeader.coding_version];
        
        let frameLen = this.getFrameLength(frameHeader,frameSize);
        // console.time('toString');
        let frameStr = this.getASCII(dataView.buffer.slice(tempPos,tempPos+frameLen));
        frameStr = frameStr.toLocaleLowerCase();
        if(frameStr.indexOf('xing')>-1 || frameStr.indexOf('info')>-1 || frameStr.indexOf('vbri')>-1){
            tempPos += frameLen;
            frameHeader = this.getFrameHeaderMsg(dataView.getUint32(tempPos));
            frameSize = framesize_table[frameHeader.layer+'_'+frameHeader.coding_version];
            frameLen = this.getFrameLength(frameHeader,frameSize);
        }
        // console.log(frameStr);
        // console.timeEnd('toString');
        let f_duration = frameSize / frameHeader.samplingrate;
        let duration = Math.floor((dataView.byteLength - tempPos)/frameLen) * f_duration;
        // console.log(frameLen,duration,f_duration)
        return {
            channel:frameHeader.channel,
            kbps:frameHeader.kbps,
            samplingrate: frameHeader.samplingrate,
            duration: duration,
        }
    }

    
    getFrameHeaderMsg(fh){
        const info = {};
        let fh_str = fh.toString(2);
        let a_str = fh_str.substring(0,11);
        let b_str = fh_str.substring(11,13);
        let c_str = fh_str.substring(13,15);
        let d_str = fh_str.substring(15,16);
        let e_str = fh_str.substring(16,20);
        let f_str = fh_str.substring(20,22);
        let g_str = fh_str.substring(22,23);
        let h_str = fh_str.substring(23,24);
        let i_str = fh_str.substring(24,26);
        let j_str = fh_str.substring(26,28);
        let k_str = fh_str.substring(28,29);
        let l_str = fh_str.substring(29,30);
        let m_str = fh_str.substring(30,32);
        switch(b_str){
            case '00':
                info.coding_version = 'MPEG2.5';
                break;
            case '01':
                info.coding_version = 'Retain';
                break;
            case '10':
                info.coding_version = 'MPEG2';
                break;
            case '11':
                info.coding_version = 'MPEG1';
                break;
        }
        switch(c_str){
            case '00':
                info.layer = 'Retain';
                break;
            case '01':
                info.layer = 'LayerIII';
                break;
            case '10':
                info.layer = 'LayerII';
                break;
            case '11':
                info.layer = 'LayerI';
                break;
        }
        info.hasCRC_check = d_str == '0';
        // console.log(e_str)
        // console.log(info)
        info.kbps = this.getKbps(e_str,info.coding_version,info.layer);
        let samplingrate = 0;
        if(info.coding_version == 'MPEG1'){
            samplingrate = samplingrate_table[f_str][0];
        }else if(info.coding_version == 'MPEG2'){
            samplingrate = samplingrate_table[f_str][1];
        }else if(info.coding_version == 'MPEG2.5'){
            samplingrate = samplingrate_table[f_str][2];
        }
        info.samplingrate = samplingrate;
        info.isFill = g_str == '1';
        info.private = h_str;
        switch(i_str){
            case '00':
                info.channel = 2;
                break;
            case '01':
                info.channel = 2;
                break;
            case '10':
                info.channel = 2;
                break;
            case '11':
                info.channel = 1;
                break;
        }
        // console.log(this.getKbps(e_str,info.coding_version,info.layer));
        return info;
    }

    getKbps(str,code_v,layer){
        const tempkbps = kbps_table[str];
        let kbps = 0;
        if(code_v == 'MPEG1'){
            if(layer == 'LayerI'){
                kbps = tempkbps[0];
            }else if(layer == 'LayerII'){
                kbps = tempkbps[1];
            }else if(layer == 'LayerIII'){
                kbps = tempkbps[2];
            }
        }else if(code_v == 'MPEG2' || code_v == 'MPEG2.5'){
            if(layer == 'LayerI'){
                kbps = tempkbps[3];
            }else if(layer == 'LayerII' || layer == 'LayerIIi'){
                kbps = tempkbps[4];
            }
        }
        return kbps;
    }

    getFrameBox(struct,dataView,tempPos,side){
        let mark = this.getASCII(dataView.buffer.slice(tempPos,tempPos+4));
        tempPos += 4;
        let len = this.getFrameLen(dataView,tempPos);//dataView.getUint32(tempPos);
        tempPos += 6;
        struct.push({
            box_mark: mark,
            contentStart: tempPos,
            contentEnd: tempPos+len
        })
        if(tempPos+len < side){
            this.getFrameBox(struct,dataView,tempPos+len,side);
        }
    }

    getFrameLen(dataView,pos){
        return dataView.getUint8(pos)*0x100000000 + dataView.getUint8(pos+1)*0x10000+ dataView.getUint8(pos+2)*0x100 +dataView.getUint8(pos+3);
    }

    getFrameLength(frameHeader,frameSize){
        let frameLen;
        if(frameHeader.layer == 'LayerI'){
            frameLen = (frameSize/8*frameHeader.kbps)/(frameHeader.samplingrate/1000);
            frameLen = Math.floor(frameLen);
            if(frameHeader.isFill){
                frameLen += 4;
            }
        }else{
            frameLen = (frameSize/8*frameHeader.kbps)/(frameHeader.samplingrate/1000);
            frameLen = Math.floor(frameLen);
            if(frameHeader.isFill){
                frameLen += 1;
            }
        }
        return frameLen;
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

export default MP3Analysis;