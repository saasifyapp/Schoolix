// Utility function to display loading suggestions
function showLoading(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const loadingItem = document.createElement('div');
    loadingItem.classList.add('suggestion-item', 'no-results');
    loadingItem.textContent = 'Loading...';
    suggestionsContainer.appendChild(loadingItem);
    suggestionsContainer.style.display = "flex";
}

// Utility function to display no results found message
function showNoResults(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const noResultsItem = document.createElement('div');
    noResultsItem.classList.add('suggestion-item', 'no-results');
    noResultsItem.textContent = 'No results found';
    suggestionsContainer.appendChild(noResultsItem);
}

// Function to fetch and display suggestions
function fetchAndDisplaySuggestions(query, suggestionsContainer, inputField, additionalActions) {
    if (query.length > 1) {
        showLoading(suggestionsContainer);
        fetch(`/get_student_details?q=${query}`)
            .then(response => response.json())
            .then(data => {
                suggestionsContainer.innerHTML = '';
                if (data.length === 0) {
                    showNoResults(suggestionsContainer);
                } else {
                    data.forEach(student => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.classList.add('suggestion-item');
                        suggestionItem.textContent = `${student.Grno} | ${student.Name} | ${student.Standard}`;
                        suggestionItem.dataset.Grno = student.Grno;
                        suggestionItem.dataset.name = student.Name;
                        suggestionItem.dataset.standard = student.Standard; // Assuming standard field exists
                        suggestionItem.dataset.contact = student.f_mobile_no; // Assuming contact field exists
                        suggestionsContainer.appendChild(suggestionItem);
                    });
                }
                // Add event listeners for selection
                suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', function () {
                        const selectedItem = event.target;
                        inputField.value = selectedItem.dataset.name;
                        additionalActions(selectedItem);
                        suggestionsContainer.innerHTML = '';
                    });
                });
            })
            .catch(error => {
                console.error('Error:', error);
                showNoResults(suggestionsContainer);
            });
    } else {
        suggestionsContainer.innerHTML = '';
    }
}

///////////////////////////////// LIBRARY >> ADD MEMBERS //////////
document.addEventListener("DOMContentLoaded", function () {
    const memberNameInput = document.getElementById('memberName');
    const suggestionsContainer = document.getElementById('suggestions');

    memberNameInput.addEventListener('input', function () {
        const query = this.value;
        fetchAndDisplaySuggestions(query, suggestionsContainer, memberNameInput, (selectedItem) => {
            document.getElementById('classFilter').value = selectedItem.dataset.standard;
            document.getElementById('contact').value = selectedItem.dataset.contact;
        });
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !memberNameInput.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });
});

///////////////////////////////// INVENTORY >> GENERATE INVOICE //////////
document.addEventListener("DOMContentLoaded", function () {
    const buyerNameInput = document.getElementById('buyerName');
    const suggestionsContainer = document.getElementById('suggestions');

    buyerNameInput.addEventListener('input', function () {
        const query = this.value;
        fetchAndDisplaySuggestions(query, suggestionsContainer, buyerNameInput, (selectedItem) => {
            document.getElementById('buyerMobile').value = selectedItem.dataset.contact;
        });
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !buyerNameInput.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });
});

//////////////////////////Update Student Enrollment Form (SMALLPOPUP)
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestions');

    searchInput.addEventListener('input', function () {
        const query = this.value.trim();
        if (!query) {
            suggestionsContainer.innerHTML = '';
            return;
        }

        fetchAndDisplaySuggestions(query, suggestionsContainer, searchInput, (selectedItem) => {
            searchInput.value = selectedItem.dataset.Grno;
            console.log(selectedItem)
        });
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !searchInput.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });
});

//////////////////////////////Generate TC Form////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById('searchInputforTC');
    const suggestionsContainer = document.getElementById('TCsuggestions');

    searchInput.addEventListener('input', function () {
        const query = this.value.trim();
        if (!query) {
            suggestionsContainer.innerHTML = '';
            return;
        }

        fetchAndDisplaySuggestions(query, suggestionsContainer, searchInput, (selectedItem) => {
            searchInput.value = selectedItem.dataset.Grno;
        });
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !searchInput.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });
});