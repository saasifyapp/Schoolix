// document.getElementById("search-studentforTC").addEventListener("click", function (event) {
function searchStudentAndHandleTC() {
  event.preventDefault(); // Prevent form submission (if inside a form)

  let searchValue = document.getElementById("searchInputforTC").value.trim();
  let section = document.getElementById("selectsectionforTC").value; // Get selected section

  // **Validation Checks**
  if (!searchValue) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Input",
      text: "Please enter a valid search value.",
      confirmButtonText: "OK",
    });
    return;
  }

  if (!section) {
    Swal.fire({
      icon: "warning",
      title: "Select Section",
      text: "Please select a section before searching.",
      confirmButtonText: "OK",
    });
    return;
  }

  // Determine search type (Number → GR No, Text → Name)
  let searchType = isNaN(searchValue) ? "name" : "grno";

  // **Call the API**
  fetch(
    `/fetch-student-for-TC?section=${encodeURIComponent(
      section
    )}&${searchType}=${encodeURIComponent(searchValue)}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        Swal.fire({
          icon: "error",
          title: "Search Error",
          text: data.error,
          confirmButtonText: "OK",
        });
      } else if (data.message === "No student found") {
        Swal.fire({
          icon: "error",
          title: "No Record Found",
          text: "No matching student details were found.",
          confirmButtonText: "OK",
        });
      } else if (data.message === "Student is inactive") {
        Swal.fire({
          icon: "warning",
          title: "Inactive Student",
          text: "This student is inactive. Please contact the administration.",
          confirmButtonText: "OK",
        });
      } else {
        // If student found, handle the data (e.g., display it)
        //console.log("Student Found:", data);

        // Check if current_outstanding and previous_outstanding are both zero
        const currentOutstanding = parseFloat(data[0].current_outstanding) || 0;
        const previousOutstanding =
          parseFloat(data[0].previous_outstanding) || 0;
        const grNo = data[0].Grno;
        const studentName = `${data[0].Firstname} ${data[0].Middlename} ${data[0].Surname}`;

        if (currentOutstanding !== 0 || previousOutstanding !== 0) {
          Swal.fire({
            icon: "warning",
            title: "Pending Transaction",
            html: `The student with GR No: <strong>${grNo}</strong> <br>
           Name: <strong>${studentName}</strong> has <strong>${currentOutstanding} INR</strong> current outstanding and 
           <strong>${previousOutstanding} INR</strong> previous outstanding amount.<br><br>
           Please clear all outstanding amounts to generate TC.`,
            confirmButtonText: "OK",
          });
          return;
        }

        // Populate the form with student data
        populateStudentTCForm(data[0]);

        document.getElementById("searchTCFormOverlay").style.display = "none";
        document.getElementById("generateTCFormOverlay").style.display = "flex";
      }
    })
    .catch((error) => {
      console.error("Error fetching student data:", error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong while fetching student details.",
        confirmButtonText: "OK",
      });
    });
}

// Function to populate form fields (Modify as per form field IDs)
function populateStudentTCForm(data) {
  if (!data) return;

  // Directly populate the form fields
  document.getElementById("studentName").value = data.Name || "";
  document.getElementById("motherName").value = data.Mother_name || "";
  document.getElementById("dob").value = formatDateForInput(data.DOB);
  document.getElementById("placeOfBirth").value = data.POB || "";
  document.getElementById("nationality").value = data.Nationality || "";
  document.getElementById("religion").value = data.Religion || "";
  document.getElementById("category").value = data.Category || "";
  document.getElementById("caste").value = data.Caste || "";
  document.getElementById("aadharId").value = data.Adhar_no || "";
  document.getElementById("tc_grNo").value = data.Grno || "";
  document.getElementById("tc_section").value = data.Section || "";
  document.getElementById("tc_class").value = data.Standard || "";
  document.getElementById("saralId").value = data.saral_id || "";
  document.getElementById("aaparId").value = data.apar_id || "";
  document.getElementById("penId").value = data.pen_id || "";
  document.getElementById("lastSchool").value = data.Last_School || "NA";
  document.getElementById("dateOfAdmission").value = formatDateForInput(
    data.Admission_Date
  );
  document.getElementById("classOfAdmission").value = data.admitted_class || "";
}

// Function to format date from "DD-MM-YYYY" to "YYYY-MM-DD" (for input[type=date])
function formatDateForInput(dateString) {
  if (!dateString) return "";
  let parts = dateString.split("-");
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : "";
}

// If switching to a new page, store data in session storage
function storeStudentDataForRedirection(data) {
  sessionStorage.setItem("tcFormData", JSON.stringify(data));
}

// If redirected, fetch from session storage and populate form
function checkAndPopulateFromSession() {
  let storedData = sessionStorage.getItem("tcFormData");
  if (storedData) {
    populateStudentTCForm(JSON.parse(storedData));
  }
}

document
  .getElementById("closeGenerateTCFormOverlay")
  .addEventListener("click", function () {
    clearTCForm();
  });

function clearTCForm() {
  // Select all input fields inside the form
  document.querySelectorAll(".generate-tc-form input").forEach((input) => {
    if (input.type === "date") {
      input.value = ""; // Clear date fields
    } else {
      input.value = ""; // Clear text fields
    }
  });

  // Optionally, remove error messages or highlights if any
  document
    .querySelectorAll(".error-message")
    .forEach((error) => error.remove());
}

/////////////////////// FETCH TC NO //////////////////////

// Function to fetch and set the next TC Number
function fetchNextTcNo() {
  fetch("/fetch-new-tc-no")
    .then((response) => response.json())
    .then((data) => {
      const tcNoInput = document.getElementById("tcNo");
      tcNoInput.value = data.new_tc_no;
    })
    .catch((error) => console.error("Error fetching next TC Number:", error));
}

// Example usage: Call this function when the page loads or when necessary
document.addEventListener("DOMContentLoaded", (event) => {
  fetchNextTcNo(); // Fetch the next TC number when the page loads
});

///////////////////////// DATE WHEN LEAVING ///////////////////////

// Function to set today's date as the default value for the date of leaving input
function setLeavingDate() {
  const dateInput = document.getElementById("dateOfLeaving");
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  const year = today.getFullYear();
  const todayDate = `${year}-${month}-${day}`;
  dateInput.value = todayDate;
}

// Set the default date when the document is ready
document.addEventListener("DOMContentLoaded", setLeavingDate);

/////////////////////////// SUGGESTION UTILS ///////////////////////////

////////////// USED BY GENERATE AND UPDATE TC /////////

// Utility function to show a loading indicator
function showLoading(container) {
  container.innerHTML = '<div class="loading">Loading...</div>';
}

// Utility function to show "No Results" message
function showNoResults(container) {
  container.innerHTML = '<div class="no-results">No results found</div>';
}

// Generic function to display suggestions
function displaySuggestions(
  inputId,
  suggestionContainerId,
  data,
  cacheFlag,
  fetchFunc
) {
  const inputElement = document.getElementById(inputId);
  const suggestionContainer = document.getElementById(suggestionContainerId);

  // Show suggestion box
  suggestionContainer.style.display = "block";
  const query = inputElement.value.toLowerCase().trim();

  if (!cacheFlag.fetched) {
    showLoading(suggestionContainer);

    // Simulate an async data fetch
    setTimeout(() => {
      cacheFlag.fetched = true;
      fetchFunc(query, suggestionContainer);
    }, 500);
  } else {
    fetchFunc(query, suggestionContainer);
  }
}

// Generic function to filter and display suggestions
function filterAndDisplaySuggestions(query, suggestionsContainer, data) {
  const filteredItems = data.filter((item) =>
    item.toLowerCase().startsWith(query)
  );
  suggestionsContainer.innerHTML = "";

  if (filteredItems.length > 0) {
    filteredItems.forEach((item) => {
      const suggestionItem = document.createElement("div");
      suggestionItem.classList.add("suggestion-item");
      suggestionItem.textContent = item;
      suggestionItem.dataset.value = item;
      suggestionsContainer.appendChild(suggestionItem);
    });
  } else {
    showNoResults(suggestionsContainer);
  }
}

// Add event listeners for selection
function attachSuggestionListeners(suggestionsContainer, inputElement) {
  suggestionsContainer.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("click", function () {
      inputElement.value = this.dataset.value;
      suggestionsContainer.innerHTML = "";
      suggestionsContainer.style.display = "none";
    });
  });
}

/////////////////////////// SUGGESTION CONFIG ///////////////////////////

const cacheFlags = {
  standards: { fetched: false },
  reasons: { fetched: false },
  progress: { fetched: false },
  conduct: { fetched: false },
  result: { fetched: false },
  remark: { fetched: false },
};

const dataMap = {
  standards: [
    "Nursery",
    "LKG",
    "UKG",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
  ],
  reasons: [
    "At his / her own request",
    "Relocation",
    "Change of School",
    "Financial Reasons",
    "Health Reasons",
    "Permanent Move Abroad",
    "Academic Reasons",
    "Behavioural Issues",
    "Lack of Satisfaction",
    "Completion of Education Level",
    "Personal/Family Issues",
    "Special Educational Needs",
    "Bullying or Safety Concerns",
    "Extracurricular Opportunities",
  ],
  progress: [
    "Excellent",
    "Very Good",
    "Good",
    "Satisfactory",
    "Average",
    "Poor",
  ],
  conduct: ["Excellent", "Very Good", "Good", "Average", "Poor"],
  result: ["Pass", "Fail", "Promoted", "Detained", "Incomplete"],
  remark: [
    "Promoted to Next Class",
    "Good",
    "Very Good",
    "Excellent",
    "Needs Improvement",
    "Satisfactory",
  ],
};

function initSuggestions(inputId, suggestionContainerId, dataType) {
  const inputElement = document.getElementById(inputId);
  const suggestionsContainer = document.getElementById(suggestionContainerId);

  inputElement.addEventListener("input", () =>
    displaySuggestions(
      inputId,
      suggestionContainerId,
      dataMap[dataType],
      cacheFlags[dataType],
      (query, container) => {
        filterAndDisplaySuggestions(query, container, dataMap[dataType]);
        attachSuggestionListeners(container, inputElement);
      }
    )
  );
  inputElement.addEventListener("focus", () =>
    displaySuggestions(
      inputId,
      suggestionContainerId,
      dataMap[dataType],
      cacheFlags[dataType],
      (query, container) => {
        filterAndDisplaySuggestions(query, container, dataMap[dataType]);
        attachSuggestionListeners(container, inputElement);
      }
    )
  );
  inputElement.addEventListener("click", () =>
    displaySuggestions(
      inputId,
      suggestionContainerId,
      dataMap[dataType],
      cacheFlags[dataType],
      (query, container) => {
        filterAndDisplaySuggestions(query, container, dataMap[dataType]);
        attachSuggestionListeners(container, inputElement);
      }
    )
  );

  document.addEventListener("click", function (event) {
    if (
      !suggestionsContainer.contains(event.target) &&
      !inputElement.contains(event.target)
    ) {
      suggestionsContainer.style.display = "none";
    }
  });
}

////////////////////////// INIT ALL SUGGESTIONS ///////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  // Standard of Leaving
  initSuggestions("standardLeaving", "standardLeavingSuggestion", "standards");
  initSuggestions(
    "tc_edit_standardOfLeaving",
    "edit_tc_standardOfLeavingSuggestion",
    "standards"
  );

  // Reason of Leaving
  initSuggestions("reasonLeaving", "reasonLeavingSuggestion", "reasons");
  initSuggestions(
    "tc_edit_reasonOfLeaving",
    "edit_tc_reasonOfLeavingSuggestion",
    "reasons"
  );

  // Progress
  initSuggestions("progress", "progressSuggestion", "progress");
  initSuggestions("tc_edit_progress", "edit_tc_progressSuggestion", "progress");

  // Conduct
  initSuggestions("conduct", "conductSuggestion", "conduct");
  initSuggestions("tc_edit_conduct", "edit_tc_conductSuggestion", "conduct");

  // Result
  initSuggestions("result", "resultSuggestion", "result");
  initSuggestions("tc_edit_result", "edit_tc_resultSuggestion", "result");

  // Remark
  initSuggestions("remark", "remarkSuggestion", "remark");
  initSuggestions("tc_edit_remark", "edit_tc_remarkSuggestion", "remark");
});

//////////////////////// GENERATE BUTTON //////////////

document
  .getElementById("submitGenerateTCForm")
  .addEventListener("click", async function (event) {
    const requiredFields = {
      studentName: "Student Name",
      motherName: "Mother's Name",
      dob: "Date of Birth (DOB)",
      placeOfBirth: "Place of Birth",
      nationality: "Nationality",
      religion: "Religion",
      category: "Category",
      caste: "Caste",
      aadharId: "Aadhar ID",
      tc_grNo: "Gr No",
      tc_section: "Section",
      tc_class: "Current Class",
      saralId: "Saral ID",
      aaparId: "Aapar ID",
      penId: "PEN ID",
      lastSchool: "Last School",
      dateOfAdmission: "Date of Admission",
      classOfAdmission: "Class of Admission",
      tcNo: "TC No",
      dateOfLeaving: "Date of Leaving",
      standardLeaving: "Standard when Leaving",
      reasonLeaving: "Reason of Leaving",
      progress: "Progress",
      conduct: "Conduct",
      result: "Result",
      remark: "Remark",
    };

    let isValid = true;
    let missingFields = [];

    Object.keys(requiredFields).forEach(function (fieldId) {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        isValid = false;
        const label = requiredFields[fieldId];
        missingFields.push(label);
      }
    });

    if (!isValid) {
      const missingFieldsList = missingFields
        .map((field) => `<li>${field}</li>`)
        .join("");
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        html: `The following fields are required: <ul>${missingFieldsList}</ul>`,
      });
      return;
    }

    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});

    const schoolName = decodeURIComponent(cookies["schoolName"]); // Decode URL-encoded value
    const loginName = decodeURIComponent(cookies["username"]);

    if (!schoolName || !loginName) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: 'Required cookies "schoolName" and "username" are missing.',
      });
      return;
    }

    try {
      // Initialize Swal for loading status
      let currentStep = "Processing...";
      const updateSwal = async (message) => {
        currentStep = message;
        Swal.update({
          title: "Processing...",
          html: message,
          allowOutsideClick: false,
          showConfirmButton: false,
        });
        Swal.showLoading();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      };

      Swal.fire({
        title: "Processing...",
        html: currentStep,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await updateSwal("Fetching School Details...");
      const fetchSchoolDetailsResponse = await fetch(
        "/generate-tc-operations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "fetch-tc-school-details",
            data: { loginName, schoolName },
          }),
        }
      );

      if (!fetchSchoolDetailsResponse.ok) {
        const errorText = await fetchSchoolDetailsResponse.text();
        throw new Error(errorText);
      }

      const schoolDetailsResponse = await fetchSchoolDetailsResponse.json();

      if (
        !schoolDetailsResponse.result ||
        Object.keys(schoolDetailsResponse.result).length === 0
      ) {
        throw new Error("School details not found or empty.");
      }

      let schoolDetails = schoolDetailsResponse.result;

      let tcformdata = {
        schoolName,
        loginName,
        ...schoolDetails,
      };

      console.log(tcformdata);

      Object.keys(requiredFields).forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        tcformdata[fieldId] = field.value.trim();
      });

      // Utility function to format date
      const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
      };

      // Apply date formatting
      const issueDate = new Date().toISOString().split("T")[0];
      tcformdata.issueDate = formatDate(issueDate);
      tcformdata.dateOfLeaving = formatDate(tcformdata.dateOfLeaving);

      await updateSwal("Saving TC Record...");
      const saveTCResponse = await fetch("/generate-tc-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "save-to-tc-table",
          data: {
            tc_no: tcformdata.tcNo,
            gr_no: tcformdata.tc_grNo,
            student_name: tcformdata.studentName,
            date_of_leaving: tcformdata.dateOfLeaving,
            standard_of_leaving: tcformdata.standardLeaving,
            reason_of_leaving: tcformdata.reasonLeaving,
            progress: tcformdata.progress,
            conduct: tcformdata.conduct,
            result: tcformdata.result,
            remark: tcformdata.remark,
            issue_date: tcformdata.issueDate,
            section: tcformdata.tc_section,
            current_class: tcformdata.tc_class,
          },
        }),
      });

      if (!saveTCResponse.ok) {
        const errorText = await saveTCResponse.text();
        if (saveTCResponse.status === 409) {
          throw new Error("Duplicate TC No");
        }
        throw new Error(errorText);
      }

      await updateSwal("Deactivating Student...");
      await fetch("/generate-tc-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "deactivate-student",
          data: {
            section: tcformdata.tc_section.toLowerCase(),
            grno: tcformdata.tc_grNo,
          },
        }),
      });

      await updateSwal("Deleting App Credentials...");
      await fetch("/generate-tc-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "delete-android-user",
          data: {
            section: tcformdata.tc_section.toLowerCase(),
            grno: tcformdata.tc_grNo,
          },
        }),
      });

      await updateSwal("Deallocating Transport...");
      await fetch("/generate-tc-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "delete-transport-alloted",
          data: {
            section: tcformdata.tc_section.toLowerCase(),
            grno: tcformdata.tc_grNo,
          },
        }),
      });

      await Swal.fire({
        icon: "success",
        title: "TC Generation Completed!",
        html: `Transfer Certificate for <strong>GR - ${tcformdata.tc_grNo}</strong> | <strong>Name - ${tcformdata.studentName}</strong> generated successfully.`,
      });

      populateTCFormData(tcformdata);
    } catch (error) {
      const errorMessage =
        error.json && typeof error.json === "function"
          ? JSON.stringify(error.json)
          : error.message;
      const displayMessage = errorMessage.includes("Duplicate TC No")
        ? "A Transfer Certificate with this TC No already exists. Please use a different TC No."
        : errorMessage;

      await Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: displayMessage,
      });
    }
  });

function populateTCFormData(formData) {
  const newTCObject = createTCObject(formData);
  addRowsToTCTable(newTCObject); // Populate table first
  adjustDateOfBirthFontSize(); // Adjust font size after table is populated
  updateSchoolDetails(formData);
  setSchoolLogos(formData);
  updateDateSignature(formData);

  const overlay = document.getElementById("previewTCOverlay");
  if (overlay) {
    overlay.style.display = "flex";
  } else {
    console.warn("previewTCOverlay element not found.");
  }
}

// Keep your existing createTCObject function unchanged
function createTCObject(tcformdata) {
  function dateToWords(dateStr) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const [year, month, day] = dateStr
      .split("-")
      .map((num) => parseInt(num, 10));
    let dayInWords =
      day < 20
        ? ones[day]
        : `${tens[Math.floor(day / 10)]}-${ones[day % 10]}`.replace(
            /^-|-$/,
            ""
          );
    const monthInWords = months[month - 1];
    let yearInWords = "";
    if (year >= 1000 && year <= 9999) {
      const thousands = Math.floor(year / 1000);
      const hundreds = Math.floor((year % 1000) / 100);
      const tensUnits = year % 100;
      yearInWords += ones[thousands] + " Thousand";
      if (hundreds > 0) yearInWords += " " + ones[hundreds] + " Hundred";
      if (tensUnits > 0) {
        yearInWords +=
          " " +
          (tensUnits < 20
            ? ones[tensUnits]
            : `${tens[Math.floor(tensUnits / 10)]}${
                tensUnits % 10 > 0 ? "-" + ones[tensUnits % 10] : ""
              }`);
      }
    }
    return `${dayInWords}-${monthInWords}-${yearInWords}`.replace(/^-|-$/, "");
  }

  const dob = tcformdata.dob || "2009-07-10";
  const [year, month, day] = dob.split("-");
  const dobFormatted = `${day.padStart(2, "0")}-${month.padStart(
    2,
    "0"
  )}-${year}`;
  const dobInWords = dateToWords(dob);
  const dobCombined = `${dobFormatted} (${dobInWords})`;

  return {
    "CERTIFICATE No": "1",
    "GENERAL REGISTER No": tcformdata.tc_grNo || "1618",
    "STUDENT NAME": tcformdata.studentName || "Om Deepak Dafade",
    "MOTHER'S NAME": tcformdata.motherName || "Smita",
    "DATE OF BIRTH": dobCombined,
    "PLACE OF BIRTH": tcformdata.placeOfBirth || "Amravati",
    NATIONALITY: tcformdata.nationality || "Indian",
    RELIGION: tcformdata.religion || "Hindu",
    "CATEGORY & CASTE": `${tcformdata.category || "OBC"} - ${
      tcformdata.caste || "Jain"
    }`,
    "AADHAR ID": tcformdata.aadharId || "674816054773",
    "LAST SCHOOL ATTENDED": tcformdata.lastSchool || "JC Highschool",
    "DATE OF ADMISSION": tcformdata.dateOfAdmission || "2020-02-23",
    "CLASS OF ADMISSION": tcformdata.classOfAdmission || "1st",
    "DATE OF LEAVING": tcformdata.dateOfLeaving || "2020-03-01",
    "STANDARD LEAVING": tcformdata.standardLeaving || "LKG",
    "REASON FOR LEAVING":
      tcformdata.reasonLeaving || "AT HIS / HER OWN REQUEST",
    PROGRESS: tcformdata.progress || "Excellent",
    CONDUCT: tcformdata.conduct || "Excellent",
    RESULT: tcformdata.result || "Pass",
    REMARK: tcformdata.remark || "Promoted to Next Class",
  };
}

// Modified addRowsToTCTable to tag "DATE OF BIRTH" cell
function addRowsToTCTable(tcObject) {
  const tbody = document.querySelector(".content-table tbody");
  if (!tbody) {
    console.error(
      "Table body not found in the DOM. Please ensure the table with class 'content-table' exists."
    );
    return;
  }

  tbody.innerHTML = ""; // Clear existing rows

  for (const [key, value] of Object.entries(tcObject)) {
    const row = document.createElement("tr");
    const keyCell = document.createElement("td");
    const valueCell = document.createElement("td");

    keyCell.textContent = key;
    valueCell.textContent = value;

    // Add a class to the "DATE OF BIRTH" value cell
    if (key === "DATE OF BIRTH") {
      valueCell.className = "date-of-birth";
    }

    row.appendChild(keyCell);
    row.appendChild(valueCell);
    tbody.appendChild(row);
  }
}

function adjustDateOfBirthFontSize() {
  const table = document.querySelector(".content-table");
  if (!table) {
    console.warn("Table with class 'content-table' not found.");
    return;
  }

  const dobCell = table.querySelector(".date-of-birth");
  if (!dobCell) {
    console.warn("Date of Birth cell with class 'date-of-birth' not found.");
    return;
  }

  // Reset any existing styles that might interfere
  dobCell.style.fontSize = ""; // Clear any previous font size
  dobCell.style.whiteSpace = "nowrap"; // Prevent wrapping during measurement
  dobCell.style.lineHeight = "normal"; // Ensure consistent line height

  const containerWidth = dobCell.getBoundingClientRect().width;
  let fontSize = 14; // Initial font size
  dobCell.style.fontSize = `${fontSize}px`;

  // Recalculate line height after setting initial font size
  const lineHeight = parseFloat(getComputedStyle(dobCell).lineHeight) || fontSize * 1.2;

  // Step 1: Reduce font size to fit on one line
  while (
    (dobCell.scrollWidth > containerWidth || dobCell.scrollHeight > lineHeight * 1.1) &&
    fontSize > 2 // Minimum font size
  ) {
    fontSize -= 0.1; // Fine-grained reduction
    dobCell.style.fontSize = `${fontSize}px`;
  }

  // Step 2: Additional reduction if still overflowing
  if (dobCell.scrollWidth > containerWidth || dobCell.scrollHeight > lineHeight * 1.1) {
    fontSize -= 0.2;
  }

  // Step 3: Ensure font size doesn't go below minimum
  let adjustedFontSize = Math.max(fontSize, 2);
  dobCell.style.fontSize = `${adjustedFontSize}px !important`; // Use !important to override external styles

  // Step 4: If still overflowing, allow wrapping and adjust for max two lines
  if (dobCell.scrollWidth > containerWidth) {
    dobCell.style.whiteSpace = "normal"; // Allow wrapping
    const maxHeight = lineHeight * 2; // Allow up to two lines
    while (dobCell.scrollHeight > maxHeight && adjustedFontSize > 2) {
      adjustedFontSize -= 0.1;
      dobCell.style.fontSize = `${adjustedFontSize}px !important`;
    }
  }

  // Step 5: Final font size check
  adjustedFontSize = Math.max(adjustedFontSize, 2);
  dobCell.style.fontSize = `${adjustedFontSize}px !important`;

  // Step 6: Adjust for print media
  if (window.matchMedia("print").matches) {
    const finalFontSize = Math.min(adjustedFontSize, 8);
    dobCell.style.fontSize = `${finalFontSize}px !important`;
  }

  // Debug: Log the final font size and dimensions
  console.log(`Final font size: ${adjustedFontSize}px`);
  console.log(`Container width: ${containerWidth}px, Scroll width: ${dobCell.scrollWidth}px`);
  console.log(`Line height: ${lineHeight}px, Scroll height: ${dobCell.scrollHeight}px`);
}


// Keep your existing updateSchoolDetails, setSchoolLogos, and updateDateSignature functions unchanged
function updateSchoolDetails(tcformdata) {
  const schoolDetailsContainer = document.querySelector(
    ".school-details-container"
  );
  if (!schoolDetailsContainer) {
    console.error("School details container not found in the DOM.");
    return;
  }

  const schoolNameElement = schoolDetailsContainer.querySelector(
    ".school-name-container h1"
  );
  if (schoolNameElement) {
    schoolNameElement.textContent =
      tcformdata.schoolName || tcformdata.school_name || "Unknown School";
  } else {
    console.warn("School name element not found.");
  }

  const addressElement = schoolDetailsContainer.querySelector(
    ".address-container p"
  );
  if (addressElement) {
    const address = tcformdata.detailed_address || "Address not available";
    let firstLine = address;
    let secondLine = "";
    const parts = address.split(",").map((part) => part.trim());
    const totalLength = address.length;
    let splitIndex = 0;
    let currentLength = 0;

    for (let i = 0; i < parts.length; i++) {
      currentLength += parts[i].length + 1;
      if (currentLength >= totalLength / 2) {
        splitIndex = i;
        break;
      }
    }

    if (splitIndex > 0 && splitIndex < parts.length - 1) {
      firstLine = parts.slice(0, splitIndex + 1).join(", ");
      secondLine = parts.slice(splitIndex + 1).join(", ");
    } else {
      const words = address.split(" ");
      const midPoint = Math.ceil(words.length / 2);
      firstLine = words.slice(0, midPoint).join(" ");
      secondLine = words.slice(midPoint).join(" ");
    }

    addressElement.innerHTML = `${firstLine}<br>${secondLine}`;
  } else {
    console.warn("Address element not found.");
  }

  const udiseElement = schoolDetailsContainer.querySelector(
    ".left-container p:nth-child(1)"
  );
  if (udiseElement) {
    udiseElement.textContent = `UDISE No: ${
      tcformdata.udise_no || "Not available"
    }`;
  } else {
    console.warn("UDISE No element not found.");
  }

  const contactElement = schoolDetailsContainer.querySelector(
    ".left-container p:nth-child(2)"
  );
  if (contactElement) {
    contactElement.textContent = `Contact No: ${
      tcformdata.contact_no ? `+91 ${tcformdata.contact_no}` : "Not available"
    }`;
  } else {
    console.warn("Contact No element not found.");
  }

  const boardIndexElement = schoolDetailsContainer.querySelector(
    ".right-container p:nth-child(1)"
  );
  if (boardIndexElement) {
    boardIndexElement.textContent = `Board Index No: ${
      tcformdata.board_index_no || "Not available"
    }`;
  } else {
    console.warn("Board Index No element not found.");
  }

  const emailElement = schoolDetailsContainer.querySelector(
    ".right-container p:nth-child(2)"
  );
  if (emailElement) {
    emailElement.textContent = `Email: ${
      tcformdata.email_address || "Not available"
    }`;
  } else {
    console.warn("Email element not found.");
  }
}

function setSchoolLogos(tcformdata) {
  const schoolName =
    tcformdata.schoolName || tcformdata.school_name || "demo school";
  const baseLogoName = schoolName.toLowerCase().replace(/\s+/g, "_");
  const logo1Url = `/images/logo/${baseLogoName}.png`;
  const logo2Url = `/images/logo/${baseLogoName}2.png`;

  const logo1Element = document.querySelector(".logo1-container img");
  const logo2Element = document.querySelector(".logo2-container img");
  const watermarkImg = document.getElementById("watermark");

  if (logo1Element) {
    logo1Element.src = logo1Url;
    logo1Element.alt = `${schoolName} Logo 1`;
  } else {
    console.warn("Logo 1 element not found in the DOM.");
  }

  if (logo2Element) {
    logo2Element.src = logo2Url;
    logo2Element.alt = `${schoolName} Logo 2`;
  } else {
    console.warn("Logo 2 element not found in the DOM.");
  }

  if (watermarkImg) {
    watermarkImg.src = logo1Url;
    watermarkImg.alt = `${schoolName} Watermark`;
  } else {
    console.warn("Watermark image element not found in the DOM.");
  }
}

function updateDateSignature(tcformdata) {
  const dateSignatureContainer = document.querySelector(
    ".date-signature-container"
  );
  if (!dateSignatureContainer) {
    console.error("Date-signature container not found in the DOM.");
    return;
  }

  const dateElement = dateSignatureContainer.querySelector(
    ".date-container p:nth-child(1)"
  );
  if (dateElement) {
    const formattedDate = tcformdata.issueDate
      ? tcformdata.issueDate.replace(/-/g, "/")
      : "Not available";
    dateElement.textContent = `Date: ${formattedDate}`;
  } else {
    console.warn("Date element not found.");
  }

  const placeElement = dateSignatureContainer.querySelector(
    ".date-container p:nth-child(2)"
  );
  if (placeElement) {
    let place = "Not available";
    if (tcformdata.detailed_address) {
      const addressParts = tcformdata.detailed_address
        .split(",")
        .map((part) => part.trim());
      place = addressParts[1] || "Not available";
    }
    placeElement.textContent = `Place: ${place}`;
  } else {
    console.warn("Place element not found.");
  }
}

// Event listeners to adjust font size on various events
window.addEventListener("load", adjustDateOfBirthFontSize);
window.addEventListener("resize", adjustDateOfBirthFontSize);
window.addEventListener("beforeprint", adjustDateOfBirthFontSize);
window.addEventListener("afterprint", adjustDateOfBirthFontSize);

document
  .getElementById("closePreviewTCOverlay")
  .addEventListener("click", function () {
    document.getElementById("previewTCOverlay").style.display = "none";
  });

function getSchoolLogoUrl(cookieName) {
  const cookies = document.cookie.split(";");
  let schoolName;

  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === cookieName) {
      schoolName = decodeURIComponent(value);
      break;
    }
  }

  if (schoolName) {
    return `../images/logo/${schoolName
      .toLowerCase()
      .replace(/\s+/g, "_")}.png`;
  }
  return null;
}
