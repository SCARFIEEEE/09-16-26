const galleryData = [
    {
        src: "Dependencies/1.png",
        caption: "April 23, 2026",
        title: "April 23, 2026",
        desc: ""
    },
    {
        src: "Dependencies/2.png",
        caption: "June 13, 2026",
        title: "June 13, 2026",
        desc: ""
    },
    {
        src: "Dependencies/3.png",
        caption: "June 23, 2026",
        title: "June 23, 2026",
        desc: ""
    }
];

//kill me//
const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');
const btnImg = document.getElementById('btnImg');
const buttonContainer = document.getElementById('buttonContainer');
const bgMusic = document.getElementById('bgMusic');
const photoFrame = document.getElementById('photoFrame');

const carouselViewport = document.getElementById('carouselViewport');
const carrousel = document.getElementById('carrousel');
const modalOverlay = document.getElementById('modalOverlay');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const closeModal = document.getElementById('closeModal');

let currentRotation = 0;
let autoRotate = true;
let isDragging = false;
let startX = 0;
let dragDistance = 0;
let deviceDPR = window.devicePixelRatio || 1;

// kill me part 2
function getCalculatedRadius(totalItems) {
    const isMobile = window.innerWidth < 600;
    const cardWidth = isMobile ? Math.min(window.innerWidth * 0.7, 240) : 300;
    return Math.max(isMobile ? 160 : 220, Math.round((cardWidth / 2) / Math.tan(Math.PI / totalItems)));
}

function buildCarousel() {
    carrousel.innerHTML = '';
    const totalItems = galleryData.length;
    const angleStep = 360 / totalItems;
    const radius = getCalculatedRadius(totalItems);

    galleryData.forEach((itemData, index) => {
        const angle = angleStep * index;
        
        const item = document.createElement('div');
        item.className = 'carrousel-item';
        item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;

        item.innerHTML = `
            <img src="${itemData.src}" alt="${itemData.caption}">
            <div class="slide-caption">
                <h3>${itemData.caption}</h3>
            </div>
        `;

        //pag clinick yung pics
        item.addEventListener('click', (e) => {
            if (Math.abs(dragDistance) < 6) {
                modalImg.src = itemData.src;
                modalTitle.textContent = itemData.title;
                modalDesc.textContent = itemData.desc;
                modalOverlay.classList.add('active');
            }
        });

        carrousel.appendChild(item);
    });
}

buildCarousel();

window.addEventListener('resize', () => {
    buildCarousel();
    resizeCanvas();
});

//gallery ig

function autoRotateCarousel() {
    if (autoRotate && !photoFrame.classList.contains('hidden') && !modalOverlay.classList.contains('active')) {
        currentRotation += 0.2;
        carrousel.style.transform = `rotateY(${currentRotation}deg)`;
    }
    requestAnimationFrame(autoRotateCarousel);
}
autoRotateCarousel();

//scrolling breh
window.addEventListener('wheel', (e) => {
    if (modalOverlay.classList.contains('active') || photoFrame.classList.contains('hidden')) return;
    currentRotation += e.deltaY * 0.12;
    carrousel.style.transform = `rotateY(${currentRotation}deg)`;
}, { passive: true });

//idek what ts is
const getClientX = (e) => (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;

const startDrag = (e) => {
    if (modalOverlay.classList.contains('active')) return;
    isDragging = true;
    autoRotate = false;
    dragDistance = 0;
    startX = getClientX(e);
};

const moveDrag = (e) => {
    if (!isDragging) return;
    const x = getClientX(e);
    const diff = x - startX;
    dragDistance += Math.abs(diff);
    currentRotation += diff * 0.45;
    carrousel.style.transform = `rotateY(${currentRotation}deg)`;
    startX = x;
};

const stopDrag = () => {
    isDragging = false;
    autoRotate = true;
};

//mostly mouse controls
carouselViewport.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', moveDrag);
window.addEventListener('mouseup', stopDrag);

carouselViewport.addEventListener('touchstart', startDrag, { passive: true });
window.addEventListener('touchmove', moveDrag, { passive: true });
window.addEventListener('touchend', stopDrag);

//huh
closeModal.addEventListener('click', () => modalOverlay.classList.remove('active'));
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('active');
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modalOverlay.classList.remove('active');
});

