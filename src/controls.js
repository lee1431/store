import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class Player {
    constructor(scene, domElement) {
        this.scene = scene;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Start position on the dock
        this.camera.position.set(0, 2.5, 5);

        this.controls = new PointerLockControls(this.camera, domElement);
        this.scene.add(this.camera); // Add camera to scene so child objects (rod) work

        // Input State
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.speed = 10.0;

        // Bindings
        this.setupInputs();
        this.setupClick(domElement);
    }

    setupClick(domElement) {
        // Click to lock
        document.getElementById('instructions').addEventListener('click', () => {
            this.controls.lock();
        });

        this.controls.addEventListener('lock', () => {
            document.getElementById('instructions').style.display = 'none';
            document.getElementById('ui-layer').style.pointerEvents = 'none'; // Lock mouse interaction
        });

        this.controls.addEventListener('unlock', () => {
            // Only show instructions if we are not in a modal
            const modals = document.querySelectorAll('.modal');
            let anyModalOpen = false;
            modals.forEach(m => {
                if (m.style.display === 'flex') anyModalOpen = true;
            });

            if (!anyModalOpen) {
                document.getElementById('instructions').style.display = 'flex';
            }
            document.getElementById('ui-layer').style.pointerEvents = 'auto'; // Enable mouse interaction for UI
        });
    }

    setupInputs() {
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    }

    update(dt) {
        if (this.controls.isLocked === true) {
            // Apply friction
            this.velocity.x -= this.velocity.x * 10.0 * dt;
            this.velocity.z -= this.velocity.z * 10.0 * dt;

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize(); // Ensure consistent speed in all directions

            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.speed * 10.0 * dt;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.speed * 10.0 * dt;

            this.controls.moveRight(-this.velocity.x * dt);
            this.controls.moveForward(-this.velocity.z * dt);

            // Simple bound checking (keep above water roughly)
            if (this.camera.position.y < 1.0) this.camera.position.y = 1.0;
        }
    }
}
