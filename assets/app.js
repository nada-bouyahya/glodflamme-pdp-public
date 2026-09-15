const $ = id => document.getElementById(id);
const kr = value => new Intl.NumberFormat('da-DK', {maximumFractionDigits: value % 1 ? 2 : 0}).format(value) + ' kr.';
const imgPath = name => '../assets/generated/' + name;
let view;
let selectedOffer;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function selectedChoice() {
  return view.offers.find(item => item.offer_id === selectedOffer);
}

function renderOffers() {
  const host = $('offers');
  host.replaceChildren();
  view.offers.forEach(choice => {
    const label = node('label', 'offer-card');
    const input = node('input');
    input.type = 'radio'; input.name = 'bundle'; input.value = choice.offer_id;
    input.checked = choice.offer_id === selectedOffer;
    input.addEventListener('change', () => {selectedOffer = choice.offer_id; updateSelection();});
    label.append(input);
    if (choice.offer_id === view.recommended_offer_id) label.append(node('span', 'offer-badge', 'ANBEFALET'));
    const top = node('div', 'offer-top');
    top.append(node('span', 'offer-title', choice.name), node('span', 'offer-price', kr(choice.price)));
    label.append(top);
    label.append(node('div', 'offer-sub', `${choice.total_quantity} ${choice.total_quantity === 1 ? 'lanterne' : 'lanterner'} i alt · ${choice.paid_quantity} betalt + ${choice.gift_quantity} gratis`));
    const value = node('div', 'offer-value');
    value.append(node('span', 'normal-price', `Normalværdi ${kr(choice.comparison_value)}`));
    value.append(node('span', 'savings', `Spar ${kr(choice.savings_amount)} · ${new Intl.NumberFormat('da-DK', {maximumFractionDigits: 2}).format(choice.savings_percent)} %`));
    value.append(node('span', '', `${kr(choice.unit_price)} pr. lanterne`));
    label.append(value);
    host.append(label);
  });
}

function updateSelection() {
  const choice = selectedChoice();
  renderOffers();
  $('selection-summary').replaceChildren(node('strong', '', `${choice.total_quantity} ${choice.total_quantity === 1 ? 'lanterne' : 'lanterner'} · ${kr(choice.price)}`));
  $('hero-cta').textContent = `Tilføj ${choice.total_quantity} ${choice.total_quantity === 1 ? 'lanterne' : 'lanterner'} til kurven · ${kr(choice.price)}`;
  $('final-cta').textContent = $('hero-cta').textContent;
  const summary = $('final-summary');
  summary.replaceChildren(node('strong', '', choice.name), node('span', '', `${choice.total_quantity} lanterner i alt`), node('span', 'normal-price', `Normalværdi ${kr(choice.comparison_value)}`), node('span', 'price', kr(choice.price)), node('span', 'savings', `Du sparer ${kr(choice.savings_amount)} · ${new Intl.NumberFormat('da-DK', {maximumFractionDigits: 2}).format(choice.savings_percent)} %`));
  const finalVisual = document.querySelector('.final-visual');
  if (choice.total_quantity === 5) {
    const grid = node('div', 'five-grid');
    for (let i = 0; i < 5; i++) {
      const img = node('img'); img.src = imgPath('G1-v2.png'); img.alt = `Glødflamme-lanterne ${i + 1} af 5`; grid.append(img);
    }
    finalVisual.replaceChildren(grid);
  } else {
    const img = node('img'); img.src = imgPath(choice.total_quantity === 3 ? 'G2-v2.png' : 'G1-v2.png');
    img.alt = choice.total_quantity === 3 ? 'Tre Glødflamme-lanterner i pakken' : 'Én Glødflamme-lanterne';
    finalVisual.replaceChildren(img);
  }
}

function openAftersell() {
  const choice = selectedChoice();
  sessionStorage.setItem('glodflamme_preview_offer', JSON.stringify({offer_id: choice.offer_id, name: choice.name, quantity: choice.total_quantity, price: choice.price}));
  location.href = `aftersell-demo/index.html?from=hero&offer=${encodeURIComponent(choice.offer_id)}`;
}