// ==========================================
// 4. GIF BUTTON & AUDIO LOGIC
// ==========================================
const staticSrc = "Dependencies/play button start.png";
const gifSrc = "Dependencies/play button.gif";
const finalFrameSrc = "Dependencies/play button end.png";
const gifDuration = 2000; 
let timer = null;

playButton.addEventListener('mouseenter', () => {
    btnImg.src = gifSrc + "?t=" + Date.now();
    timer = setTimeout(() => {
        btnImg.src = finalFrameSrc; 
    }, gifDuration);
});

playButton.addEventListener('mouseleave', () => {
    clearTimeout(timer); 
    btnImg.src = staticSrc;
});

// ==========================================
// 5. CANVAS HIGH-DPI ANIMATION LOGIC
// ==========================================
const mouse = { x: null, y: null, radius: 180 };
let flowerArray = [];
let particles = [];
let animationStage = 'idle';

function resizeCanvas() {
    deviceDPR = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * deviceDPR;
    canvas.height = window.innerHeight * deviceDPR;
    ctx.scale(deviceDPR, deviceDPR);
}
resizeCanvas();

const updatePointerPos = (x, y) => {
    if (animationStage === 'floating') {
        mouse.x = x;
        mouse.y = y;
    }
};

window.addEventListener('mousemove', (e) => updatePointerPos(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: true });

const resetPointer = () => { mouse.x = null; mouse.y = null; };
window.addEventListener('mouseleave', resetPointer);
window.addEventListener('touchend', resetPointer);

class Lily {
    constructor(startX = null, startY = null, isSpawned = false) {
        this.isSpawned = isSpawned;
        this.reset(startX, startY);
        if (!isSpawned) {
            this.y = Math.random() * window.innerHeight; 
        }
    }

    reset(startX = null, startY = null) {
        this.x = startX !== null ? startX + (Math.random() * 40 - 20) : Math.random() * window.innerWidth;
        this.y = startY !== null ? startY + (Math.random() * 40 - 20) : window.innerHeight + 60;
        
        this.targetSize = Math.random() * 16 + 14;
        this.size = this.isSpawned ? 0 : this.targetSize; 
        
        this.baseSpeedY = Math.random() * 0.8 + 0.4;
        this.speedY = this.baseSpeedY;
        this.speedX = Math.random() * 0.4 - 0.2;
        
        this.vx = 0; 
        this.vy = 0;
        this.petals = 6; 

        const isPink = Math.random() > 0.4;
        if (isPink) {
            this.hue = Math.random() * 20 + 330; 
            this.saturation = Math.random() * 30 + 70;
            this.lightness = Math.random() * 15 + 75;
        } else {
            this.hue = Math.random() * 20 + 40;
            this.saturation = Math.random() * 10 + 5;
            this.lightness = Math.random() * 10 + 90;
        }

        this.color = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        const stripeLightness = isPink ? this.lightness - 20 : this.lightness - 15;
        this.stripeColor = `hsl(${this.hue}, ${this.saturation}%, ${stripeLightness}%)`;
        
        this.stamenColor = '#f59e0b';
        this.angle = Math.random() * Math.PI * 2;
        this.baseSpin = (Math.random() * 0.01 - 0.005);
        this.spin = this.baseSpin;
        this.isCaptured = false;
    }

