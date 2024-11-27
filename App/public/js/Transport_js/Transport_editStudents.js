let debounceTimer;

// Function to fetch search suggestions from the endpoint
async function fetchSearchSuggestions(query) {
    try {
        const response = await fetch('/fetch-student-suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching search suggestions:', error);
        return [];
    }
}

// Function to display search suggestions
async function displaySearchSuggestions() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const searchInput = document.getElementById('searchbyNamoeorGr');
        const searchSuggestionsContainer = document.getElementById('searchsuggestions');

        // Show suggestion box
        searchSuggestionsContainer.style.display = "block";
        const query = searchInput.value.trim();  // Treat query as is (text or number)

        if (query === '') {
            searchSuggestionsContainer.innerHTML = '';
            searchSuggestionsContainer.style.display = 'none';
            return; // Exit if query is empty
        }

        // Fetch suggestions from the server
        showLoading(searchSuggestionsContainer);
        const suggestions = await fetchSearchSuggestions(query);
        filterAndDisplaySearchSuggestions(query, suggestions, searchSuggestionsContainer);
    }, 300); // Adjust debounce delay as necessary
}

// Function to filter and display search suggestions
function filterAndDisplaySearchSuggestions(query, suggestions, suggestionsContainer) {
    const isNumericQuery = !isNaN(query);
    const filteredSuggestions = suggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(query.toLowerCase()) || 
        (isNumericQuery && suggestion.gr_no === parseInt(query, 10))
    );
    suggestionsContainer.innerHTML = '';

    if (filteredSuggestions.length > 0) {
        filteredSuggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = `${suggestion.name} (${suggestion.gr_no})`;
            suggestionItem.dataset.value = JSON.stringify(suggestion);  // Store the full suggestion data in a hidden attribute
            suggestionsContainer.appendChild(suggestionItem);
        });

        // Add event listeners for selection
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function () {
                const searchInput = document.getElementById('searchbyNamoeorGr');
                searchInput.value = this.textContent;  // Display the selected value
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'none';

                // Call function to fill form details based on selected suggestion
                fillFormDetails(JSON.parse(this.dataset.value));
            });
        });

    } else {
        showNoResults(suggestionsContainer);
    }
}

// Function to fill form details based on selected suggestion
function fillFormDetails(selectedValue) {
    // Fill form inputs with the selected suggestion data
    document.getElementById('editGrNo').value = selectedValue.gr_no;
    document.getElementById('editStudentName').value = selectedValue.name;
    document.getElementById('editClass').value = selectedValue.standard;
    document.getElementById('editDivision').value = selectedValue.division;
    document.getElementById('editPickDropAddress').value = selectedValue.transport_pickup_drop;
    document.getElementById('editVehicleTagged').value = selectedValue.transport_tagged;
}

// Show loading indication
function showLoading(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
}

// Show no results indication
function showNoResults(container) {
    container.innerHTML = '<div class="no-results">No results found</div>';
}

// Initialization of search suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById('searchbyNamoeorGr');
    const searchSuggestionsContainer = document.getElementById('searchsuggestions');

    // Add event listeners for input, focus, and click events
    searchInput.addEventListener('input', displaySearchSuggestions);
    searchInput.addEventListener('focus', displaySearchSuggestions);
    searchInput.addEventListener('click', displaySearchSuggestions);

    document.addEventListener('click', function (event) {
        if (!searchSuggestionsContainer.contains(event.target) && !searchInput.contains(event.target)) {
            searchSuggestionsContainer.style.display = 'none';
        }
    });
});