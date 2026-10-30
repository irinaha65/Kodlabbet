$(".dialog").dialog({ autoOpen: false, width: '600px' });

function change_fontsize(i)
{
  var fontSize = parseInt($(".CodeMirror").css("font-size"));
  fontSize = fontSize + i + "px";
  $('.CodeMirror').css({"font-size": fontSize});
  editor.refresh();
}

function expand_panel()
{
  if ($('#controlpanel').css("display") == "none")
  {
    $('#arrow').html("&uarr;");
    $('#controlpanel').slideDown();
  }
  else 
  {
    $('#arrow').html("&darr;");
    $('#controlpanel').slideUp();
  }
}

$('#savemessage').fadeTo(0, 0);

function post_code()
{
  if (warning)
  {
    $('#save').html('Jobbar...');
    $('#save').attr('disabled','disabled');
    console.log('saving code');
    code = {code: editor.getValue()};
    
    $.ajax({url: "",
          type: "POST", 
          data: code,
          success: function () 
          { 
            $('#save').removeAttr('disabled');
            $('#save').html('Spara koden');
    
            var currentTime = new Date();
            var hours = currentTime.getHours();
            var minutes = ('0' + currentTime.getMinutes()).slice(-2);
            var seconds = ('0' + currentTime.getSeconds()).slice(-2);
            
            $('#savemessage').html('Sparat ' + hours + ":" + minutes + ":" + seconds);
            $('#savemessage').fadeTo("slow", 1).animate({opacity: 1.0}, 3000).fadeTo("slow", 0);
            warning = false;
          },
          error: function (jqXHR, textStatus, errorThrown) 
          { 
            $('#savemessage').html('Misslyckades med att spara!');
            $('#savemessage').fadeTo("slow", 1).animate({opacity: 1.0}, 3000).fadeTo("slow", 0);
            $('#save').removeAttr('disabled');
            $('#save').html('Spara koden');
          } });
  }
}


function postMetadata()
{
  $('#updateMetadata').html('Jobbar...');
  $('#updateMetadata').attr('disabled','disabled');
  metadata = { description: $('#description').val(),
               title: $('#title').val(),
               author: $('#author').val(),
               publicOrNot: $('#publicOrNot').is(':checked') ? "CHECKED" : ""
             };

  $.ajax({url: "",
        type: "POST", 
        data: metadata,
        success: function () 
        { 
          $('#updateMetadata').removeAttr('disabled');
          $('#updateMetadata').html('Uppdatera informationen');

          var currentTime = new Date();
          var hours = currentTime.getHours();
          var minutes = ('0' + currentTime.getMinutes()).slice(-2);
          var seconds = ('0' + currentTime.getSeconds()).slice(-2);
          
          $('#savemessage').html('Sparat ' + hours + ":" + minutes + ":" + seconds);
          $('#savemessage').fadeTo("slow", 1).animate({opacity: 1.0}, 3000).fadeTo("slow", 0);
        },
        error: function (jqXHR, textStatus, errorThrown) 
        { 
          $('#savemessage').html('Misslyckades!');
          $('#savemessage').fadeTo("slow", 1).animate({opacity: 1.0}, 3000).fadeTo("slow", 0);
          $('#updateMetadata').removeAttr('disabled');
          $('#updateMetadata').html('Uppdatera informationen');
        } });
}

textarea = document.getElementById('code');

var delay;

var editor = CodeMirror.fromTextArea(document.getElementById('code'), 
  {
    mode: 'text/html',
    lineNumbers: true,
    tabMode: 'spaces',
    saveFunction: function(){console.log("hej");},
    matchBrackets: true,
    extraKeys: {
        "F11": function(cm) {
          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Ctrl-S": function(cm) {
	  post_code();
        },
        "Ctrl-R": function(cm) {
	  updatePreview();
        },
        "Esc": function(cm) {
          if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        }
    }
  });

editor.on("change", function() 
{
  warning = true;
  clearTimeout(delay);
  if ($('#autosave').is(':checked'))
    delay = setTimeout(post_code, 3000);
});

function toggle_fullscreen()
{
  editor.setOption("fullScreen", !editor.getOption("fullScreen"));
}

function updatePreview() 
{
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  var isSafari = (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);

  if (!isMobile && !isSafari)
  {
    previewFrame = document.getElementById('preview');
    previewFrame.parentNode.removeChild(previewFrame);
    var newFrame = document.createElement("iframe");
    newFrame.id = "preview";
    var container = document.getElementById("iframecontainer");
    container.appendChild(newFrame);
  }

  previewFrame = document.getElementById('preview');

  var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;

  if (typeof(previewFrame.contentWindow.stopUpdate) != "undefined")
    previewFrame.contentWindow.stopUpdate();

  preview.open();
  preview.write(editor.getValue());
  preview.close();

  //post_code();

  previewFrame.focus();
}

var warning = false;

window.onbeforeunload = function() 
{ 
  if (warning) 
    return "Du har gjort osparade ändringar. Vill du verkligen sticka härifrån?";
}
