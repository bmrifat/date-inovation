// =============================================
// APP STATE (centralized — no more scattered globals)
// =============================================
const State = {
    selectedDate: '',
    selectedFood: '',
    selectedActivity: '',
    userName: '',
    calMonth: null,
    calYear: null
};

// =============================================
// GLOBAL HELPERS
// =============================================

// Firebase init (config loaded from config.js)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const app = document.getElementById('app');
const heartsContainer = document.querySelector('.hearts');
let heartIntervalId = null;

// =============================================
// FLOATING HEARTS (memory-safe, capped at 15)
// =============================================
function createHeart() {
    if (!heartsContainer) return;
    if (heartsContainer.children.length >= 15) return;
    const heart = document.createElement("span");
    heart.innerHTML = "❤️";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = Math.random() * 20 + 15 + "px";
    heart.style.animationDuration = Math.random() * 4 + 4 + "s";
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 8000);
}

function startHearts() {
    for (let i = 0; i < 5; i++) setTimeout(createHeart, i * 200);
    heartIntervalId = setInterval(createHeart, 800);
}

function stopHearts() {
    if (heartIntervalId) { clearInterval(heartIntervalId); heartIntervalId = null; }
}

function playMusic() {
    const music = document.getElementById('bgMusic');
    if (music) music.play().catch(() => { });
}
document.addEventListener('click', playMusic, { once: true });

function render(html) {
    app.innerHTML = html;
    app.className = 'container fade-in';
    app.scrollTop = 0;
    window.scrollTo(0, 0);
}

function fireConfetti() {
    confetti({ particleCount: 250, spread: 150, origin: { y: 0.6 } });
}

// =============================================
// SCREEN 1 — LOADING
// =============================================
function showLoading() {
    render(`
        <div class="loader-screen">
            <div class="loader-heart">❤️</div>
            <div class="loader-text">Loading love...</div>
            <div class="loader-bar"><div class="loader-fill"></div></div>
        </div>
    `);
    setTimeout(() => showWelcome(), 2500);
}

// =============================================
// SCREEN 2 — WELCOME
// =============================================
function showWelcome() {
    render(`
        <div class="welcome-screen">
            <div class="welcome-emoji">💌</div>
            <h1 class="welcome-title">Welcome, Beautiful!</h1>
            <p class="welcome-sub">Someone special has a surprise for you...</p>
            <button class="glow-btn" id="welcomeBtn">Open Letter 💌</button>
        </div>
    `);
    document.getElementById('welcomeBtn').addEventListener('click', () => {
        fireConfetti();
        showDateMe();
    });
}

// =============================================
// SCREEN 3 — WILL YOU DATE ME?
// =============================================
function showDateMe() {
    render(`
        <div class="dateme-screen">
            <img src="assets/cat.jpg" alt="Cute Cat" class="cat">
            <h1 class="typewriter-wrap">
                <span class="typewriter" id="tw"></span><span class="tw-cursor">|</span>
            </h1>
            <p class="dateme-sub">I promise we'll have an amazing time together! 🥹</p>
            <div class="buttons">
                <button class="btn-yes" id="yesBtn">Yes 💖</button>
                <button class="btn-no" id="noBtn">No 😭</button>
            </div>
        </div>
    `);
    typewriterEffect('tw', 'Will You Go On A Date With Me? ❤️', 60);

    // No button runs away — escapes outside the card
    const noBtn = document.getElementById('noBtn');
    function runAway() {
        noBtn.style.position = 'fixed';
        noBtn.style.zIndex = '9999';
        noBtn.style.left = Math.random() * (window.innerWidth - 120) + 'px';
        noBtn.style.top = Math.random() * (window.innerHeight - 60) + 'px';
    }
    noBtn.addEventListener('mouseover', runAway);
    noBtn.addEventListener('click', runAway);

    // Yes button
    document.getElementById('yesBtn').addEventListener('click', () => {
        fireConfetti();
        showYay();
    });
}

// Typewriter
function typewriterEffect(id, text, speed) {
    const el = document.getElementById(id);
    let i = 0;
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// =============================================
// SCREEN 4 — YAY!
// =============================================
function showYay() {
    render(`
        <div class="yay-screen">
            <div class="success-emoji">🥳</div>
            <img src="assets/rifat1.png" class="cat">
            <h1>Yayyyyy!! ❤️🥹</h1>
            <p>You just made me the happiest person alive!</p>
            <button class="glow-btn" id="continueBtn">Continue 💕</button>
        </div>
    `);
    setTimeout(() => confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } }), 600);
    document.getElementById('continueBtn').addEventListener('click', showLoveLetter);
}

