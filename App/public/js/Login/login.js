document.addEventListener('DOMContentLoaded', () => {
    // Show/Hide loading bar functions
    const loadingBar = document.querySelector('.loading-bar');

    function showLoadingBar() {
        loadingBar.style.display = 'block';
    }

    function hideLoadingBar() {
        loadingBar.style.display = 'none';
    }

    // Toggle login type
    const schoolButton = document.getElementById('schoolButton');
    const adminButton = document.getElementById('adminButton');
    let loginType = 'school';

    schoolButton.addEventListener('click', () => {
        loginType = 'school';
        schoolButton.classList.add('active');
        adminButton.classList.remove('active');
        flipLoginForm(); // Adjust form for school login
    });

    adminButton.addEventListener('click', () => {
        loginType = 'admin';
        adminButton.classList.add('active');
        schoolButton.classList.remove('active');
        flipLoginForm(); // Adjust form for admin login
    });

    // Function to flip login form
    function flipLoginForm() {
        const loginForm = document.querySelector('.login-form');
        loginForm.classList.add('flip-animation');
        loginForm.addEventListener('animationend', () => {
            loginForm.classList.remove('flip-animation');
            const loginIcon = document.querySelector('.login-form img');
            loginIcon.src = loginType === 'admin' ? '../images/admin.png' : '../images/locked.png';
        }, { once: true });
    }

    // Form Flip Image Animation
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const loginIcon = document.querySelector('.login-form img');

    function animateImage(imgSrc, duration = 1000) {
        loginIcon.src = imgSrc;
        loginIcon.style.opacity = '0';
        loginIcon.animate([
            { transform: 'rotateY(-90deg)', opacity: 0 },
            { transform: 'rotateY(0)', opacity: 1 }
        ], {
            duration: duration,
            easing: 'ease',
            fill: 'forwards'
        });
    }

    usernameInput.addEventListener('focus', () => animateImage('../images/login.png', 1000));
    usernameInput.addEventListener('blur', () => animateImage('../images/locked.png', 500));
    passwordInput.addEventListener('focus', () => animateImage('../images/key.png', 500));
    passwordInput.addEventListener('blur', () => animateImage('../images/locked.png', 500));

    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', (event) => {
        event.preventDefault();
        showLoadingBar();

        const username = usernameInput.value;
        const password = passwordInput.value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, loginType })
        })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => {
            hideLoadingBar();
            window.location.href = '/dashboard';
        })
        .catch(error => {
            hideLoadingBar();
            showToast(error.message || 'Network error. Please check your connection and try again.', true);
        });
    });

    // Function to display toast message
    function showToast(message, isError) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = isError ? 'toast error' : 'toast';
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
});
