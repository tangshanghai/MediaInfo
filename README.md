# MediaInfo
媒体分析JS版

导入方式
```
    <script src="MediaInfo.js"></script>  || import MediaInfo from 'MeidaInfo.js'
```

用法
```
<input type="file" id="testInput" accept="*.png,*.jpg,*.gif,*.bmp,*.mp3,*.wav,*.m4a,*.mp4"/>

<script>
    let mediaInfo = new MediaInfo();
    let inputfile = document.getElementById('testInput');
    inputfile.addEventListener('change',selectSourceBack);

    /** 文件选择完成返回 */
    function selectSourceBack (event) {
        let files = event.target.files;
        let file = files[0];
        console.log(file)

        inputfile.value = '';

        let reader = new FileReader();
        reader.onload = function(result) {
            let info = mediaInfo.getInfo(reader.result);
            console.log('fileInfo',info);
            
        }
        reader.readAsArrayBuffer(file);
    }
</script>
```
