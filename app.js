let tumUrunler = [];
let aktifKategori = "Tümü";
let aramaMetni = "";
let siralamaTipi = "varsayilan";

document.addEventListener('DOMContentLoaded', () => {
    urunleriYukle();
});

async function urunleriYukle() {
    try {
        const response = await fetch('urunler.json');
        if (!response.ok) throw new Error("urunler.json yüklenemedi!");
        tumUrunler = await response.json();
        kategoriMenuOlustur(tumUrunler);
        urunleriGuncelle(); 
    } catch (error) {
        console.error("Hata:", error);
        const vitrin = document.getElementById('urun-vitrini');
        if (vitrin) {
            vitrin.innerHTML = `<p style="color:red; text-align:center; grid-column:1/-1;">Ürünler yüklenirken JSON hatası oluştu!</p>`;
        }
    }
}

function kategoriMenuOlustur(urunler) {
    const menu = document.getElementById('kategori-menusu');
    if (!menu) return;
    menu.innerHTML = '';
    const kategoriler = ["Tümü", ...new Set(urunler.map(u => u.kategori).filter(Boolean))];
    
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
    let filtrelenmis = [...tumUrunler];
    if (aktifKategori !== "Tümü") filtrelenmis = filtrelenmis.filter(u => u.kategori === aktifKategori);
    if (aramaMetni !== "") filtrelenmis = filtrelenmis.filter(u => u.isim && u.isim.toLowerCase().includes(aramaMetni));
    
    const fiyatNum = (fiyatStr) => {
        if (!fiyatStr) return 0;
        return parseFloat(fiyatStr.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    };

    if (siralamaTipi === "artan") filtrelenmis.sort((a, b) => fiyatNum(a.fiyat) - fiyatNum(b.fiyat));
    else if (siralamaTipi === "azalan") filtrelenmis.sort((a, b) => fiyatNum(b.fiyat) - fiyatNum(a.fiyat));

    urunleriEkranaBas(filtrelenmis);
}

function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    if (!vitrin) return;
    vitrin.innerHTML = '';
    
    if (urunler.length === 0) {
        vitrin.innerHTML = `<p style="text-align:center; grid-column:1/-1; color:var(--gri-metin);">Ürün bulunamadı.</p>`;
        return;
    }
    
    const favoriler = JSON.parse(localStorage.getItem('favoriler') || '[]');
    
    urunler.forEach(urun => {
        const isFavori = favoriler.includes(urun.id);
        const etiketHTML = (urun.etiket) ? `<span class="urun-etiket">${urun.etiket}</span>` : '';
        const kalpIkonu = isFavori ? '❤️' : '🤍';
        
        const satinAlHTML = (urun.etiket === "Tükendi") 
            ? `<button class="satin-al-btn" style="background-color:var(--gri-metin); cursor:not-allowed;" disabled>Tükendi</button>`
            : `<a href="${urun.dolapLink || '#'}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>`;

        let gorselWrapperHTML = '';
        let resimDizisi = urun.gorseller && Array.isArray(urun.gorseller) ? urun.gorseller : (urun.gorsel ? [urun.gorsel] : []);

        if (resimDizisi.length > 0) {
            let resimlerHTML = '';
            resimDizisi.forEach((gorsel) => {
                resimlerHTML += `<img src="${gorsel}" alt="" class="urun-resim">`;
            });
            const oklarHTML = resimDizisi.length > 1 ? `
                <button class="carousel-btn onceki" onclick="event.stopPropagation(); carouselKaydir(this, -1)">❮</button>
                <button class="carousel-btn sonraki" onclick="event.stopPropagation(); carouselKaydir(this, 1)">❯</button>
            ` : '';

            // Resim alanına tıklandığında detay pop-up'ını açar (event.stopPropagation butonları korur)
            gorselWrapperHTML = `
                <div class="urun-resim-wrapper" onclick="detayModalAc(${urun.id})">
                    <div class="urun-resim-carousel">${resimlerHTML}</div>
                    ${oklarHTML}
                </div>
            `;
        }

        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        kart.innerHTML = `
            ${etiketHTML}
            <button class="favori-btn ${isFavori ? 'aktif' : ''}" onclick="event.stopPropagation(); favoriDegistir(${urun.id})">
                ${kalpIkonu}
            </button>
            ${gorselWrapperHTML}
            <p style="color:var(--gri-metin); font-size:14px;">${urun.kategori || ''}</p>
            <h3 style="margin:10px 0; font-size:16px; cursor:pointer;" onclick="detayModalAc(${urun.id})">${urun.isim || ''}</h3>
            <h2 style="color:var(--ana-renk); margin-bottom:15px;">${urun.fiyat || '0 TL'}</h2>
            ${satinAlHTML}
        `;
        vitrin.appendChild(kart);
    });
}

