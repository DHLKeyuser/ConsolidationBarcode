(function() {
 // Try to find the hidden consolidation-input and show popup
 function tryInit() {
   const inp = document.querySelector('input[name="SendungNrDfue"]');
   if (!inp) return false;
   const num = inp.value.trim();
   if (!/^1\d{7}$/.test(num)) return false;
   showPopup(num);
   return true;
 }

 // Build & inject the popup
 function showPopup(number) {
   if (document.getElementById('barcode-popup')) return;
   const overlay = document.createElement('div');
   overlay.id = 'barcode-popup';
   overlay.innerHTML = `
     <div class="popup-content">
       <button class="close-btn" aria-label="Close">&times;</button>
       <h2>Print Consolidation Barcode</h2>
       <p class="number">${number}</p>
       <svg id="barcode-svg"></svg>
	   <br>
       <button id="print-btn" class="btn btn-primary">
         <span class="material-icons"></span>
         Print
       </button>
     </div>`;
   document.body.appendChild(overlay);

   // Close handler
   overlay.querySelector('.close-btn')
          .addEventListener('click', () => overlay.remove());

   // Print handler → dedicated print window
   overlay.querySelector('#print-btn')
          .addEventListener('click', () => printBarcode(number));

   // Generate barcode SVG (requires jsbarcode.all.min.js)
   if (typeof JsBarcode === 'function') {
     JsBarcode('#barcode-svg', number, {
       format: 'CODE128',
       width: 2,
       height: 80,
       displayValue: false
     });
   } else {
     console.error('JsBarcode not loaded');
   }
 }

 // Opens a new window that clones your site’s CSS and prints only the barcode+number
 function printBarcode(number) {
   const svgEl = document.querySelector('#barcode-svg');
   if (!svgEl) return;
   const svgHTML = svgEl.outerHTML;

   // Gather all <link rel="stylesheet"> from the main page
   const cssLinks = Array.from(
     document.querySelectorAll('link[rel="stylesheet"]')
   ).map(link => `<link rel="stylesheet" href="${link.href}">`).join('\n');

   // Create print window
   const printWin = window.open('', 'PRINT', 'width=400,height=600');
   printWin.document.write(`
     <html>
       <head>
         <title>Print Consolidation Barcode</title>
         ${cssLinks}
         <style>
           body {
             display: flex;
             justify-content: center;
             align-items: center;
             height: 100vh;
             margin: 0;
           }
           .print-barcode {
             text-align: center;
           }
           .print-barcode svg {
             margin-bottom: 12px;
           }
           .print-barcode .number {
             font-weight: bold;
             font-size: 1.2rem;
           }
         </style>
       </head>
       <body>
         <div class="print-barcode">
           ${svgHTML}
           <div class="number">${number}</div>
         </div>
       </body>
     </html>
   `);
   printWin.document.close();
   printWin.focus();
   printWin.print();
   printWin.close();
 }

 // Initial attempt + MutationObserver fallback
 if (!tryInit()) {
   const obs = new MutationObserver((_, obsr) => {
     if (tryInit()) obsr.disconnect();
   });
   obs.observe(document.body, { childList: true, subtree: true });
 }
})();