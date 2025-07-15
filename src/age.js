 // Age verification logic
        document.addEventListener('DOMContentLoaded', function() {
            const ageModal = document.getElementById('ageModal');
            const exitBtn = document.getElementById('exitBtn');
            const enterBtn = document.getElementById('enterBtn');
            
            // Check if age is already verified
            if (!localStorage.getItem('ageVerified')) {
                ageModal.style.display = 'flex';
            }
            
            exitBtn.addEventListener('click', function() {
                window.location.href = 'https://www.google.com';
            });
            
            enterBtn.addEventListener('click', function() {
                localStorage.setItem('ageVerified', 'true');
                ageModal.style.display = 'none';
            });
            
            // Cookie consent banner would typically go here
            // Implement cookie consent logic as needed
        });
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });