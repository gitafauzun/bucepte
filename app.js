let tumUrunler = [];
let aktifKategori = "Tümü";
let aramaMetni = "";
let siralamaTipi = "varsayilan";

// Sayfa tamamen yüklendiğinde kodları çalıştırır
document.addEventListener('DOMContentLoaded', () => {
    urunleriYukle();
});

async function urunleriYukle() {
    try {
        const response = await fetch('urunler.json');
        if (!response.ok) throw new Error("urunler.json dosyası bulunamadı veya yüklenemedi!");
        
        tumUrunler = await response.json();
        
        kategoriMenuOlustur(tumUrunler);
        urunleriGuncelle(); 
    } catch (error) {
        console.error("Kritik Hata:", error);
        // Eğer JSON dosyasında hata varsa ekrana beyaz sayfa yerine uyarı basar:
        const vitrin = document.getElementById('urun-vitrini');
        if (vitrin) {
            vitrin.innerHTML = `<p style="color:red; text-align:center; grid-column: 1/-1; padding:20px; font-weight:bold;">
                Ürünler yüklenemedi! <br> Muhtemelen urunler.json dosyasında bir yazım hatası (virgül, parantez eksikliği) var. <br>
                Detaylı hata: ${error.message}
            </p>`;
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
    let filtrelenmis = [...tumUrunler]; // Orijinal listeyi bozmamak için kopyasını alıyoruz
    
    if (aktifKategori !== "Tümü") filtrelenmis = filtrelenmis.filter(u => u.kategori === aktifKategori);
    if (aramaMetni !== "") filtrelenmis = filtrelenmis.filter(u => u.isim && u.isim.toLowerCase().includes(aramaMetni));
    
    // Fiyattaki TL yazılarını temizleyip sadece sayıya göre sıralama yapan güvenli fonksiyon
    const fiyatNum = (fiyatStr) => {
        if (!fiyatStr) return 0;
        return parseFloat(fiyatStr.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    };

    if (siralamaTipi === "artan") filtrelenmis.sort((a, b) => fiyatNum(a.fiyat) - fiyatNum(b.fiyat));
    else if (siralamaTipi === "azalan") filtrelenmis.sort((a, b) => fiyatNum(b.fiyat) - fiyatNum(a.fiyat));

    urunleriEkranaBas(filtrelenmis);
}

function urunleriEkranaBas(urunler, hedefId = 'urun-vitrini') {
    const vitrin = document.getElementById(hedefId);
    if (!vitrin) return;
    
    vitrin.innerHTML = '';
    
    if (urunler.length === 0) {
        vitrin.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color:var(--gri-metin); padding:20px;">Aranan kriterde ürün bulunamadı.</p>`;
        return;
    }
    
    const favoriler = JSON.parse(localStorage.getItem('favoriler') || '[]');
    
    urunler.forEach(urun => {
        const isFavori = favoriler.includes(urun.id);
        const etiketHTML = (urun.etiket) ? `<span class="urun-etiket">${urun.etiket}</span>` : '';
        const kalpIkonu = isFavori ? '❤️' : '🤍';
        const favoriYazi = isFavori ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
        
        const satinAlHTML = (urun.etiket === "Tükendi") 
            ? `<button class="satin-al-btn" style="background-color: var(--gri-metin); cursor: not-allowed;" disabled>Tükendi</button>`
            : `<a href="${urun.dolapLink || '#'}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>`;

        // --- AKILLI GÖRSEL KONTROLÜ (Hem tek resim hem 3 resim destekler) ---
        let gorselWrapperHTML = '';
        let resimDizisi = [];
        
        if (urun.gorseller && Array.isArray(urun.gorseller)) {
            resimDizisi = urun.gorseller; // Yeni 3'lü sistem
        } else if (urun.gorsel) {
            resimDizisi = [urun.gorsel]; // Eski tekli sistem otomatik listeye dönüşüyor
        }

        if (resimDizisi.length > 0) {
            let resimlerHTML = '';
            resimDizisi.forEach((gorsel) => {
                resimlerHTML += `<img src="${gorsel}" alt="${urun.isim || 'Ürün'}" class="urun-resim">`;
            });

            // Sadece birden fazla resim varsa ok butonlarını koyar
            const oklarHTML = resimDizisi.length > 1 ? `
                <button class="carousel-btn onceki" onclick="carouselKaydir(this, -1)">❮</button>
                <button class="carousel-btn sonraki" onclick="carouselKaydir(this, 1)">❯</button>
            ` : '';

            gorselWrapperHTML = `
                <div class="urun-resim-wrapper">
                    <div class="urun-resim-carousel">${resimlerHTML}</div>
                    ${oklarHTML}
                </div>
            `;
        } else {
            // Eğer üründe hiç resim tanımlanmamışsa boş kalmasın
            gorselWrapperHTML = `<div class="urun-resim-wrapper" style="background:#eee; display:flex; align-items:center; justify-content:center; color:#999;">Görsel Yok</div>`;
        }

        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        kart.innerHTML = `
            ${etiketHTML}
            <button class="favori-btn ${isFavori ? 'aktif' : ''}" onclick="favoriDegistir(${urun.id})" title="${favoriYazi}">
                ${kalpIkonu}
            </button>
            ${gorselWrapperHTML}
            <p style="color:var(--gri-metin); font-size:14px;">${urun.kategori || ''}</p>
            <h3 style="margin: 10px 0; font-size:16px;">${urun.isim || ''}</h3>
            <h2 style="color:var(--ana-renk); margin-bottom:15px;">${urun.fiyat || '0 TL'}</h2>
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

// Arama kutusu ve Sıralama dinleyicilerini sayfa hazır olunca bağla
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

// Kaydırma fonksiyonu
function carouselKaydir(btn, yon) {
    const wrapper = btn.parentElement;
    const carousel = wrapper.querySelector('.urun-resim-carousel');
    if(!carousel) return;
    const kaydirmaMiktari = carousel.offsetWidth;
    
    carousel.scrollBy({ 
        left: yon * kaydirmaMiktari, 
        behavior: 'smooth' 
    });
}
