class BMPAnalysis{
    constructor(){

    }

    getInfo(dataView){
        let tempPos = 18;
        return {
            width:dataView.getUint32(tempPos,true),
            height:dataView.getUint32(tempPos+4,true)
        }
    }


}

export default BMPAnalysis;