// =============================================
// SCREEN 5 — LOVE LETTER
// =============================================
function showLoveLetter() {
    render(`
        <div class="letter-screen">
            <div class="letter-card">
                <div class="letter-seal">💌</div>
                <p class="letter-text">
                    Hey Beautiful,<br><br>
                    I know this is a little unexpected, but I just couldn't 
                    keep my feelings hidden anymore.<br><br>
                    Every moment I think about you, my heart skips a beat. 
                    Your smile lights up my entire world. 🌍✨<br><br>
                    I want to create beautiful memories with you — 
                    share laughs, share food, share everything. 🥰<br><br>
                    So here I am, putting my heart out there...<br><br>
                    <strong>Will you give me a chance to make you the happiest? 💕</strong>
                </p>
            </div>
            <button class="glow-btn" id="letterBtn">Next 💕</button>
        </div>
    `);
    document.getElementById('letterBtn').addEventListener('click', showChooseDate);
}

// =============================================
// SCREEN 6 — CHOOSE DATE / FOOD / NAME
// =============================================

function showChooseDate() {
    render(`
        <div class="pick-page scroll-page">
            <h1>Choose Our Date ❤️</h1>
            <p>I can't wait to spend time with you 🥰</p>

            <label class="section-label">💕 What should I call you?</label>
            <input type="text" id="nameInput" class="name-input" placeholder="What name do you want me to use?" maxlength="30">

            <label class="section-label">📅 Pick a Date</label>
            <input type="hidden" id="date" value="">
            <div class="date-picker-wrap" id="datePickerWrap">
                <div class="date-display" id="dateDisplay">Tap to pick a date...</div>
            </div>

            <label class="section-label">🍽️ What should we eat?</label>
            <div class="card-grid" id="foodGrid">
                <div class="select-card" data-value="🍕 Pizza"><span class="card-emoji">🍕</span><span class="card-text">Pizza</span></div>
                <div class="select-card" data-value="🍔 Burger"><span class="card-emoji">🍔</span><span class="card-text">Burger</span></div>
                <div class="select-card" data-value="🍣 Sushi"><span class="card-emoji">🍣</span><span class="card-text">Sushi</span></div>
                <div class="select-card" data-value="🍗 Fried Chicken"><span class="card-emoji">🍗</span><span class="card-text">Chicken</span></div>
                <div class="select-card" data-value="🍜 Ramen"><span class="card-emoji">🍜</span><span class="card-text">Ramen</span></div>
                <div class="select-card" data-value="🍦 Ice Cream"><span class="card-emoji">🍦</span><span class="card-text">Ice Cream</span></div>
                <div class="select-card" data-value="🌮 Tacos"><span class="card-emoji">🌮</span><span class="card-text">Tacos</span></div>
                <div class="select-card" data-value="🧁 Cupcake"><span class="card-emoji">🧁</span><span class="card-text">Cupcake</span></div>
            </div>

            <button class="glow-btn" id="dateNextBtn">Next ❤️</button>
        </div>
    `);

    setupGrid('foodGrid');

    // Calendar setup
    setupCalendar();
    document.getElementById('datePickerWrap').addEventListener('click', (e) => {
        e.stopPropagation();
        const popup = document.getElementById('calPopup');
        if (popup && popup.classList.contains('cal-open')) {
            closeCalendar();
        } else {
            openCalendar();
        }
    });

    // Close calendar on outside click
    const onDocClick = (e) => {
        const popup = document.getElementById('calPopup');
        const wrap = document.getElementById('datePickerWrap');
        if (popup && wrap && !wrap.contains(e.target) && !popup.contains(e.target)) {
            closeCalendar();
        }
    };
    document.addEventListener('click', onDocClick);

    document.getElementById('dateNextBtn').addEventListener('click', () => {
        State.selectedDate = document.getElementById('date').value;
        const food = document.querySelector('#foodGrid .select-card.selected');
        if (!State.selectedDate) { shakeEl('datePickerWrap'); return; }
        if (!food) { shakeEl('foodGrid'); return; }
        State.selectedFood = food.getAttribute('data-value');
        State.userName = document.getElementById('nameInput').value.trim();
        if (!State.userName) { shakeEl('nameInput'); return; }
        showChooseFood();
    });
}

