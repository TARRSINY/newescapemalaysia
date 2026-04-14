// ── Page Navigation ──
function goPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
  const map={home:'page-home',langkawi:'page-langkawi',cameron:'page-cameron',redang:'page-redang',sabah:'page-sabah',penang:'page-penang',planner:'page-planner'};
  const el=document.getElementById(map[name]);
  if(el){el.classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}
  const nl=document.getElementById('nl-'+name);
  if(nl)nl.classList.add('active');
  setTimeout(initReveal,100);
  if(name==='planner')renderPlannerPage();
}

// ── Tabs ──
function switchTab(btn,id){
  const cont=btn.closest('.dest-content');
  cont.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  cont.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(id).classList.add('active');
  setTimeout(initReveal,50);
}

// ── Hero Slideshow ──
(function(){
  const slides=document.querySelectorAll('.hero-slide');
  const dots=document.getElementById('heroDots');
  let cur=0;
  slides.forEach((_,i)=>{const d=document.createElement('div');d.className='hero-dot'+(i===0?' active':'');d.onclick=()=>setSlide(i);dots.appendChild(d);});
  function setSlide(n){
    slides[cur].classList.remove('active');document.querySelectorAll('.hero-dot')[cur].classList.remove('active');
    cur=n;slides[cur].classList.add('active');document.querySelectorAll('.hero-dot')[cur].classList.add('active');
  }
  setInterval(()=>setSlide((cur+1)%slides.length),5000);
})();

// ── Dark Mode ──
let isDark=false;
function toggleTheme(){
  isDark=!isDark;
  document.documentElement.setAttribute('data-theme',isDark?'dark':'light');
  document.getElementById('themeBtn').textContent=isDark?'☀️':'🌙';
}



// ── Mobile Drawer ──
function toggleDrawer(){document.getElementById('drawer').classList.toggle('open');}
function closeDrawer(){document.getElementById('drawer').classList.remove('open');}

// ── Scroll Reveal ──
function initReveal(){
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el=>{
    if(!el.classList.contains('visible')){revObs.observe(el);}
  });
}
const revObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revObs.unobserve(e.target);}});
},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
setTimeout(initReveal,200);

// ── Filter Destinations ──
function filterDests(tag,btn){
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.dest-card').forEach(card=>{
    if(tag==='all'){card.classList.remove('filter-hide');}
    else{const tags=card.dataset.tags||'';card.classList.toggle('filter-hide',!tags.includes(tag));}
  });
}

// ── Filter Hotels by Tier ──
function filterHotels(tier,btn,prefix){
  const row=btn.closest('.hotel-filter-row');
  row.querySelectorAll('.hf-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const grid=document.getElementById(prefix+'-hotels-grid');
  grid.querySelectorAll('.hotel-card').forEach(card=>{
    if(tier==='all')card.classList.remove('tier-hide');
    else card.classList.toggle('tier-hide',card.dataset.tier!==tier);
  });
}

// ── Filter Hotels by Price ──
function filterByPrice(input,prefix){
  const maxPrice=parseInt(input.value);
  document.getElementById(prefix+'-price-val').textContent='RM '+maxPrice.toLocaleString();
  const grid=document.getElementById(prefix+'-hotels-grid');
  if(!grid)return;
  grid.querySelectorAll('.hotel-card').forEach(card=>{
    const price=parseInt(card.dataset.price||'9999');
    card.classList.toggle('tier-hide',price>maxPrice);
  });
}

// ── Toast ──
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
}

// ── Trip Planner ──
let tripItems={};
let tripOpen=false;

function addToTrip(id,name,emoji){
  if(tripItems[id]){
    showToast('Already in your trip! ✓');return;
  }
  tripItems[id]={id,name,emoji,from:'',to:''};
  updateTripUI();
  showToast(emoji+' '+name+' added to your trip! 🧳');
  // Mark button
  const btn=document.getElementById('trip-'+id);
  if(btn){btn.textContent='✓ Added';btn.classList.add('added');}
}

