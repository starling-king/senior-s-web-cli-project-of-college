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
    }

    closeModal() {
        const modal = document.getElementById('feedbackModal');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }

    // Adjusts font size dynamically without breaking layout
    changeFontSize(step) {
        if (step === 0) {
            this.currentFontSize = 18; // Reset to default
        } else {
            // Limit how big/small text can get to prevent UI breakage
            let newSize = this.currentFontSize + (step * 2);
            if (newSize >= 14 && newSize <= 26) {
                this.currentFontSize = newSize;
            }
        }
        document.documentElement.style.setProperty('--base-font-size', `${this.currentFontSize}px`);
    }

    // Toggles the High Contrast CSS variables
    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        if (this.isHighContrast) {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    // Displays form success/error messages
    displayFormMessage(message, isSuccess) {
        const statusDiv = document.getElementById('formStatus');
        statusDiv.textContent = message;
        statusDiv.className = isSuccess ? 'status-success' : 'status-error';
        
        // Auto-clear success message after 5 seconds
        if(isSuccess) {
            setTimeout(() => { statusDiv.textContent = ''; }, 5000);
        }
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('feedbackModal');
    if (event.target === modal) {
        uiController.closeModal();
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