class Mp4Analysis{
    constructor(){

    }

    getInfo(dataView){
        // const dataView = new DataView(buffer);
        // console.log(dataView)
        const info={};
        let minor_version = dataView.getInt32(12);
        const mp4Struct = [];
        this.getMp4Struct(mp4Struct,dataView,0,dataView.byteLength,minor_version);
        // console.log(mp4Struct)
        let moovBox;
        for(let i=0;i<mp4Struct.length;i++){
            if(mp4Struct[i].boxType == 'moov'){
                moovBox = mp4Struct[i];
                break;
            }
        }
        const date = new Date();
        date.setFullYear(1904,0,1);
        date.setHours(0,0,0,0);
        const ms1904 = date.getTime();
        const moovStruct = this.getMoovData(moovBox,dataView,minor_version);
        // let time_scale = 0;
        // console.log(moovStruct)
        for(let i=0;i<moovStruct.length;i++){
            let item = moovStruct[i];
            if(item.boxType == 'mvhd'){
                info.creation_time = Math.max(0,item.info.creation_time*1000+ms1904);
                info.modification_time = Math.max(0,item.info.modification_time*1000+ms1904);
                info.duration = item.info.duration/item.info.time_scale;
            }else if(item.boxType == 'trak'){
                if(item.track_type == 'vide'){
                    // let sample_count = item.stts.sample_count;
                    // if(sample_count <= 1 && item.stsz.sample_count>1){
                    let  sample_count = item.stsz.sample_count;
                    // }
                    info.width = item.stsd.width;
                    info.height = item.stsd.height;
                    info.video_format = item.stsd.format;
                    info.video_frames = sample_count;
                    info.video_duration = item.mdhd.duration/item.mdhd.time_scale;
                    info.fps = sample_count/info.video_duration;
                    info.bit_rate = item.stsz.file_size*8/info.video_duration/1000;
                    info.bit_depth = item.stsd.bit_depth;
                }else if(item.track_type == 'soun'){
                    // let sample_count = item.stts.sample_count;
                    // if(sample_count <= 1 && item.stsz.sample_count>1){
                    let  sample_count = item.stsz.sample_count;
                    // }
                    info.audio_format = item.stsd.format;
                    info.audio_frames = sample_count;
                    info.audio_duration = item.mdhd.duration/item.mdhd.time_scale;
                    info.audio_smplrate = item.stsd.smplrate;
                    info.audio_channel = item.stsd.channel;
                    info.audio_bit_rate = item.stsz.file_size*8/info.audio_duration/1000;
                }
            }
        }
        // console.log('moovStruct',moovStruct)
        return info;
    }

    getMp4Struct(mp4Struct,dataView,positon,side){
        let boxLen = dataView.getInt32(positon);
        // let buffer = dataView.buffer.slice(positon+4,positon+8);
        let boxName = this.getASCII(dataView.buffer.slice(positon+4,positon+8));
        mp4Struct.push({
            boxType:boxName,
            boxPosStart:positon,
            boxPosEnd: positon+boxLen
        })
        if(positon+boxLen < side){
            this.getMp4Struct(mp4Struct,dataView,positon+boxLen,side);
        }
    }

    getASCII(buffer){
        const int8 = new Uint8Array(buffer);
        let str = '';
        for(let i=0;i<int8.length;i++){
            str += String.fromCharCode(int8[i]);
        }
        return str;
    }

