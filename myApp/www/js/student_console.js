document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('back-button');

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = './index.html';
        });
    }

    // Add logic to refresh student console content
    console.log('Refreshing Student Console...');
    // You can add more logic here to refresh specific parts of the student console if needed
});