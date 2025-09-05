// LANDING PAGE UI UX MODULE

// Nav link click handler
(function() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
          
            // Remove active class from all links
            document.querySelectorAll('.nav-links a').forEach(lnk => {
                lnk.classList.remove('active');
            });
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to target section
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
})();