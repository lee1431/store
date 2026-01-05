import * as THREE from 'three';
import { World } from './world.js';
import { Player } from './controls.js';
import { FishingSystem } from './fishing.js';
import { UIManager } from './ui.js';

class Game {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);

        this.clock = new THREE.Clock();

        // Components
        this.world = new World(this.scene);
        this.player = new Player(this.scene, document.body);
        this.ui = new UIManager(this);
        this.fishing = new FishingSystem(this.scene, this.player.camera, this.ui);

        // Event Listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start Loop
        this.animate();
    }

    onWindowResize() {
        this.player.camera.aspect = window.innerWidth / window.innerHeight;
        this.player.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const dt = this.clock.getDelta();

        // Updates
        this.player.update(dt);
        this.fishing.update(dt);
        this.world.update(dt);

        this.renderer.render(this.scene, this.player.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
