/*
  script.js
  - Modular vanilla JS
  - Controles: loading, menu, scroll reveal, mapa interativo, filtros, modal, gallery, contact form
*/

(() => {
  'use strict';

  // Helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // Loading
  const loading = $('#loading');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if(loading) loading.style.display = 'none';
    }, 600);
  });

  // Header scroll effect
  const header = $('#header');
  window.addEventListener('scroll', () => {
    if(window.scrollY > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  });

  // Nav toggle (mobile)
  const navToggle = $('#navToggle');
  navToggle && navToggle.addEventListener('click', ()=>{
    document.body.classList.toggle('nav-open');
    $('#mainNav').classList.toggle('open');
  });

  // Smooth scroll for internal links
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if(href.startsWith('#') && href.length>1){
        e.preventDefault();
        const target = document.querySelector(href);
        if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // Scroll reveal using IntersectionObserver
  const srObserver = new IntersectionObserver((items)=>{
    items.forEach(i=>{
      if(i.isIntersecting){
        i.target.classList.add('sr-show');
        srObserver.unobserve(i.target);
      }
    });
  },{threshold:0.12});
  $$('.sr-hide').forEach(el=>srObserver.observe(el));

  // Generate map grid (example A,B,C x 6)
  const mapGrid = $('#mapGrid');
  const lots = [];
  const statuses = ['disponivel','reservado','vendido'];
  ['A','B','C'].forEach(q => {
    for(let i=1;i<=6;i++){
      const id = `${q}${String(i).padStart(2,'0')}`;
      const status = statuses[Math.floor(Math.random()*statuses.length)];
      const area = (300 + Math.floor(Math.random()*600));
      const value = (30000 + Math.floor(Math.random()*200000));
      const lot = {number:id,quadra:q,area,value,status,desc:'Lote bem localizado com excelente topografia.'};
      lots.push(lot);
    }
  });

  function renderMap(){
    if(!mapGrid) return;
    mapGrid.innerHTML = '';
    lots.forEach(l => {
      const btn = document.createElement('button');
      btn.className = 'map-lote';
      btn.textContent = l.number;
      btn.dataset.number = l.number;
      btn.dataset.quadra = l.quadra;
      btn.dataset.status = l.status;
      btn.dataset.area = l.area;
      btn.dataset.value = l.value;
      btn.addEventListener('click', ()=>openLoteModal(l));
      mapGrid.appendChild(btn);
    });
  }
  renderMap();

  // Modal
  const loteModal = $('#loteModal');
  const modalBody = $('#modalBody');
  const modalClose = $('#modalClose');
  function openLoteModal(l){
    if(!loteModal) return;
    modalBody.innerHTML = `
      <h3>${l.number} - Quadra ${l.quadra}</h3>
      <p><strong>Área:</strong> ${l.area} m²</p>
      <p><strong>Valor:</strong> R$ ${l.value.toLocaleString()}</p>
      <p><strong>Status:</strong> ${l.status}</p>
      <p>${l.desc}</p>
      <div style="margin-top:14px"><button class='btn btn-gold' id='interesseBtn'>Tenho Interesse</button></div>
    `;
    loteModal.classList.add('show');
    loteModal.setAttribute('aria-hidden','false');
    const interesseBtn = $('#interesseBtn');
    interesseBtn && interesseBtn.addEventListener('click', ()=>{
      alert('Obrigado pelo interesse! A corretora entrará em contato.');
    });
  }
  modalClose && modalClose.addEventListener('click', closeModal);
  loteModal && loteModal.addEventListener('click', e=>{ if(e.target===loteModal) closeModal(); });
  function closeModal(){ loteModal.classList.remove('show'); loteModal.setAttribute('aria-hidden','true'); }

  // Render lot cards
  const lotList = $('#lotList');
  function renderLots(list){
    if(!lotList) return;
    lotList.innerHTML = '';
    list.forEach(l=>{
      const card = document.createElement('article');
      card.className = 'card lot-card';
      card.innerHTML = `
        <img src="https://picsum.photos/seed/${l.number}/800/480" alt="${l.number}">
        <div class="lot-info">
          <h4>${l.number} — Quadra ${l.quadra}</h4>
          <p>Área: ${l.area} m² — Valor: R$ ${l.value.toLocaleString()}</p>
          <p>Status: <strong>${l.status}</strong></p>
          <div style="margin-top:8px"><button class='btn btn-outline' data-lote='${l.number}'>Ver Detalhes</button></div>
        </div>
      `;
      lotList.appendChild(card);
    });
    // Attach detail buttons
    $$('.lot-info .btn-outline').forEach(b=>b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.lote;
      const lote = lots.find(x=>x.number===id);
      lote && openLoteModal(lote);
    }));
  }
  renderLots(lots.slice(0,12));

  // Filters
  const btnFilter = $('#btnFilter');
  const btnReset = $('#btnReset');
  btnFilter && btnFilter.addEventListener('click', applyFilters);
  btnReset && btnReset.addEventListener('click', ()=>{
    $('#searchLote').value='';$('#selectQuadra').value='';$('#selectStatus').value='';$('#selectMetragem').value='';$('#selectFaixa').value=''; renderLots(lots.slice(0,12)); renderMap();
  });

  function applyFilters(){
    const q = $('#searchLote').value.trim().toUpperCase();
    const quadra = $('#selectQuadra').value;
    const status = $('#selectStatus').value;
    const metragem = $('#selectMetragem').value;
    const faixa = $('#selectFaixa').value;
    let filtered = lots.slice();
    if(q) filtered = filtered.filter(l=>l.number.includes(q));
    if(quadra) filtered = filtered.filter(l=>l.quadra===quadra);
    if(status) filtered = filtered.filter(l=>l.status===status);
    if(metragem){
      if(metragem==='<400') filtered = filtered.filter(l=>l.area<400);
      else if(metragem==='400-700') filtered = filtered.filter(l=>l.area>=400 && l.area<=700);
      else if(metragem==='>700') filtered = filtered.filter(l=>l.area>700);
    }
    if(faixa){
      const [min,max] = faixa.split('-').map(n=>Number(n));
      filtered = filtered.filter(l=>l.value>=min && l.value<=max);
    }
    renderLots(filtered.slice(0,12));
    // update map appearances
    renderMap();
    // mark visible
    if(mapGrid){
      $$('.map-lote').forEach(btn=>{
        const id = btn.dataset.number;
        btn.style.opacity = filtered.some(f=>f.number===id)? '1':'0.25';
      });
    }
  }

  // Gallery lightbox (simple)
  $('#gallery') && $('#gallery').addEventListener('click', e=>{
    const a = e.target.closest('a');
    if(!a) return;
    e.preventDefault();
    const img = a.querySelector('img');
    if(!img) return;
    // open modal with image
    modalBody.innerHTML = `<img src='${img.src}' style='width:100%;height:auto;border-radius:8px'>`;
    loteModal.classList.add('show'); loteModal.setAttribute('aria-hidden','false');
  });

  // Back to top
  const backToTop = $('#backToTop');
  backToTop && backToTop.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Year in footer
  $('#year') && ($('#year').textContent = new Date().getFullYear());

  // WhatsApp fab default
  $('#whatsappFab') && $('#whatsappFab').addEventListener('click', e=>{
    e.preventDefault(); window.open('https://wa.me/5511999999999','_blank');
  });

  // FAQ accordion
  $$('#faq .faq-q').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const item = btn.parentElement;
      item.classList.toggle('open');
    });
  });

  // Contact form validation
  const contactForm = $('#contactForm');
  contactForm && contactForm.addEventListener('submit', e=>{
    e.preventDefault();
    const nome = $('#nome').value.trim();
    const email = $('#email').value.trim();
    const msg = $('#mensagem').value.trim();
    if(!nome || !email || !msg){ alert('Por favor preencha os campos obrigatórios.'); return; }
    // fake submit
    alert('Mensagem enviada! Em breve entraremos em contato.');
    contactForm.reset();
  });

  // Parallax effect (subtle)
  const heroBg = document.querySelector('.hero-bg');
  window.addEventListener('scroll', ()=>{
    if(heroBg){
      heroBg.style.transform = `translateY(${window.scrollY*0.12}px) scale(1.05)`;
    }
  });

})();
