class JPGAnalysis{
    constructor(){

    }

    getInfo(dataView){
        const info = {};
        let tempPos = 2;
        const clips = [];
        function getClip(pos){
            let clipMark = dataView.getUint8(pos).toString(16);
            let clipType = dataView.getUint8(pos+1).toString(16);
            let boxLen = dataView.getUint16(pos+2);
            boxLen += 2;
            clips.push({
                mark:dataView.getUint8(pos),//clipMark,
                type:dataView.getUint8(pos+1),//clipType,
                mark_string:clipMark,
                type_string:clipType,
                startPos:pos,
                endPos:pos+boxLen
            });
            if(pos+boxLen< dataView.byteLength){
                getClip(pos+boxLen);
            }
        }
        getClip(tempPos);
        for(let i=0;i<clips.length;i++){
            let item = clips[i];
            if(item.mark == 0xFF && (item.type == 0xC0 || item.type == 0xC2)){
                let tempPos = item.startPos+5;
                info.height = dataView.getUint16(tempPos);
                info.width = dataView.getUint16(tempPos+2);
            }
        }
        // console.log(clips)
        return info;
    }


}

export default JPGAnalysis;