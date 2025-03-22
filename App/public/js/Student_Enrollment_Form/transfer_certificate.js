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
  console.log(newTCObject);
  addRowsToTCTable(newTCObject);
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

function createTCObject(tcformdata) {
  return {
    "CERTIFICATE No": "1", // Hardcoded as per image
    "GENERAL REGISTER No": tcformdata.tc_grNo || "1618", // Maps to tc_grNo
    "STUDENT NAME": tcformdata.studentName || "Om Deepak Dafade", // Maps to studentName
    "MOTHER'S NAME": tcformdata.motherName || "Smita", // Maps to motherName
    "DATE OF BIRTH": tcformdata.dob || "2009-07-10", // Maps to dob
    "PLACE OF BIRTH": tcformdata.placeOfBirth || "Amravati", // Maps to placeOfBirth
    NATIONALITY: tcformdata.nationality || "Indian", // Maps to nationality
    RELIGION: tcformdata.religion || "Hindu", // Maps to religion
    "CASTE & SUB-CASTE": tcformdata.category || "OBC", // Maps to category (as per image context)
    "AADHAR ID": tcformdata.aadharId || "674816054773", // Maps to aadharId
    "LAST SCHOOL ATTENDED": tcformdata.lastSchool || "JC Highschool", // Maps to lastSchool
    "DATE OF ADMISSION": tcformdata.dateOfAdmission || "2020-02-23", // Maps to dateOfAdmission
    "CLASS OF ADMISSION": tcformdata.classOfAdmission || "1st", // Maps to classOfAdmission
    "DATE OF LEAVING": tcformdata.dateOfLeaving || "2020-03-01", // Maps to dateOfLeaving
    "STANDARD LEAVING": tcformdata.standardLeaving || "LKG", // Maps to standardLeaving
    "REASON FOR LEAVING":
      tcformdata.reasonLeaving || "AT HIS / HER OWN REQUEST", // Maps to reasonLeaving
    PROGRESS: tcformdata.progress || "Excellent", // Maps to progress
    CONDUCT: tcformdata.conduct || "Excellent", // Maps to conduct
    RESULT: tcformdata.result || "Pass", // Maps to result
    REMARK: tcformdata.remark || "Promoted to Next Class", // Maps to remark
  };
}

function addRowsToTCTable(tcObject) {
  // Find the table's tbody element in the DOM
  const tbody = document.querySelector(".content-table tbody");

  // If tbody is not found, log an error and return
  if (!tbody) {
    console.error(
      "Table body not found in the DOM. Please ensure the table with class 'content-table' exists."
    );
    return;
  }

  // Clear any existing rows in the tbody (optional, remove if you want to append without clearing)
  tbody.innerHTML = "";

  // Loop through the object entries to create and append table rows
  for (const [key, value] of Object.entries(tcObject)) {
    // Create a new row
    const row = document.createElement("tr");

    // Create the first cell (for the key)
    const keyCell = document.createElement("td");
    keyCell.textContent = key;
    row.appendChild(keyCell);

    // Create the second cell (for the value)
    const valueCell = document.createElement("td");
    valueCell.textContent = value;
    row.appendChild(valueCell);

    // Append the row to the tbody
    tbody.appendChild(row);
  }
}

function updateSchoolDetails(tcformdata) {
  // Find the container elements in the DOM
  const schoolDetailsContainer = document.querySelector(
    ".school-details-container"
  );

  // If the container isn't found, log an error and return
  if (!schoolDetailsContainer) {
    console.error(
      "School details container not found in the DOM. Please ensure the element with class 'school-details-container' exists."
    );
    return;
  }

  // Update School Name
  const schoolNameElement = schoolDetailsContainer.querySelector(
    ".school-name-container h1"
  );
  if (schoolNameElement) {
    schoolNameElement.textContent =
      tcformdata.schoolName || tcformdata.school_name || "Unknown School";
  } else {
    console.warn("School name element not found.");
  }

  // Update Address
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
  // Update UDISE No
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

  // Update Contact No
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

  // Update Board Index No
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

  // Update Email
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
  // Get the school name from tcformdata
  const schoolName =
    tcformdata.schoolName || tcformdata.school_name || "demo school";

  // Generate the logo URLs
  const baseLogoName = schoolName.toLowerCase().replace(/\s+/g, "_");
  const logo1Url = `/images/logo/${baseLogoName}.png`; // e.g., /images/logo/demo_school.png
  const logo2Url = `/images/logo/${baseLogoName}2.png`; // e.g., /images/logo/demo_school2.png

  // Find the logo image elements in the DOM
  const logo1Element = document.querySelector(".logo1-container img");
  const logo2Element = document.querySelector(".logo2-container img");

  // Update Logo 1
  if (logo1Element) {
    logo1Element.src = logo1Url;
    logo1Element.alt = `${schoolName} Logo 1`; // Update alt text for accessibility
  } else {
    console.warn("Logo 1 element not found in the DOM.");
  }

  // Update Logo 2
  if (logo2Element) {
    logo2Element.src = logo2Url;
    logo2Element.alt = `${schoolName} Logo 2`; // Update alt text for accessibility
  } else {
    console.warn("Logo 2 element not found in the DOM.");
  }
}

function updateDateSignature(tcformdata) {
  // Find the date-signature container in the DOM
  const dateSignatureContainer = document.querySelector(
    ".date-signature-container"
  );

  // If the container isn't found, log an error and return
  if (!dateSignatureContainer) {
    console.error(
      "Date-signature container not found in the DOM. Please ensure the element with class 'date-signature-container' exists."
    );
    return;
  }

  // Update Date
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

  // Update Place
  const placeElement = dateSignatureContainer.querySelector(
    ".date-container p:nth-child(2)"
  );
  if (placeElement) {
    let place = "Not available";
    if (tcformdata.detailed_address) {
      // Split the address by commas and take the second part (Dhanaj Bk)
      const addressParts = tcformdata.detailed_address
        .split(",")
        .map((part) => part.trim());
      place = addressParts[1] || "Not available"; // Dhanaj Bk is the second part
    }
    placeElement.textContent = `Place: ${place}`;
  } else {
    console.warn("Place element not found.");
  }

  // Signature section remains unchanged as there's no data to update it
}

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
