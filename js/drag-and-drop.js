//GLOBAL 変数---------------
var URL_BLANK_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/SMPTE_Color_Bars.svg/1200px-SMPTE_Color_Bars.svg.png'; //画像じゃないものがドロップされたときに表示される画像
let elDrop = document.getElementById('dropzone');
let elFiles = document.getElementById('field'); //画像のキャプチャを入れるlocation

// データを読み取る準備
let reader = new FileReader();

//添付した画像を表示するための画像データ
let dataUrl;

// ajaxで送る画像データ
let imgFileToSend;


//-------------------------


// ファイルが選択されたときの処理
let attach = document.getElementById('attach');
attach.addEventListener('change', function(e) {
    let files = e.target.files;
    let file = aryFile(files);
    renderFile(file);
}, false);

//ドロップゾーンにマウスがドラッグオーバーされたら、ブラウザのディフォルト動作を防いで、受け入れる側なのでdropEffectをコピーに設定しておく。
elDrop.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy'; //受け入れる側の設定dropEffect
    elDrop.classList.add('dropover'); //dragoverされているにstyleを変更
}, false);

elDrop.addEventListener('dragleave', function(e) {
    e.preventDefault();
    elDrop.classList.remove('dropover'); //dragleaveしたら、styleを元に戻す
}, false);


//ドラッグ要素がドロップされた時の処理
elDrop.addEventListener('drop', function(e) {
    e.preventDefault();
    elDrop.classList.remove('dropover');

    let files = e.dataTransfer.files;//dataTransfer.filesは転送中のファイルの一覧を配列で返す。これを変数に入れる。
        console.log(files);
    elFiles.innerHTML = "";

    let file = aryFile(files);
    renderFile(file);
}, false);


let sendFile = document.getElementById('sendFile');
sendFile.addEventListener('click', function() {
    ajaxRequest(imgFileToSend);
});



//------------関数--------------
//読み取った配列ファイルを一つずつ取り出す関数
function aryFile(files) {
    for (let i = 0, l = files.length; i < l; i++) {
        let file = files[i];
        let li = document.createElement('li');
        li.className = "row text-center";
        let text = file.name + "(" + file.type + "," + file.size + "bytes)";
        document.createTextNode(text);//textをノードに入れる
        li.append(text);//用意したliタグにtextを入れる。
        elFiles.appendChild(li);//キャプチャを入れるタグにこのタグを入れる
        document.getElementById('drag-drop-info').innerText = text +'がファイルが選択されました。';

        console.log(file.type);
        //ファイルがimage/から始まるものであれば画像ファイルと判断できる。画像ファイルであればonloadが終わると同時にdataUrlをimgタグに入れて表示。
        return file; //次の関数に渡すための変数
        }
}




//------------関数--------------
//画像ファイルか否かを判断する関数
function renderFile(file) {
    if (file.type.indexOf('image/' === 0)) { //画像なら下にキャプチャを表示
        reader.readAsDataURL(file);
        reader.onload = function() {
        dataUrl = reader.result;

        //画像データを表示する箱を見えるようにして、データを表示する
        document.getElementById('dataUrl').style.visibility = "visibile";
        document.getElementById('dataUrl').value = dataUrl;

        //画像のタイトルとキャプチャを表示する
        let elLi = document.createElement('li');
        elLi.className = 'row text-center';
        elLi.innerHTML = '<img src="' + dataUrl + '"width=100% height="auto" alt="添付した画像" />';
        elFiles.appendChild(elLi);
        //ちゃんと画像が追加されたら確認ボタンを表示する
        document.getElementById('cfm-btn').style.visibility = "visible";

        // document.getElementById('modal').modal('hide');



        //画像ファイルをGoogle Cloud Vision が読み取れるように必要な部分だけ’,’の前を切り離す。
        imgToBase64(dataUrl);

        }
    } else {  //画像ファイルでなければ用意していた画像を表示
        let elImage = document.createElement('img');
        elImage.src = URL_BLANK_IMAGE;
        elFiles.appendChild(elImage);
    }
}


//画像が選択されたら文字を消す関数
// function letItHidden() {
//     document.getElementsByClassName('text-handler').style.visibility = 'hidden';
// }

//------------関数--------------
function imgToBase64(dataUrl){
    imgFileToSend = dataUrl.split(',')[1];
    console.log(imgFileToSend)
}




$(function() {
//dataUrlがクリックされたら見せる処理
    $('#show-data').on('click', function() {
        $('#dataUrl').toggle(800);

    });
}); //jQuery

//------------関数--------------
// ajax
function ajaxRequest(imgFileToSend)  {
        // APIキーを入れて下さい↓
    let key = gcpKey;
    let url = 'https://vision.googleapis.com/v1/images:annotate?key=';
    let request = {
      requests:[
        {
          image:{
            "content": imgFileToSend,
          },
          features:[
            {
              type:"TEXT_DETECTION", //どの対象を検出するか確認する。
              maxResults:10
            }
          ]
        }
      ]
    };

        $.ajax({
      url: url + key,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(request),
    })
    .done(function(data) {
      console.log(data);
      if (data.responses[0].fullTextAnnotation !== null){
        console.log('working');
        $('#js-card').show();
        let textData = data.responses[0].fullTextAnnotation.text;
        let lc = $('.card-body');
        let textTag = $('<p>').addClass('card-text');
          textTag.text(textData);
        lc.append(textTag);

        $('#result').html('<img src' + dataUrl + '/100px180/?text=Image cap class="card-img-top" />');
        console.log('done');



      } else {
        console.log('画像データが読み込めませんでした');
      };
    })
    .fail(function(error) {
      console.log(error);
    });
}; //ajaxRequest

