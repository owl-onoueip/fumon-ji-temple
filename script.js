// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

// Online Toba application form handler
(function initTobaForm() {
    const form = document.getElementById('tobaForm');
    if (!form) return;
    const itemsContainer = document.getElementById('tobaItems');
    const btnAdd = document.getElementById('addTobaRow');
    const btnRemove = document.getElementById('removeTobaRow');
    // Confirmation modal elements
    const modal = document.getElementById('tobaConfirmModal');
    const modalBody = document.getElementById('tobaConfirmBody');
    const modalCancel = document.getElementById('tobaConfirmCancel');
    const modalSend = document.getElementById('tobaConfirmSend');
    let confirmedOnce = false; // submit confirmation state

    // Date constraints for inputs (UX):
    try {
        const svcDateEl = document.getElementById('service_date');
        const meinichiEl = document.getElementById('deceased_meinichi');
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        if (svcDateEl) svcDateEl.setAttribute('min', todayStr); // 法要日は過去NG
        if (meinichiEl) meinichiEl.setAttribute('max', todayStr); // ご命日は未来NG
    } catch (e) {
        console.warn('Date constraints not applied:', e);
    }

    // Helpers to manage rows
    function createTobaRow(idx) {
        const row = document.createElement('div');
        row.className = 'toba-row';
        row.style.display = 'grid';
        row.style.gridTemplateColumns = 'auto 1fr 1fr';
        row.style.gap = '10px';
        row.style.alignItems = 'center';
        const label = document.createElement('div');
        label.textContent = idx.toString();
        label.style.minWidth = '24px';
        const nameWrap = document.createElement('div');
        nameWrap.className = 'form-group';
        const nameLabel = document.createElement('label');
        nameLabel.textContent = '施主名';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'toba-name';
        nameWrap.appendChild(nameLabel);
        nameWrap.appendChild(nameInput);
        const kanaWrap = document.createElement('div');
        kanaWrap.className = 'form-group';
        const kanaLabel = document.createElement('label');
        kanaLabel.textContent = 'よみがな';
        const kanaInput = document.createElement('input');
        kanaInput.type = 'text';
        kanaInput.className = 'toba-kana';
        kanaWrap.appendChild(kanaLabel);
        kanaWrap.appendChild(kanaInput);
        row.appendChild(label);
        row.appendChild(nameWrap);
        row.appendChild(kanaWrap);
        return row;
    }

    function refreshRowIndices() {
        const rows = itemsContainer.querySelectorAll('.toba-row');
        rows.forEach((row, i) => {
            const label = row.firstChild;
            if (label) label.textContent = String(i + 1);
        });
    }

    function addRow() {
        const idx = itemsContainer.querySelectorAll('.toba-row').length + 1;
        itemsContainer.appendChild(createTobaRow(idx));
    }
    function removeRow() {
        const rows = itemsContainer.querySelectorAll('.toba-row');
        if (rows.length > 0) {
            itemsContainer.removeChild(rows[rows.length - 1]);
        }
    }

    function clearTobaForm() {
        // Reset all fields
        form.reset();
        // Rebuild items rows to default 5 empty rows
        itemsContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) addRow();
        refreshRowIndices();
        // Hide success message after clearing
        const ok = document.getElementById('toba-success');
        if (ok) ok.style.display = 'none';
        const ng = document.getElementById('toba-error');
        if (ng) ng.style.display = 'none';
    }

    function openPrintSummary({
        ticket_id,
        applicant_name,
        applicant_kana,
        applicant_phone,
        applicant_email,
        applicant_address,
        service_date,
        start_time,
        attendees,
        deceased_zokumyo,
        deceased_kaimyo,
        deceased_meinichi,
        services,
        items,
        message
    }) {
        const safe = s => (s || '').replace(/</g, '&lt;');
        const itemsRows = items.map((it, i) => `<tr><td>${i+1}</td><td>${safe(it.name)}</td><td>${safe(it.kana)}</td></tr>`).join('');
        const servicesText = services.join(', ');
        try {
            const sumWin = window.open('', '_blank');
            if (sumWin && sumWin.document) {
                const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>申込内容の控え | 普門寺</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans JP','Hiragino Kaku Gothic ProN',Meiryo,sans-serif;color:#222;line-height:1.7;margin:20px}
  .card{border:1px solid #e2d3b5;border-radius:10px;background:#fffaf2;padding:14px 16px;margin-bottom:16px}
  h1{font-size:20px;margin:0 0 10px}
  h2{font-size:16px;margin:18px 0 8px}
  table{border-collapse:collapse;width:100%}
  th,td{border:1px solid #ddd;padding:8px;text-align:left}
  th{background:#f7f7f7}
  .actions{margin-top:14px}
  .btn{display:inline-block;padding:10px 16px;border:1px solid #c19653;border-radius:999px;color:#593b0b;text-decoration:none}
  .btn-primary{background:#f5e7cf}
  @media print {.actions{display:none}}
</style></head>
<body>
  <div class="card">
    <h1>お申込みありがとうございます</h1>
    <p>内容を確認のうえ、寺務所よりご連絡いたします。</p>
    <p>受付番号：<strong>${ticket_id}</strong></p>
    <p style="color:#666">※受付番号はお問い合わせの際にお知らせください。迷惑メールフォルダもご確認ください。</p>
  </div>

  <h2>檀家名（申込者）</h2>
  <table>
    <tr><th>氏名</th><td>${safe(applicant_name)}</td></tr>
    <tr><th>よみがな</th><td>${safe(applicant_kana)}</td></tr>
    <tr><th>電話</th><td>${safe(applicant_phone)}</td></tr>
    <tr><th>メール</th><td>${safe(applicant_email)}</td></tr>
    <tr><th>住所</th><td>${safe(applicant_address)}</td></tr>
  </table>

  <h2>ご法要（ご希望日時）</h2>
  <table>
    <tr><th>ご法要日</th><td>${safe(service_date)}</td></tr>
    <tr><th>開式時間</th><td>${safe(start_time)}</td></tr>
    <tr><th>列席人数（目安）</th><td>${safe(attendees)}</td></tr>
  </table>

  <h2>故人情報</h2>
  <table>
    <tr><th>俗名</th><td>${safe(deceased_zokumyo)}</td></tr>
    <tr><th>戒名</th><td>${safe(deceased_kaimyo)}</td></tr>
    <tr><th>ご命日</th><td>${safe(deceased_meinichi)}</td></tr>
  </table>

  <h2>法事内容</h2>
  <p>${safe(servicesText)}</p>

  <h2>施主（順番どおり）</h2>
  <table>
    <thead><tr><th>#</th><th>施主名</th><th>よみがな</th></tr></thead>
    <tbody>${itemsRows}</tbody>
  </table>
  <p>件数：${items.length}</p>

  <h2>備考</h2>
  <p>${safe(message)}</p>

  <div class="actions">
    <a href="#" class="btn btn-primary" onclick="window.print();return false;">この内容を印刷</a>
  </div>
</body></html>`;
                sumWin.document.open();
                sumWin.document.write(html);
                sumWin.document.close();
            }
        } catch (e) {
            console.warn('Summary window could not be opened:', e);
        }
    }

    // Initialize with 5 rows
    for (let i = 0; i < 5; i++) addRow();
    btnAdd && btnAdd.addEventListener('click', () => { addRow(); refreshRowIndices(); });
    btnRemove && btnRemove.addEventListener('click', () => { removeRow(); refreshRowIndices(); });

    form.addEventListener('submit', async function(e){
        e.preventDefault();

        // Honeypot
        const hp = form.querySelector('#toba_website');
        if (hp && hp.value.trim()) {
            console.warn('Toba honeypot triggered. Submission ignored.');
            return;
        }

        // Rate limit per browser key: run ONLY when actually sending (after confirmation)
        if (confirmedOnce) {
            try {
                const KEY = 'toba_last_submit_ts';
                const WINDOW_SEC = 60;
                const now = Date.now();
                const last = parseInt(localStorage.getItem(KEY) || '0', 10);
                if (!isNaN(last) && now - last < WINDOW_SEC * 1000) {
                    const remain = Math.ceil((WINDOW_SEC * 1000 - (now - last)) / 1000);
                    alert(`短時間での連続送信はできません。${remain}秒後にお試しください。`);
                    return;
                }
                // Set timestamp right before sending
                localStorage.setItem(KEY, String(now));
            } catch (err) {
                console.warn('Toba ratelimit storage unavailable:', err);
            }
        }

        // Collect fields (PDF mirrored)
        const applicant_name = document.getElementById('applicant_name')?.value.trim();
        const applicant_kana = document.getElementById('applicant_kana')?.value.trim();
        const applicant_phone = document.getElementById('applicant_phone')?.value.trim();
        const applicant_email = document.getElementById('applicant_email')?.value.trim();
        const applicant_address = document.getElementById('applicant_address')?.value.trim();

        const service_date = document.getElementById('service_date')?.value.trim();
        const start_time = document.getElementById('start_time')?.value.trim();
        const attendees = document.getElementById('attendees')?.value.trim();

        const deceased_zokumyo = document.getElementById('deceased_zokumyo')?.value.trim();
        const deceased_kaimyo = document.getElementById('deceased_kaimyo')?.value.trim();
        const deceased_meinichi = document.getElementById('deceased_meinichi')?.value.trim();

        const svc_49 = document.getElementById('svc_49')?.checked;
        const svc_isshu = document.getElementById('svc_isshu')?.checked;
        const svc_kaiki = parseInt(document.getElementById('svc_kaiki')?.value || '0', 10);
        const svc_sekito = document.getElementById('svc_sekito')?.checked;
        const svc_noukotsu = document.getElementById('svc_noukotsu')?.checked;
        const svc_tsuizen = document.getElementById('svc_tsuizen')?.checked;
        const svc_only_toba = document.getElementById('svc_only_toba')?.checked;

        const message = document.getElementById('toba_message')?.value.trim();

        // Build services text
        const services = [];
        if (svc_49) services.push('49日');
        if (svc_isshu) services.push('一周忌');
        if (!isNaN(svc_kaiki) && svc_kaiki > 0) services.push(`${svc_kaiki}回忌`);
        if (svc_sekito) services.push('石塔開眼');
        if (svc_noukotsu) services.push('納骨供養');
        if (svc_tsuizen) services.push('追善回向');
        if (svc_only_toba) services.push('卒塔婆回向のみ');

        // Collect items rows
        const rows = Array.from(itemsContainer.querySelectorAll('.toba-row'));
        const items = rows.map(r => ({
            name: r.querySelector('.toba-name')?.value.trim() || '',
            kana: r.querySelector('.toba-kana')?.value.trim() || ''
        })).filter(it => it.name);

        // Validation
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!applicant_name) return alert('代表者氏名をご入力ください。');
        if (!emailRe.test(applicant_email || '')) return alert('メールアドレスの形式が正しくありません。');
        if (!applicant_phone) return alert('電話番号は必須です。');
        if (!/^[0-9+\-()\s]{6,20}$/.test(applicant_phone)) return alert('電話番号の形式が正しくありません。数字と記号（+-()）のみを使用してください。');
        if (items.length === 0) return alert('施主名を1件以上ご入力ください。');

        // Date validation rules
        function parseYMD(s) {
            if (!s) return null;
            const [y,m,d] = s.split('-').map(n => parseInt(n, 10));
            if (!y || !m || !d) return null;
            return new Date(y, m - 1, d);
        }
        const today0 = new Date(); today0.setHours(0,0,0,0);
        const svcDate = parseYMD(service_date);
        if (svcDate && svcDate < today0) return alert('ご法要日は本日以降の日付をご指定ください（過去日は指定できません）。');
        const meinichiDate = parseYMD(deceased_meinichi);
        if (meinichiDate && meinichiDate > today0) return alert('ご命日は本日以前の日付をご指定ください（未来日は指定できません）。');

        // First submit: show confirmation modal with summary
        if (!confirmedOnce && modal && modalBody) {
            const safe = s => (s || '').replace(/</g, '&lt;');
            const itemsRows = items.map((it, i) => `<tr><td>${i+1}</td><td>${safe(it.name)}</td><td>${safe(it.kana)}</td></tr>`).join('');
            const servicesText = services.join(', ');
            modalBody.innerHTML = `
                <div class="confirm-section">
                    <h4>檀家名（申込者）</h4>
                    <table class="simple"><tr><th>氏名</th><td>${safe(applicant_name)}</td></tr>
                    <tr><th>よみがな</th><td>${safe(applicant_kana)}</td></tr>
                    <tr><th>電話</th><td>${safe(applicant_phone)}</td></tr>
                    <tr><th>メール</th><td>${safe(applicant_email)}</td></tr>
                    <tr><th>住所</th><td>${safe(applicant_address)}</td></tr></table>
                </div>
                <div class="confirm-section">
                    <h4>ご法要（ご希望日時）</h4>
                    <table class="simple"><tr><th>ご法要日</th><td>${safe(service_date)}</td></tr>
                    <tr><th>開式時間</th><td>${safe(start_time)}</td></tr>
                    <tr><th>列席人数（目安）</th><td>${safe(attendees)}</td></tr></table>
                </div>
                <div class="confirm-section">
                    <h4>故人情報</h4>
                    <table class="simple"><tr><th>俗名</th><td>${safe(deceased_zokumyo)}</td></tr>
                    <tr><th>戒名</th><td>${safe(deceased_kaimyo)}</td></tr>
                    <tr><th>ご命日</th><td>${safe(deceased_meinichi)}</td></tr></table>
                </div>
                <div class="confirm-section">
                    <h4>法事内容</h4>
                    <p>${safe(servicesText)}</p>
                </div>
                <div class="confirm-section">
                    <h4>施主（順番どおり）</h4>
                    <table class="simple"><thead><tr><th>#</th><th>施主名</th><th>よみがな</th></tr></thead>
                    <tbody>${itemsRows}</tbody></table>
                    <p>件数：${items.length}</p>
                </div>
                <div class="confirm-section">
                    <h4>備考</h4>
                    <p>${safe(message)}</p>
                </div>
            `;
            // Show modal and wire buttons
            modal.style.display = 'block';
            // No print button in confirmation modal per request
            if (modalCancel) modalCancel.onclick = () => { modal.style.display = 'none'; confirmedOnce = false; };
            if (modalSend) modalSend.onclick = () => { modal.style.display = 'none'; confirmedOnce = true; form.requestSubmit(); };
            return;
        }

        // EmailJS availability
        if (typeof emailjs === 'undefined') {
            alert('送信機能の読み込みに失敗しました。時間をおいて再度お試しください。');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const old = btn.textContent;
        btn.disabled = true;
        btn.textContent = '送信中...';

        // Build HTML table for items for easy reading in email
        const items_html = (function(){
            if (!items.length) return '';
            let html = '<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse">';
            html += '<thead><tr><th>#</th><th>施主名</th><th>よみがな</th></tr></thead><tbody>';
            items.forEach((it, i) => {
                html += `<tr><td>${i+1}</td><td>${(it.name||'').replace(/</g,'&lt;')}</td><td>${(it.kana||'').replace(/</g,'&lt;')}</td></tr>`;
            });
            html += '</tbody></table>';
            return html;
        })();

        // Generate ticket ID for tracking, e.g., FJ-20250919-8X3K
        function genTicketId() {
            const d = new Date();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let rand = '';
            for (let i = 0; i < 4; i++) rand += pool[Math.floor(Math.random() * pool.length)];
            return `FJ-${y}${m}${day}-${rand}`;
        }
        const ticket_id = genTicketId();

        const templateParams = {
            form_type: 'toba',
            subject: `[塔婆申込] ${applicant_name || ''} 様 | ${ticket_id}`,
            applicant_name,
            applicant_kana,
            applicant_phone,
            applicant_email,
            applicant_address,
            service_date,
            start_time,
            attendees,
            deceased_zokumyo,
            deceased_kaimyo,
            deceased_meinichi,
            services: services.join(', '),
            items_json: JSON.stringify(items),
            items_html,
            items_count: items.length,
            message,
            ticket_id,
            reply_to: applicant_email
        };

        try {
            await emailjs.send('service_hug4h5d', 'template_9oehtxc', templateParams);
            const ok = document.getElementById('toba-success');
            const ng = document.getElementById('toba-error');
            if (ok) {
                ok.innerHTML = `<p>お申込みありがとうございます。内容を確認のうえ、寺務所よりご連絡いたします。</p>
                <p style="margin-top:6px;">受付番号：<strong>${ticket_id}</strong></p>
                <p style="color:var(--text-light); margin-top:4px;">※受付番号はお問い合わせの際にお知らせください。迷惑メールフォルダもご確認ください。</p>
                <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                    <button type="button" class="btn btn-secondary" id="toba-print">今回の申込内容を印刷する</button>
                    <button type="button" class="btn" id="toba-new">新しい申込を作成</button>
                </div>`;
                ok.style.display = 'block';
                // Accessibility: make success region programmatically focusable and announce status
                try {
                    ok.setAttribute('tabindex', '-1');
                    ok.setAttribute('role', 'status');
                    ok.setAttribute('aria-live', 'polite');
                    // Bring into view and focus for visibility
                    ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    ok.focus({ preventScroll: false });
                } catch (e) {
                    // no-op
                }
                // Attach handlers
                const btnPrint = document.getElementById('toba-print');
                const btnNew = document.getElementById('toba-new');
                if (btnPrint) btnPrint.addEventListener('click', () => openPrintSummary({
                    ticket_id,
                    applicant_name,
                    applicant_kana,
                    applicant_phone,
                    applicant_email,
                    applicant_address,
                    service_date,
                    start_time,
                    attendees,
                    deceased_zokumyo,
                    deceased_kaimyo,
                    deceased_meinichi,
                    services,
                    items,
                    message
                }));
                if (btnNew) btnNew.addEventListener('click', clearTobaForm);
                // After rendering buttons, move focus to the primary next action so users don't miss it
                setTimeout(() => {
                    if (btnPrint) {
                        try { btnPrint.focus(); } catch (_) {}
                    }
                }, 0);
            }
            if (ng) ng.style.display = 'none';
            // Do NOT auto-clear inputs; keep entered values for確認/印刷用

            // Summary window disabled by request; on-page success message provides Print/New options.
        } catch (err) {
            console.error('Toba send failed', err);
            document.getElementById('toba-success').style.display = 'none';
            document.getElementById('toba-error').style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = old;
            confirmedOnce = false; // reset confirmation state
        }
    });
})();
    
    // Online Goma-fuda application form handler (independent of Toba)
    (function initGomaForm(){
        const form = document.getElementById('gomaForm');
        if (!form) return;
        const modal = document.getElementById('gomaConfirmModal');
        const modalBody = document.getElementById('gomaConfirmBody');
        const modalCancel = document.getElementById('gomaConfirmCancel');
        const modalSend = document.getElementById('gomaConfirmSend');
        const itemsContainer = document.getElementById('gomaItems');
        const btnAddItem = document.getElementById('gomaAddItem');
        const btnRemoveItem = document.getElementById('gomaRemoveItem');
        let confirmedOnce = false;

        // --- Multi items (max 3) ---
        const PRAYER_OPTIONS = [
            '交通安全','家内安全','商売繁盛','合格祈願','厄除け','健康長寿','安産成就','心願成就','その他'
        ];

        function createItemRow(idx){
            const row = document.createElement('div');
            row.className = 'goma-item-row';
            row.style.display = 'grid';
            // 願主 / 祈願種別 / その他 / 御祈願料 / 枚数
            row.style.gridTemplateColumns = 'minmax(160px,1.2fr) minmax(140px,1fr) 1fr 140px 120px';
            row.style.gap = '10px';
            row.style.alignItems = 'center';

            // 願主
            const inpPerson = document.createElement('input');
            inpPerson.type = 'text';
            inpPerson.placeholder = '願主（お札に書くお名前）';
            inpPerson.className = 'goma-item-person';

            // 祈願種別
            const selPrayer = document.createElement('select');
            selPrayer.className = 'goma-item-prayer';
            const opt0 = document.createElement('option'); opt0.value = ''; opt0.textContent = '祈願種別を選択';
            selPrayer.appendChild(opt0);
            PRAYER_OPTIONS.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; selPrayer.appendChild(o); });

            // その他テキスト
            const txtOther = document.createElement('input');
            txtOther.type = 'text';
            txtOther.placeholder = '（その他の内容）';
            txtOther.className = 'goma-item-other';

            // 御祈願料
            const selFee = document.createElement('select');
            selFee.className = 'goma-item-fee';
            selFee.innerHTML = '<option value="">御祈願料</option><option value="3000">3,000円</option><option value="5000">5,000円</option>';

            // 枚数
            const inpCount = document.createElement('input');
            inpCount.type = 'number'; inpCount.min = '1'; inpCount.max = '50'; inpCount.value = '1';
            inpCount.className = 'goma-item-count';

            row.appendChild(inpPerson);
            row.appendChild(selPrayer);
            row.appendChild(txtOther);
            row.appendChild(selFee);
            row.appendChild(inpCount);
            return row;
        }

        function addItem(){
            if (!itemsContainer) return;
            const n = itemsContainer.querySelectorAll('.goma-item-row').length;
            if (n >= 3){ alert('同時申込は最大3件までです。'); return; }
            itemsContainer.appendChild(createItemRow(n+1));
        }
        function removeItem(){
            if (!itemsContainer) return;
            const rows = itemsContainer.querySelectorAll('.goma-item-row');
            if (rows.length>0) itemsContainer.removeChild(rows[rows.length-1]);
        }

        // Initialize with 1 item row by default
        if (itemsContainer && itemsContainer.children.length===0){ addItem(); }
        if (btnAddItem) btnAddItem.addEventListener('click', addItem);
        if (btnRemoveItem) btnRemoveItem.addEventListener('click', removeItem);

        function openGomaPrintSummary({
            ticket_id,
            goma_name,
            goma_kana,
            goma_phone,
            goma_email,
            goma_address,
            prayers,
            pray_other_text,
            goma_size,
            goma_count,
            receive,
            hope_date,
            hope_time,
            message
        }){
            const safe = s => (s||'').replace(/</g,'&lt;');
            const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>護摩札 申込内容の控え</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans JP','Hiragino Kaku Gothic ProN',Meiryo,sans-serif;color:#222;line-height:1.7;margin:20px}.card{border:1px solid #e2d3b5;border-radius:10px;background:#fffaf2;padding:14px 16px;margin-bottom:16px}h1{font-size:20px;margin:0 0 10px}h2{font-size:16px;margin:18px 0 8px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f7f7f7}.actions{margin-top:14px}.btn{display:inline-block;padding:10px 16px;border:1px solid #c19653;border-radius:999px;color:#593b0b;text-decoration:none}.btn-primary{background:#f5e7cf}@media print{.actions{display:none}}</style></head><body>
            <div class="card"><h1>お申込みありがとうございます</h1><p>内容を確認のうえ、寺務所よりご連絡いたします。</p><p>受付番号：<strong>${safe(ticket_id)}</strong></p></div>
            <h2>申込者</h2><table><tr><th>氏名</th><td>${safe(goma_name)}</td></tr><tr><th>よみがな</th><td>${safe(goma_kana)}</td></tr><tr><th>電話</th><td>${safe(goma_phone)}</td></tr><tr><th>メール</th><td>${safe(goma_email)}</td></tr><tr><th>住所</th><td>${safe(goma_address)}</td></tr></table>
            <h2>祈願</h2><table><tr><th>内容</th><td>${safe(prayers.join(', '))}${pray_other_text? '／'+safe(pray_other_text):''}</td></tr></table>
            <h2>護摩札</h2><table><tr><th>御祈願料</th><td>${safe(goma_size)}</td></tr><tr><th>枚数</th><td>${safe(String(goma_count))}</td></tr><tr><th>授与方法</th><td>${safe(receive)}</td></tr></table>
            <h2>ご希望日時</h2><table><tr><th>日付</th><td>${safe(hope_date)}</td></tr><tr><th>時間帯</th><td>${safe(hope_time)}</td></tr></table>
            <h2>備考</h2><p>${safe(message)}</p>
            <div class="actions"><a href="#" class="btn btn-primary" onclick="window.print();return false;">この内容を印刷</a></div>
            </body></html>`;
            try {
                const w = window.open('', '_blank');
                if (w && w.document){ w.document.open(); w.document.write(html); w.document.close(); }
            } catch(e){ console.warn('Goma summary window failed:', e); }
        }

        form.addEventListener('submit', async function(e){
            e.preventDefault();

            // Honeypot
            const hp = form.querySelector('#goma_website');
            if (hp && hp.value.trim()) return;

            // Rate limit only when sending
            if (confirmedOnce){
                try {
                    const KEY = 'goma_last_submit_ts';
                    const WINDOW_SEC = 60;
                    const now = Date.now();
                    const last = parseInt(localStorage.getItem(KEY) || '0', 10);
                    if (!isNaN(last) && now - last < WINDOW_SEC*1000){
                        const remain = Math.ceil((WINDOW_SEC*1000 - (now-last))/1000);
                        alert(`短時間での連続送信はできません。${remain}秒後にお試しください。`);
                        return;
                    }
                    localStorage.setItem(KEY, String(now));
                } catch(err){ console.warn('Goma ratelimit storage unavailable:', err); }
            }

            // Collect fields
            const goma_name = document.getElementById('goma_name')?.value.trim();
            const goma_kana = document.getElementById('goma_kana')?.value.trim();
            const goma_phone = document.getElementById('goma_phone')?.value.trim();
            const goma_email = document.getElementById('goma_email')?.value.trim();
            const goma_address = document.getElementById('goma_address')?.value.trim();

            // Build items from rows (preferred)
            function collectItems(){
                if (!itemsContainer) return [];
                const rows = Array.from(itemsContainer.querySelectorAll('.goma-item-row'));
                return rows.map(r=>{
                    const person = r.querySelector('.goma-item-person')?.value.trim() || '';
                    const prayer = r.querySelector('.goma-item-prayer')?.value || '';
                    const other = r.querySelector('.goma-item-other')?.value.trim() || '';
                    const feeStr = r.querySelector('.goma-item-fee')?.value || '';
                    const fee = parseInt(feeStr || '0',10);
                    const count = parseInt(r.querySelector('.goma-item-count')?.value || '0',10);
                    return { person, prayer, other, fee, count };
                }).filter(it=> it.prayer && it.count>0 && it.fee>0);
            }
            const items = collectItems();

            // Fallback to single inputs if no item rows are valid (legacy)
            let goma_size = document.getElementById('goma_size')?.value;
            let goma_count = parseInt(document.getElementById('goma_count')?.value || '0', 10);
            let pray_other_text = document.getElementById('pray_other_text')?.value.trim();
            const pray = []; // legacy checkboxes (kept for compatibility)
            if (document.getElementById('pray_traffic')?.checked) pray.push('交通安全');
            if (document.getElementById('pray_family')?.checked) pray.push('家内安全');
            if (document.getElementById('pray_business')?.checked) pray.push('商売繁盛');
            if (document.getElementById('pray_pass')?.checked) pray.push('合格祈願');
            if (document.getElementById('pray_yaku')?.checked) pray.push('厄除け');
            if (document.getElementById('pray_health')?.checked) pray.push('健康長寿');
            if (document.getElementById('pray_safe_birth')?.checked) pray.push('安産成就');
            if (document.getElementById('pray_wish')?.checked) pray.push('心願成就');
            const receive = '寺務所受取';

            const hope_date = document.getElementById('goma_hope_date')?.value.trim();
            const hope_time = document.getElementById('goma_hope_time')?.value.trim();
            const message = document.getElementById('goma_message')?.value.trim();

            // Compose a comprehensive body for contact template's main content
            const composed = [
                `【種別】護摩札申込`,
                `【氏名】${goma_name || ''}`,
                `【よみがな】${goma_kana || ''}`,
                `【電話】${goma_phone || ''}`,
                `【メール】${goma_email || ''}`,
                `【住所】${goma_address || ''}`,
                `【祈願内容】${pray.join(', ') || ''}${pray_other_text ? '／' + pray_other_text : ''}`,
                `【御祈願料】${goma_size || ''}`,
                `【枚数】${(goma_count||'')}`,
                `【授与方法】寺務所受取`,
                `【ご希望日】${hope_date || ''}`,
                `【時間帯】${hope_time || ''}`,
                `【備考】${message || ''}`
            ].join('\n');

            // Validation
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!goma_name) return alert('氏名をご入力ください。');
            if (!emailRe.test(goma_email || '')) return alert('メールアドレスの形式が正しくありません。');
            if (!goma_phone) return alert('電話番号は必須です。');
            if (!/^[0-9+\-()\s]{6,20}$/.test(goma_phone)) return alert('電話番号の形式が正しくありません。数字と記号（+-()）のみを使用してください。');
            // Validation for items
            if (items.length === 0){
                // fallback validation for legacy single inputs
                if (!goma_size) return alert('御祈願料を選択してください。');
                if (!(goma_count > 0)) return alert('枚数をご入力ください。');
            } else {
                if (items.length > 3) return alert('同時申込は最大3件までです。');
                // 重複祈願の禁止
                const set = new Set();
                for (const it of items){
                    if (!it.person) return alert('各行の「願主（お札に書くお名前）」を入力してください。');
                    const key = it.prayer + (it.prayer==='その他'? ':'+(it.other||''): '') + '|' + it.person;
                    if (set.has(key)) return alert('同じ祈願内容が重複しています。内容を見直してください。');
                    set.add(key);
                    if (it.prayer==='その他' && !it.other) return alert('「その他」の内容を入力してください。');
                    if (!(it.count>0)) return alert('枚数は1以上をご指定ください。');
                }
            }

            // Confirmation modal first
            if (!confirmedOnce && modal && modalBody){
                const safe = s => (s||'').replace(/</g,'&lt;');
                // Build items HTML and totals for preview
                function formatYen(n){ return n.toLocaleString('ja-JP',{style:'currency', currency:'JPY'}).replace('￥','¥'); }
                let itemsHtml = '';
                let totalCount = 0; let totalAmount = 0;
                if (items.length){
                    itemsHtml = '<table class="simple"><thead><tr><th>#</th><th>祈願内容</th><th>御祈願料</th><th>枚数</th><th>小計</th></tr></thead><tbody>';
                    items.forEach((it,i)=>{
                        const name = it.prayer + (it.prayer==='その他' && it.other? '（'+it.other+'）':'');
                        const subtotal = it.fee * it.count; totalCount += it.count; totalAmount += subtotal;
                        itemsHtml += `<tr><td>${i+1}</td><td>${name}</td><td>${formatYen(it.fee)}</td><td>${it.count}</td><td>${formatYen(subtotal)}</td></tr>`;
                    });
                    itemsHtml += `</tbody></table><p style="margin-top:8px;">合計枚数：${totalCount} 枚　／　概算合計：${formatYen(totalAmount)}</p>`;
                }

                const prayersText = items.length
                    ? items.map(it => it.prayer + (it.prayer==='その他' && it.other? '（'+it.other+'）':'' )).join(', ')
                    : pray.join(', ');
                modalBody.innerHTML = `
                    <div class="confirm-section">
                        <h4>申込者</h4>
                        <table class="simple"><tr><th>氏名</th><td>${safe(goma_name)}</td></tr>
                        <tr><th>よみがな</th><td>${safe(goma_kana)}</td></tr>
                        <tr><th>電話</th><td>${safe(goma_phone)}</td></tr>
                        <tr><th>メール</th><td>${safe(goma_email)}</td></tr>
                        <tr><th>住所</th><td>${safe(goma_address)}</td></tr></table>
                    </div>
                    <div class="confirm-section">
                        <h4>祈願内容</h4>
                        ${items.length ? itemsHtml : `<p>${safe(prayersText)}${pray_other_text ? '／'+safe(pray_other_text): ''}</p>`}
                    </div>
                    <div class="confirm-section">
                        <h4>護摩札</h4>
                        <table class="simple"><tr><th>御祈願料</th><td>${safe(goma_size)}</td></tr>
                        <tr><th>枚数</th><td>${safe(String(goma_count))}</td></tr>
                        <tr><th>授与方法</th><td>${safe(receive)}</td></tr></table>
                    </div>
                    <div class="confirm-section">
                        <h4>ご希望日時</h4>
                        <table class="simple"><tr><th>日付</th><td>${safe(hope_date)}</td></tr>
                        <tr><th>時間帯</th><td>${safe(hope_time)}</td></tr></table>
                    </div>
                    <div class="confirm-section">
                        <h4>備考</h4>
                        <p>${safe(message)}</p>
                    </div>
                `;
                modal.style.display = 'block';
                if (modalCancel) modalCancel.onclick = () => { modal.style.display = 'none'; confirmedOnce = false; };
                if (modalSend) modalSend.onclick = () => { modal.style.display = 'none'; confirmedOnce = true; form.requestSubmit(); };
                return;
            }

            if (typeof emailjs === 'undefined'){
                alert('送信機能の読み込みに失敗しました。時間をおいて再度お試しください。');
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            const old = btn.textContent;
            btn.disabled = true; btn.textContent = '送信中...';

            function genTicketId(){
                const d = new Date();
                const y = d.getFullYear();
                const m = String(d.getMonth()+1).padStart(2,'0');
                const day = String(d.getDate()).padStart(2,'0');
                const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                let rand = ''; for (let i=0;i<4;i++) rand += pool[Math.floor(Math.random()*pool.length)];
                return `FJ-${y}${m}${day}-${rand}`;
            }
            const ticket_id = genTicketId();

            const prayers = items.length
                ? items.map(it => it.prayer + (it.prayer==='その他' && it.other? '（'+it.other+'）':'' ))
                : pray.slice();

            // Build items table/html for email
            function formatYen(n){ return n.toLocaleString('ja-JP',{style:'currency', currency:'JPY'}).replace('￥','¥'); }
            let items_html = '';
            let items_total_count = 0; let items_total_amount = 0;
            if (items.length){
                items_html = '<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse">';
                items_html += '<thead><tr><th>#</th><th>願主</th><th>祈願内容</th><th>御祈願料</th><th>枚数</th><th>小計</th></tr></thead><tbody>';
                items.forEach((it,i)=>{
                    const name = it.prayer + (it.prayer==='その他' && it.other? '（'+it.other+'）':'');
                    const subtotal = it.fee * it.count; items_total_count += it.count; items_total_amount += subtotal;
                    items_html += `<tr><td>${i+1}</td><td>${it.person}</td><td>${name}</td><td>${formatYen(it.fee)}</td><td>${it.count}</td><td>${formatYen(subtotal)}</td></tr>`;
                });
                items_html += '</tbody></table>';
            }
            const templateParams = {
                // Generic aliases for contact template compatibility
                form_type: 'goma',
                subject: `[護摩札申込] ${goma_name || ''} 様 | ${ticket_id}`,
                name: goma_name,
                email: goma_email,
                phone: goma_phone,
                kind: '護摩札申込',
                content: composed,
                // Original detailed fields
                goma_name,
                goma_kana,
                goma_phone,
                goma_email,
                goma_address,
                prayers: prayers.join(', '),
                pray_other_text,
                // Backward compatibility: represent first fee and total count when multiple items present
                goma_size: items.length ? (items[0].fee===5000 ? '5,000円' : items[0].fee===3000 ? '3,000円' : '') : goma_size,
                goma_count: items.length ? items_total_count : goma_count,
                receive,
                hope_date,
                hope_time,
                message: composed, // legacy: full composed content
                remarks: message || '', // NEW: 備考のみ
                remarks_html: (message || '').replace(/\n/g,'<br>'),
                message_plain: message || '', // alias
                goma_message: message || '', // alias
                ticket_id,
                // Multi-items payload for template rendering
                items_html,
                items_json: JSON.stringify(items),
                items_total_count,
                items_total_amount: items_total_amount ? formatYen(items_total_amount) : '',
                reply_to: goma_email
            };

            try{
                await emailjs.send('service_hug4h5d','template_pygnzri', templateParams);
                const ok = document.getElementById('goma-success');
                const ng = document.getElementById('goma-error');
                if (ok){
                    ok.innerHTML = `<p>お申込みありがとうございます。内容を確認のうえ、寺務所よりご連絡いたします。</p>
                    <p style="margin-top:6px;">受付番号：<strong>${ticket_id}</strong></p>
                    <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                        <button type="button" class="btn btn-secondary" id="goma-print">今回の申込内容を印刷する</button>
                        <button type="button" class="btn" id="goma-new">新しい申込を作成</button>
                    </div>`;
                    ok.style.display = 'block';
                    try { ok.setAttribute('tabindex','-1'); ok.setAttribute('role','status'); ok.setAttribute('aria-live','polite'); ok.scrollIntoView({behavior:'smooth', block:'center'}); ok.focus({preventScroll:false}); } catch(_){}
                    const btnPrint = document.getElementById('goma-print');
                    const btnNew = document.getElementById('goma-new');
                    if (btnPrint) btnPrint.addEventListener('click', () => openGomaPrintSummary({
                        ticket_id,
                        goma_name,
                        goma_kana,
                        goma_phone,
                        goma_email,
                        goma_address,
                        prayers,
                        pray_other_text,
                        goma_size,
                        goma_count,
                        receive,
                        hope_date,
                        hope_time,
                        message
                    }));
                    if (btnNew) btnNew.addEventListener('click', () => { try { form.reset(); } catch(_){}; });
                    setTimeout(()=>{ if (btnPrint){ try{ btnPrint.focus(); } catch(_){} } }, 0);
                }
                if (ng) ng.style.display = 'none';
            } catch(err){
                console.error('Goma send failed', err);
                const ok = document.getElementById('goma-success'); if (ok) ok.style.display='none';
                const ng = document.getElementById('goma-error'); if (ng) ng.style.display='block';
            } finally {
                btn.disabled = false; btn.textContent = old; confirmedOnce = false;
            }
        });
    })();
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
                
                // Update active nav link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .heritage-item, .notice-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Cache-busting for local images: append same ?v= from script tag if present
    try {
        const currentScripts = Array.from(document.querySelectorAll('script[src]'));
        // Prefer the script tag that loaded this file
        const selfScript = currentScripts.reverse().find(s => /script\.js(\?|$)/.test(s.getAttribute('src')));
        let ver = '';
        if (selfScript) {
            const url = new URL(selfScript.src, window.location.origin);
            ver = url.searchParams.get('v') || '';
        }
        if (ver) {
            const imgs = Array.from(document.images);
            imgs.forEach(img => {
                // Only process local images (relative or same-origin) under images/
                const srcAttr = img.getAttribute('src') || '';
                if (!srcAttr) return;
                // Skip external URLs
                if (/^https?:\/\//i.test(srcAttr)) {
                    const u = new URL(srcAttr);
                    if (u.origin !== window.location.origin) return;
                }
                // Must target images folder
                if (!srcAttr.includes('images/')) return;
                // Avoid double-appending
                if (srcAttr.includes('v=')) return;
                const sep = srcAttr.includes('?') ? '&' : '?';
                const newSrc = `${srcAttr}${sep}v=${ver}`;
                img.setAttribute('src', newSrc);
            });
        }
    } catch (e) {
        console.warn('Image cache-busting skipped:', e);
    }

    // Museum page: auto-attach NEW badge to the current year's record header
    try {
        if (document.body.classList.contains('museum-page-body')) {
            const currentYear = new Date().getFullYear();
            const yearHeaders = document.querySelectorAll('.segaki-records-section .year-header h3');
            yearHeaders.forEach(h3 => {
                const text = h3.textContent || '';
                // Extract western year like 2025 from "令和7年（2025年）8月16日"
                const match = text.match(/(20\d{2})年/);
                if (match && parseInt(match[1], 10) === currentYear) {
                    if (!h3.querySelector('.year-badge-new')) {
                        const badge = document.createElement('span');
                        badge.className = 'year-badge-new';
                        badge.textContent = 'NEW';
                        h3.appendChild(badge);
                    }
                }
            });
        }
    } catch (e) {
        console.warn('NEW badge setup skipped:', e);
    }

    // Function to set the active navigation link based on the current page URL
    function setActiveNavLink() {
        const allNavLinks = document.querySelectorAll('.main-nav .nav-link');
        const currentPage = window.location.pathname.split('/').pop();

        allNavLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop().split('#')[0];
            link.classList.remove('active');

            // Handle index.html as the root page
            if ((currentPage === '' || currentPage === 'index.html') && (linkPage === '' || linkPage === 'index.html')) {
                 // Don't set HOME active here, let scrollspy handle it
            } else if (currentPage !== '' && currentPage !== 'index.html' && linkPage === currentPage) {
                link.classList.add('active');
            }
        });

        // If no link is active on index.html, set HOME to active by default
        if (currentPage === '' || currentPage === 'index.html') {
            const homeLink = document.querySelector('.main-nav a[href="index.html"]');
            const activeScrollLink = document.querySelector('.main-nav a[href^="#"].active');
            if (homeLink && !activeScrollLink) {
                // Temporarily add active, scrollspy will take over
                // homeLink.classList.add('active');
            }
        }
    }

    // Active navigation highlighting based on scroll position (Scrollspy)
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;
        const pageNavLinks = document.querySelectorAll('.main-nav a[href*="#"]'); // Links for current page sections

        let activeSectionFound = false;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                pageNavLinks.forEach(link => {
                    // Check if the link's href matches the sectionId
                    if (link.getAttribute('href').endsWith(`#${sectionId}`)) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
                activeSectionFound = true;
            }
        });

        // If no section is active (e.g., at the top or bottom of the page), remove active class from scroll links
        if (!activeSectionFound) {
            pageNavLinks.forEach(link => link.classList.remove('active'));
        }
    });

    // Set active link on page load
    setActiveNavLink();

    // Add loading animation for images when they would be added
    const imagePlaceholders = document.querySelectorAll('.image-placeholder');
    imagePlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            this.style.background = 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)';
            this.style.backgroundSize = '20px 20px';
            this.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
            this.innerHTML = '<span style="color: #8B4513;">画像を読み込み中...</span>';
        });
    });

    // Initialize slideshows
    const containers = document.querySelectorAll('.slideshow-container');
    containers.forEach(container => {
        const eventName = container.getAttribute('data-event');
        if (eventName) {
            slideIndex[eventName] = 1;
        }
    });
});