    draw() {
        if (this.size <= 0.1) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        for (let i = 0; i < this.petals; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2) / this.petals * i);
            
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-this.size * 0.5, -this.size * 0.6, 0, -this.size * 1.5);
            ctx.quadraticCurveTo(this.size * 0.5, -this.size * 0.6, 0, 0);
            ctx.fill();

            ctx.strokeStyle = this.stripeColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -this.size * 0.9);
            ctx.stroke();

            ctx.restore();
        }

        for (let i = 0; i < this.petals; i++) {
            ctx.save();
            ctx.rotate(((Math.PI * 2) / this.petals * i) + 0.5);
            
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(this.size * 0.2, -this.size * 0.3, this.size * 0.3, -this.size * 0.5);
            ctx.stroke();

            ctx.fillStyle = this.stamenColor;
            ctx.beginPath();
            ctx.arc(this.size * 0.3, -this.size * 0.5, this.size * 0.08, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();

        ctx.restore();
    }

    update() {
        if (this.size < this.targetSize) {
            this.size += 0.4;
        }

        this.spin = this.baseSpin;
        this.isCaptured = false;

        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.hypot(dx, dy);

            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                
                this.vx += Math.cos(angle) * force * 0.7;
                this.vy += Math.sin(angle) * force * 0.7;
                this.spin += (this.baseSpin > 0 ? 0.04 : -0.04) * force;

                if (distance < 35) {
                    this.isCaptured = true;
                }
            }
        }

        this.x += this.speedX + Math.sin(this.y * 0.008) * 0.15 + this.vx;
        this.y -= (this.speedY - this.vy);

        this.vx *= 0.88;
        this.vy *= 0.88;

        this.angle += this.spin;

        if (this.y < -60 || this.x < -60 || this.x > window.innerWidth + 60) {
            this.reset();
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = Math.random() * 6 + 3;

        const isPink = Math.random() > 0.5;
        let hue, sat, light;
        if (isPink) {
            hue = Math.random() * 20 + 330; 
            sat = Math.random() * 20 + 80;
            light = Math.random() * 20 + 70;
        } else {
            hue = 0;
            sat = 0;
            light = Math.random() * 10 + 90;
        }
        this.color = `hsl(${hue}, ${sat}%, ${light}%)`;

        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        this.rotation = Math.random() * Math.PI;
        this.spin = Math.random() * 0.2 - 0.1;
        this.type = Math.random() > 0.4 ? 'petal' : 'spark';
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;

        if (this.type === 'petal') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-this.size * 0.6, -this.size * 0.6, 0, -this.size * 1.5);
            ctx.quadraticCurveTo(this.size * 0.6, -this.size * 0.6, 0, 0);
            ctx.fill();
        } else {
            ctx.fillStyle = '#fff1f2';
            ctx.shadowColor = '#f472b6';
            ctx.shadowBlur = 8;
            ctx.fillRect(-this.size/4, -this.size/4, this.size/2, this.size/2);
        }
        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; 
        this.rotation += this.spin;
        this.alpha -= this.decay;
    }
}

function triggerExplosion(targetX, targetY) {
    const particleCount = window.innerWidth < 600 ? 80 : 130;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(targetX, targetY));
    }
}

function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    if (animationStage === 'floating') {
        let caughtCount = 0;
        flowerArray.forEach(f => { if (f.isCaptured) caughtCount++; });

        if (caughtCount >= 8 && mouse.x !== null) {
            triggerExplosion(mouse.x, mouse.y);
            flowerArray.forEach(f => {
                if (f.isCaptured || Math.hypot(f.x - mouse.x, f.y - mouse.y) < mouse.radius) {
                    f.reset(null, window.innerHeight + 100);
                }
            });
        }
    }

    for (let i = flowerArray.length - 1; i >= 0; i--) {
        flowerArray[i].update();
        flowerArray[i].draw();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    if (animationStage === 'explosion' && particles.length === 0) {
        animationStage = 'floating';
    }

    requestAnimationFrame(animate);
}

playButton.addEventListener('click', () => {
    clearTimeout(timer);
    const rect = playButton.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    buttonContainer.classList.add('hidden');
    photoFrame.classList.remove('hidden');
    animationStage = 'explosion';
    
    const lilyCount = window.innerWidth < 600 ? 25 : 45;
    flowerArray = Array.from({ length: lilyCount }, () => new Lily(null, null, true));
    triggerExplosion(x, y);

    //mobile if shits outta hand
    bgMusic.play().catch(err => console.log("Audio playback held: ", err));
});

animate();