// --- YENİ EKLENEN POP-UP (MODAL) FONKSİYONLARI ---
function detayModalAc(id) {
    const urun = tumUrunler.find(u => u.id === id);
    if (!urun) return;
    
    const modal = document.getElementById('urun-detay-modal');
    const alani = document.getElementById('modal-detay-alani');
    
    let resimDizisi = urun.gorseller && Array.isArray(urun.gorseller) ? urun.gorseller : (urun.gorsel ? [urun.gorsel] : []);
    let resimlerHTML = '';
    resimDizisi.forEach(g => {
        resimlerHTML += `<img src="${g}" alt="" class="urun-resim">`;
    });
    
    const oklarHTML = resimDizisi.length > 1 ? `
        <button class="carousel-btn onceki" onclick="carouselKaydir(this, -1)">❮</button>
        <button class="carousel-btn sonraki" onclick="carouselKaydir(this, 1)">❯</button>
    ` : '';

    alani.innerHTML = `
        <div class="modal-detay-tasarim">
            <div class="urun-resim-wrapper modal-resim-wrapper" style="height: 280px;">
                <div class="urun-resim-carousel">${resimlerHTML}</div>
                ${oklarHTML}
            </div>
            <div class="modal-bilgi">
                <p style="color:var(--gri-metin); margin:0;">${urun.kategori || ''}</p>
                <h2 style="margin: 10px 0; font-size: 20px;">${urun.isim || ''}</h2>
                <h3 style="color:var(--ana-renk); margin: 0; font-size: 22px;">${urun.fiyat || '0 TL'}</h3>
                <div class="modal-aciklama">${urun.aciklama || 'Bu ürün için detaylı açıklama girilmemiştir.'}</div>
                <a href="${urun.dolapLink || '#'}" target="_blank" class="satin-al-btn" style="text-align:center; display:block; text-decoration:none;">Dolap'tan Satın Al</a>
            </div>
        </div>
    `;
    
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Detay açıkken arka plan kaymasın
}

function detayModalKapat() {
    document.getElementById('urun-detay-modal').style.display = "none";
    document.body.style.overflow = "auto"; // Kaydırmayı geri aç
}

// Dışarı tıklayınca kapatma
window.addEventListener('click', (e) => {
    const modal = document.getElementById('urun-detay-modal');
    if (e.target === modal) detayModalKapat();
});

function favoriDegistir(id) {
    let favoriler = JSON.parse(localStorage.getItem('favoriler') || '[]');
    if (favoriler.includes(id)) favoriler = favoriler.filter(fId => fId !== id);
    else favoriler.push(id);
    localStorage.setItem('favoriler', JSON.stringify(favoriler));
    urunleriGuncelle();
}

window.addEventListener('load', () => {
    const aramaInput = document.getElementById('arama-kutusu');
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
});

function carouselKaydir(btn, yon) {
    const wrapper = btn.parentElement;
    const carousel = wrapper.querySelector('.urun-resim-carousel');
    if(!carousel) return;
    const kaydirmaMiktari = carousel.offsetWidth;
    carousel.scrollBy({ left: yon * kaydirmaMiktari, behavior: 'smooth' });
}
