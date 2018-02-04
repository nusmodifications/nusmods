const bowser = require('bowser');

if (
  bowser.check(
    {
      edge: '14',
      chrome: '56',
      firefox: '52',
      safari: '9',
    },
    true,
  )
) {
  const template = `
    <div class="overlay">
      <div class="browser-warning-modal">
        <h1>Your browser is outdated or unsupported</h1>
        <p>NUSMods may not work or work poorly. Please consider upgrading.</p>
        <button class="btn btn-primary" id="browser-warning-ignore">Continue</button>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = template;
  document.body.appendChild(container);

  container.getElementById('browser-warning-ignore').addEventListener('click', (evt) => {
    evt.preventDefault();
    document.body.removeChild(container);
  });
}
