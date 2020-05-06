class PNGAnalysis{
    constructor(){

    }

    getInfo(dataView){
        let tempPos = 16;
        return {
            width:dataView.getUint32(tempPos),
            height:dataView.getUint32(tempPos+4)
        }
    }


}

export default PNGAnalysis;