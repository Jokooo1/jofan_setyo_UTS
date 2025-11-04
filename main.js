document.addEventListener('DOMContentLoaded', () => {
    navigate('berita'); 
    renderDaftarKlub();

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const menu = this.getAttribute('data-content');
            if (contentTabs[menu]) {
                  navigate(menu);
            }
        });
    });

    window.onclick = function(event) {
        if (event.target === clubModal) {
            clubModal.style.display = 'none';
        }
        if (event.target === newsModal) {
            newsModal.style.display = 'none';
        }
    }
});