function setupGrid(id) {
    const grid = document.getElementById(id);
    grid.querySelectorAll('.select-card').forEach(card => {
        card.addEventListener('click', () => {
            grid.querySelectorAll('.select-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
}

function shakeEl(id) {
    const el = document.getElementById(id);
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'shake 0.4s ease';
}

// =============================================
// SCREEN 7 — CHOOSE ACTIVITY
// =============================================

function showChooseFood() {
    render(`
        <div class="pick-page scroll-page">
            <h1>What should we do? ✨</h1>
            <p>Pick an activity for our date! 🥰</p>

            <div class="card-grid" id="activityGrid">
                <div class="select-card" data-value="🎬 Movie"><span class="card-emoji">🎬</span><span class="card-text">Movie</span></div>
                <div class="select-card" data-value="🚗 Long Drive"><span class="card-emoji">🚗</span><span class="card-text">Long Drive</span></div>
                <div class="select-card" data-value="🛍️ Shopping"><span class="card-emoji">🛍️</span><span class="card-text">Shopping</span></div>
                <div class="select-card" data-value="☕ Café"><span class="card-emoji">☕</span><span class="card-text">Café</span></div>
                <div class="select-card" data-value="🌳 Park Walk"><span class="card-emoji">🌳</span><span class="card-text">Park Walk</span></div>
                <div class="select-card" data-value="🎮 Gaming"><span class="card-emoji">🎮</span><span class="card-text">Gaming</span></div>
                <div class="select-card" data-value="🎵 Concert"><span class="card-emoji">🎵</span><span class="card-text">Concert</span></div>
                <div class="select-card" data-value="🏖️ Beach"><span class="card-emoji">🏖️</span><span class="card-text">Beach</span></div>
            </div>

            <button class="glow-btn" id="actNextBtn">Next ❤️</button>
        </div>
    `);

    setupGrid('activityGrid');
    document.getElementById('actNextBtn').addEventListener('click', () => {
        const act = document.querySelector('#activityGrid .select-card.selected');
        if (!act) { shakeEl('activityGrid'); return; }
        State.selectedActivity = act.getAttribute('data-value');
        showGallery();
    });
}

// =============================================
// SCREEN 8 — GALLERY
// =============================================
function showGallery() {
    render(`
        <div class="pick-page">
            <h1>Our Memory Lane 📸</h1>
            <p>Moments I treasure with you 💕</p>
            <div class="gallery-grid">
                <div class="gallery-item"><img src="assets/cat.jpg" alt="Gallery 1"><div class="gallery-overlay">Forever 💕</div></div>
                <div class="gallery-item"><img src="assets/rifat1.png" alt="Gallery 2"><div class="gallery-overlay">Always ❤️</div></div>
                <div class="gallery-item"><img src="assets/heart.jpg" alt="Gallery 3"><div class="gallery-overlay">Together 🥰</div></div>
            </div>
            <button class="glow-btn" id="galleryBtn">Next 🎁</button>
        </div>
    `);
    document.getElementById('galleryBtn').addEventListener('click', showGiftBox);
}

// =============================================
// SCREEN 9 — GIFT BOX
// =============================================
function showGiftBox() {
    render(`
        <div class="gift-screen">
            <h1>I Got Something For You 🎁</h1>
            <p>Tap the box to open!</p>
            <div class="gift-box" id="giftBox">
                <div class="gift-lid">🎀</div>
                <div class="gift-body">🎁</div>
                <div class="gift-inside" id="giftInside"><span class="gift-heart">❤️</span></div>
            </div>
        </div>
    `);

    document.getElementById('giftBox').addEventListener('click', () => {
        const box = document.getElementById('giftBox');
        const inside = document.getElementById('giftInside');
        if (box.classList.contains('opened')) return;
        box.classList.add('opened');
        fireConfetti();
        setTimeout(() => {
            inside.classList.add('show');
        }, 500);
        setTimeout(() => showFinal(), 3000);
    });
}

// =============================================
// SCREEN 10 — FINAL PAGE
// =============================================
// =============================================
// TOAST NOTIFICATION
// =============================================
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function showFinal() {
    const d = new Date(State.selectedDate + 'T00:00:00');
    const dateFormatted = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    render(`
        <div class="final-screen">
            <div class="success-emoji">🎉</div>
            <img src="https://media.tenor.com/Qq1hnouswVwAAAAj/peach-cat-dancing.gif" class="cat">
            <h1>It's a Date! ❤️</h1>
            <p class="date-name">Dear <strong>${State.userName}</strong>, here's your date plan:</p>

            <div class="summary-cards">
                <div class="summary-card">
                    <span class="summary-emoji">📅</span>
                    <span class="summary-label">Date</span>
                    <span class="summary-value">${dateFormatted}</span>
                </div>
                <div class="summary-card">
                    <span class="summary-emoji">🍽️</span>
                    <span class="summary-label">Food</span>
                    <span class="summary-value">${State.selectedFood}</span>
                </div>
                <div class="summary-card">
                    <span class="summary-emoji">✨</span>
                    <span class="summary-label">Activity</span>
                    <span class="summary-value">${State.selectedActivity}</span>
                </div>
            </div>

            <h2 class="see-you">See you soon 💕</h2>
        </div>
    `);

    setTimeout(() => confetti({ particleCount: 150, spread: 120, origin: { y: 0.5 } }), 500);

    // Save to Firestore with error handling
    db.collection('invitations').add({
        name: State.userName,
        date: State.selectedDate,
        dateFormatted: dateFormatted,
        food: State.selectedFood,
        activity: State.selectedActivity,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        console.log('✅ Saved to Firestore!');
    }).catch(err => {
        console.error('Firestore error:', err);
        showToast('⚠️ Could not save to server, but your date plan is ready!');
    });
}

// =============================================
// CALENDAR
// =============================================
const TODAY = new Date();
const TODAY_STR = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`;

function setupCalendar() {
    State.calMonth = TODAY.getMonth();
    State.calYear = TODAY.getFullYear();
}

function buildCalendarHTML() {
    const mNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const first = new Date(State.calYear, State.calMonth, 1).getDay();
    const daysInMonth = new Date(State.calYear, State.calMonth + 1, 0).getDate();

    let h = `<div class="cal-header">
        <button type="button" class="cal-nav cal-prev">‹</button>
        <span class="cal-title">${mNames[State.calMonth]} ${State.calYear}</span>
        <button type="button" class="cal-nav cal-next">›</button>
    </div><div class="cal-weekdays">`;
    for (const d of dNames) h += `<span>${d}</span>`;
    h += `</div><div class="cal-days">`;
    for (let i = 0; i < first; i++) h += `<span class="cal-empty"></span>`;
    for (let day = 1; day <= daysInMonth; day++) {
        const ds = `${State.calYear}-${String(State.calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = ds === TODAY_STR;
        const isSelected = ds === State.selectedDate;
        let cls = 'cal-day';
        if (ds < TODAY_STR) cls = 'cal-day disabled';
        else if (isToday && isSelected) cls = 'cal-day today selected';
        else if (isToday) cls = 'cal-day today';
        else if (isSelected) cls = 'cal-day selected';
        h += `<span class="${cls}" data-date="${ds}">${day}</span>`;
    }
    h += `</div>`;
    return h;
}

function ensurePopup() {
    let p = document.getElementById('calPopup');
    if (!p) {
        p = document.createElement('div');
        p.id = 'calPopup';
        p.className = 'cal-popup';
        document.body.appendChild(p);
    }
    return p;
}

function closeCalendar() {
    const p = document.getElementById('calPopup');
    if (p) p.classList.remove('cal-open');
}

function openCalendar() {
    if (State.selectedDate) {
        const sd = new Date(State.selectedDate + 'T00:00:00');
        State.calMonth = sd.getMonth();
        State.calYear = sd.getFullYear();
    }
    const popup = ensurePopup();
    renderCalPopup(popup);
    popup.classList.add('cal-open');

    const dd = document.getElementById('dateDisplay');
    if (dd) dd.classList.add('active');

    const wrap = document.getElementById('datePickerWrap');
    const rect = wrap.getBoundingClientRect();
    popup.style.left = rect.left + 'px';
    popup.style.top = (rect.bottom + 10) + 'px';
    popup.style.transform = '';

    // Adjust if overflowing — handle mobile centering
    requestAnimationFrame(() => {
        const pr = popup.getBoundingClientRect();
        if (pr.right > window.innerWidth - 10) {
            popup.style.left = (window.innerWidth - pr.width - 15) + 'px';
        }
        if (pr.left < 10) {
            popup.style.left = '15px';
        }
        if (window.innerWidth <= 600) {
            popup.style.left = '50%';
            popup.style.transform = 'translateX(-50%)';
        }
    });
}

function renderCalPopup(popup) {
    popup.innerHTML = buildCalendarHTML();

    popup.querySelector('.cal-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        State.calMonth--;
        if (State.calMonth < 0) { State.calMonth = 11; State.calYear--; }
        renderCalPopup(popup);
    });

    popup.querySelector('.cal-next').addEventListener('click', (e) => {
        e.stopPropagation();
        State.calMonth++;
        if (State.calMonth > 11) { State.calMonth = 0; State.calYear++; }
        renderCalPopup(popup);
    });

    popup.querySelectorAll('.cal-day:not(.disabled)').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const dv = el.getAttribute('data-date');
            document.getElementById('date').value = dv;
            State.selectedDate = dv;
            popup.querySelectorAll('.cal-day').forEach(dd => dd.classList.remove('selected'));
            el.classList.add('selected');
            const d = new Date(dv + 'T00:00:00');
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const display = document.getElementById('dateDisplay');
            if (display) {
                display.textContent = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
                display.classList.add('active');
            }
            popup.classList.remove('cal-open');
        });
    });
}

// =============================================
// START
// =============================================
startHearts();
showLoading();
