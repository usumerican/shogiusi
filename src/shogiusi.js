/* eslint-env browser */
/* global __APP_VERSION__, YaneuraOu_sse42, YaneuraOu_nosimd */

import { simd } from 'wasm-feature-detect';

addEventListener('DOMContentLoaded', async () => {
  onunhandledrejection = (ev) => alert(ev.reason?.message || JSON.stringify(ev.reason));

  visualViewport.onresize = () => {
    document.documentElement.style.height = visualViewport.height + 'px';
  };

  visualViewport.onscroll = () => {
    document.documentElement.scrollTop = 0;
  };

  const usiOutput = document.querySelector('.UsiOutput');
  const usiInput = document.querySelector('.UsiInput');
  const usiSelect = document.querySelector('.UsiSelect');
  const options = {
    Threads: 1,
    USI_Hash: 16,
    NetworkDelay: 0,
    NetworkDelay2: 0,
    MinimumThinkingTime: 1000,
    PvInterval: 0,
    ConsiderationMode: true,
    FV_SCALE: 24,
  };
  const simdValue = await simd();
  let engine;

  document.querySelector('.TitleOutput').textContent = `${document.title} ${__APP_VERSION__}`;
  print(`# crossOriginIsolated: ${window.crossOriginIsolated}`);
  print(`# simd: ${simdValue}`);

  document.querySelector('.InfoButton').onclick = async () => {
    open('https://github.com/usumerican/shogiusi', '_blank', 'noreferrer');
  };

  document.querySelector('.ReloadButton').onclick = async () => {
    location.reload();
  };

  usiSelect.onchange = async () => {
    usiInput.value = usiSelect.value;
    usiSelect.value = '';
  };

  document.querySelector('.UsiForm').onsubmit = async (ev) => {
    ev.preventDefault();
    await postCommand(usiInput.value);
    usiInput.value = '';
  };

  async function postCommand(command) {
    print('$ ' + command);
    (await getEngine()).postMessage(command);
  }

  function print(line) {
    usiOutput.textContent += line + '\n';
    usiOutput.scrollTo({ top: usiOutput.scrollHeight, behavior: 'smooth' });
  }

  async function getEngine() {
    if (!engine) {
      engine = await (simdValue ? YaneuraOu_sse42 : YaneuraOu_nosimd)();
      engine.addMessageListener((line) => {
        print(line);
      });
      for (const name in options) {
        engine.postMessage('setoption name ' + name + ' value ' + options[name]);
      }
    }
    return engine;
  }
});