    getMoovData(recordBox,dataView,minor_version){
        if(!recordBox){
            return null;
        }
        // const moovObj = {
        //     mvhd:{}
        // }
        const moovStruct = [];
        this.getMp4Struct(moovStruct,dataView,recordBox.boxPosStart+8,recordBox.boxPosEnd);
        for(let i=0;i<moovStruct.length;i++){
            let item = moovStruct[i];
            if(item.boxType == 'mvhd'){
                item.info = this.decode_mvhd(item,dataView,minor_version);
            }else{
                // item['track'+i] = this.decodeTrack(item,dataView,minor_version);
                const trakStruct = [];
                this.getMp4Struct(trakStruct,dataView,item.boxPosStart+8,item.boxPosEnd);
                item.children = trakStruct;
                for(let j=0;j<trakStruct.length;j++){
                    let trak_item = trakStruct[j];
                    if(trak_item.boxType == 'tkhd'){
                        trak_item.info = this.decode_tkhd(trak_item,dataView,trak_item.boxPosStart+8,trak_item.boxPosEnd);
                    }else if(trak_item.boxType == 'mdia'){
                        const mdiaStruct = [];
                        this.getMp4Struct(mdiaStruct,dataView,trak_item.boxPosStart+8,trak_item.boxPosEnd);
                        trak_item.children = mdiaStruct;

                        for(let m=0;m<mdiaStruct.length;m++){
                            let mdia_item = mdiaStruct[m];
                            if(mdia_item.boxType == 'mdhd'){
                                mdia_item.info = this.decode_mdhd(mdia_item,dataView,minor_version);
                                item.mdhd = mdia_item.info;
                            }else if(mdia_item.boxType == 'hdlr'){
                                mdia_item.info = this.decode_hdlr(mdia_item,dataView,minor_version);
                                trak_item.track_type = mdia_item.info.handler_type;
                                item.track_type = mdia_item.info.handler_type;
                            }else if(mdia_item.boxType == 'minf'){
                                const minfStruct = [];
                                this.getMp4Struct(minfStruct,dataView,mdia_item.boxPosStart+8,mdia_item.boxPosEnd);
                                mdia_item.children = minfStruct;
                                for(let n=0;n<minfStruct.length;n++){
                                    let minf_item = minfStruct[n];
                                    if(minf_item.boxType == 'vmhd'){
                                        minf_item.info = this.decode_vmhd(minf_item,dataView,minor_version);
                                    }else if(minf_item.boxType == 'smhd'){
                                        minf_item.info = this.decode_smhd(minf_item,dataView,minor_version);
                                    }else if(minf_item.boxType == 'stbl'){
                                        const stblStruct = [];
                                        this.getMp4Struct(stblStruct,dataView,minf_item.boxPosStart+8,minf_item.boxPosEnd);
                                        minf_item.children = stblStruct;
                                        for(let o=0;o<stblStruct.length;o++){
                                            let stbl_item = stblStruct[o];
                                            if(stbl_item.boxType == 'stsd'){
                                                if(trak_item.track_type == 'vide'){
                                                    stbl_item.info = this.decode_stsd_video(stbl_item,dataView,minor_version);
                                                }else if(trak_item.track_type == 'soun'){
                                                    stbl_item.info = this.decode_stsd_audio(stbl_item,dataView,minor_version);
                                                }
                                                item.stsd = stbl_item.info;
                                            }else if(stbl_item.boxType == 'stts'){
                                                if(trak_item.track_type == 'vide'){
                                                    stbl_item.info = this.decode_stts_video(stbl_item,dataView,minor_version);
                                                }else if(trak_item.track_type == 'soun'){
                                                    stbl_item.info = this.decode_stts_audio(stbl_item,dataView,minor_version);
                                                }
                                                item.stts = stbl_item.info;
                                            }else if(stbl_item.boxType == 'stsz'){
                                                if(trak_item.track_type == 'vide'){
                                                    stbl_item.info = this.decode_stsz_video(stbl_item,dataView,minor_version);
                                                }else if(trak_item.track_type == 'soun'){
                                                    stbl_item.info = this.decode_stsz_audio(stbl_item,dataView,minor_version);
                                                }
                                                item.stsz = stbl_item.info;
                                            }
                                        }

                                        
                                    }
                                }
                            }
                        }
                    }
                }
                // console.log('track'+i,trakStruct)
            }
        }
        return moovStruct;
    }

