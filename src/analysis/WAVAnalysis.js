class WAVAnalysis{
    constructor(){

    }

    getInfo(dataView){
        const info = {};
        let tempPos = 4;
        let wavByte = dataView.getUint32(tempPos,true);
        tempPos += 12;
        let DWORD_len = dataView.getUint32(tempPos,true);
        tempPos += 4;
        let wave_format = this.getWaveFormat(dataView.getUint16(tempPos,true));
        tempPos += 2;
        let channel = dataView.getUint16(tempPos,true);
        tempPos += 2;
        let sampling_rate = dataView.getUint32(tempPos,true);
        tempPos += 4;
        let transfer_rate = dataView.getUint32(tempPos,true);
        tempPos += 4;
        let block_alignment = dataView.getUint16(tempPos,true);
        tempPos += 2;
        let bit_depth = dataView.getUint16(tempPos,true);
        if(wave_format == 'children'){
            tempPos += 2;

            let extend_bytelen = dataView.getUint16(tempPos,true);
            tempPos += 2;
            let extend_valid_bit = dataView.getUint16(tempPos,true);
            tempPos += 2;
            let speaker_pos = dataView.getUint32(tempPos,true);
            tempPos += 4;
            let wave_format2 = dataView.getUint16(tempPos,true);
            wave_format = this.getWaveFormat(dataView.getUint16(tempPos,true));
        }
        info.format = wave_format;
        info.channel = channel;
        info.sampling_rate = sampling_rate;
        info.bit_depth = bit_depth;
        info.duration = wavByte/transfer_rate;
        info.bitrate = transfer_rate*8/1000;
        return info;
    }

    getWaveFormat(uint16){
        let wave_format = 'PCM';
        switch(uint16){
            case 0x0001:
                wave_format = 'PCM';
                break;
            case 0x0002:
                wave_format = 'Microsoft ADPCM';
                break;
            case 0x0003:
                wave_format = 'IEEE float';
                break;
            case 0x0006:
                wave_format = 'ITU G.711 a-law';
                break;
            case 0x0007:
                wave_format = 'ITU G.711 μ-law';
                break;
            case 0x0031:
                wave_format = 'GSM 6.10';
                break;
            case 0x0040:
                wave_format = 'ITU G.721 ADPCM';
                break;
            case 0xFFFE:
                wave_format = 'children';
                break;
        }
        return wave_format;
    }

}

export default WAVAnalysis;