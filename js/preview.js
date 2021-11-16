import { wrap, proxy } from 'comlink';

window.addEventListener('DOMContentLoaded', async () => {
  const preview = document.querySelector('.preview');

  const worker = new SharedWorker('/js/worker.js', {
    type: 'module',
  });
  const compiler = wrap(worker.port);

  compiler.subscribe(
    proxy((data) => {
      preview.innerHTML = data.compiled;
    }),
  );
});