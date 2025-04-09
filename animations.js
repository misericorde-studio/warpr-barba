import * as THREE from 'three';

class Particle {
    constructor(index, config) {
        this.index = index;
        this.config = config;
        this.isInnerCircle = false;
        this.isAdditionalCircle = false;
        this.additionalCircleIndex = -1;
        this.isStatic = false;
        this.hasBeenSplit = false;
        this.floatSpeed = 0;
        this.floatPhase = 0;
        this.splitProgress = 0;
        this.splitTarget = null;
        this.splitStartPosition = null;
        this.splitEndPosition = null;
        this.sizeTransitionStart = 0;
        this.sizeTransitionTarget = 0;
        this.sizeTransitionProgress = 0;
        this.inSizeTransition = false;
        this.opacity = 1.0;
        this.active = true;
    }

    resetParticle() {
        if (this.isInnerCircle || this.isAdditionalCircle) {
            const angle = Math.random() * Math.PI * 2;
            const isBorder = Math.random() < (this.isAdditionalCircle ? this.config.additionalCircleBorderRatio : this.config.innerBorderParticleRatio);
            this.isBorder = isBorder;
            let radiusFactor;
            if (isBorder) {
                const borderWidth = this.isAdditionalCircle ? this.config.additionalCircleBorderWidth : this.config.innerBorderWidth;
                radiusFactor = 1.0 - borderWidth + Math.random() * (borderWidth * 2);
            } else {
                radiusFactor = Math.pow(Math.random(), 0.5) * this.config.innerCircleFill;
            }
            this.radius = this.config.innerRadius * radiusFactor;
            this.isStatic = true;
            this.angle = angle;
            this.x = Math.cos(this.angle) * this.radius;
            this.z = Math.sin(this.angle) * this.radius;
            if (this.isInnerCircle) {
                this.y = 2 * this.config.additionalCircleVerticalSpacing;
            } else if (this.isAdditionalCircle) {
                if (this.additionalCircleIndex === 1) {
                    this.y = 0;
                } else if (this.additionalCircleIndex === 0) {
                    this.y = this.config.additionalCircleVerticalSpacing;
                } else {
                    const offset = this.additionalCircleIndex - 1;
                    this.y = -offset * this.config.additionalCircleVerticalSpacing;
                }
            }
            if (this.isInnerCircle || (this.isAdditionalCircle && this.additionalCircleIndex !== 1)) {
                const baseScale = this.config.whiteCircleParticleScale;
                this.size = this.config.baseParticleSize * (isBorder ? this.config.additionalCircleBorderScale : baseScale) * (0.7 + Math.random() * 0.6);
            } else if (this.isAdditionalCircle && this.additionalCircleIndex === 1) {
                this.size = this.config.baseParticleSize * (isBorder ? this.config.additionalCircleBorderScale : this.config.greenCircleParticleScale) * (0.7 + Math.random() * 0.6);
            }
            this.currentSize = this.size;
            this.direction = 0;
            this.distanceTraveled = 0;
            this.originalX = this.x;
            this.originalY = this.y;
            this.originalZ = this.z;
            this.floatSpeed = 0.08 + Math.random() * 0.07;
            this.floatPhase = Math.random() * Math.PI * 2;
            this.floatAmplitude = 0.04 + Math.random() * 0.04;
            this.x = Math.cos(this.angle) * this.radius;
            this.z = Math.sin(this.angle) * this.radius;
            this.y = 0;
            this.targetX = this.x;
            this.targetZ = this.z;
            this.targetY = this.y;
            this.currentX = this.x;
            this.currentZ = this.z;
            this.currentY = this.y;
            this.velocityX = 0;
            this.velocityZ = 0;
            this.velocityY = 0;
        } else {
            this.resetOuterParticle();
        }
    }

    resetOuterParticle() {
        const wasStatic = this.isStatic;
        if (wasStatic) {
            this.isStatic = true;
            this.opacity = 1.0;
            const angle = this.angle || Math.random() * Math.PI * 2;
            this.angle = angle;
            const random = Math.random();
            const isInnerBorder = random < this.config.innerBorderParticleRatio;
            const isOuterBorder = !isInnerBorder && random < (this.config.innerBorderParticleRatio + this.config.outerBorderParticleRatio);
            this.isBorder = isInnerBorder || isOuterBorder;
            if (isInnerBorder) {
                const randomOffset = (Math.random() - 0.5) * this.config.innerBorderWidth;
                this.radius = this.config.outerRadius - this.config.innerBorderWidth/2 + randomOffset;
                this.size = this.config.outerCircleBorderParticleSize;
            } else if (isOuterBorder) {
                const randomOffset = (Math.random() - 0.5) * this.config.outerBorderWidth;
                this.radius = this.config.outerRadius + this.config.outerBorderWidth/2 + randomOffset;
                this.size = this.config.outerCircleBorderParticleSize;
            } else {
                const randomOffset = (Math.random() - 0.5) * this.config.outerCircleWidth;
                this.radius = this.config.outerRadius + randomOffset;
                this.size = this.config.outerCircleParticleSize;
            }
            this.floatSpeed = this.floatSpeed || (0.03 + Math.random() * 0.03);
            this.floatPhase = this.floatPhase || Math.random() * Math.PI * 2;
            this.floatAmplitude = this.floatAmplitude || (0.04 + Math.random() * 0.04);
            this.x = Math.cos(this.angle) * this.radius;
            this.z = Math.sin(this.angle) * this.radius;
            this.y = 0;
            this.currentSize = this.size;
            this.opacity = 1.0;
            this.active = true;
        } else {
            this.isStatic = false;
            this.isBorder = false;
            this.radius = this.config.outerRadius;
            this.size = this.config.outerCircleParticleSize;
            this.currentSize = this.size;
            this.speed = this.config.particleSpeed * (0.2 + Math.random() * 0.3);
            this.direction = Math.random() < this.config.outerOutwardRatio ? 1 : -1;
            const angle = Math.random() * Math.PI * 2;
            this.angle = angle;
            this.x = Math.cos(angle) * this.radius;
            this.z = Math.sin(angle) * this.radius;
            this.y = 0;
            this.floatSpeed = 0;
            this.floatPhase = 0;
            this.floatAmplitude = 0;
            this.distanceTraveled = 0;
            this.opacity = 0;
            this.fadeState = 'in';
            this.fadeProgress = 0;
            this.active = true;
            const currentRadius = this.radius + this.distanceTraveled;
            if (Math.abs(this.distanceTraveled) > this.config.maxParticleDistance || 
                (this.direction < 0 && currentRadius <= this.config.innerRadius)) {
                this.fadeState = 'out';
                this.fadeProgress = 1;
            }
        }
    }

    update(deltaTime) {
        if (!this.active) return;
        if (this.isAdditionalCircle && this.additionalCircleIndex === 1) {
            return;
        }
        if (!this.isStatic) {
            this.distanceTraveled += this.speed * this.direction;
            const currentRadius = this.radius + this.distanceTraveled;
            if (Math.abs(this.distanceTraveled) > this.config.maxParticleDistance || 
                (this.direction < 0 && currentRadius <= this.config.innerRadius)) {
                if (this.fadeState !== 'out') {
                    this.fadeState = 'out';
                    this.fadeProgress = 1;
                }
            }
            const fadeSpeed = 0.05;
            if (this.fadeState === 'in') {
                this.fadeProgress += fadeSpeed;
                if (this.fadeProgress >= 1) {
                    this.fadeProgress = 1;
                    this.fadeState = 'visible';
                }
                this.opacity = this.fadeProgress;
            } else if (this.fadeState === 'out') {
                this.fadeProgress -= fadeSpeed;
                if (this.fadeProgress <= 0) {
                    this.resetOuterParticle();
                    return;
                }
                this.opacity = this.fadeProgress;
            }
            this.x = Math.cos(this.angle) * currentRadius;
            this.z = Math.sin(this.angle) * currentRadius;
            this.y = 0;
            const distanceRatio = Math.abs(this.distanceTraveled) / this.config.maxParticleDistance;
            const sizeFactor = 1 - distanceRatio;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const globalProgress = (scrolled / scrollHeight) * 100;
            const sizeReductionStart = 20;
            const sizeReductionEnd = 38;
            const sizeReductionProgress = Math.min(1, Math.max(0, (globalProgress - sizeReductionStart) / (sizeReductionEnd - sizeReductionStart)));
            const smoothSizeProgress = Math.pow(sizeReductionProgress, 0.5);
            const finalSizeFactor = sizeFactor * (1 - smoothSizeProgress);
            this.currentSize = this.size * finalSizeFactor;
        } else {
            if (!this.floatSpeed || !this.floatPhase || !this.floatAmplitude) {
                this.floatSpeed = 0.03 + Math.random() * 0.03;
                this.floatPhase = Math.random() * Math.PI * 2;
                this.floatAmplitude = 0.04 + Math.random() * 0.04;
            }
            this.floatPhase += this.floatSpeed * deltaTime * 30;
            const xOffset = Math.sin(this.floatPhase * 0.5) * this.floatAmplitude * 1.2;
            const yOffset = Math.cos(this.floatPhase * 0.7) * this.floatAmplitude * 1.2;
            const zOffset = Math.sin(this.floatPhase * 0.6) * this.floatAmplitude * 1.2;
            const baseX = Math.cos(this.angle) * this.radius;
            const baseZ = Math.sin(this.angle) * this.radius;
            this.x = baseX + xOffset;
            this.y = yOffset;
            this.z = baseZ + zOffset;
            this.currentSize = this.size;
            this.opacity = 1.0;
        }
    }
}

export class AirdropAnimation {
    constructor() {
        this.config = {
    innerRadius: 0.50,
    outerRadius: 4.80,
    innerCircleParticles: 100,
    outerCircleParticles: 2000,
    baseParticleSize: 0.45,
    outerCircleParticleSize: 0.75,
    outerCircleBorderParticleSize: 0.75,
    outerCircleWidth: 0.5,
    outerCircleDensity: 0.4,
    innerBorderWidth: 0.30,
    outerBorderWidth: 0.30,
    innerBorderParticleRatio: 0.20,
    outerBorderParticleRatio: 0.20,
    perspectiveEffect: 0,
    staticRingWidth: 0.75,
    outerOutwardRatio: 0.6,
    innerCircleFill: 0.8,
    maxParticleDistance: 1,
    particleSpeed: 0.005,
    fadeWithDistance: 1,
    particleColor: 0xffffff,
    splitCircleColor: 0x00ffcc,
    minMobileRatio: 0.7,
    additionalCircles: 4,
    whiteCircleParticles: 100,
    greenCircleParticles: 100,
    greenCircleExtraParticles: 500,
    whiteCircleParticleScale: 0.7,
    greenCircleParticleScale: 0.8,
    additionalCircleVerticalSpacing: 0.15,
    additionalCircleBorderRatio: 0.45,
    additionalCircleBorderScale: 0.4,
    additionalCircleBorderWidth: 0.15,
    splitAnimation: {
        gridSize: 3,
        spacing: 1.5,
        circleRadius: 0.15,
        circleFill: 0.9,
        transitionDuration: 1.0,
        active: false,
        particleScale: 0.2,
        currentSizeMultiplier: 1.0,
        otherCirclesOpacity: 1.0,
        borderParticleRatio: 0.6,
        borderParticleScale: 0.2,
    }
};

        this.scrollConfig = {
    startRotationX: 90,
    endRotationX: 11,
    startDistance: 13,
    endDistance: 4.45,
    splitStart: 0,
    splitEnd: 1,
};

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0C0E13);
        
