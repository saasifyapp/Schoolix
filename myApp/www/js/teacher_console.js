document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('back-button');

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = './index.html';
        });
    }

    // Add logic to refresh teacher console content
    console.log('Refreshing Teacher Console...');
    // You can add more logic here to refresh specific parts of the teacher console if needed
});