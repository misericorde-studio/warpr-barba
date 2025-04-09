import { AirdropAnimation, InvestorAnimation } from './animations.js';

let currentAnimation = null;
let progressRAFId = null;

function destroyAnimation() {
    return new Promise(resolve => {
        if (currentAnimation) {
            currentAnimation.destroy();
            currentAnimation = null;
        }
        setTimeout(resolve, 50);
    });
}

// Fonction pour initialiser la barre de progression
function initializeProgressBar(namespace) {
    const progressValue = document.querySelector('.loading-progress-value');
    if (!progressValue) return;

    // Nettoyer les écouteurs d'événements existants
    const oldUpdateProgress = window[`updateProgress_${namespace}`];
    if (oldUpdateProgress) {
        window.removeEventListener('scroll', oldUpdateProgress);
    }
    
    // Arrêter toute boucle d'animation précédente
    if (progressRAFId) {
        cancelAnimationFrame(progressRAFId);
        progressRAFId = null;
    }
    
    console.log(`Initializing progress bar for ${namespace}...`);
    
    if (namespace === 'airdrop') {
        // Initialisation de la progression pour la page airdrop
        function updateProgress() {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const progress = Math.min(100, Math.max(0, Math.round((scrolled / scrollHeight) * 100)));
            progressValue.textContent = `[ ${progress}% ]`;
        }
        
        // Stocker la fonction pour pouvoir la nettoyer plus tard
        window.updateProgress_airdrop = updateProgress;
        
        // S'assurer que l'écouteur d'événement est ajouté une seule fois
        window.removeEventListener('scroll', updateProgress);
        window.addEventListener('scroll', updateProgress);
        
        // Forcer une mise à jour immédiate
        setTimeout(updateProgress, 100);
        
        // Créer une fonction de mise à jour périodique pour s'assurer que la progression est à jour
        function periodicUpdate() {
            updateProgress();
            progressRAFId = requestAnimationFrame(periodicUpdate);
        }
        
        // Démarrer la mise à jour périodique
        progressRAFId = requestAnimationFrame(periodicUpdate);
        
    } else if (namespace === 'investor') {
        // Initialisation de la progression pour la page investor
        function updateProgress() {
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
        
        // Stocker la fonction pour pouvoir la nettoyer plus tard
        window.updateProgress_investor = updateProgress;
        
        // S'assurer que l'écouteur d'événement est ajouté une seule fois
        window.removeEventListener('scroll', updateProgress);
        window.addEventListener('scroll', updateProgress);
        
        // Forcer une mise à jour immédiate
        setTimeout(updateProgress, 100);
        
        // Créer une fonction de mise à jour périodique pour s'assurer que la progression est à jour
        function periodicUpdate() {
            updateProgress();
            progressRAFId = requestAnimationFrame(periodicUpdate);
        }
        
        // Démarrer la mise à jour périodique
        progressRAFId = requestAnimationFrame(periodicUpdate);
    }
}

// Fonction pour nettoyer avant de quitter une page
function cleanupPage() {
    console.log('Cleaning up page resources...');
    
    // Annuler toute boucle d'animation en cours pour la progression
    if (progressRAFId) {
        cancelAnimationFrame(progressRAFId);
        progressRAFId = null;
    }
    
    // Nettoyer tous les écouteurs d'événements potentiels
    if (window.updateProgress_airdrop) {
        window.removeEventListener('scroll', window.updateProgress_airdrop);
    }
    
    if (window.updateProgress_investor) {
        window.removeEventListener('scroll', window.updateProgress_investor);
    }
}

barba.init({
    debug: true,
    views: [
        {
            namespace: 'airdrop',
            async beforeLeave() {
                console.log('Airdrop - beforeLeave');
                await destroyAnimation();
                cleanupPage();
            }
        },
        {
            namespace: 'investor',
            async beforeLeave() {
                console.log('Investor - beforeLeave');
                await destroyAnimation();
                cleanupPage();
            }
        }
    ],
    transitions: [{
        name: 'default-transition',
        async leave(data) {
            console.log('Transition - leave', data.current.namespace, '->', data.next.namespace);
            await destroyAnimation();
            await gsap.to(data.current.container, {
                opacity: 0,
                duration: 0.5
            });
            cleanupPage();
        },

        async beforeEnter(data) {
            console.log('Transition - beforeEnter', data.next.namespace);
            // Créer le conteneur de canvas si nécessaire
            let canvasContainer = data.next.container.querySelector('#canvas-container');
            if (!canvasContainer) {
                canvasContainer = document.createElement('div');
                canvasContainer.id = 'canvas-container';
                data.next.container.prepend(canvasContainer);
            }
            
            // Remettre le scroll à 0 avant d'entrer dans la nouvelle page
            window.scrollTo(0, 0);
        },

        async enter(data) {
            console.log('Transition - enter', data.next.namespace);
            await gsap.from(data.next.container, {
                opacity: 0,
                duration: 0.5
            });
        },

        async after(data) {
            console.log('Transition - after', data.next.namespace);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // S'assurer que toutes les animations et écouteurs précédents sont nettoyés
            cleanupPage();
            
            // Réinitialiser le scroll avant d'initialiser la nouvelle page
            window.scrollTo(0, 0);
            
            // Initialiser la barre de progression pour la nouvelle page
            setTimeout(() => {
                initializeProgressBar(data.next.namespace);
            }, 100);

            try {
                switch (data.next.namespace) {
                    case 'airdrop':
                        currentAnimation = new AirdropAnimation();
                        break;
                    case 'investor':
                        currentAnimation = new InvestorAnimation();
                        break;
                }
                
                if (currentAnimation) {
                    currentAnimation.start();
                    console.log('Animation started for', data.next.namespace);
                }
            } catch (error) {
                console.error('Error initializing animation:', error);
            }
        }
    }]
});

console.log('Barba initialized with views:', barba.views);

// Initialisation au chargement initial
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('[data-barba="container"]');
    if (!container) return;

    // Créer le conteneur de canvas si nécessaire
    let canvasContainer = document.querySelector('#canvas-container');
    if (!canvasContainer) {
        canvasContainer = document.createElement('div');
        canvasContainer.id = 'canvas-container';
        container.prepend(canvasContainer);
    }

    const namespace = container.dataset.barbaNamespace;
    
    // Initialiser la barre de progression pour la page initiale
    initializeProgressBar(namespace);
    
    // Ajouter un écouteur d'événement pour la redimension de la fenêtre
    const handleResize = debounce(() => {
        console.log('Window resized, updating progress...');
        // Réinitialiser la barre de progression après redimensionnement
        cleanupPage();
        initializeProgressBar(namespace);
    }, 200);
    
    window.addEventListener('resize', handleResize);
    
    // Écouter l'événement beforeunload pour remettre le scroll à 0
    window.addEventListener('beforeunload', () => {
        window.scrollTo(0, 0);
    });
    
    try {
        switch (namespace) {
            case 'airdrop':
                currentAnimation = new AirdropAnimation();
                break;
            case 'investor':
                currentAnimation = new InvestorAnimation();
                break;
        }
        
        if (currentAnimation) {
            currentAnimation.start();
        }
    } catch (error) {
        console.error('Error initializing animation:', error);
    }
});

// Fonction utilitaire pour limiter les appels à une fonction (debounce)
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}
