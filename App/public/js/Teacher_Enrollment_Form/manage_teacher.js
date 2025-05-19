document.addEventListener('DOMContentLoaded', () => {
    // Search Teacher elements
    const searchTeacherButton = document.getElementById('searchTeacherButton');
    const searchTeacherOverlay = document.getElementById('searchTeacherOverlay');
    const closeSearchTeacherOverlay = document.getElementById('closeSearchTeacherOverlay');

    // Delete Teacher elements
    const deleteTeacherButton = document.getElementById('deleteTeacherButton');
    const deleteTeacherOverlay = document.getElementById('deleteTeacherOverlay');
    const closeDeleteTeacherOverlay = document.getElementById('closeDeleteTeacherOverlay');

    // Open Search Teacher overlay
    searchTeacherButton.addEventListener('click', () => {
        searchTeacherOverlay.style.display = 'block';
        fetchAndPopulateTeachers('search');
    });

    // Close Search Teacher overlay
    closeSearchTeacherOverlay.addEventListener('click', () => {
        searchTeacherOverlay.style.display = 'none';
    });

    // Close Search Teacher overlay when clicking outside
    searchTeacherOverlay.addEventListener('click', (event) => {
        if (event.target === searchTeacherOverlay) {
            searchTeacherOverlay.style.display = 'none';
        }
    });

    // Open Delete Teacher overlay
    deleteTeacherButton.addEventListener('click', () => {
        deleteTeacherOverlay.style.display = 'block';
        fetchAndPopulateTeachers('delete');
    });

    // Close Delete Teacher overlay
    closeDeleteTeacherOverlay.addEventListener('click', () => {
        deleteTeacherOverlay.style.display = 'none';
    });   
    
});