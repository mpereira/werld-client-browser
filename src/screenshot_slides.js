$(function() {
  $('#screenshots').crossSlide({
    sleep: 5,
    fade: 1
  }, [
    { src: 'images/werld_login_screen.png', alt: 'Werld login screen' },
    { src: 'images/werld_game_screen0.png', alt: 'Werld game screen #0' },
    { src: 'images/werld_game_screen1.png', alt: 'Werld game screen #1' }
  ]);
});
