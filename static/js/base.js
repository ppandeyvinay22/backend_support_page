let Statue_Sort = [];
// const furl = "http://127.0.0.1:5559"; frontend url which is same as backedn this time
const url = "http://127.0.0.1:5443";

let ticket_data = "";
fetch(url + "/get_customer_cities_head_institution_wise_data", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => {
    return res.json();
  })
  .then((t_data) => {
    // console.log(t_data);
    ticket_data = t_data;
  });

document.addEventListener("DOMContentLoaded", function () {
  // ******* nav-bar filters *******
  var navLinks = document.querySelectorAll(".nav-link");
  // these all will give node list
  var nav_all_route = document.querySelectorAll(".nav-all-route");
  var nav_software_route = document.querySelectorAll(".nav-software-route");
  var nav_data_route = document.querySelectorAll(".nav-data-route");
  var nav_hardware_route = document.querySelectorAll(".nav-hardware-route");
  let url_end_point = window.location.href.split("/").slice(-1)[0];
  if (url_end_point === "datateam") {
    nav_data_route[0].classList.add("active");
  } else if (url_end_point === "hardware") {
    nav_hardware_route[0].classList.add("active");
  } else if (url_end_point === "software") {
    nav_software_route[0].classList.add("active");
  }
  // else {
  //   nav_all_route[0].classList.add("active");
  // }


  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      // Prevent the default action of the link
      // event.preventDefault();

      // console.log(this.innerText)
      // Remove 'active' class from all nav-links
      navLinks.forEach(function (navLink) {
        navLink.classList.remove("active");
      });

      // Add 'active' class to the clicked nav-link
      this.classList.add("active");
    });
  });


  //*********** Pagination starts **********/

  let originalData = [];
  let filteredData = [];
  const cardsPerPage = 21;
  let currentPage = 1;


  fetch(url + '/all_data', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      console.log("Data from server:", data);
      originalData = data;
      filteredData = data;
      displayPage(currentPage);
      updatePaginationButtons(currentPage, calculateTotalPages());
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });



  //******** filters *******//
  // If one is checked, keep others unchecked
  const checkBoxes = document.querySelectorAll('.state-checkbox');

  checkBoxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      if (this.checked) {
        // Uncheck all checkboxes except the one that was clicked
        checkBoxes.forEach(function (otherCheckbox) {
          if (otherCheckbox !== checkbox) {
            otherCheckbox.checked = false;
          }
        });
      }
    });
  });


  // Event listener for search input
  // const searchBox = document.querySelector('.search-box');
  // searchBox.addEventListener('input', function () {
  //   applySearchFilter();
  // });

  // // ****** search machine and name filter ******
  // function applySearchFilter() {
  //   const searchTerm = searchBox.value.trim().toLowerCase();
  //   filteredData = originalData.filter(data => {
  //     const machineNumber = String(data[12]);
  //     // console.log("***machine no****", machineNumber)
  //     let assign_task = data[6];
  //     // let ticket_id = String(data[0])
  //     // || ticket_id.toLowerCase().includes(searchTerm)

  //     return (machineNumber.toLowerCase().includes(searchTerm) || (assign_task && assign_task.toLowerCase().includes(searchTerm)));
  //   });
  //   displayPage(1);
  //   updatePaginationButtons(1, calculateTotalPages());
  // }

  // Made link with nav-link for search filters
  const searchBox = document.querySelector('.search-box');
  searchBox.addEventListener('input', function () {
    applySearchFilter();
  });

  // Function to apply search filter
  function applySearchFilter() {
    const searchTerm = searchBox.value.trim().toLowerCase();

    // Use the appropriate filtered data based on the active navLink
    let activeNavLinkText;
    navLinks.forEach(function (navLink) {
      if (navLink.classList.contains("active")) {
        activeNavLinkText = navLink.innerText.toLowerCase();
      }
    });

    let filteredDataForSearch;

    // Apply search filter based on the active navLink
    switch (activeNavLinkText) {
      case "all":
        filteredDataForSearch = originalData;
        break;
      case "software":
        filteredDataForSearch = originalData.filter(data => data[2] && data[2].toLowerCase() === "software");
        break;
      case "data":
        filteredDataForSearch = originalData.filter(data => data[2] && data[2].toLowerCase() === "datateam");
        break;
      case "hardware":
        filteredDataForSearch = originalData.filter(data => data[2] && data[2].toLowerCase() === "hardware");
        break;
      default:
        filteredDataForSearch = originalData;
    }

    // Apply the search filter to the filteredDataForSearch
    filteredData = filteredDataForSearch.filter(data => {
      const machineNumber = String(data[12]);
      let assign_task = data[6];

      return (machineNumber.toLowerCase().includes(searchTerm) || (assign_task && assign_task.toLowerCase().includes(searchTerm)));
    });

    displayPage(1);
    updatePaginationButtons(1, calculateTotalPages());
  }



  // ***** adding support_state filters for specific names and machines *****
  // const pendingCheckbox = document.getElementById('pendingCheckbox');
  // const ongoingCheckbox = document.getElementById('ongoingCheckbox');
  // const internetissueCheckbox = document.getElementById('internetissueCheckbox');
  // const doneCheckbox = document.getElementById('doneCheckbox');

  // // create a new variable to store the updated orginaData now 
  // let neworiginalData;
  // // event listner for pendingCheckbox
  // pendingCheckbox.addEventListener('change', function () {
  //   neworiginalData = originalData;
  //   // navLinks.forEach(function (navLink) {
  //   //   // Check if the current navLink has the 'active' class
  //   //   if (navLink.classList.contains("active")) {
  //   //     // console.log(navLink.innerText)
  //   //     if (navLink.innerText.toLowerCase() === "all") {
  //   //       neworiginalData = originalData;
  //   //     }
  //   //     else if (navLink.innerText.toLowerCase() === "software") {
  //   //       neworiginalData = originalData.filter(data => {
  //   //         const issueCondition = data[2] && data[2] === "software";
  //   //         return issueCondition;
  //   //       });
  //   //     }
  //   //     else if (navLink.innerText.toLowerCase() === "data") {
  //   //       neworiginalData = originalData.filter(data => {
  //   //         const issueCondition = data[2] && data[2] === "datateam";
  //   //         return issueCondition;
  //   //       });
  //   //     }
  //   //     else if (navLink.innerText.toLowerCase() === "hardware") {
  //   //       neworiginalData = originalData.filter(data => {
  //   //         const issueCondition = data[2] && data[2] === "hardware";
  //   //         return issueCondition;
  //   //       });
  //   //     }
  //   //   }
  //   // });
  //   if (this.checked) {
  //     console.log("pending checkbox is checked ")
  //     filteredData = neworiginalData.filter(data => {
  //       const stateCondition = data[4] && data[4].toLowerCase() === "pending";
  //       return stateCondition;
  //     });
  //     // Display the filtered data
  //     displayPage(1);
  //     updatePaginationButtons(1, calculateTotalPages());
  //   }

  //   else {
  //     console.log('Pending checkbox is unchecked');
  //     filteredData = neworiginalData;
  //     // Display the filtered data
  //     displayPage(1);
  //     updatePaginationButtons(1, calculateTotalPages());
  //   }
  // });



  // This one is for combining nav-link and state-checkboxes

  function filterData(navLinkText, data) {
    switch (navLinkText) {
      case "all":
        return originalData;
      case "software":
        return data.filter(dataItem => dataItem[2] && dataItem[2] === "software");
      case "data":
        return data.filter(dataItem => dataItem[2] && dataItem[2] === "datateam");
      case "hardware":
        return data.filter(dataItem => dataItem[2] && dataItem[2] === "hardware");
      default:
        return data;
    }
  }

  const filterConditions = {
    'pendingCheckbox': (data) => data[4] && data[4].toLowerCase() === 'pending',
    'ongoingCheckbox': (data) => data[4] && data[4].toLowerCase() === 'ongoing',
    'internetissueCheckbox': (data) => data[4] && data[4].toLowerCase() === 'internetissue',
    'doneCheckbox': (data) => data[4] && data[4].toLowerCase() === 'done'
  };

  const checkboxes = [
    document.getElementById('pendingCheckbox'),
    document.getElementById('ongoingCheckbox'),
    document.getElementById('internetissueCheckbox'),
    document.getElementById('doneCheckbox')
  ];

  let neworiginalData;

  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      neworiginalData = originalData;

      navLinks.forEach(function (navLink) {
        if (navLink.classList.contains("active")) {
          const navLinkText = navLink.innerText.toLowerCase();
          neworiginalData = filterData(navLinkText, neworiginalData);
        }
      });

      if (this.checked) {
        console.log(`${checkbox.id} checkbox is checked`);
        filteredData = neworiginalData.filter(data => filterConditions[checkbox.id](data));
      } else {
        console.log(`${checkbox.id} checkbox is unchecked`);
        filteredData = neworiginalData;
      }

      displayPage(1);
      updatePaginationButtons(1, calculateTotalPages());
    });
  });


  // Add event listeners to All
  // document.getElementById('allButton').addEventListener('click', () => {
  //   console.log("clickedAll")
  //   filteredData = originalData;
  //   displayPage(1);
  //   updatePaginationButtons(1, calculateTotalPages());
  // });

  // // Add event listeners to hardware
  // document.getElementById('hardwareButton').addEventListener('click', () => {
  //   console.log("clickedhardware")
  //   filteredData = originalData.filter(data => data[2] !== null && data[2].toLowerCase() === 'hardware');
  //   displayPage(1);
  //   updatePaginationButtons(1, calculateTotalPages());
  // });


  //This is just for nav-links
  // Add event listeners to All
  document.getElementById('allButton').addEventListener('click', () => {
    console.log("clickedAll");

    if (areCheckboxesChecked()) {
      // Apply state filter based on the selected checkboxes
      filteredData = originalData.filter(data => checkboxes.some(checkbox => checkbox.checked && filterConditions[checkbox.id](data)));
    } else {
      filteredData = originalData;
    }

    displayPage(1);
    updatePaginationButtons(1, calculateTotalPages());
  });

  // Add event listeners to hardware
  document.getElementById('hardwareButton').addEventListener('click', () => {
    console.log("clickedhardware");
    applyStateFilter('hardware');
  });

  // Add event listeners to software
  document.getElementById('softwareButton').addEventListener('click', () => {
    console.log("clickedsoftware");
    applyStateFilter('software');
  });

  // Add event listeners to data
  document.getElementById('dataButton').addEventListener('click', () => {
    console.log("clickedata");
    applyStateFilter('datateam');
  });

  // Function to check if any checkboxes are checked
  function areCheckboxesChecked() {
    return checkboxes.some(checkbox => checkbox.checked);
  }

  // Function to apply state filter based on the selected category
  function applyStateFilter(category) {
    if (areCheckboxesChecked()) {
      filteredData = originalData.filter(data => checkboxes.some(checkbox => checkbox.checked && filterConditions[checkbox.id](data) && data[2] && data[2].toLowerCase() === category));
    } else {
      filteredData = originalData.filter(data => data[2] && data[2].toLowerCase() === category);
    }

    displayPage(1);
    updatePaginationButtons(1, calculateTotalPages());
  }


  // Event listener for search input and state checkboxes combined
  // const searchBox = document.querySelector('.search-box');
  searchBox.addEventListener('input', function () {
    applyCombinedFilters();
  });

  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      applyCombinedFilters();
    });
  });

  // Function to apply both state and search filters
  function applyCombinedFilters() {
    const searchTerm = searchBox.value.trim().toLowerCase();

    // Use the appropriate filtered data based on the active navLink
    let activeNavLinkText;
    navLinks.forEach(function (navLink) {
      if (navLink.classList.contains("active")) {
        activeNavLinkText = navLink.innerText.toLowerCase();
      }
    });

    let filteredDataForState;
    let filteredDataForSearch;

    // Apply state filter based on the active navLink
    switch (activeNavLinkText) {
      case "all":
        filteredDataForState = originalData;
        break;
      case "software":
        filteredDataForState = originalData.filter(data => data[2] && data[2].toLowerCase() === "software");
        break;
      case "data":
        filteredDataForState = originalData.filter(data => data[2] && data[2].toLowerCase() === "datateam");
        break;
      case "hardware":
        filteredDataForState = originalData.filter(data => data[2] && data[2].toLowerCase() === "hardware");
        break;
      default:
        filteredDataForState = originalData;
    }

    // Apply the search filter to the filteredDataForState
    filteredDataForSearch = filteredDataForState.filter(data => {
      const machineNumber = String(data[12]);
      let assign_task = data[6];

      return (machineNumber.toLowerCase().includes(searchTerm) || (assign_task && assign_task.toLowerCase().includes(searchTerm)));
    });

    // Apply state filter based on the selected checkboxes
    checkboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        const stateFilter = filterConditions[checkbox.id];
        filteredDataForSearch = filteredDataForSearch.filter(data => stateFilter(data));
      }
    });

    // Assign the final result to filteredData
    filteredData = filteredDataForSearch;

    displayPage(1);
    updatePaginationButtons(1, calculateTotalPages());
  }

  // **********final combination between nav-link and search_bar
  // Event listener for nav links
  navLinks.forEach(function (navLink) {
    navLink.addEventListener('click', function () {
      applyFilters();
    });
  });

  // Event listener for checkboxes
  // checkboxes.forEach(function (checkbox) {
  //   checkbox.addEventListener('change', function () {
  //     applyFilters();
  //   });
  // });

  // Function to apply both nav link and checkbox filters
  function applyFilters() {
    const searchTerm = searchBox.value.trim().toLowerCase();

    // Use the appropriate filtered data based on the active navLink
    let activeNavLinkText;
    navLinks.forEach(function (navLink) {
      if (navLink.classList.contains("active")) {
        activeNavLinkText = navLink.innerText.toLowerCase();
      }
    });

    let filteredDataForNav;
    let filteredDataForCheckbox;
    let filteredDataForSearch;

    // Apply nav link filter based on the active navLink
    switch (activeNavLinkText) {
      case "all":
        filteredDataForNav = originalData;
        break;
      case "software":
        filteredDataForNav = originalData.filter(data => data[2] && data[2].toLowerCase() === "software");
        break;
      case "data":
        filteredDataForNav = originalData.filter(data => data[2] && data[2].toLowerCase() === "datateam");
        break;
      case "hardware":
        filteredDataForNav = originalData.filter(data => data[2] && data[2].toLowerCase() === "hardware");
        break;
      default:
        filteredDataForNav = originalData;
    }

    // Apply search filter to the filteredDataForNav
    filteredDataForSearch = filteredDataForNav.filter(data => {
      const machineNumber = String(data[12]);
      let assign_task = data[6];

      return (machineNumber.toLowerCase().includes(searchTerm) || (assign_task && assign_task.toLowerCase().includes(searchTerm)));
    });

    // Apply checkbox filter based on the selected checkboxes
    checkboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        const stateFilter = filterConditions[checkbox.id];
        filteredDataForCheckbox = filteredDataForSearch.filter(data => stateFilter(data));
      }
    });

    // Assign the final result to filteredData
    filteredData = filteredDataForCheckbox || filteredDataForSearch;

    displayPage(1);
    updatePaginationButtons(1, calculateTotalPages());
  }







  // ********** raise ticket search filter functions *********
  // Function to filter results based on input
  function filterResults(input) {
    let results = [];

    // Iterate through ticket_data
    for (let key in ticket_data) {
      for (let i = 0; i < ticket_data[key].length; i++) {
        let city = ticket_data[key][i].city;
        city = city === null || city === undefined ? "" : city;
        let machineNo = ticket_data[key][i].machine_no;
        machineNo =
          machineNo === null || machineNo === undefined ? "" : machineNo;
        let head_institution = key;
        head_institution =
          head_institution === null || head_institution === undefined
            ? ""
            : head_institution;

        // Check if input matches city or machine_no
        if (
          city.toLowerCase().includes(input.toLowerCase()) ||
          machineNo.toLowerCase().includes(input.toLowerCase()) ||
          head_institution.toLowerCase().includes(input.toLowerCase())
        ) {
          results.push({
            city: city.trim(),
            machineNo: machineNo.trim(),
            head_institution: head_institution.trim(),
          });
        }
        // console.log(results)
      }
    }

    return results;
  }

  // ********** Function to handle checkboxes **********
  function updateCheckboxes(results) {
    let checkboxesContainer = document.getElementById("checkboxesContainer");
    checkboxesContainer.innerHTML = "";

    for (let i = 0; i < results.length; i++) {
      let checkboxItem = document.createElement("div");
      checkboxItem.className = "checkboxItem";

      checkboxItem.innerHTML = `
          <input type="checkbox" id="checkbox_${i}" class="resultCheckbox" value="${results[i].head_institution},${results[i].city},${results[i].machineNo}">
          <label for="checkbox_${i}">
              ${results[i].head_institution}, ${results[i].city}, ${results[i].machineNo}
          </label>
      `;

      checkboxesContainer.appendChild(checkboxItem);
    }
  }

  // ********* function to show the check content below********//
  function handleCheckboxChange(checkbox) {
    let selectedOptionsContainer = document.getElementById("selectedOptionsContainer");

    // Check if the checkbox is checked or unchecked
    if (checkbox.checked) {
      // If checked, add the selected option to the container
      let selectedOption = document.createElement("div");
      selectedOption.className = "selectedOption";
      selectedOption.innerHTML = checkbox.value;

      // Add a remove button to allow removing the selected option
      let removeButton = document.createElement("span");
      removeButton.className = "removeButton";
      removeButton.innerHTML = "&times;";
      removeButton.style.cursor = "pointer"; // Set cursor to pointer
      removeButton.addEventListener("click", function () {
        selectedOptionsContainer.removeChild(selectedOption);
        checkbox.checked = false; // Uncheck the corresponding checkbox

        // Check if there are no more selected options, hide the container
        if (selectedOptionsContainer.children.length === 0) {
          selectedOptionsContainer.style.display = "none";
        }
      });

      selectedOption.appendChild(removeButton);
      selectedOptionsContainer.appendChild(selectedOption);

      // Show the container when an option is selected
      selectedOptionsContainer.style.display = "block";
    } else {
      // If unchecked, remove the corresponding option from the container
      let optionValue = checkbox.value;
      let selectedOptionToRemove = Array.from(selectedOptionsContainer.children).find(option => option.innerHTML.includes(optionValue));
      if (selectedOptionToRemove) {
        selectedOptionsContainer.removeChild(selectedOptionToRemove);
      }

      // Check if there are no more selected options, hide the container
      if (selectedOptionsContainer.children.length === 0) {
        selectedOptionsContainer.style.display = "none";
      }
    }
  }


  // ***********populate function************
  function populateEditForm(data) {
    console.log("data inside populate", data);
    // data =
    // (0)s.id,
    // (1)s.support_date,
    // (2)s.generated_by,
    // (3)s.support_mode,
    // (4)s.support_priority,
    // (5)s.support_commitment_days,
    // (6)s.issue_type,
    // (7)s.support_state,
    // (8)s.assign_task,
    // (9)s.support_remark,
    // (10)s.error_detail,
    // (11)s.resolved_by,
    // (12)s.resolution_detail,
    // (13)s.resolution_date,
    // (14)s.visit_required,
    // (15)s.visit_start_date,
    // (16)s.visit_end_date,
    // (17)s.expense,
    // (18)s.h1_replace,
    // (19)s.h2_replace,
    // (20)s.h3_replace,
    // (21)s.h4_replace,
    // (22)c.head_instituition,
    // (23)c.instituition_name,
    // (24)c.instituition_code

    document.getElementById("edit_modal_head_institution").innerText = data[22][0];
    document.getElementById("edit_modal_location").innerText = data[23].join(', ');
    console.log("machine_no in edit form:", data[23]);
    document.getElementById("edit_modal_machine_no").innerText = data[24].join(', ');

    const editAssignedTask = document.getElementById("editAssignedTask");
    const editSupportMode = document.getElementById("editSupportMode");
    const editSupportState = document.getElementById("editSupportState");
    const editPriority = document.getElementById("editPriority");
    const editSupportRemarks = document.getElementById("editSupportRemarks");
    const editDepartmentType = document.getElementById("editDepartmentType");
    const editCommitmentDays = document.getElementById("editCommitmentDays");


    const editAssignedTaskOptions = [
      "Choose...",
      "Anmoldeep",
      "Pankaj",
      "Santosh",
      "Ankit",
      "Nishit",
      "RipuDaman",
      "Ashish"
    ];

    // edit assign task
    let editAssignedTaskHTML = "";
    editAssignedTaskOptions.forEach((assign_task_option, i) => {
      // console.log(data[8], typeof data[8]);
      // const option = document.createElement("option");
      // option.value = i;
      // option.textContent = assign_task_option;
      console.log(assign_task_option, i);
      if (
        data[8] != null &&
        data[8].toLowerCase() === assign_task_option.toLowerCase()
      ) {
        editAssignedTaskHTML += `<option value="${i}" selected>${assign_task_option}</option>`;
      } else {
        editAssignedTaskHTML += `<option value="${i}">${assign_task_option}</option>`;
      }
    });
    editAssignedTask.innerHTML = editAssignedTaskHTML;

    // edit support mode
    const editSupportModeOptions = ["Choose...", "online", "offline"];

    let editSupportModeOptionsHTML = "";
    editSupportModeOptions.forEach((Support_Mode_option, i) => {
      console.log(data[3], typeof data[3]);

      if (
        data[3] !== null &&
        data[3].toLowerCase() === Support_Mode_option.toLowerCase()
      ) {
        editSupportModeOptionsHTML += `<option value="${i}" selected>${Support_Mode_option}</option>`;
      } else {
        editSupportModeOptionsHTML += `<option value="${i}" >${Support_Mode_option}</option>`;
      }
    });
    editSupportMode.innerHTML = editSupportModeOptionsHTML;

    // edit support state
    const editSupportStateOptions = [
      "Choose...",
      "Pending",
      "Ongoing",
      "InternetIssue",
      "Done",
    ];

    let editSupportStateHTML = "";
    editSupportStateOptions.forEach((option, i) => {
      console.log(data[7], typeof data[7]);

      if (data[7] !== null && data[7].toLowerCase() === option.toLowerCase()) {
        editSupportStateHTML += `<option value="${i}" selected>${option}</option>`;
        if (data[7].toLowerCase() === "done") {
          editAssignedTask.setAttribute("disabled", "disabled");
          editSupportMode.setAttribute("disabled", "disabled");
          editSupportState.setAttribute("disabled", "disabled");
          editPriority.setAttribute("disabled", "disabled");
          editSupportRemarks.setAttribute("disabled", "disabled");
          editDepartmentType.setAttribute("disabled", "disabled");
          editCommitmentDays.setAttribute("disabled", "disabled");
          editSupportMode.setAttribute("disabled", "disabled");
        }
        else {
          editAssignedTask.removeAttribute("disabled", "disabled");
          editSupportMode.removeAttribute("disabled", "disabled");
          editSupportState.removeAttribute("disabled", "disabled");
          editPriority.removeAttribute("disabled", "disabled");
          editSupportRemarks.removeAttribute("disabled", "disabled");
          editDepartmentType.removeAttribute("disabled", "disabled");
          editCommitmentDays.removeAttribute("disabled", "disabled");
          editSupportMode.removeAttribute("disabled", "disabled");
        }
      } else {
        editSupportStateHTML += `<option value="${i}" >${option}</option>`;
      }
    });
    editSupportState.innerHTML = editSupportStateHTML;



    // edit department type

    const editDepartmentTypeOptions = [
      "Choose...",
      "Software",
      "Hardware",
      "Datateam",
    ];

    let editDepartmentTypeHTML = "";
    editDepartmentTypeOptions.forEach((option, i) => {
      console.log(data[6], typeof data[6]);

      if (data[6] !== null && data[6].toLowerCase() === option.toLowerCase()) {
        editDepartmentTypeHTML += `<option value="${i}" selected>${option}</option>`;
      } else {
        editDepartmentTypeHTML += `<option value="${i}" >${option}</option>`;
      }
    });
    editDepartmentType.innerHTML = editDepartmentTypeHTML;

    // edit priority
    const editPriorityOptions = ["Choose...", "High", "Medium", "Low"];

    let editPriorityHTML = "";
    editPriorityOptions.forEach((option, i) => {
      console.log(data[4], typeof data[4]);

      if (data[4] !== null && data[4].toLowerCase() === option.toLowerCase()) {
        editPriorityHTML += `<option value="${i}" selected>${option}</option>`;
      } else {
        editPriorityHTML += `<option value="${i}" >${option}</option>`;
      }
    });
    editPriority.innerHTML = editPriorityHTML;

    // support remarks
    if (data[9]) {
      document.getElementById("editSupportRemarks").value = data[9];
    } else {
      document.getElementById("editSupportRemarks").value = "No remarks yet";
    }

    // commitment days
    if (data[5]) {
      document.getElementById("editCommitmentDays").value = data[5];
    } else {
      document.getElementById("editCommitmentDays").value = 0;
    }


    //************************** Resolution container *******************//

    // edit resolved by
    const editResolvedBy = document.getElementById("editResolvedBy");
    let editResolvedByHTML = "";
    editAssignedTaskOptions.forEach((option, i) => {
      console.log(data[11], typeof data[11]);

      if (data[11] !== null && data[11].toLowerCase() === option.toLowerCase()) {
        editResolvedByHTML += `<option value="${i}" selected>${option}</option>`;
      } else {
        editResolvedByHTML += `<option value="${i}" >${option}</option>`;
      }
    });
    editResolvedBy.innerHTML = editResolvedByHTML;


    // Add event listener to detect changes in the selected value
    const Resolved_By_Div = document.getElementById("resolved_by");
    const Resolution_details_Div = document.getElementById("resolution_details");
    editSupportState.addEventListener("change", function () {
      // Check if the selected option is "Done"
      const supportStateIndex = document.getElementById("editSupportState").selectedIndex;
      const supportState = document.getElementById("editSupportState").options[supportStateIndex].text;
      if (supportState.toLowerCase() === "done") {
        Resolved_By_Div.style.display = "block"
        Resolution_details_Div.style.display = "block"
        editAssignedTask.setAttribute("disabled", "disabled");
        editDepartmentType.setAttribute("disabled", "disabled");
        editPriority.setAttribute("disabled", "disabled");
        editSupportRemarks.setAttribute("disabled", "disabled");
        editCommitmentDays.setAttribute("disabled", "disabled");
      }
      else {
        Resolved_By_Div.style.display = "none"
        Resolution_details_Div.style.display = "none"
        editAssignedTask.removeAttribute("disabled", "disabled");
        editDepartmentType.removeAttribute("disabled", "disabled");
        editPriority.removeAttribute("disabled", "disabled");
        editSupportRemarks.removeAttribute("disabled", "disabled");
        editCommitmentDays.removeAttribute("disabled", "disabled");
      }
    });

    // console.log("bheeeeeeeeeeee", supportState);

    // edit resolution details 
    // if (data[12]) {
    //   document.getElementById("editResolutionDetails").value = data[12];
    // }
    // if (supportState.toLowerCase() === "done") {
    // }

  }

  // ************ submit form data *************
  function submitFormData(t_id) {
    // Get input values
    const assign_task_index =
      document.getElementById("editAssignedTask").selectedIndex;
    const assign_task =
      document.getElementById("editAssignedTask").options[assign_task_index].text;
    const supportMode_index =
      document.getElementById("editSupportMode").selectedIndex;
    const supportMode =
      document.getElementById("editSupportMode").options[supportMode_index].text;
    const supportStateIndex =
      document.getElementById("editSupportState").selectedIndex;
    const supportState =
      document.getElementById("editSupportState").options[supportStateIndex].text;
    const resolveByIndex =
      document.getElementById("editResolvedBy").selectedIndex;
    const resolvedBy =
      document.getElementById("editResolvedBy").options[resolveByIndex].text;
    const resolutionDetails = document.getElementById("editResolutionDetails").value;

    // console.log("bheeeeeeeeeeee", supportState);
    // if (supportState.toLowerCase() === "done") {

    // }
    const supportRemarks = document.getElementById("editSupportRemarks").value;
    const issueTypeIndex =
      document.getElementById("editDepartmentType").selectedIndex;
    const issueType =
      document.getElementById("editDepartmentType").options[issueTypeIndex].text;
    const priorityIndex = document.getElementById("editPriority").selectedIndex;
    const priority =
      document.getElementById("editPriority").options[priorityIndex].text;
    const commitmentDays = document.getElementById("editCommitmentDays").value;
    const support_id = t_id;

    // Prepare data to send to the backend
    const formData = {
      support_id: support_id,
      assign_task: assign_task,
      support_state: supportState,
      support_mode: supportMode,
      resolved_by: resolvedBy,
      resolution_detail: resolutionDetails,
      supportRemarks: supportRemarks,
      issueType: issueType,
      priority: priority,
      commitmentDays: commitmentDays,
      support_date: new Date().toISOString(),
      resolution_date: new Date().toISOString()
    };
    console.log(formData);
    // Make a POST request to the backend using fetch
    const confirmEditTicket = confirm(
      "Click On Yes! To save edit Ticket details"
    );
    if (confirmEditTicket) {
      fetch(url + "/save_edit_card_details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            console.log(response);
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Handle the response from the server
          console.log("Data sent successfully:", data);
          location.reload();
          // Optionally, perform any actions after successful submission
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
          // Handle errors or display an error message to the user
        });
    } else {
      console.log("Edit Ticket action cancelled.");
    }
  }

  // Function to handle the delete action
  function DeleteCard(delete_id) {
    console.log("Item deleted.");
    let payload = {
      support_id: delete_id,
    };
    fetch(url + "/deleting_card_information", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Handle the response from the server
        console.log("Data sent successfully:", data);
        // Optionally, perform any actions after successful submission
        location.reload();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        // Handle errors or display an error message to the user
      });
  }

  // ********** delete attachments function ********
  async function display_attachments(t_id, ShowAttachmentDiv, showDeleteBtn) {
    // fetch data

    await fetch(url + "/view", {
      method: "POST",
      body: JSON.stringify({ support_id: t_id }),
    })
      .then((response) => {
        return response.json();
      })
      .then((viewdata) => {
        console.log({ view: viewdata.files });
        let displayattach = `<ul class="mt-2 border border-top-0 border border-3 rounded-4">`;

        viewdata.files.forEach((file) => {
          // appending files of support id from database
          // const delete_attachment_file = `http://127.0.0.1:5559/delete_attachment/${file['id']}`;
          let DisplayattachInnerLi = `<li data-key="${file["id"]}">
              <a href="${url + "/view_attachment_image/" + file["id"]
            }" class="list-group-item list-group-item-action d-inline me-2" target="_blank">${file["filename"]
            }</a>${showDeleteBtn
              ? '<span class="delete_attachments_icon d-inline fs-5 fw-medium" >x</span></li>'
              : ""
            }`;
          displayattach += DisplayattachInnerLi;
        });

        displayattach += `</ul>`;

        ShowAttachmentDiv.innerHTML = displayattach;
        // delete attachments
        // delete the individual file
        delete_attachments = Array.from(
          document.querySelectorAll(".delete_attachments_icon")
        );
        delete_attachments.forEach((delete_item) => {
          delete_item.style.cursor = "pointer";
          delete_item.style.userSelect = "none";
          delete_item.addEventListener("click", async function () {
            console.log("working delete", this);
            delete_item.parentNode.style.display = "none";
            await fetch(
              url +
              "/delete_attachment/" +
              this.parentNode.getAttribute("data-key"),
              {
                method: "GET",
              }
            )
              .then((res) => {
                return res.json();
              })
              .then((data) => console.log(data))
              .catch((err) => console.log(err));
          });
          delete_item.addEventListener("mouseover", () => {
            delete_item.style.color = "red";
            delete_item.parentNode.childNodes[1].style.textDecoration =
              "line-through";
            // const listItem = delete_attachments.parentNode;
            // const link = listItem.querySelector('a');
            // link.style.innerHTML = link.style.innerHTML.strike();
            // link.classList.add("strikethrough");
          });
          delete_item.addEventListener("mouseout", () => {
            delete_item.style.color = "gray";
            delete_item.parentNode.childNodes[1].style.textDecoration = "none";
            // delete_item.parentNode.style.innerHTML = delete_item.parentNode.style.innerHTML.strike()
            // link.classList.remove('strikethrough');
          });
        });
      });

    // we will put this in above then code when data is feched from the url
    // console.log("show_edit_attachment", t_id);
    // let displayattach = `<ul class="mt-2 border border-top-0 border border-3 rounded-4">`;
    // let DisplayattachInnerLi = `<li data-key="10">
    //   <a href="#" class="list-group-item list-group-item-action d-inline me-2" target="_blank">filename</a><span class="delete_attachments_icon d-inline fs-5 fw-medium" >x</span>
    //   </li>`;
    // displayattach += DisplayattachInnerLi;
    // DisplayattachInnerLi += `<li data-key="10">
    //   <a href="#" class="list-group-item list-group-item-action d-inline me-2" target="_blank">filename</a><span class="delete_attachments_icon d-inline fs-5 fw-medium" >x</span>
    //   </li>`;
    // displayattach += DisplayattachInnerLi;

    // displayattach += `</ul>`;
    // ShowAttachmentDiv.innerHTML = displayattach;

    // // delete attachments
    // delete_attachments = Array.from(
    //   document.querySelectorAll(".delete_attachments_icon")
    // );
    // delete_attachments.forEach((delete_item) => {
    //   delete_item.style.cursor = "pointer";
    //   delete_item.style.userSelect = "none";
    //   delete_item.addEventListener("click", () => {
    //     console.log("working");
    //     delete_item.parentNode.style.display = "none";
    //   });
    //   delete_item.addEventListener("mouseover", () => {
    //     delete_item.style.color = "red";
    //     delete_item.parentNode.childNodes[1].style.textDecoration =
    //       "line-through";
    //     // const listItem = delete_attachments.parentNode;
    //     // const link = listItem.querySelector('a');
    //     // link.style.innerHTML = link.style.innerHTML.strike();
    //     // link.classList.add("strikethrough");
    //   });
    //   delete_item.addEventListener("mouseout", () => {
    //     delete_item.style.color = "gray";
    //     delete_item.parentNode.childNodes[1].style.textDecoration = "none";
    //     // delete_item.parentNode.style.innerHTML = delete_item.parentNode.style.innerHTML.strike()
    //     // link.classList.remove('strikethrough');
    //   });
    // });
    // console.log(delete_attachments);
  }




  //s.id, -0
  // s.support_date,  -1
  // s.Issue_type, -2
  // s.error_detail, -3
  // s.support_state,  -4
  // s.support_priority, -5 
  // s.assign_task, -6
  // s.generated_by, -7
  // s.support_mode,  -8
  // s.resolved_by,  -9
  // m.code  - 10

  function displayPage(pageNumber) {
    const cardContainer = document.getElementsByClassName('card-group')[0];
    cardContainer.innerHTML = '';

    const startIndex = (pageNumber - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    filteredData.slice(startIndex, endIndex).forEach(data => {
      const cardElement = document.createElement('div');
      // cardElement.classList.add('card');
      cardElement.classList.add('card', 'border', 'border-1', 'm-3', 'rounded', 'shadow');


      let machine_no = data[10];
      let support_state = data[4] ? data[4].toLowerCase() : 'pending';
      let support_priority = data[5] ? data[5].toLowerCase() : 'high';
      let Issue_type = data[2] ? data[2].toLowerCase() : 'software';
      let ticket_id = data[0];

      //****error_detail *****/

      // Shorten a string to less than maxLen characters without truncating words.
      function shorten(str, maxLen, separator = ' ') {
        if (str.length <= maxLen) return str;
        return str.substr(0, str.lastIndexOf(separator, maxLen));
      }

      let error_detail = data[3] ? shorten(data[3], 35) : "not mentioned yet";

      // console.log('Updated error_detail:', error_detail);

      let raised_by = data[7] ? data[7].toLowerCase() : 'ashish';
      let assigned_to = data[6] ? data[6].toLowerCase() : 'not assigned yet';
      let support_mode = data[8] ? data[8].toLowerCase() : 'online';
      let givenTimestamp;

      // Check if data[1] is a valid date string
      if (data[1] && Date.parse(data[1])) {
        givenTimestamp = new Date(data[1]);
      }
      // else {
      //   givenTimestamp = new Date();
      // }

      // Current time
      const currentTime = new Date();

      // Calculate the difference in milliseconds
      const timeDifferenceInMilliseconds = currentTime - givenTimestamp;

      // Convert milliseconds to hours and round down
      const CreatedTime = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60));

      console.log(CreatedTime)

      function getBadgeClass(supportState) {
        switch (supportState) {
          case 'done':
            return 'bg-success';
          case 'ongoing':
            return 'bg-warning text-dark';
          case 'pending':
            return 'bg-danger';
          case 'internetissue':
            return 'bg-info text-dark';
          default:
            return '';
        }
      }

      function getPriorityMarkerClass(priority) {
        switch (priority) {
          case 'high':
            return 'bg-red';
          case 'moderate':
          case 'medium':
            return 'bg-orange';
          case 'low':
            return 'bg-yellow';
          default:
            return 'bg-light';
        }
      }

      function getFooterClass(status) {
        switch (status) {
          case 'offline':
            return 'bg-secondary';
          case 'online':
            return 'bg-success';
          default:
            return 'bg-warning';
        }
      }

      function getIssueImage(issueType) {
        switch (issueType) {
          case 'software':
            return '../static/assets/software_logo.png';
          case 'hardware':
            return '../static/assets/hardware_logo.png';
          case 'datateam':
            return '../static/assets/datateam_logo.png';
          default:
            return '../static/assets/software_image.png';
        }
      }

      function dimesnsion(issueType) {
        switch (issueType) {
          case 'software':
            return 'height="25px" width="25px"';
          case 'hardware':
            return 'height="25px" width="25px"';
          case 'datateam':
            return 'height="25px" width="25px"';
          default:
            return 'height="25px" width="25px"';
        }
      }



      cardElement.innerHTML = `
      <!-- card-body -->
      <div
        class="card-body"
        data-bs-toggle="modal"
        data-bs-target="#cardModal"
      >
        <div class="ticket-header">
          <div class="ticket-header-part1 position-relative">
            <h5 class="card-title d-inline-block fs-3" id="ticket_id">#${ticket_id}</h5>
            <span
            class="position-absolute badge ${getBadgeClass(support_state)} top-0 end-0 fs-6" 
              >${support_state}</span
            >
          </div>
          <!-- Priority tag-->
          <div class="ticket-header-part2 position-relative">
            <!-- ${support_priority} -->
            <span
              class="d-inline-block priority-marker  ${getPriorityMarkerClass(support_priority)}"
            ></span>
            <h6 class="position-absolute d-inline-block">
              ${support_priority}
            </h6>
            <!-- <span
              class="position-absolute top-0 end-0 badge rounded-pill text-bg-dark"
              id="ticket_id"
              >#${ticket_id}</span
            > -->
          </div>
        </div>

        
        <div class="ticket-brief-info">

        <!--new position issue-type -->
          <div class="position-relative issue-raise-persons d-flex mb-1">
            <h6 class="text-nowrap"><img src="${getIssueImage(Issue_type)}" ${dimesnsion(Issue_type)} alt="">
            </h6>
            <p class="card-text issue-desc"> ${Issue_type} </p>
          </div>

          

          <div class="position-relative issue d-flex mb-1">
            <h6 class="d-inline-block text-nowrap"><img src="../static/assets/description.png" height="25px"
            width="25px" alt=""></h6>
            <p class="card-text d-inline-block issue-desc">
            ${error_detail}...
            </p>
          </div>

          <div
            class="position-relative issue-assigned-persons d-flex mb-1"
          >
            <h6 class="d-inline-block text-nowrap"><img src="../static/assets/person.png" height="25px"
            width="25px" alt=""></h6>
            <p class="card-text d-inline-block issue-desc">
              ${assigned_to}
            </p>
          </div>
        </div>
      </div>
      <!-- card-footer -->
      <div
        class='card-footer ${getFooterClass(support_mode)}  bg-gradient text-light d-flex align-items-center'
      >
        <span>${support_mode}! </span>
        <small class="text-light w-100 ps-2"
          >Created ${CreatedTime} Hrs ago</small
        >
        <div
          class="edit-card-button flex-shrink-1 me-1"
          data-bs-toggle="modal"
          data-bs-target="#editcard"
        >
          <img src="../static/assets/edit_card.png" alt="" />
        </div>
        <div
          class="delete-card-button flex-shrink-1"
        >
          <img src="../static/assets/trash-bin.png" alt="" />
        </div>
      </div>
      `;

      // Add onclick event to each card
      cardElement.addEventListener("click", async function () {
        console.log("working");
        const ticket_id = this.querySelector("#ticket_id").innerText.slice(1);
        const view_modal = document
          .querySelector("#cardModal")
          .querySelector(".modal-body");

        await fetch(url + "/individual_card_data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: ticket_id }),
        })
          .then((data) => {
            return data.json();
          })
          .then((data) => {
            // console.log(data);
            // console.log("loaction and machine numer respectively:-", data[0][23], data[0][24])
            let tableData = data[1].length
              ? `<h4 class="mt-5 ">Track Issues</h4>
        <table class="table text-center">
          <thead>
            <tr>
              <th scope="col">assign_to</th>
              <th scope="col">support_state</th>
              <th scope="col">support_date</th>
              <th scope="col">resolution_date</th>
              <th scope="col">support_remark</th>
              <th scope="col">issue_type</th>
            </tr>
          </thead>
          <tbody>
          `
              : "";
            for (let row = 0; row < data[1].length; row++) {
              let tableRowData = "<tr>";
              tableRowData += `<td>${data[1][row][1]}</td>`;
              tableRowData += `<td>${data[1][row][2]}</td>`;
              tableRowData += `<td>${data[1][row][3] == "" || data[1][row][3] == null
                ? "-"
                : new Date(data[1][row][3]).toLocaleString()
                }</td>`;
              tableRowData += `<td>${data[1][row][4] == "" || data[1][row][4] == null
                ? "-"
                : new Date(data[1][row][4]).toLocaleString()
                }</td>`;
              tableRowData += `<td>${data[1][row][5]}</td>`;
              tableRowData += `<td>${data[1][row][6]}</td>`;
              tableRowData += "</tr>";
              tableData += tableRowData;
            }
            tableData += `</tbody>
        </table>`;
            // console.log("data:", tableData);

            const Assigned_Task_To =
              data[0][8] == "" || data[0][8] == null
                ? "Not assigned to anyone yet"
                : data[0][8];
            const support_remarks =
              data[0][9] == "" || data[0][9] == null ? "No Remarks" : data[0][9];
            const resolved_by =
              data[0][11] == "" || data[0][11] == null
                ? "Not resolved yet"
                : data[0][11];
            const resolution_details =
              data[0][12] == "" || data[0][12] == null
                ? "Not resolved yet"
                : data[0][12];
            const resolved_date =
              data[0][13] == "" || data[0][13] == null
                ? "Not resolved yet"
                : new Date(data[0][13]).toLocaleString();
            const visit_start_date =
              data[0][15] == "" || data[0][15] == null
                ? "Not mentioned"
                : data[0][15];
            const visit_end_date =
              data[0][15] == "" || data[0][15] == null
                ? "-"
                : new Date(data[0][15]).toLocaleString();

            const expenses =
              data[0][17] == "" || data[0][17] == null
                ? "Not mentioned"
                : `Rs. ${data[0][17]}`;

            let items_replaced = "";
            for (let i = 18; i <= 21; i++) {
              if (
                data[0][i] != "" ||
                data[0][i] != "none" ||
                data[0][i] != "None" ||
                data[0][i] != null
              )
                items_replaced += `${data[0][i]},`;
            }
            if (items_replaced == "") items_replaced += "Nothing replaced";

            const is_Visit =
              data[0][14] == true
                ? `<div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Visit Start Date</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${visit_start_date}
              </div>
          </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Visit End Date</label>
              <div class="form-control read-only-box bg-light" readonly>
              <!-- Your read-only content goes here -->
              ${visit_end_date}
              </div>
          </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Expenses</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${expenses}
              </div>
          </div>
          <div class="col-md-6">
              <label for="inputEmail4" class="form-label fw-bold">Items Replaced</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${items_replaced}
                  <!--
                  {% if ${data[0][18]} == '' or ${data[0][18]} == 'none' or ${data[0][18]} == 'None' %}
                      
                  {% else %}
                      {{${data[0][18]}}}, 
                  {% endif %}
                  {% if ${data[0][19]} == '' or ${data[0][19]} == 'none' or ${data[0][19]} == 'None' %}
                      
                  {% else %}
                      {{${data[0][19]}}},
                  {% endif %}
                  {% if ${data[0][20]} == '' or ${data[0][20]} == 'none' or ${data[0][20]} == 'None' %}
                      
                  {% else %}
                      {{${data[0][20]}}},
                  {% endif %}
                  {% if ${data[0][21]} == '' or ${data[0][21]} == 'none' or ${data[0][21]} == 'None' %}
                      Nothing replaced
                  {% else %}
                      {{${data[0][21]}}}
                  {% endif %}
                  -->
              </div>
          </div>`
                : `<div class="col-md-4">
          <button type="button" class="badge rounded-pill text-bg-secondary" >No visit for this ticket</button>
      </div>`;

            view_modal.innerHTML = `<form class="row g-3">
            <div class="col-md-4 ">
              <label for="inputEmail4" class="form-label fw-bold">Id</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][0]}
              </div>
            </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Created Date</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][1] == "" || data[0][1] == null
                ? "-"
                : new Date(data[0][1]).toLocaleString()
              }
              </div>
          </div>
          <div class="col-md-4 ">
              <label for="inputEmail4" class="form-label fw-bold">Created By</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][2]}
              </div>
          </div>

          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Head Institution</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][22][0]}
              </div>
          </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Locations</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][23].join(', ')}
              </div>
          </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Machines</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][24].join(', ')}
              </div>
          </div>

          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Support Mode</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][3]}
              </div>
          </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Support Priority</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][4]}
              </div>
          </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Support Commitment Days</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][5]}
              </div>
          </div>

          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Issue Type</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][6]}
              </div>
          </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Support State</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][7]}
              </div>
          </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Assigned Task To</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${Assigned_Task_To}
              </div>
          </div>
          <div class="col-md-12">
              <label for="inputEmail4" class="form-label fw-bold">Support Remarks</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${support_remarks}
              </div>
          </div>

          <div class="col-md-6">
              <label for="inputEmail4" class="form-label fw-bold">Error Details</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${data[0][10]}
              </div>
          </div>
          <div class="col-md-6">
              <label class="form-label fw-bold show_attachment">Attachments</label>
                  <div id="showattachments2"></div>
          </div>

          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Resolved By</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${resolved_by}
              </div>
          </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Resolution Detail</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${resolution_details}
              </div>
          </div>
          <div class="col-md-4">
              <label for="inputEmail4" class="form-label fw-bold">Resolved Date</label>
              <div class="form-control read-only-box bg-light" readonly>
                  <!-- Your read-only content goes here -->
                  ${resolved_date}
              </div>
          </div>

          ${tableData}
          

          ${is_Visit}

      </form>
`;
            // console.log(data);
            //   return data;
            display_attachments(
              data[0][0],
              document.querySelector("#showattachments2"),
              false
            );
          })
          .catch((err) => console.log("err", err));
      });


      // Add onclick event to the edit card icon
      const edit_btn = cardElement.querySelector('.edit-card-button img');
      let edit_id;
      edit_btn.addEventListener("click", async function () {
        edit_id = data[0]
        console.log("working edit_id for this specific card", edit_id);
        const payload = {
          id: edit_id,
        };

        // getting data from backend
        await fetch(url + "/individual_card_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            // Handle the response from the server
            console.log("Data got successfully*******:", data);
            // Optionally, perform any actions after successful submission
            populateEditForm(data[0]);
          })
          .catch((error) => {
            console.error("There was a problem with the fetch operation:", error);
            // Handle errors or display an error message to the user
          });

        if (data[4] && data[4].toLowerCase() === 'done') {
          display_attachments(edit_id, ShowEditAttachments, false);
        }
        else {
          display_attachments(edit_id, ShowEditAttachments, true);
        }

        document
          .getElementById("saveChangesButton")
          .addEventListener("click", function () {
            // console.log("edit save button clicked*****", edit_id)
            // Call the function to submit form data when the button is clicked
            submitFormData(edit_id);
            console.log('working');
          });

        // add attachments in edit
        const submitattachemnts = document.getElementById("submit_edited_attachemnts");
        submitattachemnts.addEventListener("click", async function () {
          console.log("working edit btn");
          // add attachments
          const formData = new FormData();
          const editattachments = document.getElementById("edit_attachemnts").files;

          for (const file of editattachments) {
            formData.append("files", file);
          }
          formData.append("support_id", edit_id);
          await fetch(url + "/upload_files", {
            method: "POST",
            body: formData,
          })
            .then((response) => {
              // Handle the response here
              return response.json();
            })
            .then(async (data) => {
              console.log("Success:", data);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
          // fetch and display
          display_attachments(edit_id, ShowEditAttachments, true);
        });
      });


      // Add onclick event to the delete card icon
      const delete_btn = cardElement.querySelector('.delete-card-button img');
      delete_btn.addEventListener("click", function () {
        const delete_id = data[0]
        // console.log("working", delete_id, this);

        // delete_catd(delete_id);

        const confirmDelete = confirm(
          `Are you sure you want to delete ticket with id ${delete_id}`
        );

        // If user confirms the delete
        if (confirmDelete) {
          // Perform the delete action
          DeleteCard(delete_id);
        } else {
          // If user clicks "Cancel" or "No", do nothing
          console.log("Delete action cancelled.");
        }
      });

      cardContainer.appendChild(cardElement);
    });
  }

  // ******* updated pagination buttons ******** //
  function updatePaginationButtons(currentPage, totalPages) {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    const previousButton = createPaginationButton('Previous', () => {
      if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage);
        updatePaginationButtons(currentPage, totalPages);
      }
    });
    paginationContainer.appendChild(previousButton);

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = createPaginationButton(i, () => {
        currentPage = i;
        displayPage(currentPage);
        updatePaginationButtons(currentPage, totalPages);
      });
      if (i === currentPage) {
        pageButton.classList.add('active'); // Add a class to highlight the active page
      }
      paginationContainer.appendChild(pageButton);
    }

    const nextButton = createPaginationButton('Next', () => {
      if (currentPage < totalPages) {
        currentPage++;
        displayPage(currentPage);
        updatePaginationButtons(currentPage, totalPages);
      }
    });
    paginationContainer.appendChild(nextButton);
  }

  // ******* created pagination buttons ******** //
  function createPaginationButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }

  // ******* total pages in pagination ******** //
  function calculateTotalPages() {
    return Math.ceil(filteredData.length / cardsPerPage);
  }

  //****pagination ends here ************/




  //******** search box in create ticket filter **********/
  document.getElementById("searchInput").addEventListener("input", function () {
    let results = filterResults(this.value);
    // updateDropdown(results);
    updateCheckboxes(results);
  });

  // Event handler for change in the checkboxes
  document.getElementById("checkboxesContainer").addEventListener("change", function (event) {
    if (event.target.classList.contains("resultCheckbox")) {
      handleCheckboxChange(event.target);
    }
  });

  document.getElementById("searchInput").addEventListener("click", function () {
    let results = filterResults("");
    let dropdown = document.getElementById("checkboxesContainer");

    if (dropdown.style.display === "block") {
      // console.log("insise block");
      dropdown.style.display = "none";
    } else {
      dropdown.style.display = "block";
    }
    updateCheckboxes(results);
  });

  // Add event listener to close down the checkboxesContainer when clicking outside
  document.body.addEventListener("click", function (event) {
    let checkboxesContainer = document.getElementById("checkboxesContainer");
    let searchInput = document.getElementById("searchInput");

    if (!event.target.closest("#checkboxesContainer") && !event.target.closest("#searchInput")) {
      checkboxesContainer.innerHTML = ""; // Close down by clearing content
    }
  });

  //******** search box in create ticket filter ended here **********/ 


  // ********* raise ticket ************
  let new_support_id = 0;
  let create_ticket_btn = document.querySelector(".create-ticket-btn");
  let next_ticket_btn = document.querySelector(".next-ticket-btn");
  let ticket_parameters = document.querySelector(".ticket-parameters");
  let back_ticket_btn = document.querySelector(".back-ticket-btn");
  let close_raise_ticket = document.querySelector(".close-raise-ticket");
  // console.log(next_ticket_btn)
  next_ticket_btn.addEventListener("click", function () {
    // Get selected machine details from the selectedOptionsContainer
    let selectedOptionsContainer = document.getElementById("selectedOptionsContainer");
    let selectedOptions = Array.from(selectedOptionsContainer.children);

    // Remove the delete or cross sign ("×") from each selected option
    selectedOptions.forEach(option => {
      let removeButton = option.querySelector(".removeButton");
      if (removeButton) {
        option.removeChild(removeButton);
      }
    });

    // Skip the first element (heading) and extract machine details from selected options
    let machinesList = selectedOptions.slice(1).map(option => {
      let optionValue = option.innerText.trim().split(",");
      return {
        head_institution: optionValue[0],
        institution_name: optionValue[1],
        machine_no: optionValue[2], // No need to replace the remove button text
        // machine_no: optionValue[2].replace(/\s*×\s*$/, ''), // Remove remove button text
      };
    });

    // Log or use the machinesList as needed
    // console.log("Selected Machines List:", machinesList);

    // Prepare payload with the list of machines
    const payload = {
      support_date: new Date().toISOString(),
      machines: machinesList,
    };
    console.log(payload); // get data from backend
    // console.log(this);
    fetch(url + "/save_machine_and_customer_details", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("*****data*", data);
        new_support_id = data["id"];
        if (!new_support_id) {
          // Machine not found, show a pop-up
          alert("Machine not found! Reload and try again!");
          location.reload();
        }
        console.log("new_support_id", new_support_id)
      })
      .catch((err) => {
        console.log({ msg: err })
      });
    ticket_parameters.classList.replace("d-none", "d-inline");
    create_ticket_btn.classList.replace("d-none", "d-inline");
    next_ticket_btn.classList.add("d-none");
    back_ticket_btn.classList.remove("d-none");
  });

  back_ticket_btn.addEventListener("click", function () {
    next_ticket_btn.classList.remove("d-none");
    ticket_parameters.classList.replace("d-inline", "d-none");
    create_ticket_btn.classList.replace("d-inline", "d-none");
    back_ticket_btn.classList.add("d-none");
  });

  close_raise_ticket.addEventListener("click", function () {
    next_ticket_btn.classList.remove("d-none");
    ticket_parameters.classList.replace("d-inline", "d-none");
    create_ticket_btn.classList.replace("d-inline", "d-none");
    back_ticket_btn.classList.add("d-none");
  });

  create_ticket_btn.addEventListener("click", function () {
    next_ticket_btn.classList.remove("d-none");
    ticket_parameters.classList.replace("d-inline", "d-none");
    create_ticket_btn.classList.replace("d-inline", "d-none");
    back_ticket_btn.classList.add("d-none");
  });

  // adding attachment to div
  let delete_attachments = undefined;
  const submitattachemnts = document.getElementById("submitattachemnts");
  submitattachemnts.addEventListener("click", async function () {
    // console.log("working");
    const attachments = document.getElementById("addattachemnts1").files;
    // console.log(document.getElementById("addattachemnts1"))
    const formData = new FormData();

    // Append files to the FormData
    for (const file of attachments) {
      formData.append("files", file);
    }

    // Append other data directly to FormData
    formData.append("support_id", new_support_id);
    // formData.append("support_id", 2);
    // Add your additional data fields here

    // **** edit attachments for raise ticket *****
    const showattachments = document.getElementById("showattachments");
    await fetch(url + "/upload_files", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        // Handle the response here
        return response.json();
      })
      .then(async (data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    display_attachments(new_support_id, showattachments, true);
  });


  // create ticket submit button
  // Get the Create Ticket button
  const createTicketBtn = document.getElementById("saveTicketBtn");
  // console.log(createTicketBtn)
  // Add click event listener to the button
  createTicketBtn.addEventListener("click", function () {
    // Collect data from input elements
    console.log("working");
    // const iss = document.getElementById("searchInput").value.split(",");
    // institutionSelect, SelectLocation, SelectMachineNo
    // console.log("submit : ", iss);

    // const institutionSelect = iss[0].toLowerCase();
    // const SelectLocation = iss[1].toLowerCase();
    // const SelectMachineNo = iss[2].toLowerCase();

    const generatedBy = document
      .getElementById("selectgeneratedby")
      .value.toLowerCase();
    const attachments = document.getElementById("addattachemnts1").files;
    const errorDetails = document.getElementById("error_detail_desc").value;
    const issueType = document
      .getElementById("select_issue_type")
      .value.toLowerCase();
    const priority = document
      .getElementById("select_priority")
      .value.toLowerCase();
    const commitmentDays = document.getElementById("commitment_days").value;

    // Prepare payload object with collected data
    let support_mode = "";
    if (issueType == "hardware") support_mode += "offline";
    else support_mode += "online";

    const payload = {
      support_id: new_support_id,
      // head_institution: institutionSelect,
      // institution_name: SelectLocation,
      // machine_no: SelectMachineNo,
      generatedBy: generatedBy,
      attachments: attachments,
      errorDetails: errorDetails,
      support_state: "pending",
      issueType: issueType,
      support_mode: support_mode,
      priority: priority,
      commitmentDays: commitmentDays,
      support_date: new Date().toISOString(),
      // Add more properties as needed
    };

    console.log(payload);
    // Send POST request to the backend URL with payload data

    const confirmRaiseTicket = confirm("Click On Yes! To Raise Ticket");
    if (confirmRaiseTicket) {
      fetch(url + "/save_raised_ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("********saved_data_payload****", data);
          new_support_id = data[0];
          if (data) {
            document
              .getElementById("raise_ticket_alert_success")
              .classList.replace("d-none", "d-block");
            setTimeout(() => {
              document
                .getElementById("raise_ticket_alert_success")
                .classList.replace("d-block", "d-none");
            }, 8000);
          } else {
            document
              .getElementById("raise_ticket_alert_danger")
              .classList.replace("d-none", "d-block");
            setTimeout(() => {
              document
                .getElementById("raise_ticket_alert_danger")
                .classList.replace("d-block", "d-none");
            }, 8000);
          }
          location.reload();
        })
        .catch((err) => console.log({ msg: err }));
    } else {
      // If user clicks "Cancel" or "No", do nothing
      console.log("Create Ticket action cancelled.");
    }
  });

});

