let lastScroll = 0;
const bar = document.querySelector('.search-container')!;
console.log(bar);

globalThis.addEventListener('scroll', () => {
  const currentScroll = globalThis.pageYOffset;

  if (currentScroll > lastScroll && currentScroll) {
    bar.classList.add('hide');
  } else {
    bar.classList.remove('hide');
  }

  lastScroll = currentScroll;
});