function renderGallery() {
  const gallery = view.gallery;
  if (!gallery?.length) return;
  const controls = $('gallery-controls');
  let activeIndex = 0;
  function showImage(index) {
    activeIndex = (index + gallery.length) % gallery.length;
    const image = gallery[activeIndex];
    $('hero-image').src = '../' + image.path;
    $('hero-image').alt = image.alt_text;
    $('image-counter').textContent = `${activeIndex + 1} / ${gallery.length}`;
    [...controls.children].forEach((item, i) => item.setAttribute('aria-current', String(i === activeIndex)));
  }
  controls.replaceChildren();
  gallery.forEach(({path}, index) => {
    const button = node('button', 'gallery-thumb');
    button.type = 'button';
    button.setAttribute('aria-label', `Vis produktbillede ${index + 1}`);
    const thumb = node('img'); thumb.src = '../' + path; thumb.alt = ''; button.append(thumb);
    button.addEventListener('click', () => showImage(index));
    controls.append(button);
  });
  for (const [direction, step] of [['previous', -1], ['next', 1]]) {
    const button = $('gallery-' + direction);
    button.hidden = gallery.length < 2;
    button.onclick = () => showImage(activeIndex + step);
  }
  document.querySelector('.hero-gallery').onkeydown = event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showImage(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1));
  };
  showImage(0);
}

function renderStatic() {
  const copy = view.copy;
  $('promotion').textContent = copy.promotion.headline + ' · ' + copy.promotion.message;
  $('hero-title').textContent = copy.hero.headline;
  $('hero-description').textContent = copy.hero.message;
  copy.hero.benefits.forEach(text => $('hero-benefits').append(node('li', '', text)));
  $('how-title').textContent = copy.how_it_works.headline;
  $('how-message').textContent = copy.how_it_works.message;
  copy.how_it_works.steps.forEach(text => $('how-steps').append(node('li', '', text)));
  $('benefits-title').textContent = copy.benefits.headline;
  $('benefits-message').textContent = copy.benefits.message;
  ['BEN_1-rain-v3.png', 'BEN_2-placement-v3.png', 'BEN_3-easy-glow-v3.png'].forEach((name, i) => {
    const item = copy.benefits.items[i]; const card = node('article', 'benefit-card');
    const img = node('img'); img.src = imgPath(name); img.alt = item.title; img.loading = 'lazy';
    const content = node('div', 'benefit-card-content'); content.append(node('h3', '', item.title), node('p', '', item.body));
    card.append(img, content); $('benefit-grid').append(card);
  });
  $('details-title').textContent = copy.product_details.headline;
  $('details-message').textContent = copy.product_details.message;
  copy.product_details.specifications.filter(([label]) => label !== 'Beskyttelse').forEach(([label, value]) => {
    const row = node('div'); row.append(node('dt', '', label), node('dd', '', value)); $('specs').append(row);
  });
  // The comparison section is optional in customized PDP layouts.
  if ($('comparison-title')) $('comparison-title').textContent = copy.comparison.headline;
  if ($('comparison-message')) $('comparison-message').textContent = copy.comparison.message;
  $('faq-title').textContent = copy.faq.headline;
  copy.faq.items.filter(item => !item.answer.includes('Kilden') && !item.answer.includes('leverandørbekræftes')).forEach(item => {
    const details = node('details', 'faq'); details.append(node('summary', '', item.question), node('p', '', item.answer)); $('faq-list').append(details);
  });
  $('final-title').textContent = copy.final_offer.headline;
  $('final-message').textContent = copy.final_offer.message;
  renderGallery();
  $('hero-cta').addEventListener('click', openAftersell);
  $('final-cta').addEventListener('click', openAftersell);
}

// Play only while the video is on screen, and pause in a hidden browser tab.
const productVideo = document.querySelector('.product-video');
if (productVideo) {
  let videoInView = false;
  productVideo.muted = true;
  const syncVideoPlayback = () => {
    if (videoInView && !document.hidden) {
      // Native controls remain available if the browser blocks autoplay.
      productVideo.play().catch(() => {});
    } else {
      productVideo.pause();
    }
  };
  const videoObserver = new IntersectionObserver(([entry]) => {
    videoInView = entry.isIntersecting && entry.intersectionRatio > 0;
    syncVideoPlayback();
  }, {threshold: [0, 0.01]});
  videoObserver.observe(productVideo);
  document.addEventListener('visibilitychange', syncVideoPlayback);
}

fetch('pdp-data.json').then(response => {
  if (!response.ok) throw new Error('PDP-data kunne ikke indlæses');
  return response.json();
}).then(data => {
  view = data; selectedOffer = data.recommended_offer_id;
  renderStatic(); updateSelection();
}).catch(error => { $('hero-title').textContent = error.message; });