// Slideshow functionality
let slideIndex = {};

function changeSlide(eventName, direction) {
    const container = document.querySelector(`[data-event="${eventName}"]`);
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    const dots = container.querySelectorAll('.dot');
    
    if (!slideIndex[eventName]) {
        slideIndex[eventName] = 1;
    }
    
    slideIndex[eventName] += direction;
    
    if (slideIndex[eventName] > slides.length) {
        slideIndex[eventName] = 1;
    }
    if (slideIndex[eventName] < 1) {
        slideIndex[eventName] = slides.length;
    }
    
    showSlide(eventName, slideIndex[eventName]);
}

function currentSlide(eventName, slideNumber) {
    slideIndex[eventName] = slideNumber;
    showSlide(eventName, slideNumber);
}

function showSlide(eventName, slideNumber) {
    const container = document.querySelector(`[data-event="${eventName}"]`);
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    const dots = container.querySelectorAll('.dot');
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[slideNumber - 1]) {
        slides[slideNumber - 1].classList.add('active');
    }
    if (dots[slideNumber - 1]) {
        dots[slideNumber - 1].classList.add('active');
    }
}

// Toggle details functionality
function toggleDetails(detailsId) {
    const details = document.getElementById(detailsId);
    const button = document.querySelector(`[onclick="toggleDetails('${detailsId}')"]`);
    
    if (!details || !button) return;
    
    // Capture the button's preferred viewport anchor before layout change
    const desiredTop = window.scrollY + button.getBoundingClientRect().top - 120; // 120px margin from top

    // Close any other opened details in the same events grid to avoid large layout jumps
    const allDetails = document.querySelectorAll('.event-details-expanded.show');
    allDetails.forEach(el => {
        if (el !== details) {
            const btn = document.querySelector(`[onclick="toggleDetails('${el.id}')"]`);
            el.classList.remove('show');
            if (btn) btn.textContent = '詳細を見る';
        }
    });

    if (details.classList.contains('show')) {
        // Closing
        button.textContent = '詳細を見る';
        // Ensure overflow is hidden during transition
        details.style.overflow = 'hidden';
        // Animate height to 0
        details.style.maxHeight = '0px';
        // After transition ends, remove class and restore scroll position
        // After transition ends, keep the button near viewport to avoid feeling of "not returning"
        const onTransitionEnd = () => {
            details.removeEventListener('transitionend', onTransitionEnd);
            details.classList.remove('show');
            window.scrollTo({ top: desiredTop, behavior: 'smooth' });
        };
        details.addEventListener('transitionend', onTransitionEnd);
    } else {
        // Opening
        button.textContent = '詳細を閉じる';
        details.classList.add('show');
        // Ensure overflow is hidden and set maxHeight to content height for smooth expansion
        details.style.overflow = 'hidden';
        details.style.maxHeight = details.scrollHeight + 'px';
        // Keep context by ensuring the button remains in view (after expansion completes)
        const onTransitionEndOpen = () => {
            details.removeEventListener('transitionend', onTransitionEndOpen);
            window.scrollTo({ top: desiredTop, behavior: 'smooth' });
        };
        details.addEventListener('transitionend', onTransitionEndOpen);
    }
}

