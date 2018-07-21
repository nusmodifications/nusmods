// Code taken from https://developers.google.com/web/tools/workbox/guides/advanced-recipes
self.addEventListener('message', (event) => {
  if (!event.data) {
    return;
  }

  switch (event.data) {
    // When the user clicks on the update button, we skipWaiting and refresh the
    // page
    case 'skipWaiting':
      self.skipWaiting();
      break;
    default:
      // NOOP
      break;
  }
});
