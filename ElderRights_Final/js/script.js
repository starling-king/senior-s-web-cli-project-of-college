/* =====================================================================
   1. UI CONTROLLER (State Persistence, Accessibility & Slideshow)
   ===================================================================== */
class UIController {
    constructor() {
        // 1. Check browser memory for saved settings, otherwise use defaults
        this.currentFontSize = parseInt(localStorage.getItem('savedFontSize')) || 18;
        this.isHighContrast = localStorage.getItem('savedContrast') === 'true';

        // 2. Apply saved settings instantly when the page loads
        this._applySavedState();
    }

    _applySavedState() {
        // Apply saved font size
        document.documentElement.style.fontSize = `${this.currentFontSize}px`;
        document.documentElement.style.setProperty('--base-font-size', `${this.currentFontSize}px`);

        // Apply saved high contrast
        if (this.isHighContrast) {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
            // Wait a tiny fraction of a second to ensure the button exists in the DOM
            setTimeout(() => {
                const contrastBtn = document.querySelector('.btn-contrast');
                if (contrastBtn) contrastBtn.innerHTML = '☀️ Normal View';
            }, 50);
        }
    }

    // Adjusts font size dynamically and saves to memory
    changeFontSize(step) {
        if (step === 0) {
            this.currentFontSize = 18; // Reset to default
        } else {
            let newSize = this.currentFontSize + (step * 2);
            if (newSize >= 14 && newSize <= 28) {
                this.currentFontSize = newSize;
            }
        }
        
        // Apply changes
        document.documentElement.style.fontSize = `${this.currentFontSize}px`;
        document.documentElement.style.setProperty('--base-font-size', `${this.currentFontSize}px`);
        
        // Save to browser memory
        localStorage.setItem('savedFontSize', this.currentFontSize);
    }

    // Toggles High Contrast, updates button text, and saves to memory
    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        const contrastBtn = document.querySelector('.btn-contrast'); 

        if (this.isHighContrast) {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
            if (contrastBtn) contrastBtn.innerHTML = '☀️ Normal View';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (contrastBtn) contrastBtn.innerHTML = '🌓 Contrast';
        }
        
        // Save to browser memory
        localStorage.setItem('savedContrast', this.isHighContrast);
    }

    // Handles the Ask a Question Modal
    openModal() {
        const modal = document.getElementById('feedbackModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Prevents background scrolling
        }
    }

    closeModal() {
        const modal = document.getElementById('feedbackModal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto'; // Restores scrolling
        }
    }

    // Automatic Slideshow Engine (Geo-Tag Safe)
    initSlideshow() {
        let slideIndex = 0;
        const slides = document.getElementsByClassName("slide");
        
        // Safety check: only run if the slideshow exists on the current page
        if (slides.length === 0) return;

        const showSlides = () => {
            // Hide all slides
            for (let i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";  
            }
            slideIndex++;
            // Reset to first slide if we hit the end
            if (slideIndex > slides.length) { slideIndex = 1; }    
            // Show the current slide
            slides[slideIndex - 1].style.display = "block";  
            
            // Change image every 3.5 seconds
            setTimeout(showSlides, 3500); 
        };

        showSlides(); // Start the loop
    }
}

// =====================================================================
// 2. INITIALIZATION
// =====================================================================
// Instantiate the UI controller to attach to the global window
const uiController = new UIController();

// Automatically start the slideshow when the page loads
document.addEventListener('DOMContentLoaded', () => {
    uiController.initSlideshow();
});