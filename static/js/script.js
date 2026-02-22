/* =====================================================================
   1. UI CONTROLLER (Handles Accessibility and Visuals)
   ===================================================================== */
class UIController {
    constructor() {
        this.currentFontSize = 18; // Maps to var(--base-font-size)
        this.isHighContrast = false;
    }

    openModal() {
        const modal = document.getElementById('feedbackModal');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // BUG FIX: Stop the background from scrolling while modal is open
        document.body.style.overflow = 'hidden'; 
        
        // ACCESSIBILITY FIX: Automatically focus the first input for keyboard users
        document.getElementById('userName').focus();
    }

    closeModal() {
        const modal = document.getElementById('feedbackModal');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        // BUG FIX: Restore background scrolling when modal closes
        document.body.style.overflow = 'auto'; 
    }

    // Adjusts font size dynamically without breaking layout
   // Adjusts font size dynamically and scales the entire website
    changeFontSize(step) {
        if (step === 0) {
            this.currentFontSize = 18; // Reset to default
        } else {
            // Limit how big/small text can get to prevent UI breakage
            let newSize = this.currentFontSize + (step * 2);
            if (newSize >= 14 && newSize <= 28) {
                this.currentFontSize = newSize;
            }
        }
        
        // BUG FIX: Directly update the root HTML font-size. 
        // This forces all 'rem' units across the entire website to scale instantly!
        document.documentElement.style.fontSize = `${this.currentFontSize}px`;
        document.documentElement.style.setProperty('--base-font-size', `${this.currentFontSize}px`);
    }

    // Toggles High Contrast & Updates Button Text
    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        const contrastBtn = document.querySelector('.btn-contrast'); // Select the button

        if (this.isHighContrast) {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
            // BUG FIX: Change text so user knows how to go back
            if (contrastBtn) contrastBtn.innerHTML = '☀️ Normal View';
        } else {
            document.documentElement.removeAttribute('data-theme');
            // Revert text
            if (contrastBtn) contrastBtn.innerHTML = '🌓 Contrast';
        }
    }

    displayFormMessage(message, isSuccess) {
        const statusDiv = document.getElementById('formStatus');
        statusDiv.textContent = message;
        statusDiv.className = isSuccess ? 'status-success' : 'status-error';
        
        if(isSuccess) {
            setTimeout(() => { statusDiv.textContent = ''; }, 5000);
        }
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