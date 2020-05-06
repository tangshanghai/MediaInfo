
class Utils{
    constructor(){

    }

    RGBTOHSV(r,g,b){
        let max = Math.max(r,g,b);
        let min = Math.min(r,g,b);
        let h,s,v;
        if(r == max) h = (g-b)/(max-min);
        if(g == max) h = 2 +(b-r)/(max-min);
        if(b == max) h = 4 + (r-g)/(max-min);
        h = h * 60;
        if(h < 0) h = h + 360;
        v = ~~(max/255);
        s = (max-min)/max;
        return {h:h,s:s,v:v};
    }

    HSVTORGB(h,s,v){
        let R,G,B,i,f,p,q,t;
        if(s == 0){
            R=G=B=(v*255);
        }else{
            h /= 60;
            i = ~~h;
            f = h - i;
            if(i == 6) i = 0;
            
            p = v * (1 - s);
            q = v * (1 - s*f);
            t = v * (1 - s*(1-f));
            switch(i){
                case 0:
                    R=v;G=t;B=p;
                    break;
                case 1:
                    R=q;G=v;B=p;
                    break;
                case 2:
                    R=p;G=v;B=t;
                    break;
                case 3:
                    R=p;G=q;B=v;
                    break;
                case 4:
                    R=t;G=p;B=v;
                    break;
                case 5:
                    R=v;G=p;B=q;
                    break;
            }
            R = ~~(R*255);
            G = ~~(G*255);
            B = ~~(B*255);
        }
        
        return {r:R,g:G,b:B};
    }

    RGBTOHEX(r,g,b){
        let _r = (Array(2).join('0') + r.toString(16).toLocaleUpperCase()).slice(-2);
        let _g = (Array(2).join('0') + g.toString(16).toLocaleUpperCase()).slice(-2);
        let _b = (Array(2).join('0') + b.toString(16).toLocaleUpperCase()).slice(-2);
        return "#"+_r+_g+_b;
    }

    HEXTORGB(hex){
        let c = hex.replace("#","");
        let r = parseInt("0x"+c.substr(0,2));
        let g = parseInt("0x"+c.substr(2,2));
        let b = parseInt("0x"+c.substr(4,2));
        return {r:r,g:g,b:b};
    }

    //返回body最大的z-index
    getMaxZindex() {
        let elementObj = document.body;
        //取得容器节点下第一层所有节点
        let childNodes = elementObj.children || elementObj.childNodes;
        let zIndex = 0;
        for (let i = 0; i < childNodes.length; i++) {
            let node = childNodes[i];
            let ti1 = parseInt(this.getClass(node, "z-index"));
            let ti2 = parseInt(node.style.zIndex);
            let ti = ti2 || ti1;
            if (isNaN(ti)) continue;
            if (ti > zIndex) zIndex = ti;
        }
        zIndex += 10;
        return zIndex;
    }

    getClass(obj, name) {
        if (obj.currentStyle) {
            return obj.currentStyle[name]; //IE下获取非行间样式
        } else {
            return getComputedStyle(obj, false)[name]; //FF、Chorme下获取非行间样式
        }
    }

}

export default new Utils;