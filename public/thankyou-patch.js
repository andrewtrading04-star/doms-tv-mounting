// Dom's TV Mounting — thank-you page display patches
// Add to page <head>: <script src="https://doms-tv-mounting.vercel.app/thankyou-patch.js"></script>
document.addEventListener('DOMContentLoaded', function() {
  // "Estimated total" → "Total"
  var lbl = document.querySelector('#doms-ty .total .lbl');
  if (lbl) lbl.textContent = 'Total';

  // Rename lifting line items to "Second Technician"
  document.querySelectorAll('#doms-ty .item span:first-child').forEach(function(el) {
    var t = el.textContent || '';
    if (t.indexOf('My TV is 70') === 0 || t === 'My TV is 85 inches or larger') {
      el.textContent = 'Second Technician';
    }
  });
});
