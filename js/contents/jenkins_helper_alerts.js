(function ($) {
  $.jenkinsHelperAlerts = {
    alert: function (title, message, positiveButtonText, negativeButtonText, callback) {
      if (title == null) title = 'Alert';
      $.jenkinsHelperAlerts._show(title, message, null, positiveButtonText, negativeButtonText, 'alert', function (result) {
        if (callback) callback(result);
      });
    },

    confirm: function (title, message, positiveButtonText, negativeButtonText, callback) {
      if (title == null) title = 'Confirm';
      $.jenkinsHelperAlerts._show(title, message, null, positiveButtonText, negativeButtonText, 'confirm', function (result) {
        if (callback) callback(result);
      });
    },

    _show: function (title, msg, value, positiveButtonText, negativeButtonText, type, callback) {
      var _html = "";

      _html += '<div id="jenkins-helper-dialog-box"></div>' +
        '<div id="jenkins-helper-dialog-content">' +
        '<div id="jenkins-helper-dialog-head">' +
        '<span id="jenkins-helper-dialog-small-logo"></span>' +
        '<span id="jenkins-helper-dialog-title">' + title + '</span>' +
        '</div>';

      _html += '<div id="jenkins-helper-dialog-msg">' + msg + '</div><div id="jenkins-helper-dialog-btnbox">';
      if (type === "alert") {
        _html += '<input id="jenkins-helper-dialog-btnok" type="button" value="' + positiveButtonText + '" />';
      }
      if (type === "confirm") {
        _html += '<input id="jenkins-helper-dialog-btnno" type="button" value="' + negativeButtonText + '" />';
        _html += '<input id="jenkins-helper-dialog-btnok" type="button" value="' + positiveButtonText + '" />';
      }
      _html += '</div></div>';

      // 必须先将_html添加到body，再设置 CSS 样式
      $("body").append(_html);
      generateCSS();

      switch (type) {
        case 'alert':

          $("#jenkins-helper-dialog-btnok").click(function () {
            $.jenkinsHelperAlerts._hide();
            callback(true);
          });
          $("#jenkins-helper-dialog-btnok").focus().keypress(function (e) {
            if (e.keyCode === 13 || e.keyCode === 27) $("#jenkins-helper-dialog-btnok").trigger('click');
          });
          break;
        case 'confirm':

          $("#jenkins-helper-dialog-btnok").click(function () {
            $.jenkinsHelperAlerts._hide();
            if (callback) callback(true);
          });
          $("#jenkins-helper-dialog-btnno").click(function () {
            $.jenkinsHelperAlerts._hide();
            if (callback) callback(false);
          });
          $("#jenkins-helper-dialog-btnno").focus();
          $("#jenkins-helper-dialog-btnok, #jenkins-helper-dialog-btnno").keypress(function (e) {
            if (e.keyCode === 13) $("#jenkins-helper-dialog-btnok").trigger('click');
            if (e.keyCode === 27) $("#jenkins-helper-dialog-btnno").trigger('click');
          });
          break;
      }
    },
    _hide: function () {
      $("#jenkins-helper-dialog-box,#jenkins-helper-dialog-content").remove();
    }
  };
  // Shortuct functions
  jenkinsHelperAlert = function (title, message, positiveButtonText, negativeButtonText, callback) {
    $.jenkinsHelperAlerts.alert(title, message, positiveButtonText, negativeButtonText, callback);
  };

  jenkinsHelperConfirm = function (title, message, positiveButtonText, negativeButtonText, callback) {
    $.jenkinsHelperAlerts.confirm(title, message, positiveButtonText, negativeButtonText, callback);
  };


  //生成Css
  var generateCSS = function () {

    var _widht = document.documentElement.clientWidth; // 屏幕宽
    var _height = document.documentElement.clientHeight; // 屏幕高

    // console.log('_widht:', _widht, ", _height:", _height);

    $("#jenkins-helper-dialog-box").css({
      width: '100%',
      height: '100%',
      zIndex: '99999',
      position: 'fixed',
      filter: 'Alpha(opacity=60)',
      backgroundColor: 'black',
      top: '0',
      left: '0',
      opacity: '0.6'
    });

    $("#jenkins-helper-dialog-content").css({
      zIndex: '999999',
      maxWidth: '80%',
      maxHeight: _height * 0.8 + 'px',
      position: 'fixed',
      backgroundColor: 'White',
    });

    $("#jenkins-helper-dialog-head").css({
      display: 'inline'
    });

    $("#jenkins-helper-dialog-small-logo").css({
      backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABjwAAAY8BHi1VrgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAQwSURBVDiNdZNZTFxlFMf/d5l7Z98HyjCFYZuOxRZSsIvaBCJo6aD2wZomNHVpTB/UB6Npoj5ZH9oYn4xJjRqXByS1fagmpVptaam1tVKhC4UpMzBsAwzDbJc7l8vMvZ8PBGRie56+5Dvnl3N+5/soPDpoX1XVi0Qh++12y9ObfZV2hahMOiWkRTH7RWgqeiISiSytL6AeRmlraTlktTk+EsWMp615u3rwpT0cTREQVcGSLOOXi3+lP//2zHh8VgiEpkNTj4S9EAicbWltbZ8eH00dPvCcvcShp5RlGQApyJuZS4iH3/0ktCAu7Q4GgwIA0OsTdjY2PqXklfbLPT3K3uZtxg1WnlJzOdwZiSIryQUwQnMGb7mnliXkxJqX1YPH47EzDHs+0B5gamp8UHM5oio5nDr3B8LhCDKiVACzGjQ49t4htrrc3bzKYVYvHVZrYG8gcCA6M0fH4/O5Z7b7OKvZQGk5Dk82+sFpWNA0BYpaMaPRsKAAOBxm09//jJ1KZpKJtc6Kiou9LMOwALAkLaU9JQ4aAKrKi1eKDXbcvD0CALjWN7ginNMjkRS0rmJTBQCwq7BkPJG5M3BLNht1y8KirM3nVTDMWuP48ptOxJMZ7Kj3gdOwuNY3iOHQBFx2KxwWk6PAWd2Wmjfeen0fv9XvNeVlkcwn0/n1jo4cfB4fvt0BAHiibhOGQxNo2d2Ax/1ecCyTKoDRgOC0mdHW1IDTJz+wejY4WTwkaJYDBQqv7n8WXWcvYXI6Fh8KRoYLFsCo7HKp29W0o96nT4sSdDz3MBZ+u9KH4fAE+gfD2NWwGbfujIz+2P378QLYXCJ+L52WnN+dvlC/r72VM/D/+aJpFoKYRdfZS4hMzoKiKESmZkAIwY3+oRv3guGugjEB4OrNvqM6Pf91Lq8CoDA0Mo68okAlKhJJAQaDFtvr/SgrdeFIRwBFDpsYDE91rVNVGKn55Kc/dfdINKtBxcYN+PnX6wBRUVbqwrbaakxGY1jZNItjn3Vms/n8uTVV60FlZWU2Sm/+4e7gg/LWpl2U06KnXXYzznRfRZHThrLSItT6vJiejeOdj78S6BK/Vc4kDjg5tjMuCNLqR6eqqze9xpsdx11bdxXRvA7ZgYvZVzpejt+/clnNh0ZdvUKWtzstY+5iVyo0FK7Yo9Oa+o1OfrFyC5nr7x0P3r9dzbrdbr3RaL5ura7zWyprOSmTghSLgnb79Q8m5w3yRFR/VK/Vvann5ZNpsWJxcSL2vsXseIyjqTFlGTFJojRGCwtApU0mE8PbiiuNG31cYmoMUiYJEAKVAL0jMw4dxYjLhIAQwjfqtGmz16u7ptUufJ/Nx1KgQFQFOUm8AYCwwWBQqPJpYiN/XjDK2cX/vauunGzzWfnogLwsnl+ULTsrqmys0UTdnY7LyZkpKAtJWDi2BwD+BTdmveyki1MHAAAAAElFTkSuQmCC)',
      width: '16px',
      height: '16px',
      marginLeft: '20px',
      verticalAlign: 'middle',
      display: 'inline-block',
      backgroundSize: 'auto 100%',
    });

    $("#jenkins-helper-dialog-title").css({
      display: 'inline-block',
      fontSize: '14px',
      color: '#444',
      margin: '10px',
      fontWeight: 'bold'
    });

    $("#jenkins-helper-dialog-msg").css({
      padding: '20px 40px',
      lineHeight: '2em',
      textAlign: 'center',
      maxHeight: _height * 0.7 - 100 + 'px',
      fontSize: '14px',
      color: '#4c4c4c',
      display: 'block',
      wordBreak: 'break-all',
      wordWrap: 'break-word',
      overflowY: 'auto'
    });

    $("#jenkins-helper-dialog-icon").css({
      display: 'block',
      position: 'absolute',
      right: '10px',
      top: '9px',
      border: '1px solid Gray',
      width: '18px',
      height: '18px',
      textAlign: 'center',
      lineHeight: '16px',
      cursor: 'pointer',
      borderRadius: '12px',
      fontFamily: '微软雅黑'
    });

    $("#jenkins-helper-dialog-btnbox").css({
      height: '60px',
      lineHeight: '60px',
      margin: '0 auto',
      textAlign: 'center'
    });

    $("#jenkins-helper-dialog-btnok,#jenkins-helper-dialog-btnno").css({
      width: '80px',
      height: '30px',
      color: 'white',
      border: 'none',
      borderRadius: '4px'
    });
    $("#jenkins-helper-dialog-btnok").css({
      backgroundColor: 'cornflowerblue'
    });
    $("#jenkins-helper-dialog-btnno").css({
      backgroundColor: 'darkgray',
      marginRight: '20px'
    });


    // 右上角关闭按钮hover样式
    $("#jenkins-helper-dialog-icon").hover(function () {
      $(this).css({
        backgroundColor: 'Red',
        color: 'White'
      });
    }, function () {
      $(this).css({
        backgroundColor: '#DDD', color: 'black'
      });
    });

    var boxWidth = $("#jenkins-helper-dialog-content").width();
    var boxHeight = $("#jenkins-helper-dialog-content").height();

    // 让提示框居中
    $("#jenkins-helper-dialog-content").css({
      top: (_height - boxHeight) / 2 + 'px',
      left: (_widht - boxWidth) / 2 + 'px'
    });
  }

})(jQuery);