// Video placeholder functionality for museum page
function playVideo(videoId) {
    const videoPlaceholder = document.querySelector(`[data-video="${videoId}"]`);
    if (!videoPlaceholder) return;
    
    // This will be replaced with actual Vimeo embed when video URLs are provided
    const vimeoEmbed = `
        <iframe src="https://player.vimeo.com/video/VIMEO_ID_HERE?autoplay=1" 
                width="100%" height="100%" frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" allowfullscreen>
        </iframe>
    `;
    
    // For now, show a message that video will be loaded
    videoPlaceholder.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #8B4513;">
            <div style="text-align: center;">
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">動画を準備中です</p>
                <p style="font-size: 0.9rem; opacity: 0.8;">VimeoのURLが設定されると自動的に表示されます</p>
            </div>
        </div>
    `;
}

// Add click handlers for video placeholders
document.addEventListener('DOMContentLoaded', function() {
    const videoPlaceholders = document.querySelectorAll('.video-placeholder');
    videoPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video');
            if (videoId) {
                playVideo(videoId);
            }
        });
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

// EmailJS initialization
(function() {
    if (typeof emailjs !== 'undefined') {
        try {
            emailjs.init('ihjRUl-y6KLX5NFCf'); // Your actual Public Key
            console.log('EmailJS initialized successfully.');
        } catch (e) {
            console.error('Failed to initialize EmailJS:', e);
        }
    } else {
        console.warn('EmailJS script not loaded. Contact form will not function.');
    }
})();

// Contact form handler with EmailJS
function handleContactForm(e) {
    e.preventDefault();
    console.log('Form submission initiated.');

    // Honeypot check: if hidden field has any value, silently drop
    const hpValue = e.target.website ? (e.target.website.value || '').trim() : '';
    if (hpValue) {
        console.warn('Honeypot triggered. Submission ignored.');
        return; // Do not proceed
    }

    // Simple client-side rate limiting (per browser)
    try {
        const RATE_LIMIT_SECONDS = 60; // allow one submission per minute
        const nowTs = Date.now();
        const lastTs = parseInt(localStorage.getItem('contact_last_submit_ts') || '0', 10);
        if (!isNaN(lastTs) && nowTs - lastTs < RATE_LIMIT_SECONDS * 1000) {
            const remain = Math.ceil((RATE_LIMIT_SECONDS * 1000 - (nowTs - lastTs)) / 1000);
            alert(`短時間での連続送信はできません。${remain}秒後にお試しください。`);
            return;
        }
        // Store timestamp early to guard against rapid retries
        localStorage.setItem('contact_last_submit_ts', String(nowTs));
    } catch (err) {
        console.warn('Rate limit storage not available:', err);
    }

    // Basic validation (defensive)
    const name = (e.target.name?.value || '').trim();
    const email = (e.target.email?.value || '').trim();
    const phone = (e.target.phone?.value || '').trim();
    const subject = (e.target.subject?.value || '').trim();
    const message = (e.target.message?.value || '').trim();

    // Name
    if (!name || name.length > 100) {
        alert('お名前を正しく入力してください（100文字以内）。');
        return;
    }
    // Email
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRe.test(email)) {
        alert('メールアドレスの形式が正しくありません。');
        return;
    }
    // Subject
    if (!subject) {
        alert('件名を選択してください。');
        return;
    }
    // Message length
    if (message.length < 10) {
        alert('お問い合わせ内容は10文字以上でご記入ください。');
        return;
    }
    if (message.length > 5000) {
        alert('お問い合わせ内容が長すぎます。5000文字以内にしてください。');
        return;
    }
    // Optional phone: basic check if provided
    if (phone && !/^[0-9+\-()\s]{6,20}$/.test(phone)) {
        alert('電話番号の形式が正しくありません。数字と記号（+-()）のみを使用してください。');
        return;
    }

    // Check if EmailJS is available
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS is not defined. Cannot send email.');
        alert('メール送信機能の読み込みに失敗しました。お手数ですが、時間をおいて再度お試しいただくか、お電話でお問い合わせください。');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '送信中...';
    submitBtn.disabled = true;

    // Format submission date
    const now = new Date();
    const submissionDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Normalize subject to a human-readable Japanese label
    const subjectRaw = e.target.subject.value;
    const SUBJECT_LABELS = {
        contact: 'お問い合わせ',
        inquiry: 'お問い合わせ',
        prayer: 'ご祈祷',
        goma: '護摩札申込',
        memorial: '供養相談',
        consultation: 'ご相談',
        other: 'その他'
    };
    const subjectLabel = SUBJECT_LABELS[subjectRaw] || subjectRaw;

    const templateParams = {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        // Send both for compatibility
        inquiry_type: subjectLabel, // original placeholder compatibility
        kind: subjectLabel,         // for {{kind}} in shared template
        subject: subjectLabel,      // to populate template Subject {{subject}}
        message: e.target.message.value,
        remarks: e.target.message.value, // add: plain remarks for template
        remarks_html: (e.target.message.value || '').replace(/\n/g,'<br>'), // add: HTML with line breaks
        submission_date: submissionDate, // Add formatted date
        reply_to: e.target.email.value
    };

    console.log('Sending email with params:', templateParams);

    emailjs.send('service_hug4h5d', 'template_pygnzri', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            document.getElementById('form-success').style.display = 'block';
            document.getElementById('form-error').style.display = 'none';
            e.target.reset();
            document.getElementById('form-success').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, function(error) {
            console.error('FAILED...', error);
            document.getElementById('form-error').style.display = 'block';
            document.getElementById('form-success').style.display = 'none';
            document.getElementById('form-error').scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .finally(function() {
            // Reset button state regardless of success or failure
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// Simple test to verify script is loading
console.log('Script.js loaded successfully');

// Event announcement system based on dates
function initEventAnnouncements() {
    const eventContainer = document.getElementById('event-announcements');
    if (!eventContainer) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const currentDay = currentDate.getDate();
    
    // Temple event schedule - only events mentioned on the website
    const templeEvents = [
        {
            name: '春彼岸法要',
            startMonth: 3,
            startDay: 18,
            endMonth: 3,
            endDay: 24,
            description: '春のお彼岸法要のご案内',
            type: 'upcoming'
        },
        {
            name: '大施餓鬼会法要',
            startMonth: 8,
            startDay: 16,
            endMonth: 8,
            endDay: 16,
            description: '餓鬼道に堕ちた霊とご先祖様を供養いたします',
            type: 'upcoming'
        },
        {
            name: '秋彼岸法要',
            startMonth: 9,
            startDay: 20,
            endMonth: 9,
            endDay: 26,
            description: '秋のお彼岸法要のご案内',
            type: 'current'
        },
        {
            name: '十夜護摩祈祷',
            startMonth: 11,
            startDay: 23,
            endMonth: 11,
            endDay: 23,
            description: '観音堂において護摩供修行を勤修。五穀豊穣や家運隆昌を祈念',
            type: 'upcoming'
        }
    ];

    // Filter and sort events based on current date
    const relevantEvents = templeEvents.filter(event => {
        const eventStart = new Date(currentDate.getFullYear(), event.startMonth - 1, event.startDay);
        const eventEnd = new Date(currentDate.getFullYear(), event.endMonth - 1, event.endDay);
        const today = new Date(currentDate.getFullYear(), currentMonth - 1, currentDay);
        
        // Show events that are happening now or within next 60 days
        const daysDiff = Math.ceil((eventStart - today) / (1000 * 60 * 60 * 24));
        const isCurrentEvent = today >= eventStart && today <= eventEnd;
        const isUpcoming = daysDiff >= 0 && daysDiff <= 60;
        
        return isCurrentEvent || isUpcoming;
    }).sort((a, b) => {
        const aStart = new Date(currentDate.getFullYear(), a.startMonth - 1, a.startDay);
        const bStart = new Date(currentDate.getFullYear(), b.startMonth - 1, b.startDay);
        return aStart - bStart;
    });

    // Add general announcements if no specific events
    if (relevantEvents.length === 0) {
        relevantEvents.push(
            {
                name: '護摩祈祷',
                description: '毎月第1・第3日曜日に護摩祈祷を行っています',
                type: 'general',
                date: '毎月'
            },
            {
                name: '永代供養相談',
                description: '永代供養・墓地のご相談を随時承っております',
                type: 'general',
                date: '随時'
            },
            {
                name: '境内参拝',
                description: '境内見学・参拝は自由にお越しください',
                type: 'general',
                date: '随時'
            }
        );
    }

    // Generate HTML for events
    eventContainer.innerHTML = '';
    relevantEvents.slice(0, 4).forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'update-item';
        
        let dateText = '';
        if (event.type === 'general') {
            dateText = event.date;
        } else {
            const eventStart = new Date(currentDate.getFullYear(), event.startMonth - 1, event.startDay);
            const eventEnd = new Date(currentDate.getFullYear(), event.endMonth - 1, event.endDay);
            const today = new Date(currentDate.getFullYear(), currentMonth - 1, currentDay);
            
            // Check if event is currently happening
            if (today >= eventStart && today <= eventEnd) {
                if (eventStart.getTime() === eventEnd.getTime()) {
                    dateText = '本日開催';
                } else {
                    dateText = '開催中';
                }
            } else {
                // Format the date as MM/DD
                const month = event.startMonth;
                const day = event.startDay;
                
                if (event.startMonth === event.endMonth && event.startDay === event.endDay) {
                    // Single day event
                    dateText = `${month}月${day}日`;
                } else {
                    // Multi-day event
                    dateText = `${event.startMonth}月${event.startDay}日〜${event.endMonth}月${event.endDay}日`;
                }
            }
        }
        
        eventElement.innerHTML = `
            <span class="update-date">${dateText}</span>
            <span class="update-title">${event.name}${event.description ? ' - ' + event.description : ''}</span>
        `;
        
        eventContainer.appendChild(eventElement);
    });
}

// Initialize event announcements when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initEventAnnouncements();
    
    // Update announcements daily
    setInterval(initEventAnnouncements, 24 * 60 * 60 * 1000);
});

// Image slideshow functionality
function initSlideshow() {
    console.log('initSlideshow called');
    
    // Initialize Kannon Hall slideshow
    const kannonSlideshow = document.querySelector('.image-slideshow');
    console.log('Kannon slideshow container found:', kannonSlideshow);
    
    if (kannonSlideshow) {
        initSlideshowContainer(kannonSlideshow, 'Kannon Hall');
    }
    
    // Initialize Memorial Tower slideshow
    const memorialSlideshow = document.querySelector('.memorial-tower-slideshow');
    console.log('Memorial tower slideshow container found:', memorialSlideshow);
    
    if (memorialSlideshow) {
        initSlideshowContainer(memorialSlideshow, 'Memorial Tower');
    }
    
    // Initialize Shakyo slideshow
    const shakyoSlideshow = document.querySelector('.shakyo-slideshow');
    console.log('Shakyo slideshow container found:', shakyoSlideshow);
    
    if (shakyoSlideshow) {
        initSlideshowContainer(shakyoSlideshow, 'Shakyo');
    }
    
    // Initialize Memorial Tower Detailed slideshow
    const memorialDetailedSlideshow = document.querySelector('.memorial-tower-slideshow-detailed');
    console.log('Memorial tower detailed slideshow container found:', memorialDetailedSlideshow);
    
    if (memorialDetailedSlideshow) {
        initSlideshowContainerWithDescription(memorialDetailedSlideshow, 'Memorial Tower Detailed');
    }
}

function initSlideshowContainer(container, name) {
    const slideshowImages = container.querySelectorAll('.slideshow-image');
    console.log(`Found ${name} images:`, slideshowImages.length);
    
    if (slideshowImages.length > 1) {
        let currentIndex = 0;
        
        // Reset all images
        slideshowImages.forEach((img, index) => {
            img.classList.remove('active');
            console.log(`${name} Image`, index, 'classes after remove:', img.className);
            if (index === 0) {
                img.classList.add('active');
                console.log(`${name} Image`, index, 'classes after add active:', img.className);
            }
        });
        
        console.log(`Starting ${name} slideshow with`, slideshowImages.length, 'images');
        
        const slideInterval = setInterval(() => {
            console.log(`${name} Timer fired - switching from image`, currentIndex);
            
            // Remove active from current image
            slideshowImages[currentIndex].classList.remove('active');
            console.log(`${name} Removed active from image`, currentIndex);
            
            // Move to next image
            currentIndex = (currentIndex + 1) % slideshowImages.length;
            
            // Add active to next image
            slideshowImages[currentIndex].classList.add('active');
            console.log(`${name} Added active to image`, currentIndex);
            
        }, 3000); // Switch every 3 seconds
    } else {
        console.log(`${name} Not enough images for slideshow`);
    }
}

function initSlideshowContainerWithDescription(container, name) {
    const slideshowImages = container.querySelectorAll('.slideshow-image');
    const descriptionElement = document.getElementById('memorial-description');
    // Dots container (create if not present)
    let dotsContainer = container.querySelector('.slideshow-dots');
    if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'slideshow-dots';
        container.appendChild(dotsContainer);
    }
    // Ensure dots match the number of slides
    if (dotsContainer.children.length !== slideshowImages.length) {
        dotsContainer.innerHTML = '';
        slideshowImages.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
                // Jump to slide i
                // Remove active from current
                const current = container.querySelector('.slideshow-image.active');
                if (current) current.classList.remove('active');
                const currentDot = dotsContainer.querySelector('.dot.active');
                if (currentDot) currentDot.classList.remove('active');
                // Set new index
                currentIndex = i;
                slideshowImages[currentIndex].classList.add('active');
                dot.classList.add('active');
                // Update description
                const desc = slideshowImages[currentIndex].getAttribute('data-description');
                if (desc && descriptionElement) descriptionElement.textContent = desc;
            });
            dotsContainer.appendChild(dot);
        });
    }
    console.log(`Found ${name} images:`, slideshowImages.length);
    
    if (slideshowImages.length > 1 && descriptionElement) {
        let currentIndex = 0;
        
        // Reset all images and set initial description
        slideshowImages.forEach((img, index) => {
            img.classList.remove('active');
            if (index === 0) {
                img.classList.add('active');
                const description = img.getAttribute('data-description');
                if (description) {
                    descriptionElement.textContent = description;
                }
            }
        });
        
        // Initialize first dot active
        const dots = dotsContainer.querySelectorAll('.dot');
        if (dots.length) {
            dots.forEach(d => d.classList.remove('active'));
            if (dots[0]) dots[0].classList.add('active');
        }

        console.log(`Starting ${name} slideshow with descriptions`);
        
        const slideInterval = setInterval(() => {
            // Remove active from current image
            slideshowImages[currentIndex].classList.remove('active');
            
            // Move to next image
            currentIndex = (currentIndex + 1) % slideshowImages.length;
            
            // Add active to next image and update description
            const nextImage = slideshowImages[currentIndex];
            nextImage.classList.add('active');
            
            const description = nextImage.getAttribute('data-description');
            if (description && descriptionElement) {
                descriptionElement.textContent = description;
            }
            
            // Update dots
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.dot');
                dots.forEach(d => d.classList.remove('active'));
                if (dots[currentIndex]) dots[currentIndex].classList.add('active');
            }
            
            console.log(`${name} switched to image ${currentIndex} with description`);
            
        }, 10000); // Switch every 10 seconds for detailed view (GUIDE memorial)
    } else {
        console.log(`${name} Not enough images for slideshow or description element not found`);
    }
}

// Test immediate execution
console.log('About to call initSlideshow immediately');
initSlideshow();

// Try multiple ways to ensure the slideshow starts
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    initSlideshow();
});

window.addEventListener('load', function() {
    console.log('Window load fired');
    initSlideshow();
});

// Also try after delays
setTimeout(function() {
    console.log('1 second timeout fired');
    initSlideshow();
}, 1000);

setTimeout(function() {
    console.log('3 second timeout fired');
    initSlideshow();
}, 3000);
