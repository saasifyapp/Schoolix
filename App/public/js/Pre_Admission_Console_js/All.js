///////////////////////////////// Dark Mode Toggle ///////////////////////////////////////
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        // Default to system preference if no saved theme
        if (systemPrefersDark) {
            document.documentElement.classList.add('dark');
        }
    }
}

// Toggle theme and save preference
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        document.querySelector('.theme-toggle i').className = 'fas fa-moon';
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        document.querySelector('.theme-toggle i').className = 'fas fa-sun';
    }
}

// Initialize theme on page load
initializeTheme();

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const newTheme = e.matches ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', e.matches);
    localStorage.setItem('theme', newTheme);
});