function removeFromTrip(id){
  delete tripItems[id];
  updateTripUI();
  // Reset button
  const btn=document.getElementById('trip-'+id);
  if(btn){btn.textContent='＋ Add to Trip';btn.classList.remove('added');}
}

function updateTripUI(){
  const ids=Object.keys(tripItems);
  const count=ids.length;
  const countEl=document.getElementById('tripCount');
  countEl.textContent=count;
  countEl.style.display=count>0?'flex':'none';
  document.getElementById('tripSummaryHeader').textContent=count+' destination'+(count!==1?'s':'')+' planned';
  renderTripBody();
}

function renderTripBody(){
  const ids=Object.keys(tripItems);
  const body=document.getElementById('tripBody');
  const footer=document.getElementById('tripFooter');
  const empty=document.getElementById('tripEmpty');
  if(ids.length===0){empty.style.display='block';footer.style.display='none';return;}
  empty.style.display='none';footer.style.display='block';
  // Clear old items (keep empty)
  body.querySelectorAll('.trip-item').forEach(el=>el.remove());
  ids.forEach(id=>{
    const item=tripItems[id];
    const div=document.createElement('div');
    div.className='trip-item';
    div.innerHTML=`
      <div class="trip-item-emoji">${item.emoji}</div>
      <div class="trip-item-info">
        <h5>${item.name}</h5>
        <div class="trip-date-input">
          <input type="date" placeholder="From" value="${item.from}" onchange="tripItems['${id}'].from=this.value;updateTripSummary()" title="Arrival date">
        </div>
        <div class="trip-date-input" style="margin-top:4px;">
          <input type="date" placeholder="To" value="${item.to}" onchange="tripItems['${id}'].to=this.value;updateTripSummary()" title="Departure date">
        </div>
      </div>
      <button class="trip-item-remove" onclick="removeFromTrip('${id}')" title="Remove">✕</button>
    `;
    body.appendChild(div);
  });
  updateTripSummary();
}

function updateTripSummary(){
  const ids=Object.keys(tripItems);
  const names=ids.map(id=>tripItems[id].emoji+' '+tripItems[id].name).join(' → ');
  document.getElementById('tripSummaryText').innerHTML=`<strong>Your route:</strong> ${names}`;
}

function toggleTrip(){
  tripOpen=!tripOpen;
  document.getElementById('tripWindow').classList.toggle('open',tripOpen);
}

function clearTrip(){
  tripItems={};
  document.querySelectorAll('.add-trip-btn').forEach(btn=>{
    btn.textContent='＋ Add to Trip';btn.classList.remove('added');
  });
  updateTripUI();
  showToast('Trip planner cleared 🗑️');
}

function exportTrip(){
  const ids=Object.keys(tripItems);
  if(!ids.length){showToast('Add destinations first!');return;}
  let text='🇲🇾 My Malaysia Trip Itinerary\n\n';
  ids.forEach((id,i)=>{
    const item=tripItems[id];
    text+=`${i+1}. ${item.emoji} ${item.name}`;
    if(item.from)text+=` · Arrive: ${item.from}`;
    if(item.to)text+=` · Leave: ${item.to}`;
    text+='\n';
  });
  text+='\nGenerated by MalaysiaEscape.com 🌿';
  navigator.clipboard.writeText(text).then(()=>showToast('Itinerary copied! 📋')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast('Itinerary copied! 📋');
  });
}

function renderPlannerPage(){
  const cont=document.getElementById('plannerTripList');
  const ids=Object.keys(tripItems);
  if(!ids.length){
    cont.innerHTML='<div style="text-align:center;padding:20px;color:var(--mid);font-size:14px;">No destinations added yet. Browse destinations and click ＋ Add to Trip on any card.</div>';
    return;
  }
  cont.innerHTML=`<h3 class="sub-heading">Your Planned Destinations</h3><div class="hotels-grid">
  ${ids.map(id=>{
    const item=tripItems[id];
    return `<div class="hotel-card"><div class="hotel-body">
      <div style="font-size:36px;margin-bottom:10px;">${item.emoji}</div>
      <h4>${item.name}</h4>
      ${item.from?`<div class="hotel-loc">📅 ${item.from}${item.to?' → '+item.to:''}</div>`:''}
      <div class="hotel-footer" style="margin-top:12px;">
        <button class="hotel-book-btn" onclick="goPage('${id}')">View Destination →</button>
        <button onclick="removeFromTrip('${id}');renderPlannerPage();" style="background:none;border:none;color:var(--mid);font-size:13px;cursor:pointer;">✕ Remove</button>
      </div>
    </div></div>`;
  }).join('')}
  </div>`;
}

