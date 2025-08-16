/**
 * Token Tycoon v2.0 - Advanced Particle System
 * Circuit board energy effects and visual enhancements
 */

class ParticleSystem {
    constructor(container, cardType) {
        this.container = container;
        this.cardType = cardType.toLowerCase();
        this.particles = [];
        this.isRunning = false;
        this.isPaused = false;
        this.isEnabled = true;
        this.quality = 'standard'; // 'low', 'standard', 'high'
        
        this.config = this.getConfigForCardType();
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        
        this.lastTime = 0;
        this.emissionTimer = 0;
        
        this.init();
    }
    
    getConfigForCardType() {
        const baseConfigs = {
            chain: {
                particleCount: 12,
                particleSize: 3,
                color: '#00D9FF',
                secondaryColor: '#00B8E6',
                speed: 1.2,
                lifetime: 2500,
                emissionRate: 1.5,
                pattern: 'network',
                glowIntensity: 0.8
            },
            defi: {
                particleCount: 8,
                particleSize: 4,
                color: '#FFA500',
                secondaryColor: '#8B00FF',
                speed: 1.0,
                lifetime: 3000,
                emissionRate: 1.0,
                pattern: 'flow',
                glowIntensity: 0.6
            },
            eoa: {
                particleCount: 6,
                particleSize: 2,
                color: '#00B8E6',
                secondaryColor: '#FF0080',
                speed: 0.8,
                lifetime: 3500,
                emissionRate: 0.8,
                pattern: 'security',
                glowIntensity: 0.7
            },
            action: {
                particleCount: 20,
                particleSize: 5,
                color: '#FF6B00',
                secondaryColor: '#FF0000',
                speed: 2.0,
                lifetime: 1500,
                emissionRate: 2.5,
                pattern: 'explosion',
                glowIntensity: 1.0
            },
            ability: {
                particleCount: 10,
                particleSize: 3,
                color: '#8B00FF',
                secondaryColor: '#00D9FF',
                speed: 1.1,
                lifetime: 2800,
                emissionRate: 1.2,
                pattern: 'neural',
                glowIntensity: 0.9
            }
        };
        
        return baseConfigs[this.cardType] || baseConfigs.chain;
    }
    
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.className = 'particle-canvas';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 15;
            mix-blend-mode: screen;
        `;
        
        return canvas;
    }
    
    init() {
        this.updateCanvasSize();
        this.container.appendChild(this.canvas);
        this.start();
        
        // Setup resize observer
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                this.handleResize();
            });
            this.resizeObserver.observe(this.container);
        }
    }
    
    updateCanvasSize() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
        this.canvasWidth = rect.width;
        this.canvasHeight = rect.height;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
    
    enable() {
        this.isEnabled = true;
        this.canvas.style.display = 'block';
    }
    
    disable() {
        this.isEnabled = false;
        this.canvas.style.display = 'none';
    }
    
    setQuality(quality) {
        this.quality = quality;
        
        const multipliers = {
            low: 0.5,
            standard: 1.0,
            high: 1.5
        };
        
        const multiplier = multipliers[quality] || 1.0;
        this.config.particleCount = Math.ceil(this.config.particleCount * multiplier);
        this.config.emissionRate = this.config.emissionRate * multiplier;
    }
    
    intensify() {
        // Increase particle emission when card is hovered
        this.config.emissionRate *= 2;
        this.config.speed *= 1.5;
    }
    
    normalize() {
        // Reset to normal levels
        const baseConfig = this.getConfigForCardType();
        this.config.emissionRate = baseConfig.emissionRate;
        this.config.speed = baseConfig.speed;
    }
    
    animate(currentTime = 0) {
        if (!this.isRunning || this.isPaused || !this.isEnabled) {
            if (this.isRunning && this.isEnabled) {
                requestAnimationFrame(this.animate.bind(this));
            }
            return;
        }
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(this.animate.bind(this));
    }
    
    update(deltaTime) {
        // Emit new particles
        this.emissionTimer += deltaTime;
        const emissionInterval = 1000 / this.config.emissionRate;
        
        while (this.emissionTimer >= emissionInterval && this.particles.length < this.config.particleCount) {
            this.emitParticle();
            this.emissionTimer -= emissionInterval;
        }
        
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            this.updateParticle(particle, deltaTime);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    emitParticle() {
        const particle = new Particle(this.getEmissionPoint(), this.config, this.cardType);
        this.particles.push(particle);
    }
    
    getEmissionPoint() {
        // Different emission patterns based on card type
        switch (this.config.pattern) {
            case 'network':
                return this.getNetworkEmissionPoint();
            case 'flow':
                return this.getFlowEmissionPoint();
            case 'security':
                return this.getSecurityEmissionPoint();
            case 'explosion':
                return this.getExplosionEmissionPoint();
            case 'neural':
                return this.getNeuralEmissionPoint();
            default:
                return { x: this.canvasWidth * Math.random(), y: this.canvasHeight * Math.random() };
        }
    }
    
    getNetworkEmissionPoint() {
        // Emit from network node positions
        const nodePositions = [
            { x: this.canvasWidth * 0.2, y: this.canvasHeight * 0.3 },
            { x: this.canvasWidth * 0.8, y: this.canvasHeight * 0.3 },
            { x: this.canvasWidth * 0.5, y: this.canvasHeight * 0.6 },
            { x: this.canvasWidth * 0.2, y: this.canvasHeight * 0.8 },
            { x: this.canvasWidth * 0.8, y: this.canvasHeight * 0.8 }
        ];
        
        return nodePositions[Math.floor(Math.random() * nodePositions.length)];
    }
    
    getFlowEmissionPoint() {
        // Emit from liquidity pool areas
        return {
            x: this.canvasWidth * (0.3 + Math.random() * 0.4),
            y: this.canvasHeight * (0.4 + Math.random() * 0.2)
        };
    }
    
    getSecurityEmissionPoint() {
        // Emit from vault perimeter
        const centerX = this.canvasWidth * 0.5;
        const centerY = this.canvasHeight * 0.6;
        const radius = 60;
        const angle = Math.random() * Math.PI * 2;
        
        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        };
    }
    
    getExplosionEmissionPoint() {
        // Emit from center with explosion pattern
        return {
            x: this.canvasWidth * 0.5 + (Math.random() - 0.5) * 40,
            y: this.canvasHeight * 0.5 + (Math.random() - 0.5) * 40
        };
    }
    
    getNeuralEmissionPoint() {
        // Emit from neural network connection points
        const points = [
            { x: this.canvasWidth * 0.5, y: this.canvasHeight * 0.3 }, // Speaker
            { x: this.canvasWidth * 0.25, y: this.canvasHeight * 0.7 }, // Audience
            { x: this.canvasWidth * 0.75, y: this.canvasHeight * 0.7 }
        ];
        
        return points[Math.floor(Math.random() * points.length)];
    }
    
    updateParticle(particle, deltaTime) {
        particle.update(deltaTime, this.canvasWidth, this.canvasHeight);
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Render particles
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
    }
    
    handleResize() {
        this.updateCanvasSize();
    }
    
    destroy() {
        this.stop();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

/**
 * Individual Particle Class
 */
class Particle {
    constructor(position, config, cardType) {
        this.startPosition = { ...position };
        this.position = { ...position };
        this.velocity = this.getInitialVelocity(cardType);
        this.size = config.particleSize + (Math.random() - 0.5) * 2;
        this.color = this.getParticleColor(config);
        this.life = config.lifetime;
        this.maxLife = config.lifetime;
        this.opacity = 1.0;
        this.cardType = cardType;
        this.config = config;
        
        // Pattern-specific properties
        this.initializePatternProperties();
    }
    
    getInitialVelocity(cardType) {
        switch (cardType) {
            case 'chain':
                return this.getNetworkVelocity();
            case 'defi':
                return this.getFlowVelocity();
            case 'eoa':
                return this.getSecurityVelocity();
            case 'action':
                return this.getExplosionVelocity();
            case 'ability':
                return this.getNeuralVelocity();
            default:
                return { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
        }
    }
    
    getNetworkVelocity() {
        // Network particles move along connection paths
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1;
        return {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
    }
    
    getFlowVelocity() {
        // DeFi particles follow yield flow patterns
        return {
            x: (Math.random() - 0.5) * 1.5,
            y: -0.5 - Math.random() * 1.5 // Generally upward (yield accumulation)
        };
    }
    
    getSecurityVelocity() {
        // Security particles orbit around center
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.5;
        return {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
    }
    
    getExplosionVelocity() {
        // Explosion particles radiate outward
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        return {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
    }
    
    getNeuralVelocity() {
        // Neural particles move in learning patterns
        return {
            x: (Math.random() - 0.5) * 1,
            y: (Math.random() - 0.5) * 1
        };
    }
    
    getParticleColor(config) {
        // Randomly choose between primary and secondary colors
        const colors = [config.color, config.secondaryColor];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    initializePatternProperties() {
        // Additional properties for specific patterns
        switch (this.cardType) {
            case 'eoa':
                this.orbitRadius = 30 + Math.random() * 20;
                this.orbitAngle = Math.random() * Math.PI * 2;
                this.orbitSpeed = 0.02 + Math.random() * 0.02;
                break;
            case 'chain':
                this.connectionTarget = null; // Could be set to another particle for connections
                break;
            case 'action':
                this.explosionForce = 1 + Math.random() * 2;
                break;
        }
    }
    
    update(deltaTime, canvasWidth, canvasHeight) {
        // Update pattern-specific behavior
        this.updatePatternBehavior(deltaTime);
        
        // Update position
        this.position.x += this.velocity.x * this.config.speed;
        this.position.y += this.velocity.y * this.config.speed;
        
        // Update life and opacity
        this.life -= deltaTime;
        this.opacity = Math.max(0, this.life / this.maxLife);
        
        // Apply fade effects
        if (this.life < this.maxLife * 0.3) {
            this.opacity *= (this.life / (this.maxLife * 0.3));
        }
        
        // Boundary handling
        this.handleBoundaries(canvasWidth, canvasHeight);
    }
    
    updatePatternBehavior(deltaTime) {
        switch (this.cardType) {
            case 'eoa':
                this.updateSecurityOrbit();
                break;
            case 'defi':
                this.updateYieldFlow();
                break;
            case 'chain':
                this.updateNetworkFlow();
                break;
            case 'action':
                this.updateExplosionForce();
                break;
            case 'ability':
                this.updateNeuralConnection();
                break;
        }
    }
    
    updateSecurityOrbit() {
        // Orbit around original position
        this.orbitAngle += this.orbitSpeed;
        const orbitX = Math.cos(this.orbitAngle) * this.orbitRadius;
        const orbitY = Math.sin(this.orbitAngle) * this.orbitRadius;
        
        this.position.x = this.startPosition.x + orbitX;
        this.position.y = this.startPosition.y + orbitY;
    }
    
    updateYieldFlow() {
        // Add slight curve to simulate yield accumulation
        this.velocity.y -= 0.01; // Slight upward acceleration
        
        // Add some swaying motion
        this.velocity.x += Math.sin(Date.now() * 0.001 + this.startPosition.x) * 0.05;
    }
    
    updateNetworkFlow() {
        // Add network synchronization effects
        const syncPhase = Math.sin(Date.now() * 0.002);
        this.velocity.x += syncPhase * 0.02;
        this.velocity.y += syncPhase * 0.02;
    }
    
    updateExplosionForce() {
        // Apply continuous explosion force
        this.velocity.x *= this.explosionForce;
        this.velocity.y *= this.explosionForce;
        this.explosionForce *= 0.99; // Decay force over time
    }
    
    updateNeuralConnection() {
        // Add neural network-like behavior
        const connectionStrength = Math.sin(Date.now() * 0.003 + this.startPosition.x * 0.01);
        this.velocity.x += connectionStrength * 0.03;
        this.velocity.y += connectionStrength * 0.03;
    }
    
    handleBoundaries(canvasWidth, canvasHeight) {
        // Wrap around or bounce based on card type
        switch (this.cardType) {
            case 'chain':
                // Wrap around for continuous network effect
                if (this.position.x < 0) this.position.x = canvasWidth;
                if (this.position.x > canvasWidth) this.position.x = 0;
                if (this.position.y < 0) this.position.y = canvasHeight;
                if (this.position.y > canvasHeight) this.position.y = 0;
                break;
                
            case 'eoa':
                // Don't handle boundaries for orbiting particles
                break;
                
            default:
                // Kill particles that leave bounds
                if (this.position.x < -50 || this.position.x > canvasWidth + 50 ||
                    this.position.y < -50 || this.position.y > canvasHeight + 50) {
                    this.life = 0;
                }
                break;
        }
    }
    
    render(ctx) {
        if (this.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Create glow effect
        const glowSize = this.size * 3;
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, glowSize
        );
        
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.3, this.color + '80'); // Semi-transparent
        gradient.addColorStop(1, this.color + '00'); // Fully transparent
        
        // Draw glow
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw particle core
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParticleSystem, Particle };
}