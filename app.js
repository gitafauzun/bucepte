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
    
    if (siralamaTipi === "artan") filtrelenmis.sort((a, b) => parseFloat(a.fiyat) - parseFloat(b.fiyat));
    else if (siralamaTipi === "azalan") filtrelenmis.sort((a, b) => parseFloat(b.fiyat) - parseFloat(a.fiyat));

    urunleriEkranaBas(filtrelenmis);
}

// ürünleri ekrana bas
function urunleriEkranaBas(urunler, hedefId = 'urun-vitrini') {
    const vitrin = document.getElementById(hedefId);
    if (!vitrin) return;
    
    vitrin.innerHTML = '';
    
    const favoriler = JSON.parse(localStorage.getItem('favoriler') || '[]');
    
    urunler.forEach(urun => {
        // Hatanın çözümü: isFavori burada tanımlanıyor
        const isFavori = favoriler.includes(urun.id);
        const etiketHTML = (urun.etiket) ? `<span class="urun-etiket">${urun.etiket}</span>` : '';
        const kalpIkonu = isFavori ? '❤️' : '🤍';
        const favoriYazi = isFavori ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
        
        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        kart.innerHTML = `
            ${etiketHTML}
            <button class="favori-btn ${isFavori ? 'aktif' : ''}" onclick="favoriDegistir(${urun.id})" title="${favoriYazi}">
                ${kalpIkonu}
            </button>
            <img src="${urun.gorsel}" alt="${urun.isim}">
            <p style="color:var(--gri-metin); font-size:14px;">${urun.kategori}</p>
            <h3 style="margin: 10px 0; font-size:16px;">${urun.isim}</h3>
            <h2 style="color:var(--ana-renk); margin-bottom:15px;">${urun.fiyat}</h2>
            <a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>
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

// Arama ve sıralama dinleyicileri
const aramaInput = document.getElementById('arama-kutusu');
if(aramaInput) aramaInput.addEventListener('input', (e) => { aramaMetni = e.target.value.toLowerCase(); urunleriGuncelle(); });

const siralamaSelect = document.getElementById('siralama-kutusu');
if(siralamaSelect) siralamaSelect.addEventListener('change', (e) => { siralamaTipi = e.target.value; urunleriGuncelle(); });
