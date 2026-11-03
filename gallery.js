'use strict';

const entries = [...document.querySelectorAll('[data-gallery]')];
const titles = ['业务平台与 Bot 集成', '设备对象选择', '结构化查询结果', '多轮信息补全'];
const viewer = document.querySelector('#viewer');
const image = document.querySelector('#viewer-image');
const title = document.querySelector('#viewer-title');
const count = document.querySelector('#viewer-count');
const original = document.querySelector('#original-image');
let current = 0;
let opener = null;

function display(index) {
  current = (index + entries.length) % entries.length;
  const entry = entries[current];
  image.src = entry.href;
  image.alt = entry.querySelector('img').alt;
  title.textContent = titles[current];
  count.textContent = (current + 1) + ' / ' + entries.length;
  original.href = entry.href;
}

entries.forEach((entry, index) => {
  entry.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof viewer.showModal !== 'function') return;
    event.preventDefault();
    opener = entry;
    display(index);
    viewer.showModal();
    document.body.classList.add('viewer-open');
  });
});
document.querySelector('#close-viewer').addEventListener('click', () => viewer.close());
document.querySelector('#previous-image').addEventListener('click', () => display(current - 1));
document.querySelector('#next-image').addEventListener('click', () => display(current + 1));
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    display(current + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
viewer.addEventListener('close', () => {
  document.body.classList.remove('viewer-open');
  opener?.focus();
});
viewer.addEventListener('click', event => {
  if (event.target !== viewer) return;
  const rect = viewer.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
});