// ── Weather ──
const weatherData=[
  {loc:'Langkawi',icon:'🌤️',temp:'31°C',cond:'Partly Cloudy',humidity:'74%'},
  {loc:'Cameron Highlands',icon:'🌫️',temp:'18°C',cond:'Misty',humidity:'88%'},
  {loc:'Redang Island',icon:'☀️',temp:'29°C',cond:'Sunny',humidity:'70%'},
  {loc:'Kota Kinabalu',icon:'⛅',temp:'30°C',cond:'Mostly Sunny',humidity:'78%'},
  {loc:'Penang',icon:'🌦️',temp:'32°C',cond:'Chance of Rain',humidity:'80%'},
];
function renderWeather(){
  const strip=document.getElementById('weatherStrip');
  strip.innerHTML=weatherData.map(w=>`
    <div class="weather-item">
      <span class="weather-icon">${w.icon}</span>
      <strong>${w.loc}</strong>
      <span class="w-temp">${w.temp}</span>
      <span>${w.cond} · 💧${w.humidity}</span>
    </div>
  `).join('');
}
renderWeather();
setInterval(()=>{
  weatherData.forEach(w=>{const d=(Math.random()-0.5)*2;const b=parseInt(w.temp);w.temp=(b+Math.round(d))+'°C';});
  renderWeather();
},30000);

