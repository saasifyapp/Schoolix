document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed'); // Log for debugging

    // Input Elements
    const categoryNameInput = document.getElementById('setFeeAmount_categoryName');
    const categorySuggestionsContainer = document.getElementById('categorySuggestions');
    const classGradeInput = document.getElementById('classGrade');
    const gradeSuggestionsContainer = document.getElementById('gradeSuggestions');
    const allGradesRadio = document.getElementById('allGrades');
    const amountInput = document.getElementById('amount');
    const setFeeAmountForm = document.getElementById('setFeeAmountForm');
    const categoryIdInput = document.createElement('input'); // Hidden input for category ID
    categoryIdInput.type = 'hidden';
    categoryIdInput.name = 'categoryId';
    setFeeAmountForm.appendChild(categoryIdInput);

    let allCategories = []; // To store all categories
    let allGrades = []; // To store all grades

    // Function to fetch all category suggestions
    function fetchAllCategories() {
        fetch(`/setFee_getCategoryName`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                console.log(data); // Log the response for debugging
                if (Array.isArray(data)) {
                    allCategories = data;
                    displayCategorySuggestions(allCategories); // Display all categories initially
                } else {
                    console.error('Data is not an array:', data);
                }
            })
            .catch((error) => console.error('Error:', error));
    }

    // Function to fetch all grade suggestions
    function fetchAllGrades() {
        fetch(`/setFee_getGrades`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                console.log(data); // Log the response for debugging
                if (Array.isArray(data)) {
                    allGrades = data;
                    displayGradeSuggestions(allGrades); // Display all grades initially
                } else {
                    console.error('Data is not an array:', data);
                }
            })
            .catch((error) => console.error('Error:', error));
    }

    // Function to display category suggestions
    function displayCategorySuggestions(categories) {
        categorySuggestionsContainer.style.display = 'block'; // Show suggestions container
        categorySuggestionsContainer.innerHTML = '';

        if (!Array.isArray(categories) || categories.length === 0) {
            const noResultsItem = document.createElement('div');
            noResultsItem.classList.add('suggestion-item', 'no-results');
            noResultsItem.textContent = 'No results found';
            categorySuggestionsContainer.appendChild(noResultsItem);
        } else {
            categories.forEach((category) => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = category.category_name;
                suggestionItem.dataset.categoryId = category.category_id; // Store category ID
                categorySuggestionsContainer.appendChild(suggestionItem);
            });
        }
    }

    // Function to display grade suggestions
    function displayGradeSuggestions(grades) {
        gradeSuggestionsContainer.style.display = 'block'; // Show suggestions container
        gradeSuggestionsContainer.innerHTML = '';

        if (!Array.isArray(grades) || grades.length === 0) {
            const noResultsItem = document.createElement('div');
            noResultsItem.classList.add('suggestion-item', 'no-results');
            noResultsItem.textContent = 'No results found';
            gradeSuggestionsContainer.appendChild(noResultsItem);
        } else {
            grades.forEach((grade) => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = grade; // Ensure this matches your database field
                gradeSuggestionsContainer.appendChild(suggestionItem);
            });
        }
    }

    // Show all categories when input is focused
    categoryNameInput.addEventListener('focus', function () {
        console.log('Input focused'); // Log for debugging
        fetchAllCategories();
    });

    // Show all grades when input is focused
    classGradeInput.addEventListener('focus', function () {
        console.log('Input focused'); // Log for debugging
        fetchAllGrades();
    });

    // Update category suggestions when user types
    categoryNameInput.addEventListener('input', function () {
        console.log('Input changed'); // Log for debugging
        const query = this.value.toLowerCase();
        const filteredCategories = allCategories.filter(category =>
            category.category_name.toLowerCase().includes(query)
        );
        displayCategorySuggestions(filteredCategories);
    });

    // Update grade suggestions when user types
    classGradeInput.addEventListener('input', function () {
        console.log('Input changed'); // Log for debugging
        const query = this.value.toLowerCase();
        const filteredGrades = allGrades.filter(grade =>
            grade.toLowerCase().includes(query)
        );
        displayGradeSuggestions(filteredGrades);
    });

    // Handle category suggestion click
    categorySuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedCategory = event.target;
            categoryNameInput.value = selectedCategory.textContent;
            categoryIdInput.value = selectedCategory.dataset.categoryId; // Set category ID
            categorySuggestionsContainer.style.display = 'none'; // Hide suggestions container
            categorySuggestionsContainer.innerHTML = '';

            // Log the selected category ID and name
            console.log('Selected Category ID:', selectedCategory.dataset.categoryId);
            console.log('Selected Category Name:', selectedCategory.textContent);
        }
    });

    // Handle grade suggestion click
    gradeSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedGrade = event.target;
            classGradeInput.value = selectedGrade.textContent;
            gradeSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            gradeSuggestionsContainer.innerHTML = '';
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function (event) {
        if (!categorySuggestionsContainer.contains(event.target) && !categoryNameInput.contains(event.target)) {
            categorySuggestionsContainer.style.display = 'none'; // Hide suggestions container
            categorySuggestionsContainer.innerHTML = '';
        }
        if (!gradeSuggestionsContainer.contains(event.target) && !classGradeInput.contains(event.target)) {
            gradeSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            gradeSuggestionsContainer.innerHTML = '';
        }
    });

    // Disable radio button if class/grade input is not null
    classGradeInput.addEventListener('input', function () {
        if (classGradeInput.value.trim() !== '') {
            allGradesRadio.disabled = true;
        } else {
            allGradesRadio.disabled = false;
        }
    });

    // Handle radio button click to toggle selection and clear class/grade input
    allGradesRadio.addEventListener('click', function () {
        if (allGradesRadio.checked) {
            classGradeInput.value = '';
            classGradeInput.disabled = true;
        } else {
            allGradesRadio.checked = false;
            classGradeInput.disabled = false;
        }
    });

    // Initial check to disable radio button if class/grade input is not empty
    if (classGradeInput.value.trim() !== '') {
        allGradesRadio.disabled = true;
    }

    // Initial check to disable class/grade input if radio button is selected
    if (allGradesRadio.checked) {
        classGradeInput.disabled = true;
    }

    // Handle form submission
    setFeeAmountForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = {
            categoryId: categoryIdInput.value,
            categoryName: categoryNameInput.value,
            classGrade: allGradesRadio.checked ? 'All Grades' : classGradeInput.value, // Use 'All Grades' if radio is checked
            amount: amountInput.value
        };

        console.log('Form Data:', formData); // Log the form data for debugging

        fetch('/setFeeAmount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response:', data); // Log the response for debugging
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Fee structure added successfully!');
                // Reset the form
                setFeeAmountForm.reset();
                categoryIdInput.value = '';
                allGradesRadio.checked = false;
                classGradeInput.disabled = false;
                allGradesRadio.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while adding the fee structure.');
        });
    });
});