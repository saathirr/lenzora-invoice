let itemIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadLogoAsBase64();
  document.getElementById('invoiceNo').value = 'INV-' + Date.now().toString().slice(-6);
  document.getElementById('invoiceDate').value = new Date().toISOString().slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + 30);
  document.getElementById('dueDate').value = due.toISOString().slice(0, 10);
  addItem();
});

function loadLogoAsBase64() {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = 'Lenzora logo.png';
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    localStorage.setItem('lenzoraLogo', dataUrl);
    const wm = document.getElementById('watermarkImg');
    if (wm) wm.src = dataUrl;
  };

  const card = new Image();
  card.crossOrigin = 'anonymous';
  card.src = 'Lenzora Card.png';
  card.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = card.naturalWidth;
    canvas.height = card.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(card, 0, 0);
    localStorage.setItem('lenzoraCard', canvas.toDataURL('image/png'));
  };
}

function addItem() {
  itemIndex++;
  const tbody = document.getElementById('itemsBody');
  const tr = document.createElement('tr');
  tr.id = 'item-' + itemIndex;
  tr.innerHTML = `
    <td class="col-no">${itemIndex}</td>
    <td><input type="text" placeholder="Item description" oninput="calcTotals()"></td>
    <td><input type="number" value="1" min="1" oninput="calcTotals()"></td>
    <td><input type="number" value="0" min="0" step="0.01" oninput="calcTotals()"></td>
    <td class="col-amount"><span class="item-total">0.00</span></td>
    <td><button class="btn-remove" onclick="removeItem(this)">&times;</button></td>
  `;
  tbody.appendChild(tr);
  calcTotals();
}

function removeItem(btn) {
  const row = btn.closest('tr');
  row.remove();
  renumberItems();
  calcTotals();
}

function renumberItems() {
  const rows = document.querySelectorAll('#itemsBody tr');
  rows.forEach((row, i) => {
    row.querySelector('.col-no').textContent = i + 1;
  });
}

function calcTotals() {
  const rows = document.querySelectorAll('#itemsBody tr');
  let subtotal = 0;
  rows.forEach(row => {
    const qty = parseFloat(row.querySelectorAll('input')[1]?.value) || 0;
    const rate = parseFloat(row.querySelectorAll('input')[2]?.value) || 0;
    const amount = qty * rate;
    row.querySelector('.item-total').textContent = amount.toFixed(2);
    subtotal += amount;
  });

  const discount = parseFloat(document.getElementById('discount').value) || 0;
  const tax = parseFloat(document.getElementById('tax').value) || 0;

  const afterDiscount = subtotal - (subtotal * discount / 100);
  const total = afterDiscount + (afterDiscount * tax / 100);

  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('total').textContent = total.toFixed(2);
}

function previewInvoice() {
  const previewArea = document.getElementById('previewArea');
  previewArea.innerHTML = generateInvoiceHTML();
  document.getElementById('previewModal').style.display = 'block';
}

function closePreview() {
  document.getElementById('previewModal').style.display = 'none';
}

function printInvoice() {
  const invoiceNo = document.getElementById('invoiceNo').value;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${invoiceNo}</title>
        <link rel="stylesheet" href="style.css">
        <style>
          body { padding: 20px; background: #fff; }
          .actions, .btn-add, .btn-remove, .close, .modal { display: none !important; }
          .watermark-logo { display: block !important; }
          @page { margin: 12mm; }
        </style>
      </head>
      <body>${generateInvoiceHTML()}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 800);
}

function savePDF() {
  const invoiceNo = document.getElementById('invoiceNo').value;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${invoiceNo}</title>
        <link rel="stylesheet" href="style.css">
        <style>
          body { padding: 20px; background: #fff; }
          .actions, .btn-add, .btn-remove, .close, .modal { display: none !important; }
          .watermark-logo { display: block !important; }
          @page { margin: 12mm; }
        </style>
      </head>
      <body>${generateInvoiceHTML()}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 800);
}

function resetInvoice() {
  if (!confirm('Reset all invoice data?')) return;
  document.getElementById('itemsBody').innerHTML = '';
  itemIndex = 0;
  addItem();
  document.getElementById('discount').value = 0;
  document.getElementById('tax').value = 0;
  document.getElementById('notes').value = '';
  document.getElementById('invoiceNo').value = 'INV-' + Date.now().toString().slice(-6);
  document.getElementById('invoiceDate').value = new Date().toISOString().slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + 30);
  document.getElementById('dueDate').value = due.toISOString().slice(0, 10);
  document.querySelectorAll('.to input').forEach(i => i.value = '');
  calcTotals();
}

