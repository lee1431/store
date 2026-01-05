export class UIManager {
    constructor(game) {
        this.game = game;
        this.inventory = [];
        this.money = 0;

        // DOM Elements
        this.fishCountEl = document.getElementById('fish-count');
        this.moneyCountEl = document.getElementById('money-count');
        this.powerBarContainer = document.getElementById('power-bar-container');
        this.powerBarFill = document.getElementById('power-bar-fill');
        this.notification = document.getElementById('notification');

        this.inventoryModal = document.getElementById('inventory-modal');
        this.shopModal = document.getElementById('shop-modal');
        this.inventoryList = document.getElementById('inventory-list');
        this.shopList = document.getElementById('shop-list');

        this.setupKeys();
    }

    setupKeys() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyI') this.toggleInventory();
            if (e.code === 'KeyB') this.toggleShop();
            if (e.code === 'Escape') this.closeAll();
        });

        document.getElementById('btn-close-inv').onclick = () => this.toggleInventory();
        document.getElementById('btn-close-shop').onclick = () => this.toggleShop();

        document.getElementById('btn-sell-all').onclick = () => this.sellAll();
    }

    toggleInventory() {
        if (this.inventoryModal.style.display === 'flex') {
            this.inventoryModal.style.display = 'none';
            this.game.player.controls.lock();
        } else {
            this.closeAll();
            this.updateInventoryList();
            this.inventoryModal.style.display = 'flex';
            this.game.player.controls.unlock();
        }
    }

    toggleShop() {
        if (this.shopModal.style.display === 'flex') {
            this.shopModal.style.display = 'none';
            this.game.player.controls.lock();
        } else {
            this.closeAll();
            this.updateShopList();
            this.shopModal.style.display = 'flex';
            this.game.player.controls.unlock();
        }
    }

    closeAll() {
        this.inventoryModal.style.display = 'none';
        this.shopModal.style.display = 'none';
    }

    updateInventoryList() {
        this.inventoryList.innerHTML = '';
        if (this.inventory.length === 0) {
            this.inventoryList.innerHTML = '<p style="text-align: center; opacity: 0.5;">Empty</p>';
            return;
        }
        this.inventory.forEach(fish => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `<span>${fish.name}</span><span>${fish.weight}kg</span>`;
            this.inventoryList.appendChild(row);
        });
    }

    updateShopList() {
        this.shopList.innerHTML = '';
        let total = 0;
        this.inventory.forEach(fish => {
            total += fish.price;
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `<span>${fish.name}</span><span>$${fish.price}</span>`;
            this.shopList.appendChild(row);
        });
        document.getElementById('sell-value').textContent = total;
    }

    sellAll() {
        let total = 0;
        this.inventory.forEach(fish => total += fish.price);
        this.money += total;
        this.inventory = [];
        this.updateStats();
        this.updateShopList();
        this.showNotification(`Sold all for $${total}!`, 2000);
    }

    addFish(fish) {
        this.inventory.push(fish);
        this.updateStats();
    }

    updateStats() {
        this.fishCountEl.textContent = this.inventory.length;
        this.moneyCountEl.textContent = `$${this.money}`;
    }

    showPowerBar(show) {
        this.powerBarContainer.style.display = show ? 'block' : 'none';
    }

    updatePowerBar(percent) {
        // Color transition Green -> Red
        const r = Math.min(255, (percent * 2.55));
        const g = Math.min(255, 255 - (percent * 2.55) + 100);
        this.powerBarFill.style.width = `${percent}%`;
        this.powerBarFill.style.background = `rgb(${r},${g},0)`;
    }

    showNotification(text, duration = 2000) {
        this.notification.textContent = text;
        this.notification.style.opacity = 1;

        if (this.notifTimeout) clearTimeout(this.notifTimeout);

        if (duration > 0) {
            this.notifTimeout = setTimeout(() => {
                this.notification.style.opacity = 0;
            }, duration);
        }
    }
}
