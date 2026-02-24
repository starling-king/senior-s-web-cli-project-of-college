/* =====================================================================
   1. UI CONTROLLER (State Persistence & Accessibility)
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
            // We must wait a tiny fraction of a second to ensure the button exists in the DOM
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

    openModal() {
        const modal = document.getElementById('feedbackModal');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; 
        document.getElementById('userName').focus();
    }

    closeModal() {
        const modal = document.getElementById('feedbackModal');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto'; 
    }

    displayFormMessage(message, isSuccess) {
        const statusDiv = document.getElementById('formStatus');
        statusDiv.textContent = message;
        statusDiv.className = isSuccess ? 'status-success' : 'status-error';
        
        if(isSuccess) {
            setTimeout(() => { statusDiv.textContent = ''; }, 5000);
        }
    }

    // Automatic Slideshow Engine
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
            
            // Change image every 3.5 seconds (3500 milliseconds)
            setTimeout(showSlides, 3500); 
        };

        showSlides(); // Start the loop
    }
}
/* =====================================================================
   2. API SERVICE (Handles Async Network Requests securely)
   ===================================================================== */
class APIService {
    constructor(uiController) {
        this.ui = uiController;
        this.apiEndpoint = '/api/v1/feedback';
    }

    // Async function to handle form submission without reloading the page
    async submitFeedback(event) {
        event.preventDefault(); // Prevent default form reload
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Extract clean data
        const payload = {
            name: document.getElementById('userName').value.trim(),
            topic: document.getElementById('queryTopic').value,
            message: document.getElementById('userMessage').value.trim()
        };

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                this.ui.displayFormMessage(result.message, true);
                event.target.reset(); // Clear the form
            } else {
                this.ui.displayFormMessage(result.message || "Submission failed.", false);
            }

        } catch (error) {
            console.error("Network Error:", error);
            this.ui.displayFormMessage("Network error. Please try again.", false);
        } finally {
            // Always re-enable the button regardless of success or failure
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Query';
        }
    }
}

// =====================================================================
// 3. INITIALIZATION
// =====================================================================
// Instantiate classes to attach to the global window for HTML onclick attributes
const uiController = new UIController();
const apiService = new APIService(uiController);

// Automatically start the slideshow when the page loads
document.addEventListener('DOMContentLoaded', () => {
    uiController.initSlideshow();
});