var $ = require('jquery');

$(function () {
  function createRipple(x, y) {
    var $ripple = $('<span class="ripple"></span>');
    $('body').append($ripple);

    $ripple
      .css({
        top: y - 32 + 'px',
        left: x - 32 + 'px',
      })
      .addClass('rippling')
      .one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
        $(this).remove();
      })
  }

  $(document).click(function(e) {
    createRipple(e.clientX, e.clientY);
  });
});
