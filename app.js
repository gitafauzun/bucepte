let tumUrunler = [];
let aktifKategori = "Tümü";
let aramaMetni = "";
let siralamaTipi = "varsayilan";

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    urunleriYukle();
});

async function urunleriYukle() {
    try {
        const response = await fetch('urunler.json');
        if (!response.ok) throw new Error("Dosya bulunamadı");
        tumUrunler = await response.json();
        kategoriMenuOlustur(tumUrunler);
        urunleriGuncelle();
    } catch (error) {
        console.error("Ürün yükleme hatası:", error);
    }
}

function kategoriMenuOlustur(urunler) {
    const menu = document.getElementById('kategori-menusu');
    if (!menu) return;
    menu.innerHTML = '';
    const kategoriler = ["Tümü", ...new Set(urunler.map(u => u.kategori))];
    kategoriler.forEach(kat => {
        const btn = document.createElement('button');
        btn.textContent = kat;
        btn.className = 'kategori-btn';
        if(kat === "Tümü") btn.classList.add('aktif');
        btn.onclick = (e) => {
            document.querySelectorAll('.kategori-btn').forEach(b => b.classList.remove('aktif'));
            e.target.classList.add('aktif');
            aktifKategori = kat;
            urunleriGuncelle();
        };
        menu.appendChild(btn);
    });
}

function urunleriGuncelle() {
    let filtrelenmis = tumUrunler;
    if (aktifKategori !== "Tümü") filtrelenmis = filtrelenmis.filter(u => u.kategori === aktifKategori);
    if (aramaMetni !== "") filtrelenmis = filtrelenmis.filter(u => u.isim.toLowerCase().includes(aramaMetni));

    if (siralamaTipi === "artan") {
        filtrelenmis.sort((a, b) => (parseFloat(a.fiyat) || 0) - (parseFloat(b.fiyat) || 0));
    } else if (siralamaTipi === "azalan") {
        filtrelenmis.sort((a, b) => (parseFloat(b.fiyat) || 0) - (parseFloat(b.fiyat) || 0));
    }

    urunleriEkranaBas(filtrelenmis);
}

function urunleriEkranaBas(urunler, hedefId = 'urun-vitrini') {
    const vitrin = document.getElementById(hedefId);
    if (!vitrin) return;
    vitrin.innerHTML = '';
    const favoriler = JSON.parse(localStorage.getItem('favoriler') || '[]');

    urunler.forEach(urun => {
        const isFavori = favoriler.includes(urun.id);
        const etiketHTML = (urun.etiket) ? `<span class="urun-etiket">${urun.etiket}</span>` : '';
        const kalpIkonu = isFavori ? '❤️' : '🤍';
        const favoriYazi = isFavori ? 'Favorilerden Çıkar' : 'Favorilere Ekle';

        // Tükendi durumu için buton
        const satinAlHTML = (urun.etiket === "Tükendi")
            ? `<button class="satin-al-btn" style="background-color: var(--gri-metin); cursor: not-allowed;" disabled>Tükendi</button>`
            : `<a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>`;

        const kart = document.createElement('div');
        kart.className = 'urun-karti';

        // Carousel için resim wrapperı
        let gorselWrapperHTML = '';
        if (urun.gorseller && urun.gorseller.length > 0) {
            const wrapperClass = 'urun-resim-wrapper';
            const innerClass = 'urun-resim-carousel';
            let resimlerHTML = '';
            urun.gorseller.forEach((gorsel, index) => {
                resimlerHTML += `<img src="${gorsel}" alt="${urun.isim} - Resim ${index + 1}" class="urun-resim">`;
            });

            gorselWrapperHTML = `
                <div class="${wrapperClass}">
                    <div class="${innerClass}">${resimlerHTML}</div>
                    ${urun.gorseller.length > 1 ? `<button class="carousel-btn onceki" onclick="carouselKaydir(this, -1)">❮</button><button class="carousel-btn sonraki" onclick="carouselKaydir(this, 1)">❯</button>` : ''}
                </div>
            `;
        }

        kart.innerHTML = `
            ${etiketHTML}
            <button class="favori-btn ${isFavori ? 'aktif' : ''}" onclick="favoriDegistir(${urun.id})" title="${favoriYazi}">
                ${kalpIkonu}
            </button>
            ${gorselWrapperHTML} <p style="color:var(--gri-metin); font-size:14px;">${urun.kategori}</p>
            <h3 style="margin: 10px 0; font-size:16px;">${urun.isim}</h3>
            <h2 style="color:var(--ana-renk); margin-bottom:15px;">${urun.fiyat}</h2>
            ${satinAlHTML}
        `;
        vitrin.appendChild(kart);
    });
}

function favoriDegistir(id) {
    let favoriler = JSON.parse(localStorage.getItem('favoriler') || '[]');
    if (favoriler.includes(id)) favoriler = favoriler.filter(fId => fId !== id);
    else favoriler.push(id);
    localStorage.setItem('favoriler', JSON.stringify(favoriler));
    urunleriGuncelle();
}

// Search and sort listeners - ID DÜZELTİLDİ
const aramaInput = document.getElementById('arama-kutusu'); // 'search-box' yerine 'arama-kutusu'
if(aramaInput) {
    aramaInput.addEventListener('input', (e) => {
        aramaMetni = e.target.value.toLowerCase();
        urunleriGuncelle();
    });
}

const siralamaSelect = document.getElementById('siralama-kutusu');
if(siralamaSelect) {
    siralamaSelect.addEventListener('change', (e) => {
        siralamaTipi = e.target.value;
        urunleriGuncelle();
    });
}

// Carousel kaydırma fonksiyonu
function carouselKaydir(btn, yon) {
    const wrapper = btn.parentElement;
    const carousel = wrapper.querySelector('.urun-resim-carousel');
    const resimler = carousel.querySelectorAll('.urun-resim');
    const resimGenisligi = resimler[0].offsetWidth;
    const gecerliIndex = Math.round(carousel.scrollLeft / resimGenisligi);
    let yeniIndex = gecerliIndex + yon;

    if (yeniIndex < 0) yeniIndex = resimler.length - 1;
    if (yeniIndex >= resimler.length) yeniIndex = 0;

    carousel.scrollTo({
        left: yeniIndex * resimGenisligi,
        behavior: 'smooth'
    });
}
