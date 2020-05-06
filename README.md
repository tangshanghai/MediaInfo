# colorPickerTSH
简易取色组件

用法
```
<input type="text" value="#00ff00" id="inputText"/>
<script>
    var colorpicker = new ColorPickerTSH("#inputText",onChange);
    function onChange(color){
        console.log(color);
        //colorpicker.setColor(color.hex,color.alpha)
    }
    colorpicker.setColor("#00ff00",0.1);
</script>
```# MediaInfo