// ── Chat ──
let chatOpen=false;
function toggleChat(){
  chatOpen=!chatOpen;
  const win=document.getElementById('chatWindow');
  if(chatOpen){win.classList.add('open');document.getElementById('chatUnread').style.display='none';}
  else{win.classList.remove('open');}
}
const chatKnowledge={
  langkawi:['Langkawi is best visited November to April (dry season). The monsoon runs May–October with heavy rains.','Langkawi has its own international airport with direct flights from KL (45 min), Singapore, and other regional cities.','Langkawi is duty-free! Stock up on chocolates, alcohol, cosmetics and electronics.','Top activities: Langkawi SkyCab cable car, Kilim Geoforest boat tour, island hopping, and Pantai Cenang beach.'],
  cameron:['Cameron Highlands is about 3.5 hours drive from KL via the Simpang Pulai route. Bus services from KL Sentral too.','Cameron Highlands is cool year-round (14–25°C). March–October is drier. December–January can be foggy and rainy.','Must-do: BOH Tea Sungei Palas estate (free entry), Mossy Forest on Gunung Brinchang, and strawberry picking.','Cameron is famous for BOH tea, strawberries, honey, and fresh highland vegetables. Bring a jumper — it can get chilly!'],
  redang:['Redang Island is open March to October. It CLOSES November–February due to the northeast monsoon.','Take a ferry from Shahbandar Jetty in Kuala Terengganu (45–60 min). Most resorts include ferry transfers in packages.','Redang is a marine park — no fishing allowed. Visibility regularly exceeds 20–30m.','Best snorkel spots: Beras Basah, Pulau Lima, Teluk Dalam main beach, and the reef in front of most resorts.'],
  sabah:['Fly into Kota Kinabalu International Airport (BKI) — direct flights from KL (1h40m), Singapore.','Best time: April–September for climbing Kinabalu and wildlife watching.','Book Sipadan dive permits WELL in advance — only 120 permits per day! Go through licensed operators.','For Kinabatangan wildlife, stay 2 nights at Sukau or Bilit for the best chance of seeing pygmy elephants.'],
  penang:['Penang is a year-round destination. March–April and July–August are the driest months.','George Town is walkable and compact. Hire a bicycle (RM15/day) or trishaw for the heritage zone.','Penang has some of Malaysia\'s best hawker food. Key centres: New Lane, Gurney Drive, Pulau Tikus Market.','George Town UNESCO zone is most photogenic in the morning. The Clan Jetties are magical at golden hour.'],
  general:['Malaysia is generally safe for tourists. Dress modestly when visiting mosques and temples.','The Malaysian Ringgit (MYR/RM) is the currency. ATMs are widely available. Hawkers are cash-only.','Grab is the dominant ride-hailing app in Malaysia and works in all cities. Download it before your trip!','Best time overall: Dec–Feb for west coast (Langkawi, Penang). Mar–Oct for east coast (Redang). Year-round for highlands.']
};
function askChat(q){document.getElementById('chatInput').value=q;sendChat();}
function sendChat(){
  const input=document.getElementById('chatInput');const q=input.value.trim();if(!q)return;
  addMsg('user',q);input.value='';document.getElementById('quickBtns').style.display='none';
  showTyping();
  setTimeout(()=>{removeTyping();addMsg('bot',generateAnswer(q.toLowerCase()));},800+Math.random()*600);
}
function generateAnswer(q){
  if(q.includes('langkawi'))return chatKnowledge.langkawi[Math.floor(Math.random()*chatKnowledge.langkawi.length)];
  if(q.includes('cameron')||q.includes('highland'))return chatKnowledge.cameron[Math.floor(Math.random()*chatKnowledge.cameron.length)];
  if(q.includes('redang'))return chatKnowledge.redang[Math.floor(Math.random()*chatKnowledge.redang.length)];
  if(q.includes('sabah')||q.includes('kinabalu')||q.includes('sipadan'))return chatKnowledge.sabah[Math.floor(Math.random()*chatKnowledge.sabah.length)];
  if(q.includes('penang')||q.includes('george town'))return chatKnowledge.penang[Math.floor(Math.random()*chatKnowledge.penang.length)];
  if(q.includes('food')||q.includes('eat'))return 'Malaysia is a food paradise! 🍜 Penang is the undisputed street food capital. Try: Char Kway Teow, Nasi Lemak, Asam Laksa, Roti Canai, Cendol, and Nasi Dagang. Which destination\'s food do you want more details on?';
  if(q.includes('hotel')||q.includes('stay')||q.includes('resort'))return 'Each destination has excellent options! Check the 🏨 Hotels tab on any page for curated picks from budget to luxury. You can filter by tier and price range! The Datai (Langkawi) and Sukau Rainforest Lodge (Sabah) are among Malaysia\'s finest.';
  if(q.includes('budget')||q.includes('cheap'))return 'Great budget picks: Cameron Highlands has guesthouses from RM80/night, Penang boutique stays from RM120, and Coral Redang for all-inclusive dive packages at RM300. Use the price filter on the Hotels tab to find options within your budget! 💚';
  if(q.includes('planner')||q.includes('itinerary')||q.includes('trip'))return 'Use the 🧳 Trip Planner button to add destinations and set your dates! Click the ＋ Add to Trip button that appears on any destination card when you hover. Then click 📋 Copy Itinerary to get the full plan.';
  return chatKnowledge.general[Math.floor(Math.random()*chatKnowledge.general.length)]+' 🇲🇾 Feel free to ask about any specific destination!';
}
function addMsg(type,text){
  const msgs=document.getElementById('chatMsgs');
  const d=document.createElement('div');d.className=`msg ${type}`;
  d.innerHTML=type==='bot'?`<div class="msg-avatar">🌴</div><div class="msg-bubble">${text}</div>`:`<div class="msg-bubble">${text}</div>`;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function showTyping(){
  const msgs=document.getElementById('chatMsgs');const d=document.createElement('div');
  d.className='msg bot';d.id='typing-indicator';
  d.innerHTML=`<div class="msg-avatar">🌴</div><div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function removeTyping(){const t=document.getElementById('typing-indicator');if(t)t.remove();}