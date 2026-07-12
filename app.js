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
    if (!menu) return; // Menü divi yoksa hata vermesin
    
    menu.innerHTML = ''; // Önce temizle
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
    
    // Fiyatı boş olan ürünlerde sıralamanın bozulmaması için (|| 0) eklendi
    if (siralamaTipi === "artan") filtrelenmis.sort((a, b) => (parseFloat(a.fiyat) || 0) - (parseFloat(b.fiyat) || 0));
    else if (siralamaTipi === "azalan") filtrelenmis.sort((a, b) => (parseFloat(b.fiyat) || 0) - (parseFloat(a.fiyat) || 0));

    urunleriEkranaBas(filtrelenmis);
}

// Ürünleri ekrana basan fonksiyon
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
        
        // Ürün etiketi "Tükendi" ise butonu kapatır, değilse Dolap linkini koyar
        const satinAlHTML = (urun.etiket === "Tükendi") 
            ? `<button class="satin-al-btn" style="background-color: var(--gri-metin); cursor: not-allowed;" disabled>Tükendi</button>`
            : `<a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>`;

        // Yeni eklenen 3'lü Görsel Carousel Yapısı
        let gorselWrapperHTML = '';
        if (urun.gorseller && urun.gorseller.length > 0) {
            let resimlerHTML = '';
            urun.gorseller.forEach((gorsel) => {
                resimlerHTML += `<img src="${gorsel}" alt="${urun.isim}" class="urun-resim">`;
            });

            // Eğer üründe birden fazla resim varsa sağ/sol ok tuşlarını gösterir
            const oklarHTML = urun.gorseller.length > 1 ? `
                <button class="carousel-btn onceki" onclick="carouselKaydir(this, -1)">❮</button>
                <button class="carousel-btn sonraki" onclick="carouselKaydir(this, 1)">❯</button>
            ` : '';

            gorselWrapperHTML = `
                <div class="urun-resim-wrapper">
                    <div class="urun-resim-carousel">${resimlerHTML}</div>
                    ${oklarHTML}
                </div>
            `;
        }

        const kart = document.createElement('div');
        kart.className = 'urun-karti';
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

// Arama ve Sıralama Dinleyicileri (Hatalar Giderildi)
const aramaInput = document.getElementById('arama-kutusu'); // HTML'deki ID ile eşitlendi
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

// Oklara tıklandığında resmi tam 1 çerçeve boyutu kadar sağa/sola kaydıran yeni fonksiyon
function carouselKaydir(btn, yon) {
    const wrapper = btn.parentElement;
    const carousel = wrapper.querySelector('.urun-resim-carousel');
    const kaydirmaMiktari = carousel.offsetWidth; // 1 resmin net genişliği
    
    carousel.scrollBy({ 
        left: yon * kaydirmaMiktari, 
        behavior: 'smooth' 
    });
}
