import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(100, 100, 50);
        this.scene.add(dirLight);

        // Water Plane
        const waterGeometry = new THREE.PlaneGeometry(1000, 1000, 20, 20);
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x006994,
            shininess: 100,
            opacity: 0.9,
            transparent: true,
            side: THREE.DoubleSide
        });
        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI / 2;
        this.scene.add(this.water);

        // Grid helper for reference
        const gridHelper = new THREE.GridHelper(1000, 100);
        gridHelper.position.y = 0.1;
        this.scene.add(gridHelper);

        // Land/Platform (Simple dock)
        const dockGeo = new THREE.BoxGeometry(10, 1, 20);
        const dockMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        this.dock = new THREE.Mesh(dockGeo, dockMat);
        this.dock.position.set(0, 0.5, 0); // Slightly above water
        this.scene.add(this.dock);
    }

    update(dt) {
        // Simple water wave animation (optional optimization: move to shader later)
        // For now static is fine or simple color shift
    }
}
