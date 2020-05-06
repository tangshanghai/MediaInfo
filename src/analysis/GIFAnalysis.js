class GIFAnalysis{
    constructor(){

    }

    getInfo(dataView){
        let tempPos = 6;
        return {
            width:dataView.getUint16(tempPos,true),
            height:dataView.getUint16(tempPos+2,true)
        }
    }


}

export default GIFAnalysis;