    decode_mvhd(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart+8;
        if(minor_version==1){
            tempPos+=4;
            info.creation_time = dataView.getBigUint64(tempPos);
            tempPos+=8;
            info.modification_time = dataView.getBigUint64(tempPos);
            tempPos+=8;
            info.time_scale = dataView.getUint32(tempPos);
            tempPos+=4;
            info.duration = dataView.getBigUint64(tempPos);
            tempPos+=4;
        }else{
            tempPos+=4;
            info.creation_time = dataView.getUint32(tempPos);
            tempPos+=4;
            info.modification_time = dataView.getUint32(tempPos);
            tempPos+=4;
            info.time_scale = dataView.getUint32(tempPos);
            tempPos+=4;
            info.duration = dataView.getUint32(tempPos);
            tempPos+=4;
        }
        info.rate = dataView.getUint32(tempPos);
        tempPos+=4;
        info.volume = dataView.getUint16(tempPos);
        return info;
    }
    decode_tkhd(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart+8;
        info.version = dataView.getUint8(tempPos);
        info.flags = dataView.getUint8(tempPos+3);
        tempPos+=4;
        info.creation_time = dataView.getUint32(tempPos);
        tempPos+=4;
        info.modification_time = dataView.getUint32(tempPos);
        tempPos+=4;
        info.track_id = dataView.getUint32(tempPos);
        tempPos+=4;
        //保留4位
        // info.reserved = dataView.getUint32(tempPos);
        tempPos+=4;
        info.duration = dataView.getUint32(tempPos);
        tempPos+=8;
        //保留8位
        tempPos+=4;
        info.layer = dataView.getUint16(tempPos);
        tempPos+=2;
        info.alternate_group = dataView.getUint16(tempPos);
        tempPos+=2;
        info.volume = dataView.getUint8(tempPos)+dataView.getUint8(tempPos+1)/100;
        tempPos+=2;
        tempPos+=2;
        //保留2位
        tempPos+=36;
        info.width = dataView.getUint16(tempPos);
        tempPos+=4;
        info.height = dataView.getUint16(tempPos);
        
        return info;
    }
    decode_mdhd(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart+8;
        info.version = dataView.getUint8(tempPos);
        info.flags = dataView.getUint8(tempPos+3);
        tempPos+=4;
        info.creation_time = dataView.getUint32(tempPos);
        tempPos+=4;
        info.modification_time = dataView.getUint32(tempPos);
        tempPos+=4;
        info.time_scale = dataView.getUint32(tempPos);
        tempPos+=4;
        info.duration = dataView.getUint32(tempPos);
        return info;
    }
    decode_hdlr(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart+8;
        info.version = dataView.getUint8(tempPos);
        info.flags = dataView.getUint8(tempPos+3);
        tempPos+=8;
        info.handler_type = this.getASCII(dataView.buffer.slice(tempPos,tempPos+4));
        return info;
    }
    decode_vmhd(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart+8;
        info.version = dataView.getUint8(tempPos);
        info.flags = dataView.getUint8(tempPos+3);
        tempPos+=4;
        info.graphics_mode = dataView.getUint32(tempPos);
        return info;
    }
    decode_smhd(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart+8;
        info.version = dataView.getUint8(tempPos);
        info.flags = dataView.getUint8(tempPos+3);
        tempPos+=4;
        info.balance = dataView.getInt8(tempPos);
        return info;
    }
    decode_stsd_video(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart+8;
        // console.log('atomLen',dataView.getUint32(tempPos-8))
        info.version = dataView.getUint8(tempPos);
        info.flags = dataView.getUint8(tempPos+3);
        tempPos+=4;
        info.sample_descriptions = dataView.getUint32(tempPos);
        tempPos+=4;
        info.size = dataView.getUint32(tempPos);
        tempPos+=4;
        info.format = this.getASCII(dataView.buffer.slice(tempPos,tempPos+4));
        tempPos+=28;
        info.width = dataView.getUint16(tempPos);
        info.height = dataView.getUint16(tempPos+2);
        tempPos += 4;
        info.horizresolution = dataView.getUint32(tempPos);
        info.vertresolution  = dataView.getUint32(tempPos+4);
        tempPos += 8;
        info.reserved = dataView.getUint32(tempPos);
        tempPos += 4;
        info.frames_count = dataView.getUint16(tempPos);
        tempPos += 2;
        tempPos += 32;
        info.bit_depth = dataView.getUint16(tempPos);
        tempPos += 2;
        //pre_defined
        // tempPos += 2;
        // let avcC_size = dataView.getUint32(tempPos);
        // tempPos += 4;
        // let avcC_boxName = this.getASCII(dataView.buffer.slice(tempPos,tempPos+4));
        // tempPos += 4;
        // let avc_version = dataView.getUint8(tempPos);
        // let avcProfileIndication = dataView.getUint8(tempPos+1);
        // let profile_compatibility = dataView.getUint8(tempPos+2);
        // let avcLevelIndication = dataView.getUint8(tempPos+3);
        // let NALU_len = dataView.getUint8(tempPos+4);
        // let SPS_number = dataView.getUint8(tempPos+5);
        // tempPos += 6;
        // let SPS_len = dataView.getUint16(tempPos);
        // tempPos += 2;
        // console.log(dataView.buffer.slice(tempPos,tempPos+SPS_len))
        // tempPos += SPS_len;
        // let PPS_number = dataView.getUint8(tempPos);
        // tempPos += 1;
        // let PPS_len = dataView.getUint16(tempPos);
        // tempPos += 2;
        // console.log(dataView.buffer.slice(tempPos,tempPos+PPS_len))
        // console.log(info,avcC_boxName)
        return info;
    }
    decode_stsd_audio(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart+8;
        info.version = dataView.getUint8(tempPos);
        info.flags = dataView.getUint8(tempPos+3);
        tempPos+=4;
        info.sample_descriptions = dataView.getUint32(tempPos);
        tempPos+=4;
        info.size = dataView.getUint32(tempPos);
        tempPos+=4;
        info.format = this.getASCII(dataView.buffer.slice(tempPos,tempPos+4));
        tempPos+=20;
        info.channel = dataView.getUint16(tempPos);
        tempPos+=8;
        info.smplrate = dataView.getUint16(tempPos);
        // info.height = dataView.getUint16(tempPos+2);
        return info;
    }
    decode_stts_video(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart+8;
        info.version = dataView.getUint8(tempPos);
        info.flags = dataView.getUint8(tempPos+3);
        tempPos+=4;
        info.time_to_sample = dataView.getUint32(tempPos);
        tempPos+=4;
        info.sample_count = dataView.getUint32(tempPos);
        tempPos+=4;
        info.sample_duration = dataView.getUint32(tempPos);
        return info;
    }
    decode_stts_audio(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart+8;
        info.version = dataView.getUint8(tempPos);
        info.flags = dataView.getUint8(tempPos+3);
        tempPos+=4;
        info.time_to_sample = dataView.getUint32(tempPos);
        tempPos+=4;
        info.sample_count = dataView.getUint32(tempPos);
        tempPos+=4;
        info.sample_duration = dataView.getUint32(tempPos);
        return info;
    }
    decode_stsz_video(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart;
        let sample_count = dataView.getInt32(tempPos+16);
        tempPos += 20;
        let all_size_byte = 0;
        for(let i=0;i<sample_count;i++){
            all_size_byte += dataView.getInt32(tempPos);
            tempPos += 4;
        }
        info.file_size = all_size_byte;
        info.sample_count = sample_count;
        return info;
    }
    decode_stsz_audio(recordBox,dataView,minor_version){
        const info = {};
        let tempPos = recordBox.boxPosStart;
        let sample_count = dataView.getInt32(tempPos+16);
        tempPos += 20;
        let all_size_byte = 0;
        for(let i=0;i<sample_count;i++){
            all_size_byte += dataView.getInt32(tempPos);
            tempPos += 4;
        }
        info.file_size = all_size_byte;
        info.sample_count = sample_count;
        return info;
    }
}

export default Mp4Analysis;