        const container = document.getElementById('canvas-container');
        const containerWidth = container ? container.clientWidth : window.innerWidth;
        const containerHeight = container ? container.clientHeight : window.innerHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });

        this.renderer.setSize(containerWidth, containerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x0C0E13, 1);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.NoToneMapping;

        this.particles = null;
        this.innerParticles = null;
        this.outerParticles = null;
        this.innerGeometry = null;
        this.outerGeometry = null;
        this.innerMaterial = null;
        this.outerMaterial = null;
        this.particlesGroup = null;
        this.outerCircleGroup = null;
        this.hasScrolled = false;
        this.animationFrameId = null;
        this.guideCircles = null;

        // Bind methods
        this.animate = this.animate.bind(this);
        this.updateRendererSize = this.updateRendererSize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    init() {
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        canvasContainer.innerHTML = '';
        canvasContainer.appendChild(this.renderer.domElement);
        
        // Mettre à jour la taille initiale et configurer les écouteurs d'événements
        this.updateRendererSize();
        window.addEventListener('resize', this.updateRendererSize);
        window.addEventListener('scroll', this.handleScroll);
        
        this.camera.position.set(0, 0, this.scrollConfig.startDistance);
        this.camera.lookAt(0, 0, 0);
        this.particles = this.createParticles();
        this.outerParticles = this.particles.filter(p => !p.isInnerCircle && !p.isAdditionalCircle);
        this.innerParticles = this.particles.filter(p => p.isInnerCircle || p.isAdditionalCircle);
        this.innerGeometry = new THREE.BufferGeometry();
        this.outerGeometry = new THREE.BufferGeometry();
        const outerPositions = new Float32Array(this.outerParticles.length * 3);
        const outerSizes = new Float32Array(this.outerParticles.length);
        const outerColors = new Float32Array(this.outerParticles.length * 3);
        const outerOpacities = new Float32Array(this.outerParticles.length);
        const innerPositions = new Float32Array(this.innerParticles.length * 3);
        const innerSizes = new Float32Array(this.innerParticles.length);
        const innerColors = new Float32Array(this.innerParticles.length * 3);
        const innerOpacities = new Float32Array(this.innerParticles.length);
        this.outerGeometry.setAttribute('position', new THREE.BufferAttribute(outerPositions, 3));
        this.outerGeometry.setAttribute('size', new THREE.BufferAttribute(outerSizes, 1));
        this.outerGeometry.setAttribute('color', new THREE.BufferAttribute(outerColors, 3));
        this.outerGeometry.setAttribute('opacity', new THREE.BufferAttribute(outerOpacities, 1));
        this.innerGeometry.setAttribute('position', new THREE.BufferAttribute(innerPositions, 3));
        this.innerGeometry.setAttribute('size', new THREE.BufferAttribute(innerSizes, 1));
        this.innerGeometry.setAttribute('color', new THREE.BufferAttribute(innerColors, 3));
        this.innerGeometry.setAttribute('opacity', new THREE.BufferAttribute(innerOpacities, 1));
        this.outerMaterial = this.createParticlesMaterial(false);
        this.innerMaterial = this.createParticlesMaterial(true);
        const outerParticlesObject = new THREE.Points(this.outerGeometry, this.outerMaterial);
        const innerParticlesObject = new THREE.Points(this.innerGeometry, this.innerMaterial);
        this.particlesGroup = new THREE.Group();
        this.outerCircleGroup = new THREE.Group();
        this.outerCircleGroup.add(outerParticlesObject);
        this.particlesGroup.add(this.outerCircleGroup);
        this.particlesGroup.add(innerParticlesObject);
        this.particlesGroup.rotation.x = THREE.MathUtils.degToRad(this.scrollConfig.startRotationX);
        this.scene.add(this.particlesGroup);
        this.animate();
    }
}

    createSeparateGeometries() {
        const outerParticles = this.particles.filter(p => !p.isInnerCircle && !p.isAdditionalCircle);
        const innerParticles = this.particles.filter(p => p.isInnerCircle || p.isAdditionalCircle);
    const outerGeometry = new THREE.BufferGeometry();
    const outerPositions = new Float32Array(outerParticles.length * 3);
    const outerSizes = new Float32Array(outerParticles.length);
    const outerColors = new Float32Array(outerParticles.length * 3);
    const outerOpacities = new Float32Array(outerParticles.length);
    const innerGeometry = new THREE.BufferGeometry();
    const innerPositions = new Float32Array(innerParticles.length * 3);
    const innerSizes = new Float32Array(innerParticles.length);
    const innerColors = new Float32Array(innerParticles.length * 3);
    const innerOpacities = new Float32Array(innerParticles.length);
    outerGeometry.setAttribute('position', new THREE.BufferAttribute(outerPositions, 3));
    outerGeometry.setAttribute('size', new THREE.BufferAttribute(outerSizes, 1));
    outerGeometry.setAttribute('color', new THREE.BufferAttribute(outerColors, 3));
    outerGeometry.setAttribute('opacity', new THREE.BufferAttribute(outerOpacities, 1));
    innerGeometry.setAttribute('position', new THREE.BufferAttribute(innerPositions, 3));
    innerGeometry.setAttribute('size', new THREE.BufferAttribute(innerSizes, 1));
    innerGeometry.setAttribute('color', new THREE.BufferAttribute(innerColors, 3));
    innerGeometry.setAttribute('opacity', new THREE.BufferAttribute(innerOpacities, 1));
    return { outerGeometry, innerGeometry };
}

    updateCameraFromScroll() {
    const sections = document.querySelectorAll('.airdrop_content');
    if (sections.length < 3) return;
    const secondSection = sections[1];
    const thirdSection = sections[2];
    const secondSectionRect = secondSection.getBoundingClientRect();
    const thirdSectionRect = thirdSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const globalProgress = (scrolled / scrollHeight) * 100;

    // Mise à jour de la rotation
    const startRotation = this.scrollConfig.startRotationX;
    const endRotation = this.scrollConfig.endRotationX;
    const currentRotation = startRotation - ((startRotation - endRotation) * (globalProgress / 100));
    this.particlesGroup.rotation.x = THREE.MathUtils.degToRad(currentRotation);

    const outerCircleStartFade = 36;
    const outerCircleEndFade = 38;
    const sizeReductionStart = 20;
    const sizeReductionEnd = 38;
    const verticalSpacingStart = 20;
    const verticalSpacingEnd = 60;
    const shrinkStart = 55;
    const shrinkStartClose = 58;
    const shrinkEnd = 70;
    const innerColorStart = 68;
    const innerColorEnd = 70;
    const splitStart = 65;
    const splitEnd = 95;
    const outerCircleProgress = Math.min(1, Math.max(0, (globalProgress - outerCircleStartFade) / (outerCircleEndFade - outerCircleStartFade)));
    const sizeReductionProgress = Math.min(1, Math.max(0, (globalProgress - sizeReductionStart) / (sizeReductionEnd - sizeReductionStart)));
    const verticalSpacingProgress = Math.min(1, Math.max(0, (globalProgress - verticalSpacingStart) / (verticalSpacingEnd - verticalSpacingStart)));
    const shrinkProgress = Math.min(1, Math.max(0, (globalProgress - shrinkStart) / (shrinkEnd - shrinkStart)));
    const shrinkProgressClose = Math.min(1, Math.max(0, (globalProgress - shrinkStartClose) / (shrinkEnd - shrinkStartClose)));
    const innerColorProgress = Math.min(1, Math.max(0, (globalProgress - innerColorStart) / (innerColorEnd - innerColorStart)));
    const splitProgress = Math.min(1, Math.max(0, (globalProgress - splitStart) / (splitEnd - splitStart)));
    const startColor = new THREE.Color(0xffffff);
    const endColor = new THREE.Color(0x0C0E13);
    const smoothProgress = Math.pow(outerCircleProgress, 0.5);
    const smoothSizeProgress = Math.pow(sizeReductionProgress, 0.5);
    const currentColor = startColor.clone().lerp(endColor, smoothProgress);
    let opacity = 1.0;
    if (smoothProgress > 0.95) {
        opacity = 1.0 - ((smoothProgress - 0.95) * 20);
    }
        const colors = this.outerGeometry.attributes.color;
        const opacities = this.outerGeometry.attributes.opacity;
        const sizes = this.outerGeometry.attributes.size;
    for (let i = 0; i < colors.count; i++) {
        colors.setXYZ(i, currentColor.r, currentColor.g, currentColor.b);
        opacities.setX(i, opacity);
            if (this.outerParticles[i]) {
                this.outerParticles[i].color = currentColor;
                this.outerParticles[i].opacity = opacity;
                const originalSize = this.outerParticles[i].size;
            const targetSize = originalSize * (1 - smoothSizeProgress);
                this.outerParticles[i].currentSize = targetSize;
            sizes.setX(i, targetSize);
        }
    }
    colors.needsUpdate = true;
    opacities.needsUpdate = true;
    sizes.needsUpdate = true;
        const startSpacing = this.config.additionalCircleVerticalSpacing;
    const endSpacing = 1.5;
    const currentSpacing = startSpacing + (endSpacing - startSpacing) * verticalSpacingProgress;
    const startColorSpacing = new THREE.Color(0xffffff);
    const endColorSpacing = new THREE.Color(0x0C0E13);
    const processedIndices = new Set();
    const time = Date.now() * 0.001;
        this.innerParticles.forEach(particle => {
        if (particle.isInnerCircle || (particle.isAdditionalCircle && particle.additionalCircleIndex !== 1)) {
            const currentColorSpacing = startColorSpacing.clone().lerp(endColorSpacing, innerColorProgress);
            particle.color = currentColorSpacing;
            particle.opacity = 1.0;
            if (shrinkProgress > 0 && !particle.hasBeenSplit) {
                if (!particle.shrinkStartPosition) {
                    particle.shrinkStartPosition = {
                        x: particle.originalX,
                        y: particle.originalY,
                        z: particle.originalZ
                    };
                    particle.originalSize = particle.size;
                }
                let currentProgress;
                if (particle.additionalCircleIndex === 0 || particle.additionalCircleIndex === 2) {
                    currentProgress = shrinkProgressClose;
                } else {
                    currentProgress = shrinkProgress;
                }
                const baseY = particle.shrinkStartPosition.y;
                const nonLinearProgress = Math.pow(currentProgress, 2.0);
                const convergenceSpeed = Math.sqrt(
                    Math.pow(particle.shrinkStartPosition.x, 2) + 
                    Math.pow(particle.shrinkStartPosition.z, 2)
                    ) / this.config.innerRadius;
                const compressionFactor = Math.pow(nonLinearProgress, 0.7);
                const finalScale = 0.2 + (1.0 - compressionFactor) * 0.8;
                particle.originalX = particle.shrinkStartPosition.x * (1 - nonLinearProgress * convergenceSpeed) * finalScale;
                particle.originalZ = particle.shrinkStartPosition.z * (1 - nonLinearProgress * convergenceSpeed) * finalScale;
                particle.originalY = baseY;
                const targetSize = particle.originalSize * 0.4;
                particle.currentSize = particle.originalSize - (particle.originalSize - targetSize) * currentProgress;
                particle.x = particle.originalX;
                particle.y = particle.originalY;
                particle.z = particle.originalZ;
            } else if (shrinkProgress === 0 && particle.shrinkStartPosition) {
                particle.originalX = particle.shrinkStartPosition.x;
                particle.originalZ = particle.shrinkStartPosition.z;
                particle.originalY = particle.shrinkStartPosition.y;
                particle.x = particle.originalX;
                particle.y = particle.originalY;
                particle.z = particle.originalZ;
                particle.currentSize = particle.originalSize;
            }
        }
        const verticalSpeed = 0.8 + (particle.additionalCircleIndex * 0.1);
        const verticalAmplitude = 0.01;
        const individualOffset = particle.index * 0.5;
        const verticalOffset = Math.sin(time * verticalSpeed + individualOffset) * verticalAmplitude;
        let baseY;
        if (particle.isInnerCircle) {
            baseY = 2 * currentSpacing;
        } else if (particle.isAdditionalCircle) {
            if (particle.additionalCircleIndex === 0) {
                baseY = currentSpacing;
            } else if (particle.additionalCircleIndex === 1) {
                baseY = 0;
            } else if (particle.additionalCircleIndex === 2) {
                baseY = -currentSpacing;
            } else if (particle.additionalCircleIndex === 3) {
                baseY = -2 * currentSpacing;
            }
        }
        particle.x = particle.originalX;
        particle.y = baseY + verticalOffset;
        particle.z = particle.originalZ;
    });
        this.innerGeometry.attributes.position.needsUpdate = true;
        this.innerGeometry.attributes.color.needsUpdate = true;
        this.innerGeometry.attributes.opacity.needsUpdate = true;
    const currentRotationX = 90 - (180 * (globalProgress / 100));
        this.particlesGroup.rotation.x = THREE.MathUtils.degToRad(currentRotationX);
    const cameraProgress = Math.min(1, globalProgress / outerCircleEndFade);
        const currentDistance = this.scrollConfig.startDistance - 
                              ((this.scrollConfig.startDistance - this.scrollConfig.endDistance) * cameraProgress);
        this.camera.position.z = currentDistance;
    if (splitProgress > 0) {
            this.config.splitAnimation.active = true;
            this.config.splitAnimation.currentSizeMultiplier = 1.0;
            this.config.splitAnimation.otherCirclesOpacity = 1.0 - splitProgress;
            this.updateSplitAnimation(splitProgress);
    } else {
            this.config.splitAnimation.active = false;
            this.config.splitAnimation.currentSizeMultiplier = 1.0;
            this.config.splitAnimation.otherCirclesOpacity = 1.0;
            this.updateSplitAnimation(0);
    }
}

    updateSplitAnimation(progress) {
        const centralParticles = this.particles.filter(p => 
        p.isAdditionalCircle && 
        p.additionalCircleIndex === 1
    );
    if (centralParticles.length === 0 || progress < 0 || progress > 1) {
        return;
    }
        const gridSize = this.config.splitAnimation.gridSize;
    const totalSubCircles = gridSize * gridSize;
    const particlesPerSubCircle = Math.ceil(centralParticles.length / totalSubCircles);
    centralParticles.forEach((particle, index) => {
        particle.active = true;
        particle.opacity = 1.0;
        if (particle.isExtraGreenParticle) {
            particle.currentSize = particle.size * progress;
        } else {
            particle.currentSize = particle.size;
        }
        if (!particle.originalX) {
            particle.originalX = particle.x;
            particle.originalY = particle.y;
            particle.originalZ = particle.z;
        }
        if (!particle.splitStartPosition) {
            particle.splitStartPosition = {
                x: particle.originalX,
                y: particle.originalY,
                z: particle.originalZ
            };
        }
        if (!particle.splitTarget) {
            const subCircleIndex = Math.floor(index / particlesPerSubCircle);
            const row = Math.floor(subCircleIndex / gridSize);
            const col = subCircleIndex % gridSize;
                const centerX = (col - (gridSize - 1) / 2) * this.config.splitAnimation.spacing;
                const centerZ = (row - (gridSize - 1) / 2) * this.config.splitAnimation.spacing;
                particle.isBorder = Math.random() < this.config.splitAnimation.borderParticleRatio;
            const particleIndexInSubCircle = index % particlesPerSubCircle;
            const angleInSubCircle = (particleIndexInSubCircle / particlesPerSubCircle) * Math.PI * 2;
            let radiusFactor;
            if (particle.isBorder) {
                radiusFactor = 0.8 + Math.random() * 0.4;
            } else {
                    radiusFactor = Math.pow(Math.random(), 0.5) * this.config.splitAnimation.circleFill;
            }
                const finalRadius = this.config.splitAnimation.circleRadius * radiusFactor;
            particle.splitTarget = {
                x: centerX + Math.cos(angleInSubCircle) * finalRadius,
                z: centerZ + Math.sin(angleInSubCircle) * finalRadius,
                y: particle.y
            };
        }
        const easeProgress = progress < 0.5 
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const time = Date.now() * 0.001;
        const individualOffset = index * 0.5;
        const verticalSpeed = 0.8;
        const horizontalSpeed = 0.4;
        const verticalAmplitude = 0.15;
        const horizontalAmplitude = 0.1;
        const verticalOffset = Math.sin(time * verticalSpeed + individualOffset) * verticalAmplitude;
        const horizontalOffsetX = Math.cos(time * horizontalSpeed + individualOffset) * horizontalAmplitude;
        const horizontalOffsetZ = Math.sin(time * horizontalSpeed + individualOffset * 1.3) * horizontalAmplitude;
        const baseX = particle.splitStartPosition.x * (1 - easeProgress) + particle.splitTarget.x * easeProgress;
        const baseZ = particle.splitStartPosition.z * (1 - easeProgress) + particle.splitTarget.z * easeProgress;
        const floatProgress = Math.pow(progress, 0.7);
        particle.x = baseX + horizontalOffsetX * floatProgress;
        particle.y = particle.splitStartPosition.y + verticalOffset * floatProgress;
        particle.z = baseZ + horizontalOffsetZ * floatProgress;
        particle.hasBeenSplit = true;
    });
}

    createParticlesGeometry() {
        const totalParticles = this.config.innerCircleParticles + 
                             (this.config.additionalCircles * this.config.additionalCircleParticles) + 
                             this.config.outerCircleParticles;
    const positions = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    const colors = new Float32Array(totalParticles * 3);
    const opacities = new Float32Array(totalParticles);
    for (let i = 0; i < totalParticles; i++) {
        const idx = i * 3;
        positions[idx] = 0;
        positions[idx + 1] = 0;
        positions[idx + 2] = 0;
            sizes[i] = this.config.baseParticleSize;
            const color = new THREE.Color(this.config.particleColor);
        colors[idx] = color.r;
        colors[idx + 1] = color.g;
        colors[idx + 2] = color.b;
        opacities[i] = 1.0;
    }
    const baseColor = {
            main: new THREE.Color(this.config.particleColor),
            split: new THREE.Color(this.config.splitCircleColor)
    };
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    return { geometry, positions, sizes, colors, opacities, baseColor };
}

    createParticlesMaterial(isOuterCircle = false) {
    return new THREE.ShaderMaterial({
        uniforms: {
                cameraPos: { value: this.camera.position }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            attribute float opacity;
            varying vec3 vColor;
            varying float vOpacity;
            uniform vec3 cameraPos;
            void main() {
                vColor = color;
                vOpacity = opacity;
                float distanceToCamera = distance(position, cameraPos);
                    float scaleFactor = 1.0 - (distanceToCamera * ${this.config.perspectiveEffect.toFixed(2)}) / 10.0;
                float adjustedSize = size * max(scaleFactor, 0.3);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = adjustedSize * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vOpacity;
            void main() {
                vec2 center = vec2(0.5, 0.5);
                float dist = length(gl_PointCoord - center);
                float threshold = 0.25;
                float alpha = 1.0 - smoothstep(threshold, threshold + 0.01, dist);
                alpha *= pow(vOpacity, 1.5);
                vec3 finalColor = vColor;
                if(finalColor.r <= 0.05 && finalColor.g <= 0.06 && finalColor.b <= 0.08) {
                    finalColor = vec3(0.047, 0.055, 0.075);
                    alpha = 0.0;
                }
                gl_FragColor = vec4(finalColor, alpha);
                if (dist > threshold + 0.01 || alpha < 0.01) discard;
            }
        `,
        transparent: true,
        depthTest: true,
        depthWrite: isOuterCircle,
        blending: THREE.NormalBlending
    });
}

    createParticles() {
    const particles = [];
    let index = 0;
        for (let i = 0; i < this.config.innerCircleParticles; i++) {
            const particle = new Particle(index++, this.config);
        particle.isInnerCircle = true;
        particle.isAdditionalCircle = false;
        particle.additionalCircleIndex = -1;
        particle.isStatic = true;
        particle.resetParticle();
        particles.push(particle);
    }
        for (let circleIndex = 0; circleIndex < this.config.additionalCircles; circleIndex++) {
        const particleCount = circleIndex === 1 ? 
                (this.config.greenCircleParticles + this.config.greenCircleExtraParticles) : 
                this.config.whiteCircleParticles;
            const particleScale = circleIndex === 1 ? this.config.greenCircleParticleScale : this.config.whiteCircleParticleScale;
        for (let i = 0; i < particleCount; i++) {
                const particle = new Particle(index++, this.config);
            particle.isInnerCircle = false;
            particle.isAdditionalCircle = true;
            particle.additionalCircleIndex = circleIndex;
            particle.isStatic = true;
            particle.particleScale = particleScale;
                if (circleIndex === 1 && i >= this.config.greenCircleParticles) {
                particle.isExtraGreenParticle = true;
                    particle.size = this.config.baseParticleSize * particleScale;
                particle.currentSize = 0;
                particle.opacity = 1;
            }
            particle.resetParticle();
            if (particle.isExtraGreenParticle) {
                particle.currentSize = 0;
            }
            particles.push(particle);
        }
    }
    let staticCount = 0;
    let mobileCount = 0;
    const targetMobileRatio = 0.4;
        for (let i = 0; i < this.config.outerCircleParticles; i++) {
            const particle = new Particle(index++, this.config);
        particle.isInnerCircle = false;
        particle.isAdditionalCircle = false;
        particle.additionalCircleIndex = -1;
        const currentMobileRatio = mobileCount / (staticCount + mobileCount + 1);
        const shouldBeMobile = currentMobileRatio < targetMobileRatio;
        particle.isStatic = !shouldBeMobile;
        particle.resetOuterParticle();
        if (shouldBeMobile) {
            mobileCount++;
        } else {
            staticCount++;
        }
        particles.push(particle);
    }
    return particles;
}

    createGuideCircles() {
    return new THREE.Group();
}

    start() {
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
            canvasContainer.innerHTML = '';
            canvasContainer.appendChild(this.renderer.domElement);
            this.camera.position.set(0, 0, this.scrollConfig.startDistance);
            this.camera.lookAt(0, 0, 0);
            
            // Forcer une mise à jour initiale de la taille
            this.updateRendererSize();
            
            this.guideCircles = this.createGuideCircles();
            this.scene.add(this.guideCircles);
            
            this.init();
            
            // Add event listeners
            window.addEventListener('resize', this.updateRendererSize);
            window.addEventListener('scroll', this.handleScroll);
            
            // Start animation loop
            this.animate();
        }
    }

    destroy() {
        this.isDestroyed = true;

        // Cancel animation frame if it exists
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('beforeunload', this.destroy);

        // Clean up Three.js resources
        if (this.innerParticles) {
            for (const particle of this.innerParticles) {
                if (particle && particle.geometry) {
                    particle.geometry.dispose();
                }
                if (particle && particle.material) {
                    particle.material.dispose();
                }
            }
        }

        if (this.outerParticles) {
            for (const particle of this.outerParticles) {
                if (particle && particle.geometry) {
                    particle.geometry.dispose();
                }
                if (particle && particle.material) {
                    particle.material.dispose();
                }
            }
        }

        if (this.innerGeometry) {
            this.innerGeometry.dispose();
        }

        if (this.outerGeometry) {
            this.outerGeometry.dispose();
        }

        if (this.innerMaterial) {
            this.innerMaterial.dispose();
        }

        if (this.outerMaterial) {
            this.outerMaterial.dispose();
        }

        // Remove canvas
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement) {
                this.renderer.domElement.remove();
            }
        }

        // Clear references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.innerParticles = null;
        this.outerParticles = null;
        this.innerGeometry = null;
        this.outerGeometry = null;
        this.innerMaterial = null;
        this.outerMaterial = null;
        this.particlesGroup = null;
        this.outerCircleGroup = null;
        this.guideCircles = null;
    }

    handleScroll() {
        this.hasScrolled = true;
        requestAnimationFrame(() => this.updateCameraFromScroll());
    }

    updateProgress() {
        const progressValue = document.querySelector('.loading-progress-value');
        if (!progressValue) return;

        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const progress = Math.min(100, Math.round((scrolled / scrollHeight) * 100));
        progressValue.textContent = `[ ${progress}% ]`;
    }

    animate() {
        if (this.isDestroyed) return;

        this.animationFrameId = requestAnimationFrame(this.animate);
        
        if (!this.scene || !this.camera || !this.renderer) {
            return;
        }
        
        let shrinkProgress = 0;
        if (this.hasScrolled) {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
            const globalProgress = (scrolled / scrollHeight) * 100;
            const shrinkStart = 55;
            const shrinkEnd = 70;
            shrinkProgress = Math.min(1, Math.max(0, (globalProgress - shrinkStart) / (shrinkEnd - shrinkStart)));
                this.updateCameraFromScroll();
        } else {
            this.outerParticles.forEach((particle, i) => {
                const idx = i * 3;
                this.outerGeometry.attributes.color.array[idx] = 1;
                this.outerGeometry.attributes.color.array[idx + 1] = 1;
                this.outerGeometry.attributes.color.array[idx + 2] = 1;
            });
            this.outerGeometry.attributes.color.needsUpdate = true;
        }
        const mainColor = new THREE.Color(this.config.particleColor);
        const splitColor = new THREE.Color(this.config.splitCircleColor);
        let movingCount = 0;
        const time = Date.now() * 0.001;
        this.innerParticles.forEach((particle, i) => {
            if (!particle.active) return;
            if (!particle.isStatic) {
                particle.update(0.016);
            }
            const idx = i * 3;
            if (particle.isAdditionalCircle || particle.isInnerCircle) {
                if (particle.floatPhase === undefined) {
                    particle.floatPhase = Math.random() * Math.PI * 2;
                }
                let floatScale = 1.0;
                if (shrinkProgress > 0 && !particle.hasBeenSplit) {
                    const targetSize = particle.originalSize * 0.4;
                    const currentSizeRatio = (particle.currentSize - targetSize) / (particle.originalSize - targetSize);
                    floatScale = Math.max(0.2, currentSizeRatio);
                }
                const verticalOffset = Math.sin(time * 1.2 + particle.floatPhase) * 0.05 * floatScale;
                const horizontalOffset = Math.cos(time * 0.8 + particle.floatPhase) * 0.03 * floatScale;
                    this.innerGeometry.attributes.position.array[idx] = particle.x + horizontalOffset;
                    this.innerGeometry.attributes.position.array[idx + 1] = particle.y + verticalOffset;
                    this.innerGeometry.attributes.position.array[idx + 2] = particle.z + horizontalOffset;
            } else {
                    this.innerGeometry.attributes.position.array[idx] = particle.x;
                    this.innerGeometry.attributes.position.array[idx + 1] = particle.y;
                    this.innerGeometry.attributes.position.array[idx + 2] = particle.z;
            }
            this.innerGeometry.attributes.size.array[i] = particle.currentSize;
        const color = particle.isAdditionalCircle && particle.additionalCircleIndex === 1 ? 
            splitColor : (particle.color || mainColor);
            this.innerGeometry.attributes.color.array[idx] = color.r;
            this.innerGeometry.attributes.color.array[idx + 1] = color.g;
            this.innerGeometry.attributes.color.array[idx + 2] = color.b;
            this.innerGeometry.attributes.opacity.array[i] = particle.opacity;
        });
        this.outerParticles.forEach((particle, i) => {
            if (!particle.active) return;
            if (!particle.isStatic) {
                particle.update(0.016);
                movingCount++;
            } else {
                if (!particle.floatSpeed || !particle.floatPhase || !particle.floatAmplitude) {
                    particle.floatSpeed = 0.03 + Math.random() * 0.03;
                    particle.floatPhase = Math.random() * Math.PI * 2;
                    particle.floatAmplitude = 0.04 + Math.random() * 0.04;
                }
                particle.floatPhase += particle.floatSpeed * 0.016 * 30;
                const xOffset = Math.sin(particle.floatPhase * 0.5) * particle.floatAmplitude * 1.2;
                const yOffset = Math.cos(particle.floatPhase * 0.7) * particle.floatAmplitude * 1.2;
                const zOffset = Math.sin(particle.floatPhase * 0.6) * particle.floatAmplitude * 1.2;
                const baseX = Math.cos(particle.angle) * particle.radius;
                const baseZ = Math.sin(particle.angle) * particle.radius;
                particle.x = baseX + xOffset;
                particle.y = yOffset;
                particle.z = baseZ + zOffset;
            }
            const idx = i * 3;
            this.outerGeometry.attributes.position.array[idx] = particle.x;
            this.outerGeometry.attributes.position.array[idx + 1] = particle.y;
            this.outerGeometry.attributes.position.array[idx + 2] = particle.z;
            this.outerGeometry.attributes.size.array[i] = particle.currentSize;
            this.outerGeometry.attributes.opacity.array[i] = particle.opacity;
        });
        const minMobileParticles = Math.floor(this.config.outerCircleParticles * this.config.minMobileRatio);
    if (movingCount < minMobileParticles) {
        const particlesToConvert = Math.min(50, minMobileParticles - movingCount);
        let resetCount = 0;
            for (let i = 0; i < this.outerParticles.length && resetCount < particlesToConvert; i++) {
                const particle = this.outerParticles[i];
            if (particle.isStatic) {
                particle.isStatic = false;
                particle.direction = Math.random() < 0.7 ? -1 : 1;
                    particle.speed = this.config.particleSpeed * (0.7 + Math.random() * 0.6);
                particle.distanceTraveled = 0;
                resetCount++;
            }
        }
    }
        this.innerGeometry.attributes.position.needsUpdate = true;
        this.innerGeometry.attributes.size.needsUpdate = true;
        this.innerGeometry.attributes.color.needsUpdate = true;
        this.innerGeometry.attributes.opacity.needsUpdate = true;
        this.outerGeometry.attributes.position.needsUpdate = true;
        this.outerGeometry.attributes.size.needsUpdate = true;
        this.outerGeometry.attributes.color.needsUpdate = true;
        this.outerGeometry.attributes.opacity.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
    }

    updateRendererSize() {
        const container = document.getElementById('canvas-container');
        if (container) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }
}

export class InvestorAnimation {
    constructor() {
        // Define configuration as a class property
        this.config = {
            radius: 1.5,
            particleCount: 500,
            particleSize: 12.0,
            curveAmplitude: 0.13,
            curveFrequency: 9,
            curvePhases: 4,
            noiseScale: 0.8,
            noisePower: 1.2,
            backgroundColor: 0x0B0E13,
            particleColor: 0x00FEA5,
            cameraDistance: -3,
            initialZoom: 2.10,
            finalZoom: 1.0,
            cameraNear: 1,
            cameraFar: 2.2,
            initialFar: 2.2,
            finalFar: 5.0,
            clipPlaneHeight: 0.5,
            clipPlanePosition: 0.0,
            borderWidth: 0.4,
            borderParticleCount: 2000,
            borderParticleSize: 6.80,
            borderParticleMaxSize: 6.80,
            borderParticleMinSize: 6.80,
            borderColor: 0xFFFFFF,
            thicknessVariationMultiplier: 5.0,
            greenLine: {
                width: 1.0,
                height: 0.02
            }
        };

        // Initialize properties
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.borderParticles = null;
        this.clock = new THREE.Clock();
        this.container = null;
        this.heightVariation = 0.12;
        this.lineThickness = 0.030;
        this.lastFrameTime = 0;
        this.hasPrewarmed = false;
        this.targetRotationY = 0;
        this.currentRotationY = 0;
        this.targetRotationX = 0;
        this.currentRotationX = 0;
        this.visibilityObserver = null;
        this.prewarmObserver = null;
        this.currentZoom = 2.10;
        this.targetZoom = 2.10;
        this.currentFar = 2.2;
        this.targetFar = 2.2;
        this.progressBar = null;
        this.progressValue = null;
        this.targetLineOpacity = 1;
        this.currentLineOpacity = 1;
        this.planeMesh = null;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.lastScrollY = 0;
        this.mainInitialPositions = null;
        this.mainFinalPositions = null;
        this.positions = null;
        this.phaseOffsets = [0, Math.PI/2, Math.PI, Math.PI*3/2];
        this.frequencyMultipliers = [1, 0.5, 0.7, 0.3];
        this.amplitudeMultipliers = [1.5, 0.7, 0.01, 0.002];
        this.resizeTimeout = null;
        this.resizeThrottleTime = 150;
        this.isCanvasVisible = true;

        // Initialize caches
        this.particleCache = {
            positions: null,
            phases: null,
            deploymentProgress: null,
            thicknessProgress: null,
            borderPhases: null,
            borderDeploymentProgress: null
        };

        this.mathCache = {
            phases: new Float32Array(this.config.particleCount + this.config.borderParticleCount),
            borderPhases: new Float32Array(this.config.particleCount + this.config.borderParticleCount)
        };

        for (let i = 0; i < this.config.particleCount + this.config.borderParticleCount; i++) {
            this.mathCache.phases[i] = Math.random() * Math.PI * 2;
            this.mathCache.borderPhases[i] = Math.random() * Math.PI * 2;
        }

        // Initialize Three.js helpers
        this.tempVector = new THREE.Vector3();
        this.tempQuaternion = new THREE.Quaternion();
        this.tempMatrix = new THREE.Matrix4();

        // Bind methods that will be used as callbacks
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.updateScroll = this.updateScroll.bind(this);
        this.updateClipPlane = this.updateClipPlane.bind(this);
        this.destroy = this.destroy.bind(this);

        // Set up event listeners
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('beforeunload', this.destroy);
        this.rafId = null;
    }

    start() {
        // Initialize everything
        this.init();
        
        // Start animation loop
        this.lastFrameTime = performance.now();
        this.animate(this.lastFrameTime);
        
        // Add scroll event listener
        window.addEventListener('scroll', this.throttle(this.updateScroll, 16), { passive: true });
        window.addEventListener('scroll', () => {
            if (!this.isScrolling) {
                this.isScrolling = true;
            }
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 150);
        }, { passive: true });
    }

    createOptimizedGeometry(particleCount) {
        const positions = new Float32Array(particleCount * 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        return geometry;
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    noise1D(x) {
        const X = Math.floor(x) & 255;
        x -= Math.floor(x);
        const fadeX = x * x * (3 - 2 * x);
        const h1 = Math.sin(X * 12.9898) * 43758.5453123;
        const h2 = Math.sin((X + 1) * 12.9898) * 43758.5453123;
        return this.lerp(h1 - Math.floor(h1), h2 - Math.floor(h2), fadeX);
    }

    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }
    easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
    init() {
        this.container = document.getElementById('canvas-container');
        if (!this.container) {
            console.error('Canvas container not found');
            return;
        }
        this.visibilityObserver = this.createObserver(this.container);
        const pixelRatio = 1; // Même pixel ratio sur mobile et desktop
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.backgroundColor);
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const baseWidth = 1920;
        const isMobile = window.innerWidth <= 768;
        const frustumSize = isMobile ? 
            (baseWidth / this.container.clientWidth) * 1.6 :
            (baseWidth / this.container.clientWidth) * 3.5;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            this.config.cameraNear,
            this.config.cameraFar
        );
        this.camera.position.set(0, 0, this.config.cameraDistance);
        this.camera.lookAt(0, 0, 0);
        this.camera.zoom = this.config.initialZoom;
        this.camera.updateProjectionMatrix();
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: 'high-performance',
            precision: 'highp',
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            logarithmicDepthBuffer: false
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight, false);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setClearColor(0x0B0E13, 1);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = false;
        this.renderer.physicallyCorrectLights = false;
        this.renderer.info.autoReset = false;
        this.container.appendChild(this.renderer.domElement);
        
        // Initialize Lenis for smooth scrolling
        if (typeof Lenis !== 'undefined') {
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true
            });
            
            const updateProgress = () => {
                this.updateProgress();
            };
            
            const raf = (time) => {
                lenis.raf(time);
                updateProgress();
                this.rafId = requestAnimationFrame(raf);
            };
            
            window.lenis = lenis;
            this.rafId = requestAnimationFrame(raf);
        }
        
        this.createParticles();
        this.updateParticles();
        if (this.particles && this.particles.material.uniforms) {
            this.particles.material.uniforms.scaleFactor.value = this.container.clientWidth / baseWidth;
        }
        if (this.borderParticles && this.borderParticles.material.uniforms) {
            this.borderParticles.material.uniforms.scaleFactor.value = this.container.clientWidth / baseWidth;
        }
        this.progressBar = document.querySelector('.loading-progress-bar');
        this.progressValue = document.querySelector('.loading-progress-value');
        this.prewarmObserver = this.createObserver(this.container);
        this.prewarmObserver.observe(this.container);
        this.clock = new THREE.Clock();
        this.lastFrameTime = performance.now();
        this.animate(this.lastFrameTime);
        const thresholdLineGeometry = new THREE.BufferGeometry();
        const lineWidth = 1;
        const vertices = new Float32Array([
            -lineWidth/2, 0, 0,
            lineWidth/2, 0, 0
        ]);
        thresholdLineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const thresholdLineMaterial = new THREE.LineBasicMaterial({
            color: 0x00FEA5,
            linewidth: 2,
            transparent: true,
            opacity: 1.0,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const thresholdLine = new THREE.Line(thresholdLineGeometry, thresholdLineMaterial);
        thresholdLine.renderOrder = 999;
        thresholdLine.position.set(0, this.config.clipPlanePosition - this.config.clipPlaneHeight, -1.5);
        thresholdLine.frustumCulled = false;
        this.scene.add(thresholdLine);
        this.planeMesh = thresholdLine;
        this.initializeParticleCache();
        this.currentZoom = this.config.initialZoom;
        this.targetZoom = this.config.initialZoom;
        this.currentFar = this.config.initialFar;
        this.targetFar = this.config.initialFar;
        this.camera.zoom = this.currentZoom;
        this.camera.far = this.currentFar;
        this.camera.near = Math.max(0.1, this.currentFar * 0.1);
        this.camera.updateProjectionMatrix();
    }
    initializeParticleCache() {
        const totalParticles = this.config.particleCount + this.config.borderParticleCount;
        this.particleCache.positions = new Float32Array(totalParticles * 3);
        this.particleCache.phases = new Float32Array(totalParticles);
        this.particleCache.deploymentProgress = new Float32Array(totalParticles);
        this.particleCache.thicknessProgress = new Float32Array(totalParticles);
        this.particleCache.borderPhases = new Float32Array(totalParticles);
        this.particleCache.borderDeploymentProgress = new Float32Array(totalParticles);
    }
    updateProgressIndicator(scrollProgress) {
        if (this.progressBar && this.progressValue) {
            this.progressBar.style.setProperty('--progress', `${scrollProgress}%`);
            this.progressValue.textContent = `[ ${Math.round(scrollProgress)}% ]`;
        }
    }

    updateProgress() {
        const progressValue = document.querySelector('.loading-progress-value');
        if (!progressValue) return;
        
        const investorSection = document.querySelector('.investor');
        if (!investorSection) {
            progressValue.textContent = `[ 0% ]`;
            return;
        }

        const investorRect = investorSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const startPoint = windowHeight * 0.9;
        const sectionTop = investorRect.top;

        if (sectionTop > startPoint || investorRect.bottom <= 0) {
            progressValue.textContent = `[ 0% ]`;
            return;
        }

        const totalHeight = investorRect.height - windowHeight;
        const currentScroll = -investorRect.top;
        const scrollAtStart = -startPoint;
        const adjustedScroll = currentScroll - scrollAtStart;
        const adjustedTotal = totalHeight - scrollAtStart;
        const progress = Math.min(100, Math.max(0, Math.round((adjustedScroll / adjustedTotal) * 100)));
        
        progressValue.textContent = `[ ${progress}% ]`;
    }


    animate(timestamp) {
        requestAnimationFrame(this.animate);
        if (window.lenis && (timestamp - this.lastFrameTime >= 16)) {
            window.lenis.raf(timestamp);
        }
        if (timestamp - this.lastFrameTime < 15.5) {
            return;
        }
        this.lastFrameTime = timestamp;
        const scrollProgress = this.calculateScrollProgress();
        this.updateProgressIndicator(scrollProgress);
        this.updateProgress();
        if (this.particles) {
            const normalizedProgress = scrollProgress / 100;
            this.targetRotationY = -(normalizedProgress) * (180 * Math.PI / 180);
            if (scrollProgress > 58) {
                const rotationProgress = (scrollProgress - 58) / 20;
                this.targetRotationX = -(Math.min(1, rotationProgress)) * (90 * Math.PI / 180);
            } else {
                this.targetRotationX = 0;
            }
            if (window.lenis) {
                const rotationLerp = window.lenis.options.lerp;
                this.currentRotationY += (this.targetRotationY - this.currentRotationY) * rotationLerp;
                this.currentRotationX += (this.targetRotationX - this.currentRotationX) * rotationLerp;
                this.particles.rotation.y = this.currentRotationY;
                this.particles.rotation.x = this.currentRotationX;
                if (this.borderParticles) {
                    this.borderParticles.rotation.copy(this.particles.rotation);
                }
            }
            this.updateCameraParameters(scrollProgress);
        }
        if (this.particles && this.particles.geometry) {
            this.updateParticlesOptimized(timestamp, scrollProgress);
        }
        if (this.borderParticles && this.borderParticles.geometry) {
            this.updateBorderParticlesOptimized(timestamp, scrollProgress);
        }
        this.updatePlaneSeparation(scrollProgress);
        this.renderer.render(this.scene, this.camera);
    }
    updateCameraParameters(scrollProgress) {
        if (scrollProgress < 58) {
            this.targetZoom = this.config.initialZoom;
        } else if (scrollProgress >= 58 && scrollProgress <= 78) {
            const zoomProgress = Math.min(1, (scrollProgress - 58) / 20);
            this.targetZoom = this.config.initialZoom + (this.config.finalZoom - this.config.initialZoom) * zoomProgress;
        } else {
            this.targetZoom = this.config.finalZoom;
        }
        if (scrollProgress < 23) {
            this.targetFar = this.config.initialFar;
        } else if (scrollProgress >= 23 && scrollProgress <= 50) {
            const farProgress = Math.min(1, (scrollProgress - 23) / 27);
            this.targetFar = this.config.initialFar + (this.config.finalFar - this.config.initialFar) * farProgress;
        } else {
            this.targetFar = this.config.finalFar;
        }
        if (window.lenis) {
            const lerpFactor = window.lenis.options.lerp * 0.8;
            this.currentZoom += (this.targetZoom - this.currentZoom) * lerpFactor;
            this.currentFar += (this.targetFar - this.currentFar) * lerpFactor;
            this.camera.zoom = this.currentZoom;
            this.camera.far = this.currentFar;
            this.camera.near = Math.max(0.1, this.currentFar * 0.1);
            this.camera.updateProjectionMatrix();
        }
    }
    updatePlaneSeparation(scrollProgress) {
        if (scrollProgress <= 32) {
            this.config.clipPlaneHeight = 0.5;
            this.config.clipPlanePosition = 0.5;
            this.targetLineOpacity = 1;
        } else if (scrollProgress <= 40) {
            const progress = (scrollProgress - 32) / 8;
            this.config.clipPlaneHeight = 0.5 - (progress * 0.1);
            this.config.clipPlanePosition = 0.5;
            this.targetLineOpacity = 1;
        } else if (scrollProgress <= 46) {
            this.config.clipPlaneHeight = 0.4;
            this.config.clipPlanePosition = 0.5;
            this.targetLineOpacity = 1;
        } else if (scrollProgress <= 68) {
            const heightProgress = (scrollProgress - 46) / 22;
            const opacityProgress = (scrollProgress - 46) / 14;
            this.targetLineOpacity = Math.max(0, 1 - opacityProgress);
            this.config.clipPlaneHeight = 0.4 + (heightProgress * 0.6);
            this.config.clipPlanePosition = 0.5;
        } else {
            this.config.clipPlaneHeight = 1.0;
            this.config.clipPlanePosition = 0.5;
            this.targetLineOpacity = 0;
        }
        this.updateClipPlane();
        if (this.planeMesh && window.lenis) {
            const lerpFactor = window.lenis.options.lerp;
            const worldY = (this.config.clipPlanePosition - this.config.clipPlaneHeight) * 2;
            this.planeMesh.position.y += (worldY - this.planeMesh.position.y) * lerpFactor;
            this.currentLineOpacity += (this.targetLineOpacity - this.currentLineOpacity) * lerpFactor;
            if (this.particles && this.particles.material.uniforms) {
                this.particles.material.uniforms.clipPlaneHeight.value = this.config.clipPlaneHeight;
                this.particles.material.uniforms.clipPlanePosition.value = this.planeMesh.position.y / 2;
            }
            if (this.borderParticles && this.borderParticles.material.uniforms) {
                this.borderParticles.material.uniforms.clipPlaneHeight.value = this.config.clipPlaneHeight;
                this.borderParticles.material.uniforms.clipPlanePosition.value = this.planeMesh.position.y / 2;
            }
            const scaleCompensation = this.config.initialZoom / this.camera.zoom;
            const circleDiameter = this.config.radius * 2;
            const targetWidth = circleDiameter * this.config.greenLine.width;
            this.planeMesh.scale.set(targetWidth * scaleCompensation, 1, 1);
            this.planeMesh.material.opacity = this.currentLineOpacity;
            this.planeMesh.visible = this.currentLineOpacity > 0.001;
        }
    }
    updateBorderParticlesOptimized(timestamp, scrollProgress) {
        const positions = this.borderParticles.geometry.attributes.position.array;
        const initialPositions = this.borderParticles.geometry.attributes.initialPosition.array;
        const finalPositions = this.borderParticles.geometry.attributes.finalPosition.array;
        const time = timestamp * 0.001;
        const batchSize = 1000;
        const totalParticles = positions.length / 3;
        const deploymentLerp = window.lenis ? window.lenis.options.lerp : 0.1;
        if (!this.particleCache.borderPhases) {
            this.particleCache.borderPhases = new Float32Array(totalParticles);
            for (let i = 0; i < totalParticles; i++) {
                this.particleCache.borderPhases[i] = Math.random() * Math.PI * 2;
            }
        }
        if (!this.particleCache.borderDeploymentProgress) {
            this.particleCache.borderDeploymentProgress = new Float32Array(totalParticles);
        }
        const isDeploying = scrollProgress >= 60;
        const deploymentProgress = isDeploying ? (scrollProgress - 60) / 30 : 0;
        const targetDeployment = Math.min(1, deploymentProgress);
        for (let batch = 0; batch < totalParticles; batch += batchSize) {
            const end = Math.min(batch + batchSize, totalParticles);
            for (let i = batch; i < end; i++) {
                const i3 = i * 3;
                const phase = this.particleCache.borderPhases[i];
                const floatX = Math.sin(time * 1.5 + phase) * 0.015;
                const floatY = Math.cos(time * 1.8 + phase) * 0.015;
                const floatZ = Math.sin(time * 2.0 + phase) * 0.015;
                let baseX = initialPositions[i3];
                let baseZ = initialPositions[i3 + 2];
                if (this.particleCache.borderDeploymentProgress[i] === undefined) {
                    this.particleCache.borderDeploymentProgress[i] = 0;
                }
                this.particleCache.borderDeploymentProgress[i] += (targetDeployment - this.particleCache.borderDeploymentProgress[i]) * deploymentLerp;
                const currentDeployment = this.particleCache.borderDeploymentProgress[i];
                const deployedX = initialPositions[i3] + (finalPositions[i3] - initialPositions[i3]) * currentDeployment;
                const deployedZ = initialPositions[i3 + 2] + (finalPositions[i3 + 2] - initialPositions[i3 + 2]) * currentDeployment;
                const dx = deployedX;
                const dz = deployedZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                const dirX = dx / dist;
                const dirZ = dz / dist;
                const radialDirection = ((i % 3) - 1);
                let radialOffset;
                if (radialDirection > 0) {
                    radialOffset = currentDeployment * 0.05 * radialDirection;
                } else {
                    radialOffset = currentDeployment * 0.08 * radialDirection;
                }
                baseX = deployedX + dirX * radialOffset;
                baseZ = deployedZ + dirZ * radialOffset;
                positions[i3] = baseX + floatX;
                positions[i3 + 1] = initialPositions[i3 + 1] + floatY;
                positions[i3 + 2] = baseZ + floatZ;
            }
        }
        this.borderParticles.geometry.attributes.position.needsUpdate = true;
    }
    updateParticlesOptimized(timestamp, scrollProgress) {
        const positions = this.particles.geometry.attributes.position.array;
        const initialPositions = this.particles.geometry.attributes.initialPosition.array;
        const finalPositions = this.particles.geometry.attributes.finalPosition.array;
        const radialOffsets = this.particles.geometry.attributes.radialOffset.array;
        const time = timestamp * 0.001;
        const batchSize = 1000;
        const totalParticles = positions.length / 3;
        const deploymentLerp = window.lenis ? window.lenis.options.lerp : 0.1;
        if (!this.particleCache.phases) {
            this.particleCache.phases = new Float32Array(totalParticles);
            for (let i = 0; i < totalParticles; i++) {
                this.particleCache.phases[i] = Math.random() * Math.PI * 2;
            }
        }
        if (!this.particleCache.deploymentProgress) {
            this.particleCache.deploymentProgress = new Float32Array(totalParticles);
        }
        if (!this.particleCache.thicknessProgress) {
            this.particleCache.thicknessProgress = new Float32Array(totalParticles);
        }
        const isDeploying = scrollProgress >= 60;
        const deploymentProgress = isDeploying ? (scrollProgress - 60) / 30 : 0;
        const targetDeployment = Math.min(1, deploymentProgress);
        const targetThickness = isDeploying ? Math.min(0.1, deploymentProgress * 0.1) : 0;
        for (let batch = 0; batch < totalParticles; batch += batchSize) {
            const end = Math.min(batch + batchSize, totalParticles);
            for (let i = batch; i < end; i++) {
                const i3 = i * 3;
                if (!this.particleCache.phases[i]) {
                    this.particleCache.phases[i] = Math.random() * Math.PI * 2;
                }
                const phase = this.particleCache.phases[i];
                const floatX = Math.sin(time * 1.5 + phase) * 0.015;
                const floatY = Math.cos(time * 1.8 + phase) * 0.015;
                const floatZ = Math.sin(time * 2.0 + phase) * 0.015;
                let baseX = initialPositions[i3];
                let baseZ = initialPositions[i3 + 2];
                if (this.particleCache.deploymentProgress[i] === undefined) {
                    this.particleCache.deploymentProgress[i] = 0;
                }
                if (this.particleCache.thicknessProgress[i] === undefined) {
                    this.particleCache.thicknessProgress[i] = 0;
                }
                this.particleCache.deploymentProgress[i] += (targetDeployment - this.particleCache.deploymentProgress[i]) * deploymentLerp;
                this.particleCache.thicknessProgress[i] += (targetThickness - this.particleCache.thicknessProgress[i]) * deploymentLerp;
                const currentDeployment = this.particleCache.deploymentProgress[i];
                const currentThickness = this.particleCache.thicknessProgress[i];
                const deployedX = initialPositions[i3] + (finalPositions[i3] - initialPositions[i3]) * currentDeployment;
                const deployedZ = initialPositions[i3 + 2] + (finalPositions[i3 + 2] - initialPositions[i3 + 2]) * currentDeployment;
                const dx = deployedX;
                const dz = deployedZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                const dirX = dx / dist;
                const dirZ = dz / dist;
                const radialOffset = radialOffsets[i] * currentThickness;
                baseX = deployedX + dirX * radialOffset;
                baseZ = deployedZ + dirZ * radialOffset;
                positions[i3] = baseX + floatX;
                positions[i3 + 1] = initialPositions[i3 + 1] + floatY;
                positions[i3 + 2] = baseZ + floatZ;
            }
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
    calculateScrollProgress() {
        if (this.isDestroyed) return 0;
        
        const investorSection = document.querySelector('.investor');
        if (!investorSection) return 0;
        
        const investorRect = investorSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const startPoint = windowHeight * 0.9;
        const sectionTop = investorRect.top;
        
        if (sectionTop > startPoint || investorRect.bottom <= 0) {
            return 0;
        }
        
        const totalHeight = investorRect.height - windowHeight;
        const currentScroll = -investorRect.top;
        const scrollAtStart = -startPoint;
        const adjustedScroll = currentScroll - scrollAtStart;
        const adjustedTotal = totalHeight - scrollAtStart;
        return Math.min(100, Math.max(0, Math.round((adjustedScroll / adjustedTotal) * 100)));
    }
    prewarmRenderer() {
        const currentScrollProgress = window.scrollY;
        const testScrollPositions = [0, 30, 60, 90, 100];
        testScrollPositions.forEach(scrollProgress => {
            if (this.particles) {
                const rotationY = -(scrollProgress / 100) * (180 * Math.PI / 180);
                this.particles.rotation.y = rotationY;
                if (scrollProgress > 60) {
                    const rotationX = -((Math.min(scrollProgress, 90) - 60) / 30) * (90 * Math.PI / 180);
                    this.particles.rotation.x = rotationX;
                } else {
                    this.particles.rotation.x = 0;
                }
                if (this.borderParticles) {
                    this.borderParticles.rotation.copy(this.particles.rotation);
                }
            }
            this.renderer.render(this.scene, this.camera);
        });
        if (this.particles) {
            this.particles.rotation.set(0, 0, 0);
            if (this.borderParticles) {
                this.borderParticles.rotation.set(0, 0, 0);
            }
        }
    }
    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.config.particleCount * 3);
        const colors = new Float32Array(this.config.particleCount * 3);
        const mainInitialPositions = new Float32Array(this.config.particleCount * 3);
        const mainFinalPositions = new Float32Array(this.config.particleCount * 3);
        const radialOffsets = new Float32Array(this.config.particleCount);
        const startValues = new Float32Array(this.config.curvePhases);
        const endValues = new Float32Array(this.config.curvePhases);
        for (let phase = 0; phase < this.config.curvePhases; phase++) {
            startValues[phase] = Math.sin(0 * this.config.curveFrequency * this.frequencyMultipliers[phase] + this.phaseOffsets[phase]) || 0;
            endValues[phase] = Math.sin(Math.PI * 2 * this.config.curveFrequency * this.frequencyMultipliers[phase] + this.phaseOffsets[phase]) || 0;
        }
        let maxY = -Infinity;
        let minY = Infinity;
        for (let i = 0; i < this.config.particleCount; i++) {
            const i3 = i * 3;
            const angle = (i / this.config.particleCount) * Math.PI * 2;
            const progress = i / (this.config.particleCount - 1);
            const angleVariation = (Math.random() - 0.5) * 0.02;
            const finalAngle = angle + angleVariation;
            const randomFactor = Math.max(0.8, Math.min(1.2, 0.8 + Math.random() * 0.4));
            const layerOffset = Math.max(-0.04, Math.min(0.04, (randomFactor - 1) * 0.04));
            const initialRadius = Math.max(0.1, this.config.radius * (1 + layerOffset * 0.2));
            const finalRadius = Math.max(0.1, this.config.radius * (1 + layerOffset));
            const initialX = Math.cos(finalAngle) * initialRadius;
            const initialZ = Math.sin(finalAngle) * initialRadius;
            const finalX = Math.cos(finalAngle) * finalRadius;
            const finalZ = Math.sin(finalAngle) * finalRadius;
            const thicknessVariation = Math.max(0, Math.min(1, (Math.abs(Math.cos(finalAngle * 2)) + Math.abs(Math.sin(finalAngle * 3))) * (this.config.thicknessVariationMultiplier * 0.5)));
            const baseThickness = Math.max(0.001, this.lineThickness * (1 + thicknessVariation));
            const randomY = (Math.random() * 2 - 1) * baseThickness * 0.9;
            let y = randomY;
            for (let phase = 0; phase < this.config.curvePhases; phase++) {
                const freq = this.config.curveFrequency * (this.frequencyMultipliers[phase] || 1);
                const amp = this.heightVariation * (this.amplitudeMultipliers[phase] || 1) * 0.9;
                let value = Math.sin(finalAngle * freq + (this.phaseOffsets[phase] || 0)) || 0;
                if (progress > 0.95) {
                    const blend = (progress - 0.95) / 0.05;
                    value = value * (1 - blend) + (startValues[phase] || 0) * blend;
                }
                y += (value * amp) || 0;
            }
            const noiseValue = (this.noise1D(finalAngle * this.config.noiseScale) || 0) * 0.18 + (Math.random() - 0.5) * 0.08;
            y += (noiseValue * this.heightVariation) || 0;
            y = Math.max(-10, Math.min(10, y || 0));
            maxY = Math.max(maxY, y);
            minY = Math.min(minY, y);
            radialOffsets[i] = Math.random() * 2 - 1;
        }
        for (let i = 0; i < this.config.particleCount; i++) {
            const i3 = i * 3;
            const angle = (i / this.config.particleCount) * Math.PI * 2;
            const progress = i / (this.config.particleCount - 1);
            const angleVariation = (Math.random() - 0.5) * 0.02;
            const finalAngle = angle + angleVariation;
            const randomFactor = Math.max(0.8, Math.min(1.2, 0.8 + Math.random() * 0.4));
            const layerOffset = Math.max(-0.04, Math.min(0.04, (randomFactor - 1) * 0.04));
            const initialRadius = Math.max(0.1, this.config.radius * (1 + layerOffset * 0.2));
            const finalRadius = Math.max(0.1, this.config.radius * (1 + layerOffset));
            const initialX = Math.cos(finalAngle) * initialRadius;
            const initialZ = Math.sin(finalAngle) * initialRadius;
            const finalX = Math.cos(finalAngle) * finalRadius;
            const finalZ = Math.sin(finalAngle) * finalRadius;
            const thicknessVariation = Math.max(0, Math.min(1, (Math.abs(Math.cos(finalAngle * 2)) + Math.abs(Math.sin(finalAngle * 3))) * (this.config.thicknessVariationMultiplier * 0.6)));
            const baseThickness = Math.max(0.001, this.lineThickness * (1 + thicknessVariation));
            const randomY = (Math.random() * 2 - 1) * baseThickness;
            let y = randomY;
            for (let phase = 0; phase < this.config.curvePhases; phase++) {
                const freq = this.config.curveFrequency * (this.frequencyMultipliers[phase] || 1);
                const amp = this.heightVariation * (this.amplitudeMultipliers[phase] || 1);
                let value = Math.sin(finalAngle * freq + (this.phaseOffsets[phase] || 0)) || 0;
                if (progress > 0.95) {
                    const blend = (progress - 0.95) / 0.05;
                    value = value * (1 - blend) + (startValues[phase] || 0) * blend;
                }
                y += (value * amp) || 0;
            }
            const rand = Math.random();
            if (rand < 0.3) {
                y -= (Math.random() * 0.6 + 0.2) * this.heightVariation * 1.0;
            } else if (rand < 0.6) {
                y += (Math.random() * 0.6 + 0.2) * this.heightVariation * 1.0;
            }
            y += (Math.random() * 2 - 1) * this.heightVariation * 0.4;
            const noiseValue = Math.sin(finalAngle * this.config.noiseScale) * 0.25;
            y += noiseValue * (this.heightVariation * 0.9);
            if (Math.random() < 0.4) {
                const direction = Math.random() < 0.5 ? 1 : -1;
                y += direction * Math.random() * this.heightVariation * 0.3;
            }
            const attractionStrength = 0.15;
            y *= (1 - attractionStrength);
            y = Math.max(-10, Math.min(10, y || 0));
            const normalizedHeight = (y - minY) / (maxY - minY);
            if (normalizedHeight > this.config.greenThreshold) {
                colors[i3] = 0.0;
                colors[i3 + 1] = 0.996;
                colors[i3 + 2] = 0.647;
            } else {
                colors[i3] = 1.0;
                colors[i3 + 1] = 1.0;
                colors[i3 + 2] = 1.0;
            }
            mainInitialPositions[i3] = initialX;
            mainInitialPositions[i3 + 1] = y;
            mainInitialPositions[i3 + 2] = initialZ;
            mainFinalPositions[i3] = finalX;
            mainFinalPositions[i3 + 1] = y;
            mainFinalPositions[i3 + 2] = finalZ;
            positions[i3] = initialX;
            positions[i3 + 1] = y;
            positions[i3 + 2] = initialZ;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('initialPosition', new THREE.BufferAttribute(mainInitialPositions, 3));
        geometry.setAttribute('finalPosition', new THREE.BufferAttribute(mainFinalPositions, 3));
        geometry.setAttribute('radialOffset', new THREE.BufferAttribute(radialOffsets, 1));
        const particlePhases = new Float32Array(this.config.particleCount);
        for (let i = 0; i < this.config.particleCount; i++) {
            particlePhases[i] = Math.random() * Math.PI * 2;
        }
        geometry.setAttribute('phase', new THREE.BufferAttribute(particlePhases, 1));
        const material = new THREE.ShaderMaterial({
            uniforms: {
                pointSize: { value: this.config.particleSize },
                scaleFactor: { value: this.container ? this.container.clientWidth / 1920 : 1.0 },
                clipPlaneHeight: { value: this.config.clipPlaneHeight },
                clipPlanePosition: { value: this.config.clipPlanePosition },
                time: { value: 0.0 }
            },
            vertexShader: `
                uniform float pointSize;
                uniform float scaleFactor;
                uniform float clipPlaneHeight;
                uniform float clipPlanePosition;
                uniform float time;
                attribute float phase;
                varying vec4 vClipPos;
                varying float vY;
                float safeValue(float value) {
                    return isnan(value) ? 0.0 : value;
                }
                void main() {
                    vec3 basePosition = vec3(
                        safeValue(position.x),
                        safeValue(position.y),
                        safeValue(position.z)
                    );
                    float safePhase = safeValue(phase);
                    float safeTime = safeValue(time);
                    float offsetX = sin(safeTime * 0.5 + safePhase) * 0.015;
                    float offsetY = cos(safeTime * 0.4 + safePhase) * 0.015;
                    float offsetZ = sin(safeTime * 0.6 + safePhase) * 0.015;
                    vec3 finalPosition = basePosition + vec3(
                        clamp(offsetX, -0.015, 0.015),
                        clamp(offsetY, -0.015, 0.015),
                        clamp(offsetZ, -0.015, 0.015)
                    );
                    finalPosition = vec3(
                        safeValue(finalPosition.x),
                        safeValue(finalPosition.y),
                        safeValue(finalPosition.z)
                    );
                    vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    vClipPos = gl_Position;
                    vY = finalPosition.y;
                    gl_PointSize = pointSize * scaleFactor;
                }
            `,
            fragmentShader: `
                uniform float clipPlaneHeight;
                uniform float clipPlanePosition;
                varying vec4 vClipPos;
                varying float vY;
                void main() {
                    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                    float r = dot(cxy, cxy);
                    float delta = fwidth(r);
                    float alpha = 1.0 - smoothstep(1.0 - delta, 1.0, r);
                    if (alpha <= 0.0) {
                        discard;
                    }
                    vec3 whiteColor = vec3(1.0);
                    vec3 greenColor = vec3(0.0, 254.0/255.0, 165.0/255.0);
                    vec3 color = vY > clipPlanePosition * 2.0 ? greenColor : whiteColor;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            depthTest: false
        });
        this.particles = new THREE.Points(geometry, material);
        this.particles.frustumCulled = true;
        this.scene.add(this.particles);
        const borderGeometry = new THREE.BufferGeometry();
        const borderPositions = new Float32Array(this.config.borderParticleCount * 3);
        const borderSizes = new Float32Array(this.config.borderParticleCount);
        const borderInitialPositions = new Float32Array(this.config.borderParticleCount * 3);
        const borderFinalPositions = new Float32Array(this.config.borderParticleCount * 3);
        for (let i = 0; i < this.config.borderParticleCount; i++) {
            const i3 = i * 3;
            const angle = (i / this.config.borderParticleCount) * Math.PI * 2;
            const progress = i / (this.config.borderParticleCount - 1);
            const radialAngle = Math.random() * Math.PI * 2;
            const radialOffset = Math.random() * this.config.borderWidth * 0.7;
            let baseY = 0;
            for (let phase = 0; phase < this.config.curvePhases; phase++) {
                const freq = this.config.curveFrequency * this.frequencyMultipliers[phase];
                const amp = this.heightVariation * this.amplitudeMultipliers[phase] * 1.2;
                let value = Math.sin(angle * freq + this.phaseOffsets[phase]);
                if (progress > 0.95) {
                    const blend = (progress - 0.95) / 0.05;
                    value = value * (1 - blend) + startValues[phase] * blend;
                }
                baseY += value * amp;
            }
            const rand = Math.random();
            if (rand < 0.3) {
                baseY -= (Math.random() * 0.6 + 0.2) * this.heightVariation * 1.0;
            } else if (rand < 0.6) {
                baseY += (Math.random() * 0.6 + 0.2) * this.heightVariation * 1.0;
            }
            baseY += (Math.random() * 2 - 1) * this.heightVariation * 0.4;
            const noiseValue = Math.sin(angle * this.config.noiseScale) * 0.25;
            baseY += noiseValue * (this.heightVariation * 0.9);
            if (Math.random() < 0.4) {
                const direction = Math.random() < 0.5 ? 1 : -1;
                baseY += direction * Math.random() * this.heightVariation * 0.3;
            }
            const attractionStrength = 0.15;
            baseY *= (1 - attractionStrength);
            const baseRadius = this.config.radius + ((i % 3) - 1) * this.lineThickness;
            const baseX = Math.cos(angle) * baseRadius;
            const baseZ = Math.sin(angle) * baseRadius;
            const offsetX = Math.cos(radialAngle) * radialOffset * 0.7;
            const offsetY = (Math.random() - 0.5) * this.config.borderWidth * 0.7;
            const offsetZ = Math.sin(radialAngle) * radialOffset * 0.7;
            borderInitialPositions[i3] = baseX;
            borderInitialPositions[i3 + 1] = baseY;
            borderInitialPositions[i3 + 2] = baseZ;
            borderFinalPositions[i3] = baseX + offsetX;
            borderFinalPositions[i3 + 1] = baseY;
            borderFinalPositions[i3 + 2] = baseZ + offsetZ;
            borderPositions[i3] = borderInitialPositions[i3];
            borderPositions[i3 + 1] = borderInitialPositions[i3 + 1];
            borderPositions[i3 + 2] = borderInitialPositions[i3 + 2];
            const distanceFromBase = Math.sqrt(offsetX * offsetX + offsetY * offsetY + offsetZ * offsetZ);
            const normalizedDistance = Math.min(distanceFromBase / this.config.borderWidth, 1);
            borderSizes[i] = this.config.borderParticleMaxSize * (1 - normalizedDistance) + this.config.borderParticleMinSize * normalizedDistance;
        }
        borderGeometry.setAttribute('position', new THREE.BufferAttribute(borderPositions, 3));
        borderGeometry.setAttribute('size', new THREE.BufferAttribute(borderSizes, 1));
        borderGeometry.setAttribute('initialPosition', new THREE.BufferAttribute(borderInitialPositions, 3));
        borderGeometry.setAttribute('finalPosition', new THREE.BufferAttribute(borderFinalPositions, 3));
        const borderParticlePhases = new Float32Array(this.config.borderParticleCount);
        for (let i = 0; i < this.config.borderParticleCount; i++) {
            borderParticlePhases[i] = Math.random() * Math.PI * 2;
        }
        borderGeometry.setAttribute('phase', new THREE.BufferAttribute(borderParticlePhases, 1));
        const borderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                pointSize: { value: this.config.borderParticleSize },
                scaleFactor: { value: 1.0 },
                clipPlaneHeight: { value: this.config.clipPlaneHeight },
                clipPlanePosition: { value: this.config.clipPlanePosition },
                time: { value: 0.0 }
            },
            vertexShader: `
                uniform float pointSize;
                uniform float scaleFactor;
                uniform float clipPlaneHeight;
                uniform float clipPlanePosition;
                uniform float time;
                attribute float phase;
                varying vec4 vClipPos;
                varying float vY;
                float safeValue(float value) {
                    return isnan(value) ? 0.0 : value;
                }
                void main() {
                    vec3 basePosition = vec3(
                        safeValue(position.x),
                        safeValue(position.y),
                        safeValue(position.z)
                    );
                    float safePhase = safeValue(phase);
                    float safeTime = safeValue(time);
                    float offsetX = sin(safeTime * 0.5 + safePhase) * 0.015;
                    float offsetY = cos(safeTime * 0.4 + safePhase) * 0.015;
                    float offsetZ = sin(safeTime * 0.6 + safePhase) * 0.015;
                    vec3 finalPosition = basePosition + vec3(
                        clamp(offsetX, -0.015, 0.015),
                        clamp(offsetY, -0.015, 0.015),
                        clamp(offsetZ, -0.015, 0.015)
                    );
                    finalPosition = vec3(
                        safeValue(finalPosition.x),
                        safeValue(finalPosition.y),
                        safeValue(finalPosition.z)
                    );
                    vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    vClipPos = gl_Position;
                    vY = finalPosition.y;
                    gl_PointSize = pointSize * scaleFactor;
                }
            `,
            fragmentShader: `
                uniform float clipPlaneHeight;
                uniform float clipPlanePosition;
                varying vec4 vClipPos;
                varying float vY;
                void main() {
                    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                    float r = dot(cxy, cxy);
                    float delta = fwidth(r);
                    float alpha = 1.0 - smoothstep(1.0 - delta, 1.0, r);
                    if (alpha <= 0.0) {
                        discard;
                    }
                    vec3 whiteColor = vec3(1.0);
                    vec3 greenColor = vec3(0.0, 254.0/255.0, 165.0/255.0);
                    vec3 color = vY > clipPlanePosition * 2.0 ? greenColor : whiteColor;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            depthTest: false
        });
        this.borderParticles = new THREE.Points(borderGeometry, borderMaterial);
        this.borderParticles.frustumCulled = true;
        this.scene.add(this.borderParticles);
    }
    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, 128, 128);
        ctx.beginPath();
        ctx.arc(64, 64, 63, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        return texture;
    }
    onWindowResize() {
        if (!this.container) return;
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const baseWidth = 1920;
        const isMobile = window.innerWidth <= 768;
        const frustumSize = isMobile ? 
            (baseWidth / this.container.clientWidth) * 1.6 :
            (baseWidth / this.container.clientWidth) * 3.5;
        this.camera.left = frustumSize * aspect / -2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = frustumSize / -2;
        this.camera.updateProjectionMatrix();
        const scaleFactor = this.container.clientWidth / baseWidth * (isMobile ? 1.5 : 1.0);
        if (this.particles && this.particles.material.uniforms) {
            this.particles.material.uniforms.scaleFactor.value = scaleFactor;
            this.particles.material.uniforms.pointSize.value = this.config.particleSize * (isMobile ? 1.2 : 1.0);
        }
        if (this.borderParticles && this.borderParticles.material.uniforms) {
            this.borderParticles.material.uniforms.scaleFactor.value = scaleFactor;
            this.borderParticles.material.uniforms.pointSize.value = this.config.borderParticleSize * (isMobile ? 1.2 : 1.0);
        }
        const pixelRatio = 1; // Même pixel ratio sur mobile et desktop
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    cacheElements() {
        this.thresholdContainer = document.querySelector('.threshold-line-container');
        this.thresholdLine = document.querySelector('.threshold-line');
    }
    updateThresholdLine(position, width, opacity) {
        if (!this.thresholdContainer || !this.thresholdLine) return;
        this.thresholdContainer.style.top = `${position}%`;
        if (width !== undefined) {
            this.thresholdLine.style.width = width;
        }
        if (opacity !== undefined) {
            this.thresholdLine.style.opacity = opacity;
        }
    }
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    updateClipPlane() {
        if (!this.particles || !this.particles.material || !this.particles.material.uniforms) return;
        this.particles.material.uniforms.clipPlaneHeight.value = this.config.clipPlaneHeight;
        this.particles.material.uniforms.clipPlanePosition.value = this.config.clipPlanePosition;
        if (this.borderParticles && this.borderParticles.material && this.borderParticles.material.uniforms) {
            this.borderParticles.material.uniforms.clipPlaneHeight.value = this.config.clipPlaneHeight;
            this.borderParticles.material.uniforms.clipPlanePosition.value = this.config.clipPlanePosition;
        }
    }
    updateScroll() {
        if (this.isDestroyed) return;

        const investorSection = document.querySelector('.investor');
        if (!investorSection) return;

        const investorRect = investorSection.getBoundingClientRect();
        const currentScrolled = window.scrollY;
        const windowHeight = window.innerHeight;
        const startPoint = windowHeight * 0.6;
        const sectionTop = investorRect.top;
        
        if (sectionTop > startPoint || investorRect.bottom <= 0) {
            this.lastScrollY = currentScrolled;
            return;
        }

        const totalHeight = investorRect.height - windowHeight;
        const currentScroll = -investorRect.top;
        const scrollAtStart = -startPoint;
        const adjustedScroll = currentScroll - scrollAtStart;
        const adjustedTotal = totalHeight - scrollAtStart;
        const scrollProgress = Math.min(100, Math.max(0, (adjustedScroll / adjustedTotal) * 100));

        if (!this.particles) return;

        const rotationY = -(scrollProgress / 100) * (180 * Math.PI / 180);
        this.particles.rotation.y = rotationY;
        
        if (scrollProgress > 60) {
            const rotationProgress = Math.min(1, (scrollProgress - 60) / 24);
            this.particles.rotation.x = -(rotationProgress) * (90 * Math.PI / 180);
        } else {
            this.particles.rotation.x = 0;
        }
        
        if (this.borderParticles) {
            this.borderParticles.rotation.copy(this.particles.rotation);
        }

        if (scrollProgress <= 32) {
            this.config.clipPlaneHeight = 0.5;
            this.config.clipPlanePosition = 0.5;
            this.targetLineOpacity = 1;
        } else if (scrollProgress <= 40) {
            const progress = (scrollProgress - 32) / 8;
            this.config.clipPlaneHeight = 0.5 - (progress * 0.1);
            this.config.clipPlanePosition = 0.5;
            this.targetLineOpacity = 1;
        } else if (scrollProgress <= 46) {
            this.config.clipPlaneHeight = 0.4;
            this.config.clipPlanePosition = 0.5;
            this.targetLineOpacity = 1;
        } else if (scrollProgress <= 68) {
            const heightProgress = (scrollProgress - 46) / 22;
            const opacityProgress = (scrollProgress - 46) / 14;
            this.targetLineOpacity = Math.max(0, 1 - opacityProgress);
            this.config.clipPlaneHeight = 0.4 + (heightProgress * 0.6);
            this.config.clipPlanePosition = 0.5;
        } else {
            this.config.clipPlaneHeight = 1.0;
            this.config.clipPlanePosition = 0.5;
            this.targetLineOpacity = 0;
        }
        
        this.updateClipPlane();
    }
    updateParticles() {
        // Sauvegarder les tailles actuelles des particules
        const currentMainSize = this.particles && this.particles.material && this.particles.material.uniforms ? 
            this.particles.material.uniforms.pointSize.value : this.config.particleSize;
        const currentBorderSize = this.borderParticles && this.borderParticles.material && this.borderParticles.material.uniforms ? 
            this.borderParticles.material.uniforms.pointSize.value : this.config.borderParticleSize;
        
        // Nettoyer les particules existantes
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.scene.remove(this.particles);
        }
        
        if (this.borderParticles) {
            this.borderParticles.geometry.dispose();
            this.borderParticles.material.dispose();
            this.scene.remove(this.borderParticles);
        }
        
        // Sauvegarder les tailles originales configurées
        const originalMainSize = this.config.particleSize;
        const originalBorderSize = this.config.borderParticleSize;
        const originalMaxSize = this.config.borderParticleMaxSize;
        const originalMinSize = this.config.borderParticleMinSize;
        
        // Utiliser temporairement les tailles actuelles pour la création
        this.config.particleSize = currentMainSize;
        this.config.borderParticleSize = currentBorderSize;
        this.config.borderParticleMaxSize = currentBorderSize;
        this.config.borderParticleMinSize = currentBorderSize;
        
        // Créer les nouvelles particules
        this.createParticles();
        
        // Restaurer les valeurs originales de configuration
        this.config.particleSize = originalMainSize;
        this.config.borderParticleSize = originalBorderSize;
        this.config.borderParticleMaxSize = originalMaxSize;
        this.config.borderParticleMinSize = originalMinSize;
        
        // S'assurer que les uniforms ont les bonnes valeurs
        if (this.particles && this.particles.material && this.particles.material.uniforms) {
            this.particles.material.uniforms.pointSize.value = currentMainSize;
        }
        
        if (this.borderParticles && this.borderParticles.material && this.borderParticles.material.uniforms) {
            this.borderParticles.material.uniforms.pointSize.value = currentBorderSize;
        }
    }

    handleResize() {
        if (!this.resizeTimeout) {
            this.resizeTimeout = setTimeout(() => {
                console.log('Investor animation handling resize...');
                if (!this.container) return;
                
                // Recalculer les paramètres de la caméra orthographique
                const aspect = this.container.clientWidth / this.container.clientHeight;
                const baseWidth = 1920;
                const isMobile = window.innerWidth <= 768;
                const frustumSize = isMobile ? 
                    (baseWidth / this.container.clientWidth) * 1.6 :
                    (baseWidth / this.container.clientWidth) * 3.5;
                
                // Mettre à jour les dimensions de la caméra
                this.camera.left = frustumSize * aspect / -2;
                this.camera.right = frustumSize * aspect / 2;
                this.camera.top = frustumSize / 2;
                this.camera.bottom = frustumSize / -2;
                this.camera.updateProjectionMatrix();
                
                // Calculer le facteur d'échelle
                const scaleFactor = this.container.clientWidth / baseWidth * (isMobile ? 1.5 : 1.0);
                
                // Stocker les tailles actuelles avant recréation
                let mainSize = this.config.particleSize;
                let borderSize = this.config.borderParticleSize;
                
                if (this.particles && this.particles.material && this.particles.material.uniforms) {
                    mainSize = this.particles.material.uniforms.pointSize.value;
                }
                
                if (this.borderParticles && this.borderParticles.material && this.borderParticles.material.uniforms) {
                    borderSize = this.borderParticles.material.uniforms.pointSize.value;
                }
                
                // Ajuster le ratio de pixels et la taille du renderer
                const pixelRatio = 1; // Même pixel ratio sur mobile et desktop
                this.renderer.setPixelRatio(pixelRatio);
                this.renderer.setSize(this.container.clientWidth, this.container.clientHeight, false);
                
                // Si nécessaire, recréer les particules pour éviter les déformations
                if (this.particles && this.borderParticles) {
                    // Sauvegarder l'état actuel
                    const currentRotationX = this.particles.rotation.x;
                    const currentRotationY = this.particles.rotation.y;
                    const currentRotationZ = this.particles.rotation.z;
                    
                    // Recréer les particules
                    this.updateParticles();
                    
                    // Mettre à jour les facteurs d'échelle après la recréation
                    if (this.particles && this.particles.material && this.particles.material.uniforms) {
                        this.particles.material.uniforms.scaleFactor.value = scaleFactor;
                        this.particles.material.uniforms.pointSize.value = mainSize;
                    }
                    
                    if (this.borderParticles && this.borderParticles.material && this.borderParticles.material.uniforms) {
                        this.borderParticles.material.uniforms.scaleFactor.value = scaleFactor;
                        this.borderParticles.material.uniforms.pointSize.value = borderSize;
                    }
                    
                    // Restaurer la rotation
                    if (this.particles) {
                        this.particles.rotation.set(currentRotationX, currentRotationY, currentRotationZ);
                    }
                    if (this.borderParticles) {
                        this.borderParticles.rotation.copy(this.particles.rotation);
                    }
                }
                
                this.resizeTimeout = null;
            }, this.resizeThrottleTime);
        }
    }
    createObserver(container) {
        const observer = new IntersectionObserver((entries) => {
            this.isCanvasVisible = entries[0].isIntersecting;
        }, {
            threshold: 0.1
        });
        observer.observe(container);
        return observer;
    }
    destroy() {
        if (this.visibilityObserver) {
            this.visibilityObserver.disconnect();
        }
        if (this.prewarmObserver) {
            this.prewarmObserver.disconnect();
        }
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.updateScroll);
        window.removeEventListener('beforeunload', this.destroy);
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
        if (this.renderer) this.renderer.dispose();
        for (const key in this.particleCache) {
            if (this.particleCache[key] && this.particleCache[key].length) {
                this.particleCache[key] = null;
            }
        }
        for (const key in this.mathCache) {
            if (this.mathCache[key] && this.mathCache[key].length) {
                this.mathCache[key] = null;
            }
        }
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}