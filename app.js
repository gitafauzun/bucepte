let tumUrunler = [
    // Veri listesini buraya yapıştırın (JSON içeriğiniz)
];

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
            <div class="urun-bilgi-alani">
                <p class="kategori-etiket">${urun.kategori || ''}</p>
                <h3 class="urun-isim">${urun.isim || ''}</h3>
                <p class="urun-fiyat">${urun.fiyat || '0 TL'}</p>
            </div>
        `;
        vitrin.appendChild(kart);
    });
}

function detayModalAc(id) {
    const urun = tumUrunler.find(u => u.id === id);
    const modal = document.getElementById('urun-detay-modal');
    document.getElementById('modal-detay-alani').innerHTML = `
        <h2>${urun.isim}</h2>
        <p>${urun.aciklama}</p>
        <p><strong>${urun.fiyat}</strong></p>
        <button onclick="document.getElementById('urun-detay-modal').style.display='none'">Kapat</button>
    `;
    modal.style.display = "block";
}

// Başlangıç tetikleyici
document.addEventListener('DOMContentLoaded', () => {
    // Eğer JSON dosyası okunamıyorsa, yukarıdaki let tumUrunler içine veriyi yapıştırmayı unutmayın.
    urunleriEkranaBas(tumUrunler);
});
