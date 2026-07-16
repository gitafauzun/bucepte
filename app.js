let tumUrunler = [];

document.addEventListener('DOMContentLoaded', () => {
    urunleriYukle();
});

async function urunleriYukle() {
    try {
        const response = await fetch('./urunler.json');
        if (!response.ok) throw new Error("Dosya bulunamadı");
        tumUrunler = await response.json();
        urunleriEkranaBas(tumUrunler);
    } catch (error) {
        console.error("Hata:", error);
    }
}

function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    vitrin.innerHTML = '';
    urunler.forEach(urun => {
        let gorsel = (urun.gorseller && urun.gorseller.length > 0) ? urun.gorseller[0] : 'placeholder.jpg';
        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        kart.onclick = () => detayModalAc(urun.id);
        kart.innerHTML = `
            <img src="${gorsel}" class="urun-resim-tek">
            <p class="kategori-etiket">${urun.kategori}</p>
            <h3 class="urun-isim">${urun.isim}</h3>
            <p class="urun-fiyat">${urun.fiyat}</p>
        `;
        vitrin.appendChild(kart);
    });
}

function detayModalAc(id) {
    const urun = tumUrunler.find(u => u.id === id);
    const modal = document.getElementById('urun-detay-modal');
    const modalDetay = document.getElementById('modal-detay-alani');
    
    const isStoktaYok = urun.fiyat === "Stokta yok";
    
    modalDetay.innerHTML = `
        <button class="kapat-btn" onclick="detayModalKapat()">×</button>
        <img src="${urun.gorseller ? urun.gorseller[0] : 'placeholder.jpg'}" class="modal-gorsel">
        <div class="modal-metin">
            <p class="kategori-etiket">${urun.kategori}</p>
            <h2>${urun.isim}</h2>
            <p class="modal-aciklama">${urun.aciklama}</p>
            <div class="modal-fiyat-alani">
                <span class="fiyat-etiketi">Fiyat</span>
                <h3 class="fiyat-degeri">${urun.fiyat}</h3>
            </div>
            <a href="${isStoktaYok ? '#' : urun.dolapLink}" target="_blank" 
               class="satin-al-btn ${isStoktaYok ? 'disabled' : ''}">
               ${isStoktaYok ? 'Stokta Yok' : 'Dolap\'tan Satın Al'}
            </a>
        </div>
    `;
    modal.style.display = "block";
}

function detayModalKapat() {
    document.getElementById('urun-detay-modal').style.display = "none";
}