function generateInvoiceHTML() {
  const get = id => document.getElementById(id).value;
  const getVal = id => document.getElementById(id).textContent;

  let itemsHtml = '';
  document.querySelectorAll('#itemsBody tr').forEach((row, i) => {
    const desc = row.querySelectorAll('input')[0]?.value || '';
    const qty = row.querySelectorAll('input')[1]?.value || 0;
    const rate = row.querySelectorAll('input')[2]?.value || 0;
    const amt = row.querySelector('.item-total')?.textContent || '0.00';
    itemsHtml += `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:center;background:#fff">${i + 1}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;background:#fff">${desc}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:center;background:#fff">${qty}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:right;background:#fff">LKR ${parseFloat(rate).toFixed(2)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;background:#fff">LKR ${amt}</td>
    </tr>`;
  });

  const logoBase64 = localStorage.getItem('lenzoraLogo') || 'Lenzora logo.png';

  const subtotal = parseFloat(getVal('subtotal')) || 0;
  const discountPct = parseFloat(get('discount')) || 0;
  const taxPct = parseFloat(get('tax')) || 0;
  const discountAmt = subtotal * discountPct / 100;
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = afterDiscount * taxPct / 100;

  return `
    <div class="invoice-wrapper" style="padding:30px 35px;position:relative;overflow:hidden;background:#fff;border-radius:16px;border:1px solid rgba(0,0,0,0.04)">
      <img src="${logoBase64}" alt="" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-15deg);opacity:0.06;pointer-events:none;z-index:0;user-select:none;max-width:400px;width:60%">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;padding-bottom:22px;border-bottom:2px solid #f0f0f0;position:relative;z-index:1">
        <div>
          <img src="${logoBase64}" alt="Lenzora Logo" style="max-height:90px;width:auto;display:block;border-radius:12px">
        </div>
        <div style="text-align:right">
          <p><strong style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Invoice No:</strong><br><span style="font-size:16px;font-weight:700;color:#1a1a2e">${get('invoiceNo')}</span></p>
          <p style="margin-top:6px"><strong style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Date:</strong><br><span style="font-weight:600">${get('invoiceDate')}</span></p>
          <p style="margin-top:6px"><strong style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Due Date:</strong><br><span style="font-weight:600">${get('dueDate')}</span></p>
        </div>
      </div>
      <div style="max-width:420px;margin-bottom:28px;position:relative;z-index:1">
        <h3 style="font-size:11px;font-weight:800;color:#6c5ce7;margin-bottom:10px;text-transform:uppercase;letter-spacing:1.5px">Bill To</h3>
        <p style="font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:3px">${get('clientName')}</p>
        <p style="font-size:13px;color:#636e72">${get('clientAddress')}</p>
        <p style="font-size:13px;color:#636e72">${get('clientEmail')}</p>
        <p style="font-size:13px;color:#636e72">${get('clientPhone')}</p>
      </div>
      <table style="width:100%;border-collapse:separate;border-spacing:0;border-radius:10px;overflow:hidden;border:1.5px solid #f0f0f0;margin-bottom:24px;position:relative;z-index:1">
        <thead>
          <tr style="background:linear-gradient(135deg,#1a1a2e,#2d2d5e)">
            <th style="padding:12px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#fff;text-align:center">#</th>
            <th style="padding:12px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#fff;text-align:left">Description</th>
            <th style="padding:12px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#fff;text-align:center">Qty</th>
            <th style="padding:12px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#fff;text-align:right">Rate</th>
            <th style="padding:12px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#fff;text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="display:grid;grid-template-columns:1fr 280px;gap:32px;position:relative;z-index:1">
        <div>
          <p style="font-size:11px;font-weight:800;color:#6c5ce7;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Notes</p>
          <p style="font-size:13px;color:#636e72">${get('notes') || 'Thank you for your business'}</p>
        </div>
        <div style="background:linear-gradient(135deg,#1a1a2e,#2d2d5e);border-radius:12px;padding:20px 24px">
          <div style="display:flex;justify-content:space-between;padding:7px 0;font-size:14px;color:#dfe6e9">
            <span>Subtotal</span><span>LKR ${getVal('subtotal')}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:7px 0;font-size:14px;color:#dfe6e9">
            <span>Discount (${get('discount')}%)</span><span>-LKR ${discountAmt.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:7px 0;font-size:14px;color:#dfe6e9">
            <span>Tax (${get('tax')}%)</span><span>LKR ${taxAmt.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-top:2px solid rgba(162,155,254,0.3);margin-top:6px;padding-top:14px;font-size:20px;font-weight:800;color:#fff">
            <span>Total</span><span style="color:#a29bfe">LKR ${getVal('total')}</span>
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:24px;position:relative;z-index:1">
        <img src="${localStorage.getItem('lenzoraCard') || 'Lenzora Card.png'}" alt="Payment Cards" style="max-width:280px;width:100%;height:auto;display:inline-block;border-radius:8px">
      </div>
    </div>
  `;
}

window.onclick = function(e) {
  const modal = document.getElementById('previewModal');
  if (e.target === modal) modal.style.display = 'none';
};
