let content;

$(function() {
  $('#upfile').on('change', function() {
    console.log(this);
    let reader = new FileReader();
    console.log(this.files[0]);
    let file = this.files[0];
    console.log(file);

    imgToBase64(this);
  });




// }); //function sendFileToServer()


  function imgToBase64(element) {
    let reader = new FileReader(); //encode
    let file = element.files[0];
    reader.onloadend = function() {
      content = reader.result.split(',')[1];
      // ajaxRequest();  //複数のデータを配列に入れる。
    };
    reader.readAsDataURL(file);
  }

  function ajaxRequest() {
        // APIキーを入れて下さい↓
    let key = gcpKey;
    let url = 'https://vision.googleapis.com/v1/images:annotate?key=';
    let request = {
      requests:[
        {
          image:{
            "content": content,
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
        let textData = data.responses[0].fullTextAnnotation.text;
        let lc = $('#result');
        let textTag = $('<li>').addClass('text-tag p-4 bg-secondary rounded text-light border border-info tagline tagline');
          textTag.text(textData);
        lc.append(textTag);


      } else {
        console.log('画像データが読み込めませんでした');
      };
    })
    .fail(function(error) {
      console.log(error);
    });


  }; //ajaxRequest()の閉じタグ


  // LETTER FX
    $('.tagline').letterfx({
      "fx":"fall",
      "words":true,
      "timing":200
    });





});//jQueryのおまじない閉じタグ