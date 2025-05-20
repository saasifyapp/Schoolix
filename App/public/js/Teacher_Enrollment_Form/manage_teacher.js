document.addEventListener('DOMContentLoaded', () => {
    // Search Teacher elements
    const searchTeacherButton = document.getElementById('searchTeacherButton');
    const searchTeacherOverlay = document.getElementById('searchTeacherOverlay');
    const closeSearchTeacherOverlay = document.getElementById('closeSearchTeacherOverlay');

    // Delete Teacher elements
    const deleteTeacherButton = document.getElementById('deleteTeacherButton');
    const deleteTeacherOverlay = document.getElementById('deleteTeacherOverlay');
    const closeDeleteTeacherOverlay = document.getElementById('closeDeleteTeacherOverlay');

    // Update Teacher elements
    const updateTeacherButton = document.getElementById('updateTeacherButton');
    const updateTeacherOverlay = document.getElementById('updateTeacherOverlay');
    const closeUpdateTeacherOverlay = document.getElementById('closeUpdateTeacherOverlay');

    // Generate Experience Certificate elements
    const generateExperienceCertificateButton = document.getElementById('generateExperienceCertificateButton');
    const generateExperienceCertificateOverlay = document.getElementById('generateExperienceCertificateOverlay');
    const closeGenerateExperienceCertificateOverlay = document.getElementById('closeGenerateExperienceCertificateOverlay');

    // Search Experience Certificate elements
    const generateExperienceCertificate = document.getElementById('generateExperienceCertificate');
    const searchExperienceCertificateFormOverlay = document.getElementById('searchExperienceCertificateFormOverlay');
    const closeSearchExperienceCertificateFormOverlay = document.getElementById('closeSearchExperienceCertificateFormOverlay');

    // Search Experience Certificate table elements
    const searchExperienceCertificate = document.getElementById('searchExperienceCertificate');
    const searchExperienceCertificateOverlay = document.getElementById('searchExperienceCertificateOverlay');
    const closeSearchExperienceCertificateOverlay = document.getElementById('closeSearchExperienceCertificateOverlay');

    // Open Search Teacher overlay
    searchTeacherButton.addEventListener('click', () => {
        searchTeacherOverlay.style.display = 'flex';
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
        deleteTeacherOverlay.style.display = 'flex';
        fetchAndPopulateTeachers('delete');
    });

    // Close Delete Teacher overlay
    closeDeleteTeacherOverlay.addEventListener('click', () => {
        deleteTeacherOverlay.style.display = 'none';
    });

    // Open Update Teacher overlay
    updateTeacherButton.addEventListener('click', () => {
        updateTeacherOverlay.style.display = 'flex';
        fetchAndPopulateTeachers('update');
    });

    // Close Update Teacher overlay
    closeUpdateTeacherOverlay.addEventListener('click', () => {
        updateTeacherOverlay.style.display = 'none';
    });

    // Close Update Teacher overlay when clicking outside
    updateTeacherOverlay.addEventListener('click', (event) => {
        if (event.target === updateTeacherOverlay) {
            updateTeacherOverlay.style.display = 'none';
        }
    });

    // Open Generate Experience Certificate overlay
    generateExperienceCertificateButton.addEventListener('click', () => {
        generateExperienceCertificateOverlay.style.display = 'flex';
    });

    // Close Generate Experience Certificate overlay
    closeGenerateExperienceCertificateOverlay.addEventListener('click', () => {
        generateExperienceCertificateOverlay.style.display = 'none';
    });

    // Close Generate Experience Certificate overlay when clicking outside
    generateExperienceCertificateOverlay.addEventListener('click', (event) => {
        if (event.target === generateExperienceCertificateOverlay) {
            generateExperienceCertificateOverlay.style.display = 'none';
        }
    });

    // Open Search Experience Certificate Form overlay
    generateExperienceCertificate.addEventListener('click', () => {
        searchExperienceCertificateFormOverlay.style.display = 'flex';
        fetchAndPopulateTeachers('generateExperience');
    });

    // Close Search Experience Certificate Form overlay
    closeSearchExperienceCertificateFormOverlay.addEventListener('click', () => {
        searchExperienceCertificateFormOverlay.style.display = 'none';
    });

    // Close Search Experience Certificate Form overlay when clicking outside
    searchExperienceCertificateFormOverlay.addEventListener('click', (event) => {
        if (event.target === searchExperienceCertificateFormOverlay) {
            searchExperienceCertificateFormOverlay.style.display = 'none';
        }
    });

    // Open Search Experience Certificate Table overlay
    searchExperienceCertificate.addEventListener('click', () => {
        searchExperienceCertificateOverlay.style.display = 'flex';
        fetchAndPopulateTeachers('searchExperienceTable');
    });

    // Close Search Experience Certificate Table overlay
    closeSearchExperienceCertificateOverlay.addEventListener('click', () => {
        searchExperienceCertificateOverlay.style.display = 'none';
    });

    // Close Search Experience Certificate Table overlay when clicking outside
    searchExperienceCertificateOverlay.addEventListener('click', (event) => {
        if (event.target === searchExperienceCertificateOverlay) {
            searchExperienceCertificateOverlay.style.display = 'none';
        }
    });
});