// Three.js 3D Golden Can
(function() {
    'use strict';

    let scene, camera, renderer, canGroup, controls;
    let container;
    let animationId;
    let isVisible = false;

    function finishSceneSetup() {
        // Add lights
        setupLighting();

        // Orbit controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 2.0;
            controls.enablePan = false;
            controls.minDistance = 4;
            controls.maxDistance = 15;
            controls.target.set(0, 0, 0);
        }

        // Handle resize
        window.addEventListener('resize', onResize);

        // Start animation loop
        animate();
    }

    function init() {
        container = document.getElementById('can-3d-container');
        if (!container) return;

        const width = container.clientWidth || 300;
        const height = container.clientHeight || 500;

        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 8);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // Load external can label texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            'assets/images/bottle/can-label.png',
            function(texture) {
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                buildBeerCan(texture);
                finishSceneSetup();
            },
            undefined,
            function() {
                console.warn('Failed to load can-label.png, using fallback texture');
                const fallbackTexture = createCanTexture();
                buildBeerCan(fallbackTexture);
                finishSceneSetup();
            }
        );
    }

    function createCanTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        // ---- Gold metallic base ----
        const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
        baseGrad.addColorStop(0, '#B8941F');
        baseGrad.addColorStop(0.3, '#D4AF37');
        baseGrad.addColorStop(0.5, '#E8C84A');
        baseGrad.addColorStop(0.7, '#D4AF37');
        baseGrad.addColorStop(1, '#A67C00');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 0, W, H);

        // Add subtle radial sheen for metallic look
        const sheen = ctx.createRadialGradient(W * 0.5, H * 0.4, 50, W * 0.5, H * 0.4, 600);
        sheen.addColorStop(0, 'rgba(255,255,220,0.25)');
        sheen.addColorStop(1, 'rgba(255,255,220,0)');
        ctx.fillStyle = sheen;
        ctx.fillRect(0, 0, W, H);

        // ---- Top dark band ----
        ctx.fillStyle = '#0D0D1A';
        ctx.fillRect(0, 0, W, 160);
        // Top band gold inner line
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(0, 158, W, 4);

        // Top small text
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'italic 26px Georgia, "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.fillText('Beechwood Aging produces a taste and drinkability you will find in no other beer', W * 0.5, 90);

        // ---- TRADE MARK / REGISTERED small side bands ----
        ctx.save();
        ctx.fillStyle = '#0D0D1A';
        ctx.fillRect(W * 0.08, 200, 220, 50);
        ctx.fillRect(W * 0.82, 200, 220, 50);
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 22px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TRADE MARK', W * 0.08 + 110, 235);
        ctx.fillText('REGISTERED', W * 0.82 + 110, 235);
        ctx.restore();

        // ---- Center Diamond Logo ----
        const cx = W * 0.5;
        const cy = H * 0.30;
        const dSize = 380;

        function drawDiamond(x, y, size, stroke, color) {
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size * 1.15, y);
            ctx.lineTo(x, y + size);
            ctx.lineTo(x - size * 1.15, y);
            ctx.closePath();
            ctx.lineWidth = stroke;
            ctx.strokeStyle = color;
            ctx.stroke();
        }

        // Outer ornate diamonds
        drawDiamond(cx, cy, dSize + 40, 6, '#0D0D1A');
        drawDiamond(cx, cy, dSize + 30, 4, '#D4AF37');
        drawDiamond(cx, cy, dSize + 15, 3, '#0D0D1A');
        drawDiamond(cx, cy, dSize, 8, '#D4AF37');

        // Inner fill
        ctx.beginPath();
        ctx.moveTo(cx, cy - dSize + 10);
        ctx.lineTo(cx + (dSize - 10) * 1.15, cy);
        ctx.lineTo(cx, cy + dSize - 10);
        ctx.lineTo(cx - (dSize - 10) * 1.15, cy);
        ctx.closePath();
        ctx.fillStyle = 'rgba(10,10,26,0.85)';
        ctx.fill();

        // Diamond corner ornaments (triangles)
        const triSize = 55;
        [
            [cx, cy - dSize - 15],
            [cx + (dSize + 15) * 1.15, cy],
            [cx, cy + dSize + 15],
            [cx - (dSize + 15) * 1.15, cy]
        ].forEach(([tx, ty]) => {
            ctx.beginPath();
            ctx.arc(tx, ty, 18, 0, Math.PI * 2);
            ctx.fillStyle = '#D4AF37';
            ctx.fill();
        });

        // Surrounding text on diamond
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 30px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('BERGITA', cx, cy - dSize + 55);
        ctx.fillText('AMERICA', cx, cy + dSize - 25);

        ctx.save();
        ctx.translate(cx - dSize * 1.15 + 30, cy);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('BEER', 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(cx + dSize * 1.15 - 30, cy);
        ctx.rotate(Math.PI / 2);
        ctx.fillText('BREWERS', 0, 0);
        ctx.restore();

        // Inner circle with crown
        ctx.beginPath();
        ctx.arc(cx, cy, dSize * 0.45, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#D4AF37';
        ctx.stroke();

        // Crown icon (simplified)
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 38px Georgia, serif';
        ctx.fillText('\u2655', cx, cy - dSize * 0.22);

        // NB text
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 130px Arial, sans-serif';
        ctx.fillText('NB', cx, cy + 35);

        // Original text under NB
        ctx.font = 'bold 22px Georgia, serif';
        ctx.fillText('ORIGINAL', cx, cy + 75);

        // ---- Noble Brew Script ----
        ctx.fillStyle = '#0D0D1A';
        ctx.font = 'italic 120px "Brush Script MT", "Segoe Script", "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('Noble Brew', cx, H * 0.58);

        // ---- MAGNUM ----
        ctx.font = 'bold 95px "Arial Black", Impact, sans-serif';
        ctx.fillText('MAGNUM', cx, H * 0.68);

        // ---- SUPER PREMIUM BEER ----
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.letterSpacing = '8px';
        ctx.fillText('SUPER PREMIUM BEER', cx, H * 0.72 + 20);

        // ---- Script description ----
        ctx.fillStyle = '#0D0D1A';
        ctx.font = 'italic 34px "Brush Script MT", "Segoe Script", cursive';
        ctx.fillText('Brewed by our original process', cx, H * 0.78);
        ctx.fillText('with Hops, Rice and Best Barley', cx, H * 0.82);
        ctx.fillText('Crafted Since 1876', cx, H * 0.87);

        // ---- Bottom dark band ----
        ctx.fillStyle = '#0D0D1A';
        ctx.fillRect(0, H - 140, W, 140);
        // Bottom band gold inner line
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(0, H - 143, W, 4);

        // NOBLE-BREW CO text on bottom band
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 52px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NOBLE-BREW CO.', cx, H - 55);

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        return texture;
    }

    function addCondensation(radius, height) {
        const dropletGeo = new THREE.SphereGeometry(0.028, 8, 8);
        const dropletMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.05,
            transmission: 0.9,
            transparent: true,
            opacity: 0.7,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05
        });

        const count = 180;
        for (let i = 0; i < count; i++) {
            const droplet = new THREE.Mesh(dropletGeo, dropletMat);
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * height * 0.85;
            const r = radius + 0.012;
            droplet.position.set(
                Math.cos(theta) * r,
                y,
                Math.sin(theta) * r
            );
            const scale = 0.5 + Math.random() * 1.2;
            droplet.scale.set(scale, scale * 0.6, scale);
            droplet.lookAt(0, y, 0);
            canGroup.add(droplet);
        }
    }

    function buildBeerCan(labelTexture) {
        canGroup = new THREE.Group();

        // Materials
        const bodyMaterial = new THREE.MeshStandardMaterial({
            map: labelTexture,
            metalness: 0.75,
            roughness: 0.22,
            envMapIntensity: 1.0
        });

        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xD4AF37,
            metalness: 0.95,
            roughness: 0.15,
            envMapIntensity: 1.2
        });

        const darkGoldMaterial = new THREE.MeshStandardMaterial({
            color: 0xA67C00,
            metalness: 0.9,
            roughness: 0.2
        });

        const darkMaterial = new THREE.MeshStandardMaterial({
            color: 0x0D0D1A,
            metalness: 0.3,
            roughness: 0.4
        });

        // Beer can proportions
        const radius = 0.9;
        const canHeight = 4.2;
        const bodyHeight = canHeight * 0.82;

        // --- Main body with label texture ---
        const bodyGeometry = new THREE.CylinderGeometry(radius, radius, bodyHeight, 128);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = -0.25;
        body.castShadow = true;
        body.receiveShadow = true;
        body.rotation.y = Math.PI; // Face the label forward
        canGroup.add(body);

        // --- Tapered neck ---
        const neckHeight = 0.35;
        const neckGeometry = new THREE.CylinderGeometry(radius * 0.88, radius, neckHeight, 96);
        const neck = new THREE.Mesh(neckGeometry, goldMaterial);
        neck.position.y = bodyHeight / 2 - 0.25 + neckHeight / 2;
        canGroup.add(neck);

        // ========== DETAILED CAN TOP ==========
        const topY = bodyHeight / 2 - 0.25 + neckHeight;
        const lidRadius = radius * 0.82;

        // --- Outer thick rolled rim ---
        const outerRimGeo = new THREE.TorusGeometry(lidRadius + 0.04, 0.065, 20, 128);
        const outerRim = new THREE.Mesh(outerRimGeo, goldMaterial);
        outerRim.position.y = topY + 0.01;
        outerRim.rotation.x = Math.PI / 2;
        canGroup.add(outerRim);

        // --- First step down ring ---
        const step1Geo = new THREE.TorusGeometry(lidRadius + 0.01, 0.02, 12, 128);
        const step1 = new THREE.Mesh(step1Geo, darkGoldMaterial);
        step1.position.y = topY - 0.005;
        step1.rotation.x = Math.PI / 2;
        canGroup.add(step1);

        // --- Second step down ring ---
        const step2Geo = new THREE.TorusGeometry(lidRadius - 0.04, 0.018, 12, 128);
        const step2 = new THREE.Mesh(step2Geo, goldMaterial);
        step2.position.y = topY - 0.012;
        step2.rotation.x = Math.PI / 2;
        canGroup.add(step2);

        // --- Main lid flat surface ---
        const lidGeo = new THREE.CylinderGeometry(lidRadius - 0.08, lidRadius - 0.08, 0.015, 128);
        const lid = new THREE.Mesh(lidGeo, goldMaterial);
        lid.position.y = topY - 0.018;
        canGroup.add(lid);

        // --- Subtle concentric arcs on lid (partial rings around tab area) ---
        const arcMat = darkGoldMaterial.clone();
        arcMat.opacity = 0.4;
        arcMat.transparent = true;
        [0.38, 0.30, 0.22].forEach((r, i) => {
            const arcGeo = new THREE.TorusGeometry(lidRadius * r, 0.003, 8, 64, Math.PI * 1.2);
            const arc = new THREE.Mesh(arcGeo, arcMat);
            arc.position.y = topY - 0.010;
            arc.rotation.x = Math.PI / 2;
            arc.rotation.z = -Math.PI * 0.6;
            canGroup.add(arc);
        });

        // --- Scored outline (single smooth oval hugging the tab) ---
        const scoreGeo = new THREE.TorusGeometry(1, 0.003, 8, 64);
        const scoreLine = new THREE.Mesh(scoreGeo, darkGoldMaterial);
        scoreLine.position.y = topY - 0.008;
        scoreLine.rotation.x = Math.PI / 2;
        scoreLine.scale.set(0.28, 0.50, 1);
        canGroup.add(scoreLine);

        // --- Classic stay-on-tab pull tab shape ---
        const tabShape = new THREE.Shape();
        // Classic soda/beer can "stay-on-tab" outline
        // Wide rivet end at top, narrows in middle, finger hole at bottom
        const tW1 = 0.20;   // width at rivet end (top)
        const tW2 = 0.12;   // width at narrow waist
        const tW3 = 0.16;   // width at finger hole flare
        const tH1 = 0.28;   // top half length
        const tH2 = 0.23;   // bottom half length

        // Top center (rivet end) - wide rounded
        tabShape.moveTo(0, tH1);
        tabShape.bezierCurveTo(tW1 * 0.6, tH1, tW1, tH1 * 0.75, tW1, tH1 * 0.4);
        // Right side curves inward to waist
        tabShape.bezierCurveTo(tW1, tH1 * 0.1, tW2 * 1.1, -tH2 * 0.2, tW2, -tH2 * 0.45);
        // Right side flares to finger hole
        tabShape.bezierCurveTo(tW2 * 0.9, -tH2 * 0.7, tW3, -tH2 * 0.85, tW3 * 0.7, -tH2);
        // Bottom center (between hole area)
        tabShape.bezierCurveTo(tW3 * 0.3, -tH2 - 0.02, -tW3 * 0.3, -tH2 - 0.02, -tW3 * 0.7, -tH2);
        // Left side flares from finger hole
        tabShape.bezierCurveTo(-tW3, -tH2 * 0.85, -tW2 * 0.9, -tH2 * 0.7, -tW2, -tH2 * 0.45);
        // Left side curves inward to waist
        tabShape.bezierCurveTo(-tW2 * 1.1, -tH2 * 0.2, -tW1, tH1 * 0.1, -tW1, tH1 * 0.4);
        // Left top curves back to center
        tabShape.bezierCurveTo(-tW1, tH1 * 0.75, -tW1 * 0.6, tH1, 0, tH1);

        // Finger hole (oval cutout below rivet)
        const fhPath = new THREE.Path();
        const fhRx = 0.072;
        const fhRy = 0.090;
        fhPath.absellipse(0, -tH2 * 0.55, fhRx, fhRy, 0, Math.PI * 2, false, 0);
        tabShape.holes.push(fhPath);

        const tabGeo = new THREE.ExtrudeGeometry(tabShape, {
            depth: 0.020,
            bevelEnabled: true,
            bevelThickness: 0.006,
            bevelSize: 0.006,
            bevelSegments: 3
        });
        const tabMesh = new THREE.Mesh(tabGeo, goldMaterial);
        tabMesh.rotation.x = -Math.PI / 2;
        tabMesh.position.set(0, topY + 0.005, 0.030);
        tabMesh.castShadow = true;
        canGroup.add(tabMesh);

        // --- Rivet (centered on the wide end) ---
        const rivetStemGeo = new THREE.CylinderGeometry(0.036, 0.042, 0.026, 24);
        const rivetStem = new THREE.Mesh(rivetStemGeo, darkGoldMaterial);
        rivetStem.position.set(0, topY + 0.008, 0.030);
        canGroup.add(rivetStem);

        const rivetHeadGeo = new THREE.CylinderGeometry(0.046, 0.048, 0.007, 24);
        const rivetHead = new THREE.Mesh(rivetHeadGeo, goldMaterial);
        rivetHead.position.set(0, topY + 0.024, 0.030);
        canGroup.add(rivetHead);

        // --- Tiny rivet center dimple ---
        const rivetDimpleGeo = new THREE.SphereGeometry(0.020, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.4);
        const rivetDimple = new THREE.Mesh(rivetDimpleGeo, darkGoldMaterial);
        rivetDimple.position.set(0, topY + 0.028, 0.030);
        canGroup.add(rivetDimple);

        // --- Bottom taper ---
        const bottomTaperHeight = 0.3;
        const bottomTaperGeometry = new THREE.CylinderGeometry(radius, radius * 0.88, bottomTaperHeight, 96);
        const bottomTaper = new THREE.Mesh(bottomTaperGeometry, goldMaterial);
        bottomTaper.position.y = -bodyHeight / 2 - 0.25 - bottomTaperHeight / 2;
        canGroup.add(bottomTaper);

        // --- Bottom rim ---
        const bottomRimGeometry = new THREE.TorusGeometry(radius * 0.88, 0.05, 16, 96);
        const bottomRim = new THREE.Mesh(bottomRimGeometry, goldMaterial);
        bottomRim.position.y = -bodyHeight / 2 - 0.25 - bottomTaperHeight - 0.02;
        bottomRim.rotation.x = Math.PI / 2;
        canGroup.add(bottomRim);

        // --- Bottom base ---
        const bottomBaseGeometry = new THREE.CylinderGeometry(radius * 0.85, radius * 0.85, 0.03, 96);
        const bottomBase = new THREE.Mesh(bottomBaseGeometry, darkGoldMaterial);
        bottomBase.position.y = -bodyHeight / 2 - 0.25 - bottomTaperHeight - 0.06;
        canGroup.add(bottomBase);

        // --- Condensation droplets ---
        addCondensation(radius, bodyHeight);

        // Initial tilt for better presentation
        canGroup.rotation.x = 0.12;
        canGroup.rotation.z = 0.06;

        scene.add(canGroup);
    }

    function setupLighting() {
        // Dark ambient for depth
        const ambientLight = new THREE.AmbientLight(0x221a14, 0.5);
        scene.add(ambientLight);

        // Key light (warm white)
        const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
        keyLight.position.set(4, 6, 8);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.bias = -0.0001;
        scene.add(keyLight);

        // Fill light (cool blue-gray for metal contrast)
        const fillLight = new THREE.DirectionalLight(0xb8c4d4, 0.6);
        fillLight.position.set(-6, 3, 5);
        scene.add(fillLight);

        // Rim light (orange warmth for label pop)
        const rimLight = new THREE.SpotLight(0xff7700, 2.0);
        rimLight.position.set(-4, 5, -6);
        rimLight.lookAt(0, 0, 0);
        rimLight.penumbra = 0.5;
        scene.add(rimLight);

        // Top highlight for aluminum sheen
        const topLight = new THREE.PointLight(0xffffff, 0.8, 15);
        topLight.position.set(0, 6, 3);
        scene.add(topLight);

        // Bottom bounce (subtle warm ground reflection)
        const bounceLight = new THREE.PointLight(0xff8833, 0.4, 12);
        bounceLight.position.set(0, -5, 4);
        scene.add(bounceLight);

        // Side accent for depth definition
        const sideLight = new THREE.PointLight(0xffaa44, 0.5, 10);
        sideLight.position.set(5, -2, -3);
        scene.add(sideLight);

        // Front subtle highlight
        const frontLight = new THREE.PointLight(0xffffff, 0.3, 10);
        frontLight.position.set(0, 0, 6);
        scene.add(frontLight);
    }

    function animate() {
        animationId = requestAnimationFrame(animate);

        if (canGroup && isVisible) {
            // Subtle floating animation
            const time = Date.now() * 0.001;
            canGroup.position.y = Math.sin(time) * 0.1;
        }

        if (controls) {
            controls.update();
        }

        renderer.render(scene, camera);
    }

    function onResize() {
        if (!container || !camera || !renderer) return;

        const width = container.clientWidth || 300;
        const height = container.clientHeight || 500;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // Public API for main.js to control visibility
    window.GoldenCan3D = {
        show: function() {
            isVisible = true;
            if (container) {
                container.classList.add('active');
                container.classList.remove('exit');
            }
        },
        hide: function() {
            isVisible = false;
            if (container) {
                container.classList.remove('active');
                container.classList.add('exit');
            }
        },
        reset: function() {
            isVisible = false;
            if (container) {
                container.classList.remove('active', 'exit');
            }
            if (canGroup) {
                canGroup.rotation.y = 0;
                canGroup.position.y = 0;
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
