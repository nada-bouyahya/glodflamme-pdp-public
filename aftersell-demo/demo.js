const raw = sessionStorage.getItem('glodflamme_preview_offer');
const choice = raw ? JSON.parse(raw) : null;

document.getElementById('primary-choice').textContent = choice
  ? `Din hovedpakke: ${choice.name} · ${choice.quantity} ${choice.quantity === 1 ? 'lanterne' : 'lanterner'} · ${new Intl.NumberFormat('da-DK').format(choice.price)} kr.`
  : 'Din hovedpakke er ikke valgt i denne fane.';

document.getElementById('addOffer').addEventListener('click', () => {
  document.getElementById('result').textContent = 'Demo: De 2 ekstra lanterner er vist som tilvalg. Ingen ordre blev oprettet.';
});
