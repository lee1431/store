import * as THREE from 'three';

const STATES = {
    IDLE: 0,
    CHARGING: 1,
    CASTING: 2,
    WAITING: 3,
    BITING: 4,
    REELING: 5
};

const FISH_TYPES = [
    { name: "Sardine", price: 5, weight: 0.1, color: "#C0C0C0" },
    { name: "Mackerel", price: 15, weight: 0.5, color: "#3a7ca5" },
    { name: "Red Snapper", price: 50, weight: 2.0, color: "#d9534f" },
    { name: "Tuna", price: 150, weight: 10.0, color: "#00008b" },
    { name: "Goldfish", price: 500, weight: 0.2, color: "#FFD700" }
];

export class FishingSystem {
    constructor(scene, camera, ui) {
        this.scene = scene;
        this.camera = camera;
        this.ui = ui;

        this.state = STATES.IDLE;

        // Rod Setup
        this.setupRod();

        // Bobber Setup
        this.bobber = null;
        this.velocity = new THREE.Vector3();

        // Mechanics constants
        this.chargePower = 0;
        this.maxPower = 30;
        this.gravity = 9.8;

        // Timers
        this.biteTimer = 0;
        this.biteWindow = 0;

        this.setupInputs();
    }

    setupRod() {
        // Simple Rod Mesh attached to camera
        const geometry = new THREE.CylinderGeometry(0.02, 0.05, 2, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        this.rod = new THREE.Mesh(geometry, material);

        // Position relative to camera (right hand side)
        this.rod.position.set(0.5, -0.5, -1);
        this.rod.rotation.x = Math.PI / 3;

        this.camera.add(this.rod);
    }

    setupInputs() {
        document.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || !document.pointerLockElement) return; // Only Left Click and valid lock

            if (this.state === STATES.IDLE) {
                this.state = STATES.CHARGING;
                this.chargePower = 0;
                this.ui.showPowerBar(true);
            } else if (this.state === STATES.WAITING || this.state === STATES.BITING) {
                this.reelIn();
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button !== 0 || !document.pointerLockElement) return;

            if (this.state === STATES.CHARGING) {
                this.cast();
            }
        });
    }

    cast() {
        this.state = STATES.CASTING;
        this.ui.showPowerBar(false);

        // Create Bobber
        const geo = new THREE.SphereGeometry(0.1, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.bobber = new THREE.Mesh(geo, mat);

        // Start position (tip of rod roughly, converted to world space)
        // Simply starting at camera position + forward offset for simplicity
        const startPos = new THREE.Vector3(0, 0, -1).applyMatrix4(this.camera.matrixWorld);
        this.bobber.position.copy(startPos);

        this.scene.add(this.bobber);

        // Calculate Velocity based on Camera direction
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);

        // Add some upward arc
        dir.y += 0.5;
        dir.normalize();

        const speed = 10 + (this.chargePower / 100) * 20; // Base 10 + up to 20
        this.velocity.copy(dir).multiplyScalar(speed);

        this.ui.showNotification("Cast!", 1000);
    }

    reelIn() {
        if (this.state === STATES.BITING) {
            // Success!
            this.handleSuccess();
        } else {
            // Failure (Too early)
            this.ui.showNotification("Too early!", 1000);
            this.reset();
        }
    }

    handleSuccess() {
        // Pick random fish
        const r = Math.random();
        let fish = FISH_TYPES[0];
        if (r > 0.95) fish = FISH_TYPES[4];
        else if (r > 0.85) fish = FISH_TYPES[3];
        else if (r > 0.7) fish = FISH_TYPES[2];
        else if (r > 0.4) fish = FISH_TYPES[1];

        this.ui.showNotification(`Caught a ${fish.name}!`, 2000);
        this.ui.addFish(fish);
        this.reset();
    }

    reset() {
        if (this.bobber) {
            this.scene.remove(this.bobber);
            this.bobber = null;
        }
        this.state = STATES.IDLE;

        // Reset Rod Animation if any
        this.rod.rotation.x = Math.PI / 3;
    }

    update(dt) {
        // Charging Logic
        if (this.state === STATES.CHARGING) {
            this.chargePower += 100 * dt; // Full power in 1 sec
            if (this.chargePower > 100) this.chargePower = 100;
            this.ui.updatePowerBar(this.chargePower);

            // Wobble rod
            this.rod.rotation.z = Math.sin(Date.now() * 0.02) * 0.05;
        } else {
            this.rod.rotation.z = 0;
        }

        // Bobber Physics
        if (this.bobber) {
            if (this.state === STATES.CASTING) {
                this.velocity.y -= this.gravity * dt;
                this.bobber.position.addScaledVector(this.velocity, dt);

                // Hit Water
                if (this.bobber.position.y <= 0) {
                    this.bobber.position.y = 0;
                    this.state = STATES.WAITING;
                    this.biteTimer = 2 + Math.random() * 5; // 2-7 seconds wait
                    this.velocity.set(0, 0, 0);
                    this.ui.showNotification("Waiting...", 1000);
                }
            } else if (this.state === STATES.WAITING) {
                // Float animation
                this.bobber.position.y = Math.sin(Date.now() * 0.005) * 0.05;

                this.biteTimer -= dt;
                if (this.biteTimer <= 0) {
                    this.state = STATES.BITING;
                    this.biteWindow = 0.5 + Math.random() * 0.5; // 0.5 - 1.0s reaction time

                    // Visual/Audio cue
                    this.bobber.material.color.setHex(0xffff00); // Yellow
                    this.bobber.scale.setScalar(1.5);
                    this.ui.showNotification("!!!", 0); // Permanent until click
                }
            } else if (this.state === STATES.BITING) {
                // Intense shaking/dipping
                this.bobber.position.y = -0.2 + Math.random() * 0.1;

                this.biteWindow -= dt;
                if (this.biteWindow <= 0) {
                    // Failed to catch
                    this.ui.showNotification("Got away...", 1000);
                    this.reset();
                }
            }
        }
    }
}
