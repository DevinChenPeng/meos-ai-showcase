'use strict';

const entries = [...document.querySelectorAll('[data-gallery]')];
const titles = ['业务平台与 Bot 集成', '设备对象选择', '结构化查询结果', '多轮信息补全', '供冷系统关系图', '楼层末端设备分布', '三维机房模型', '室内照明运行看板'];
const viewer = document.querySelector('#viewer');
const image = document.querySelector('#viewer-image');
const title = document.querySelector('#viewer-title');
const count = document.querySelector('#viewer-count');
const original = document.querySelector('#original-image');
const imageStatus = document.querySelector('#image-status');
const retryImage = document.querySelector('#retry-image');
let current = 0;
let opener = null;

function display(index) {
  current = (index + entries.length) % entries.length;
  const entry = entries[current];
  imageStatus.textContent = '正在加载原图…';
  retryImage.hidden = true;
  image.setAttribute('aria-busy', 'true');
  image.src = entry.href;
  image.alt = entry.querySelector('img').alt;
  title.textContent = titles[current];
  count.textContent = (current + 1) + ' / ' + entries.length;
  original.href = entry.href;
}

image.addEventListener('load', () => {
  imageStatus.textContent = '';
  image.setAttribute('aria-busy', 'false');
});
image.addEventListener('error', () => {
  imageStatus.textContent = '图片暂时无法加载，请重试或查看原图。';
  image.setAttribute('aria-busy', 'false');
  retryImage.hidden = false;
});
retryImage.addEventListener('click', () => display(current));

entries.forEach((entry, index) => {
  entry.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof viewer.showModal !== 'function') return;
    event.preventDefault();
    opener = entry;
    display(index);
    viewer.showModal();
    original.focus({ preventScroll: true });
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
  // A hidden case panel cannot receive focus after cycling the full gallery.
  if (opener?.getClientRects().length) opener.focus({ preventScroll: true });
});

// Each tab keeps a stable footprint; changing scenarios does not move the page.
function selectCase(caseTabs, index, moveFocus = false) {
  const selected = (index + caseTabs.length) % caseTabs.length;
  caseTabs.forEach((tab, i) => {
    const active = i === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  });
  if (moveFocus) caseTabs[selected].focus({ preventScroll: true });
}
document.querySelectorAll('[role="tablist"]').forEach(tablist => {
  const caseTabs = [...tablist.querySelectorAll('[role="tab"][data-case]')];
  caseTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCase(caseTabs, index));
    tab.addEventListener('keydown', event => {
      const keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: caseTabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      selectCase(caseTabs, keys[event.key], true);
    });
  });
});
viewer.addEventListener('click', event => {
  if (event.target !== viewer) return;
  const rect = viewer.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
});
