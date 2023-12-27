let Statue_Sort = [];
// const url = "http://127.0.0.1:5559";
const url = "http://127.0.0.1:5443";

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
  } else {
    nav_all_route[0].classList.add("active");
  }
  // navLinks.forEach(function (link) {
  //   link.addEventListener("click", function (event) {
  //     // Prevent the default action of the link
  //     event.preventDefault();

  //     console.log(this)
  //     // Remove 'active' class from all nav-links
  //     navLinks.forEach(function (navLink) {
  //       navLink.classList.remove("active");
  //     });

  //     // Add 'active' class to the clicked nav-link
  //     this.classList.add("active");
  //   });
  // });


  //************ */

  const cardsPerPage = 21;
  let originalData = [];
  let filteredData = [];


  fetch(url + '/all_data', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      // console.log("Data from server:", data);
      originalData = data;
      filteredData = data;
      displayPage(1);
      updatePaginationButtons(1, calculateTotalPages());
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  // Event listener for search input
  const searchBox = document.querySelector('.search-box');
  searchBox.addEventListener('input', function () {
    applySearchFilter();
  });


  function applySearchFilter() {
    const searchTerm = searchBox.value.trim().toLowerCase();
    filteredData = originalData.filter(data => {
      const machineNumber = String(data[10]);
      return machineNumber.toLowerCase().includes(searchTerm);
    });
    displayPage(1);
    updatePaginationButtons(1, calculateTotalPages());
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

  //   {{
  //     'bg-success' if data[4] and data[4].lower() == 'done' else 
  //     ('bg-warning text-dark' if data[4] and data[4].lower() == 'ongoing' else 
  //     ('bg-danger' if data[4] and data[4].lower() == 'pending' else 
  //     ('bg-info text-dark' if data[4] and data[4].lower() == 'internetissue' else '')))
  // }}

  // {{'bg-red' if lower_data_5 == 'high' else ('bg-orange' if lower_data_5 == 'moderate' or lower_data_5 == 'medium' else ('bg-yellow' if lower_data_5 == 'low' else 'bg-light')) }}

  function displayPage(pageNumber) {
    const cardContainer = document.getElementsByClassName('card-group')[0];
    cardContainer.innerHTML = '';

    const startIndex = (pageNumber - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    filteredData.slice(startIndex, endIndex).forEach(data => {
      const cardElement = document.createElement('div');
      // cardElement.classList.add('card');
      cardElement.classList.add('card', 'border', 'border-5', 'm-3', 'rounded', 'shadow');

      const limitStringTo25Words = (inputString) => inputString.split(/\s+/).slice(0, 25).join(' ') + (inputString.split(/\s+/).length > 25 ? '...' : '');

      const machine_no = data[10];
      const support_state = data[4];
      const support_priority = data[5].toLowerCase();
      const Issue_type = data[2];
      const ticket_id = data[0];
      const error_detail = limitStringTo25Words(data[3]);
      const raised_by = data[7];
      const assigned_to = data[6];
      const support_mode = data[8];

      cardElement.innerHTML = `
      <!-- card-body -->
      <div
        class="card-body"
        data-bs-toggle="modal"
        data-bs-target="#cardModal"
      >
        <div class="ticket-header">
          <div class="ticket-header-part1 position-relative">
            <h5 class="card-title d-inline-block fs-3">${machine_no}</h5>
            <span
            class="position-absolute badge  top-0 end-0 fs-6" 

              >${support_state}</span
            >
          </div>
          <!-- Priority tag-->
          <div class="ticket-header-part2 position-relative">
            ${support_priority}
            <span
              class="d-inline-block priority-marker"
            ></span>
            <h6 class="position-absolute d-inline-block">
              ${Issue_type}
            </h6>
            <span
              class="position-absolute top-0 end-0 badge rounded-pill text-bg-dark"
              id="ticket_id"
              >#${ticket_id}</span
            >
          </div>
        </div>
        <div class="ticket-brief-info">
          <div class="position-relative issue d-flex mb-1">
            <h6 class="d-inline-block text-nowrap">ISSUE :</h6>
            <p class="card-text d-inline-block issue-desc">
            ${error_detail}
            </p>
          </div>
          <div
            class="position-relative issue-raise-persons d-flex mb-1"
          >
            <h6 class="text-nowrap">Raised by:</h6>
            <p class="card-text issue-desc">${raised_by}</p>
          </div>
          <div
            class="position-relative issue-assigned-persons d-flex mb-1"
          >
            <h6 class="d-inline-block text-nowrap">Assigned to:</h6>
            <p class="card-text d-inline-block issue-desc">
              ${assigned_to}
            </p>
          </div>
        </div>
      </div>
      `;
      cardContainer.appendChild(cardElement);
    });
  }

  function updatePaginationButtons(currentPage, totalPages) {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    const previousButton = createPaginationButton('Previous', () => {
      if (currentPage > 1) {
        displayPage(currentPage - 1);
      }
    });
    paginationContainer.appendChild(previousButton);

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = createPaginationButton(i, () => {
        displayPage(i);
      });
      paginationContainer.appendChild(pageButton);
    }

    const nextButton = createPaginationButton('Next', () => {
      if (currentPage < totalPages) {
        displayPage(currentPage + 1);
      }
    });
    paginationContainer.appendChild(nextButton);
  }

  function createPaginationButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }

  function calculateTotalPages() {
    return Math.ceil(filteredData.length / cardsPerPage);
  }


  // Add event listeners to All, hardware, software, and datateam buttons
  document.getElementById('allButton').addEventListener('click', () => {
    console.log("clickedAll")
    filteredData = originalData;
    displayPage(1);
    updatePaginationButtons(1, calculateTotalPages());
  });


  document.getElementById('hardwareButton').addEventListener('click', () => {
    console.log("clickedhardware")
    filteredData = originalData.filter(data => data[2] !== null && data[2] === 'hardware');
    displayPage(1);
    updatePaginationButtons(1, calculateTotalPages());
  });

  document.getElementById('softwareButton').addEventListener('click', () => {
    console.log("clickedsoftware")
    filteredData = originalData.filter(data => data[2] !== null && data[2] === 'software');
    displayPage(1);
    updatePaginationButtons(1, calculateTotalPages());
  });

  document.getElementById('dataButton').addEventListener('click', () => {
    console.log("clickedata")
    filteredData = originalData.filter(data => data[2] !== null && data[2] === 'datateam');
    displayPage(1);
    updatePaginationButtons(1, calculateTotalPages());
  });

  //****pagination ends here ************/





  // const cardList = document.getElementsByClassName("card-group")[0];
  // cardList.innerHTML = `<h1> vinay hai here</h1>`



  // ***** filter *****
  var linkItems = document.querySelectorAll(".link-item");
  // linkItems.forEach(function (link) {
  //   link.addEventListener("click", function () {
  //     linkItems.forEach(function (item) {
  //       item.classList.remove("fw-bold");
  //     });

  //     // Add 'bold-text' class to the clicked link
  //     var card_status = this.innerText;
  //     console.log("card_status.selectedIndex : ", card_status)
  //     this.classList.add("fw-bold");
  //     const cardGroup = document.querySelector(".card-group"); // Get the container of card elements
  //     const cards = Array.from(cardGroup.querySelectorAll(".card")); // Get all card elements as an array

  //     cards.forEach(function (card) {
  //       const status = getStatusValue(card);
  //       if (status != card_status.trim().toLowerCase()) {
  //         card.style.display = "none"; // Hide cards not matching the allowed statuses
  //       } else {
  //         card.style.display = "block"; // Hide cards not matching the allowed statuses
  //       }
  //     });
  //   });
  // });

  // $("document").ready(function () {
  //   $(".nav-link").on("click", function () {
  //     $(".nav-link").removeClass("active");
  //     $(this).addClass("active");
  // });

  // ********* raise ticket ************
  // let new_support_id = 0;
  // let create_ticket_btn = document.querySelector(".create-ticket-btn");
  // let next_ticket_btn = document.querySelector(".next-ticket-btn");
  // let ticket_parameters = document.querySelector(".ticket-parameters");
  // let back_ticket_btn = document.querySelector(".back-ticket-btn");
  // let close_raise_ticket = document.querySelector(".close-raise-ticket");
  // // console.log(next_ticket_btn)
  // next_ticket_btn.addEventListener("click", function () {
  //   const institutionSelect =
  //     document.getElementById("institutionSelect").value;
  //   const SelectLocation = document.getElementById("SelectLocation").value;
  //   const SelectMachineNo = document.getElementById("SelectMachineNo").value;
  //   const payload = {
  //     head_institution: institutionSelect,
  //     institution_name: SelectLocation,
  //     machine_no: SelectMachineNo,
  //   };
  //   console.log(payload); // get data from backend
  //   console.log(this);
  //   fetch(url + "/save_machine_and_customer_details", {
  //     method: "POST",
  //     body: JSON.stringify(payload),
  //     headers: {
  //       "Content-type": "application/json; charset=UTF-8",
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data);
  //       new_support_id = data[0];
  //     })
  //     .catch((err) => console.log({ msg: err }));
  //   ticket_parameters.classList.replace("d-none", "d-inline");
  //   create_ticket_btn.classList.replace("d-none", "d-inline");
  //   next_ticket_btn.classList.add("d-none");
  //   back_ticket_btn.classList.remove("d-none");
  // });

  // back_ticket_btn.addEventListener("click", function () {
  //   next_ticket_btn.classList.remove("d-none");
  //   ticket_parameters.classList.replace("d-inline", "d-none");
  //   create_ticket_btn.classList.replace("d-inline", "d-none");
  //   back_ticket_btn.classList.add("d-none");
  // });

  // close_raise_ticket.addEventListener("click", function () {
  //   next_ticket_btn.classList.remove("d-none");
  //   ticket_parameters.classList.replace("d-inline", "d-none");
  //   create_ticket_btn.classList.replace("d-inline", "d-none");
  //   back_ticket_btn.classList.add("d-none");
  // });

  // create_ticket_btn.addEventListener("click", function () {
  //   next_ticket_btn.classList.remove("d-none");
  //   ticket_parameters.classList.replace("d-inline", "d-none");
  //   create_ticket_btn.classList.replace("d-inline", "d-none");
  //   back_ticket_btn.classList.add("d-none");
  // });

  // adding attachment to div
  // let delete_attachments = undefined;
  // const submitattachemnts = document.getElementById("submitattachemnts");
  // submitattachemnts.addEventListener("click", async function () {
  //   console.log("working");
  //   const attachments = document.getElementById("addattachemnts1").files;
  //   // console.log(document.getElementById("addattachemnts1"))
  //   const formData = new FormData();

  //   // Append files to the FormData
  //   for (const file of attachments) {
  //     formData.append("files", file);
  //   }

  //   // Append other data directly to FormData
  //   formData.append("support_id", new_support_id);
  //   // formData.append("support_id", 2);
  //   // Add your additional data fields here

  //   // **** edit attachments for raise ticket *****
  //   const showattachments = document.getElementById("showattachments");
  //   await fetch(url + "/upload_files", {
  //     method: "POST",
  //     body: formData,
  //   })
  //     .then((response) => {
  //       // Handle the response here
  //       return response.json();
  //     })
  //     .then(async (data) => {
  //       console.log("Success:", data);
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  //   display_attachments(new_support_id, showattachments);
  // });

  // ************

  // create ticket submit button
  // Get the Create Ticket button
  // const createTicketBtn = document.getElementById("saveTicketBtn");
  // // console.log(createTicketBtn)
  // // Add click event listener to the button
  // createTicketBtn.addEventListener("click", function () {
  //   // Collect data from input elements
  //   console.log("working");
  //   const institutionSelect =
  //     document.getElementById("institutionSelect").value;
  //   const SelectLocation = document.getElementById("SelectLocation").value;
  //   const SelectMachineNo = document
  //     .getElementById("SelectMachineNo")
  //     .value.toLowerCase();
  //   const generatedBy = document
  //     .getElementById("selectgeneratedby")
  //     .value.toLowerCase();
  //   const attachments = document.getElementById("addattachemnts1").files;
  //   const errorDetails = document.getElementById("error_detail_desc").value;
  //   const issueType = document
  //     .getElementById("select_issue_type")
  //     .value.toLowerCase();
  //   const priority = document
  //     .getElementById("select_priority")
  //     .value.toLowerCase();
  //   const commitmentDays = document.getElementById("commitment_days").value;

  //   // Prepare payload object with collected data
  //   let support_mode = "";
  //   if (issueType == "hardware") support_mode += "offline";
  //   else support_mode += "online";

  //   const payload = {
  //     support_id: new_support_id,
  //     head_institution: institutionSelect,
  //     institution_name: SelectLocation,
  //     machine_no: SelectMachineNo,
  //     generatedBy: generatedBy,
  //     attachments: attachments,
  //     errorDetails: errorDetails,
  //     support_state: "pending",
  //     issueType: issueType,
  //     support_mode: support_mode,
  //     priority: priority,
  //     commitmentDays: commitmentDays,
  //     support_date: new Date().toISOString(),
  //     // Add more properties as needed
  //   };

  //   console.log(payload);
  //   // Send POST request to the backend URL with payload data

  //   fetch(url + "/save_raised_ticket", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(payload),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data);
  //       new_support_id = data[0];
  //       if (data) {
  //         document
  //           .getElementById("raise_ticket_alert_success")
  //           .classList.replace("d-none", "d-block");
  //         setTimeout(() => {
  //           document
  //             .getElementById("raise_ticket_alert_success")
  //             .classList.replace("d-block", "d-none");
  //         }, 8000);
  //       } else {
  //         document
  //           .getElementById("raise_ticket_alert_danger")
  //           .classList.replace("d-none", "d-block");
  //         setTimeout(() => {
  //           document
  //             .getElementById("raise_ticket_alert_danger")
  //             .classList.replace("d-block", "d-none");
  //         }, 8000);
  //       }
  //       location.reload();
  //     })
  //     .catch((err) => console.log({ msg: err }));
  // });
});

//  ********* show card ********
const cards_clicked = Array.from(document.querySelectorAll(".card-body")); // Get all card elements as an array
// // console.log(cards_clicked);
// cards_clicked.forEach(function (cards) {
//   cards.addEventListener("click", async function () {
//     console.log("working");
//     const ticket_id = this.querySelector("#ticket_id").innerText.slice(1);
//     const view_modal = document
//       .querySelector("#cardModal")
//       .querySelector(".modal-body");
//     // console.log("working", this, ticket_id);
//     // data = [
//     //   [
//     //     10, // s.id,
//     //     "2023-12-22T08:42:40.229Z", // s.support_date,
//     //     "ashish", // s.generated_by,
//     //     "online", // s.support_mode,
//     //     "high", // s.support_priority,
//     //     "10", // s.support_commitment_days,
//     //     "harware", // s.issue_type,
//     //     "pending", // s.support_state,
//     //     "vijay", // s.assign_task,
//     //     "", // s.support_remark,
//     //     "Issue type: Learning to program in Python before JavaScript, I was stumped when first trying to understand how the front and back ends of my flask applications would knit together. \nThis article covers a simple way to grab some request data from a HTML form, and use Jinja to dynamically change update HTML of a page without the use of JavaScript.", // s.error_detail,
//     //     "", // s.resolved_by,
//     //     "", // s.resolution_detail,
//     //     "", // s.resolution_date,
//     //     "", // s.visit_required,
//     //     "", // s.visit_start_date,
//     //     "", // s.visit_end_date,
//     //     "", // s.expense,
//     //     "", // s.h1_replace,
//     //     "", // s.h2_replace,
//     //     "", // s.h3_replace,
//     //     "", // s.h4_replace,
//     //     "ENAM Rajasthan", // c.head_instituition,
//     //     "Mandawri", // c.instituition_name,
//     //     "1013", // c.instituition_code
//     //   ],
//     // ];
//     // let displayattach = `<ul class="mt-2 border border-top-0 border border-3 rounded-4">`;
//     // let DisplayattachInnerLi = `<li data-key="10">
//     //   <a href="#" class="list-group-item list-group-item-action d-inline me-2" target="_blank">filename</a>
//     //   </li>`;
//     // displayattach += DisplayattachInnerLi;
//     // DisplayattachInnerLi += `<li data-key="10">
//     //   <a href="#" class="list-group-item list-group-item-action d-inline me-2" target="_blank">filename</a>
//     //   </li>`;
//     // displayattach += DisplayattachInnerLi;

//     // displayattach += `</ul>`;

//     await fetch(url + "/individual_card_data", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: ticket_id }),
//     })
//       .then((data) => {
//         return data.json();
//       })
//       .then((data) => {
//         // console.log(data);
//         const Assigned_Task_To =
//           data[0][8] == "" || data[0][8] == null
//             ? "Not assigned to anyone yet"
//             : data[0][8];
//         const support_remarks =
//           data[0][9] == "" || data[0][9] == null ? "No Remarks" : data[0][9];
//         const resolved_by =
//           data[0][11] == "" || data[0][11] == null
//             ? "Not resolved yet"
//             : data[0][11];
//         const resolution_details =
//           data[0][12] == "" || data[0][12] == null
//             ? "Not resolved or mentioned yet"
//             : data[0][12];
//         const resolved_date =
//           data[0][13] == "" || data[0][13] == null
//             ? "Not resolved yet"
//             : data[0][13];
//         const visit_start_date =
//           data[0][15] == "" || data[0][15] == null
//             ? "Not mentioned"
//             : data[0][15];
//         const visit_end_date =
//           data[0][15] == "" || data[0][15] == null
//             ? "Not resolved or mentioned yet"
//             : data[0][15];

//         const expenses =
//           data[0][17] == "" || data[0][17] == null
//             ? "Not mentioned"
//             : `Rs. ${data[0][17]}`;

//         let items_replaced = "";
//         for (let i = 18; i <= 21; i++) {
//           if (
//             data[0][i] != "" ||
//             data[0][i] != "none" ||
//             data[0][i] != "None" ||
//             data[0][i] != null
//           )
//             items_replaced += `${data[0][i]},`;
//         }
//         if (items_replaced == "") items_replaced += "Nothing replaced";

//         const is_Visit =
//           data[0][14] == true
//             ? `<div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Visit Start Date</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${visit_start_date}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Visit End Date</label>
//               <div class="form-control read-only-box bg-light" readonly>
//               <!-- Your read-only content goes here -->
//               ${visit_end_date}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Expenses</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${expenses}
//               </div>
//           </div>
//           <div class="col-6">
//               <label for="inputEmail4" class="form-label fw-bold">Items Replaced</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${items_replaced}
//                   <!--
//                   {% if ${data[0][18]} == '' or ${data[0][18]} == 'none' or ${data[0][18]} == 'None' %}

//                   {% else %}
//                       {{${data[0][18]}}}, 
//                   {% endif %}
//                   {% if ${data[0][19]} == '' or ${data[0][19]} == 'none' or ${data[0][19]} == 'None' %}

//                   {% else %}
//                       {{${data[0][19]}}},
//                   {% endif %}
//                   {% if ${data[0][20]} == '' or ${data[0][20]} == 'none' or ${data[0][20]} == 'None' %}

//                   {% else %}
//                       {{${data[0][20]}}},
//                   {% endif %}
//                   {% if ${data[0][21]} == '' or ${data[0][21]} == 'none' or ${data[0][21]} == 'None' %}
//                       Nothing replaced
//                   {% else %}
//                       {{${data[0][21]}}}
//                   {% endif %}
//                   -->
//               </div>
//           </div>`
//             : `<div class="col-4">
//           <button type="button" class="badge rounded-pill text-bg-secondary" >No visit for this ticket</button>
//       </div>`;
//         view_modal.innerHTML = `<form class="row g-3">
//             <div class="col-4 ">
//               <label for="inputEmail4" class="form-label fw-bold">Id</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][0]}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Created Date</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][1]}
//               </div>
//           </div>
//           <div class="col-4 ">
//               <label for="inputEmail4" class="form-label fw-bold">Created By</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][2]}
//               </div>
//           </div>

//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Head Institution</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][22]}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Location</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][23]}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Machine Number</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][24]}
//               </div>
//           </div>

//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Support Mode</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][3]}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Support Priority</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][4]}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Support Commitment Days</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][5]}
//               </div>
//           </div>

//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Issue Type</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][6]}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Support State</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][7]}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Assigned Task To</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${Assigned_Task_To}
//               </div>
//           </div>
//           <div class="col-12">
//               <label for="inputEmail4" class="form-label fw-bold">Support Remarks</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${support_remarks}
//               </div>
//           </div>

//           <div class="col-6">
//               <label for="inputEmail4" class="form-label fw-bold">Error Details</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${data[0][10]}
//               </div>
//           </div>
//           <div class="col-6">
//               <label class="form-label fw-bold show_attachment">Attachments</label>
//                   <div id="showattachments2"></div>
//           </div>

//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Resolved By</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${resolved_by}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Resolution Detail</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${resolution_details}
//               </div>
//           </div>
//           <div class="col-4">
//               <label for="inputEmail4" class="form-label fw-bold">Resolved Date</label>
//               <div class="form-control read-only-box bg-light" readonly>
//                   <!-- Your read-only content goes here -->
//                   ${resolved_date}
//               </div>
//           </div>

//           ${is_Visit}

//       </form>
// `;
//         // console.log(data);
//         //   return data;
//         display_attachments(
//           data[0][0],
//           document.querySelector("#showattachments2")
//         );
//       })
//       .catch((err) => console.log("err", err));
//   });
// });

//  ********* Edit card ********
const edit_card_button = document.querySelectorAll(".edit-card-button");
const ShowEditAttachments = document.getElementById("ShowEditAttachments");
let edit_id = "";
// display_attachments(edit_id, ShowEditAttachments);
// edit_card_button.forEach((edit_btn) => {
//   // console.log(edit_btn);
//   edit_btn.addEventListener("click", async function () {
//     edit_id = this.parentNode.parentNode
//       .querySelector("#ticket_id")
//       .innerText.slice(1);
//     console.log("working", edit_id);
//     const payload = {
//       id: edit_id,
//     };

//     // getting data from backend
//     await fetch(url + "/individual_card_data", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     })
//       .then((response) => {
//         return response.json();
//       })
//       .then((data) => {
//         // Handle the response from the server
//         console.log("Data got successfully:", data);
//         // Optionally, perform any actions after successful submission
//         populateEditForm(data[0]);
//       })
//       .catch((error) => {
//         console.error("There was a problem with the fetch operation:", error);
//         // Handle errors or display an error message to the user
//       });

//     display_attachments(edit_id, ShowEditAttachments);

//     // add attachments
//     const submitattachemnts = document.getElementById(
//       "submit_edited_attachemnts"
//     );
//     submitattachemnts.addEventListener("click", async function () {
//       console.log("working");
//       // fetch and display
//       display_attachments(edit_id, ShowEditAttachments);
//     });
//   });
// });

// document
//   .getElementById("saveChangesButton")
//   .addEventListener("click", function () {
//     // Call the function to sdubmit form data when the button is clicked
//     submitFormData(edit_id);
//     // console.log('working');
//   });

// function populateEditForm(data) {
//   console.log("data inside populate", data);
//   // data =
//   // (0)s.id,
//   // (1)s.support_date,
//   // (2)s.generated_by,
//   // (3)s.support_mode,
//   // (4)s.support_priority,
//   // (5)s.support_commitment_days,
//   // (6)s.issue_type,
//   // (7)s.support_state,
//   // (8)s.assign_task,
//   // (9)s.support_remark,
//   // (10)s.error_detail,
//   // (11)s.resolved_by,
//   // (12)s.resolution_detail,
//   // (13)s.resolution_date,
//   // (14)s.visit_required,
//   // (15)s.visit_start_date,
//   // (16)s.visit_end_date,
//   // (17)s.expense,
//   // (18)s.h1_replace,
//   // (19)s.h2_replace,
//   // (20)s.h3_replace,
//   // (21)s.h4_replace,
//   // (22)c.head_instituition,
//   // (23)c.instituition_name,
//   // (24)c.instituition_code

//   document.getElementById("edit_modal_head_institution").value = data[22];
//   document.getElementById("edit_modal_location").value = data[23];
//   document.getElementById("edit_modal_machine_no").value = data[24];
//   const editAssignedTask = document.getElementById("editAssignedTask");
//   const editAssignedTaskOptions = [
//     "Choose...",
//     "Anmoldeep",
//     "Pankaj",
//     "Santosh",
//     "Ankit",
//     "Nishit",
//     "RipuDaman",
//     "Ashish",
//   ];

//   // edit assign task
//   let editAssignedTaskHTML = "";
//   editAssignedTaskOptions.forEach((assign_task_option, i) => {
//     console.log(data[8], typeof data[8]);
//     // const option = document.createElement("option");
//     // option.value = i;
//     // option.textContent = assign_task_option;
//     console.log(assign_task_option, i);
//     if (
//       data[8] != null &&
//       data[8].toLowerCase() === assign_task_option.toLowerCase()
//     ) {
//       editAssignedTaskHTML += `<option value="${i}" selected>${assign_task_option}</option>`;
//     } else {
//       editAssignedTaskHTML += `<option value="${i}">${assign_task_option}</option>`;
//     }
//   });
//   editAssignedTask.innerHTML = editAssignedTaskHTML;

//   // edit support mode
//   const editSupportMode = document.getElementById("editSupportMode");
//   const editSupportModeOptions = ["Choose...", "online", "offline"];

//   let editSupportModeOptionsHTML = "";
//   editSupportModeOptions.forEach((Support_Mode_option, i) => {
//     console.log(data[3], typeof data[3]);

//     if (
//       data[3] !== null &&
//       data[3].toLowerCase() === Support_Mode_option.toLowerCase()
//     ) {
//       editSupportModeOptionsHTML += `<option value="${i}" selected>${Support_Mode_option}</option>`;
//     } else {
//       editSupportModeOptionsHTML += `<option value="${i}" >${Support_Mode_option}</option>`;
//     }
//   });
//   editSupportMode.innerHTML = editSupportModeOptionsHTML;

//   // edit support state
//   const editSupportState = document.getElementById("editSupportState");
//   const editSupportStateOptions = [
//     "Choose...",
//     "Pending",
//     "Ongoing",
//     "InternetIssue",
//     "Done",
//   ];

//   let editSupportStateHTML = "";
//   editSupportStateOptions.forEach((option, i) => {
//     console.log(data[7], typeof data[7]);

//     if (data[7] !== null && data[7].toLowerCase() === option.toLowerCase()) {
//       editSupportStateHTML += `<option value="${i}" selected>${option}</option>`;
//     } else {
//       editSupportStateHTML += `<option value="${i}" >${option}</option>`;
//     }
//   });
//   editSupportState.innerHTML = editSupportStateHTML;

//   // edit department type
//   const editDepartmentType = document.getElementById("editDepartmentType");
//   const editDepartmentTypeOptions = [
//     "Choose...",
//     "Software",
//     "Hardware",
//     "Data",
//   ];

//   let editDepartmentTypeHTML = "";
//   editDepartmentTypeOptions.forEach((option, i) => {
//     console.log(data[6], typeof data[6]);

//     if (data[6] !== null && data[6].toLowerCase() === option.toLowerCase()) {
//       editDepartmentTypeHTML += `<option value="${i}" selected>${option}</option>`;
//     } else {
//       editDepartmentTypeHTML += `<option value="${i}" >${option}</option>`;
//     }
//   });
//   editDepartmentType.innerHTML = editDepartmentTypeHTML;

//   // edit priority
//   const editPriority = document.getElementById("editPriority");
//   const editPriorityOptions = ["Choose...", "High", "Medium", "Low"];

//   let editPriorityHTML = "";
//   editPriorityOptions.forEach((option, i) => {
//     console.log(data[4], typeof data[4]);

//     if (data[4] !== null && data[4].toLowerCase() === option.toLowerCase()) {
//       editPriorityHTML += `<option value="${i}" selected>${option}</option>`;
//     } else {
//       editPriorityHTML += `<option value="${i}" >${option}</option>`;
//     }
//   });
//   editPriority.innerHTML = editPriorityHTML;

//   // support remarks
//   if (data[9]) {
//     document.getElementById("editSupportRemarks").value = data[9];
//   } else {
//     document.getElementById("editSupportRemarks").value = "No remarks yet";
//   }

//   // commitment days
//   if (data[5]) {
//     document.getElementById("editCommitmentDays").value = data[5];
//   } else {
//     document.getElementById("editCommitmentDays").value = 0;
//   }
// }

// function submitFormData(t_id) {
//   // Get input values
//   const assign_task_index =
//     document.getElementById("editAssignedTask").selectedIndex;
//   const assign_task =
//     document.getElementById("editAssignedTask").options[assign_task_index].text;
//   const supportMode_index =
//     document.getElementById("editSupportMode").selectedIndex;
//   const supportMode =
//     document.getElementById("editSupportMode").options[supportMode_index].text;
//   const supportStateIndex =
//     document.getElementById("editSupportState").selectedIndex;
//   const supportState =
//     document.getElementById("editSupportState").options[supportStateIndex].text;
//   const supportRemarks = document.getElementById("editSupportRemarks").value;
//   const issueTypeIndex =
//     document.getElementById("editDepartmentType").selectedIndex;
//   const issueType =
//     document.getElementById("editDepartmentType").options[issueTypeIndex].text;
//   const priorityIndex = document.getElementById("editPriority").selectedIndex;
//   const priority =
//     document.getElementById("editPriority").options[priorityIndex].text;
//   const commitmentDays = document.getElementById("editCommitmentDays").value;
//   const support_id = t_id;

//   // Prepare data to send to the backend
//   const formData = {
//     support_id: support_id,
//     assign_task: assign_task,
//     support_mode: supportMode,
//     support_state: supportState,
//     supportRemarks: supportRemarks,
//     issueType: issueType,
//     priority: priority,
//     commitmentDays: commitmentDays,
//     support_date: new Date().toISOString(),
//   };
//   console.log(formData);
//   // Make a POST request to the backend using fetch
//   fetch(url + "/save_edit_card_details", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(formData),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       return response.json();
//     })
//     .then((data) => {
//       // Handle the response from the server
//       console.log("Data sent successfully:", data);
//       location.reload();
//       // Optionally, perform any actions after successful submission
//     })
//     .catch((error) => {
//       console.error("There was a problem with the fetch operation:", error);
//       // Handle errors or display an error message to the user
//     });
// }

// ******** delete card *********
let delete_id = "";
// const delete_card_button = document.querySelectorAll(".delete-card-button");
// delete_card_button.forEach((delete_btn) => {
//   // console.log(edit_btn);
//   delete_btn.addEventListener("click", function () {
//     delete_id = this.parentNode.parentNode
//       .querySelector("#ticket_id")
//       .innerText.slice(1);
//     console.log("working", delete_id, this);
//     let payload = {
//       support_id: delete_id,
//     };
//     // delete_catd(delete_id);
//     fetch("/deleting_card_information", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         return response.json();
//       })
//       .then((data) => {
//         // Handle the response from the server
//         console.log("Data sent successfully:", data);
//         // Optionally, perform any actions after successful submission
//         location.reload();
//       })
//       .catch((error) => {
//         console.error("There was a problem with the fetch operation:", error);
//         // Handle errors or display an error message to the user
//       });
//   });
// });

// async function display_attachments(t_id, ShowAttachmentDiv) {
//   // fetch data

//   await fetch(url + "/view", {
//     method: "POST",
//     body: JSON.stringify({ support_id: t_id }),
//   })
//     .then((response) => {
//       return response.json();
//     })
//     .then((viewdata) => {
//       console.log({ view: viewdata.files });
//       let displayattach = `<ul class="mt-2 border border-top-0 border border-3 rounded-4">`;

//       viewdata.files.forEach((file) => {
//         // appending files of support id from database
//         // const delete_attachment_file = `http://127.0.0.1:5559/delete_attachment/${file['id']}`;
//         let DisplayattachInnerLi = `<li data-key="${file["id"]}">
//             <a href="${url + "/view_attachment_image/" + file["id"]
//           }" class="list-group-item list-group-item-action d-inline me-2" target="_blank">${file["filename"]
//           }</a><span class="delete_attachments_icon d-inline fs-5 fw-medium" >x</span>
//             </li>`;
//         displayattach += DisplayattachInnerLi;
//       });

//       displayattach += `</ul>`;

//       ShowAttachmentDiv.innerHTML = displayattach;
//       // delete attachments
//       // delete the individual file
//       delete_attachments = Array.from(
//         document.querySelectorAll(".delete_attachments_icon")
//       );
//       delete_attachments.forEach((delete_item) => {
//         delete_item.style.cursor = "pointer";
//         delete_item.style.userSelect = "none";
//         delete_item.addEventListener("click", async function () {
//           console.log("working delete", this);
//           delete_item.parentNode.style.display = "none";
//           await fetch(
//             url +
//             "/delete_attachment/" +
//             this.parentNode.getAttribute("data-key"),
//             {
//               methord: "GET",
//             }
//           )
//             .then((res) => {
//               return res.json();
//             })
//             .then((data) => console.log(data))
//             .catch((err) => console.log(err));
//         });
//         delete_item.addEventListener("mouseover", () => {
//           delete_item.style.color = "red";
//           delete_item.parentNode.childNodes[1].style.textDecoration =
//             "line-through";
//           // const listItem = delete_attachments.parentNode;
//           // const link = listItem.querySelector('a');
//           // link.style.innerHTML = link.style.innerHTML.strike();
//           // link.classList.add("strikethrough");
//         });
//         delete_item.addEventListener("mouseout", () => {
//           delete_item.style.color = "gray";
//           delete_item.parentNode.childNodes[1].style.textDecoration = "none";
//           // delete_item.parentNode.style.innerHTML = delete_item.parentNode.style.innerHTML.strike()
//           // link.classList.remove('strikethrough');
//         });
//       });
//     });

//   // we will put this in above then code when data is feched from the url
//   // console.log("show_edit_attachment", t_id);
//   // let displayattach = `<ul class="mt-2 border border-top-0 border border-3 rounded-4">`;
//   // let DisplayattachInnerLi = `<li data-key="10">
//   //   <a href="#" class="list-group-item list-group-item-action d-inline me-2" target="_blank">filename</a><span class="delete_attachments_icon d-inline fs-5 fw-medium" >x</span>
//   //   </li>`;
//   // displayattach += DisplayattachInnerLi;
//   // DisplayattachInnerLi += `<li data-key="10">
//   //   <a href="#" class="list-group-item list-group-item-action d-inline me-2" target="_blank">filename</a><span class="delete_attachments_icon d-inline fs-5 fw-medium" >x</span>
//   //   </li>`;
//   // displayattach += DisplayattachInnerLi;

//   // displayattach += `</ul>`;
//   // ShowAttachmentDiv.innerHTML = displayattach;

//   // // delete attachments
//   // delete_attachments = Array.from(
//   //   document.querySelectorAll(".delete_attachments_icon")
//   // );
//   // delete_attachments.forEach((delete_item) => {
//   //   delete_item.style.cursor = "pointer";
//   //   delete_item.style.userSelect = "none";
//   //   delete_item.addEventListener("click", () => {
//   //     console.log("working");
//   //     delete_item.parentNode.style.display = "none";
//   //   });
//   //   delete_item.addEventListener("mouseover", () => {
//   //     delete_item.style.color = "red";
//   //     delete_item.parentNode.childNodes[1].style.textDecoration =
//   //       "line-through";
//   //     // const listItem = delete_attachments.parentNode;
//   //     // const link = listItem.querySelector('a');
//   //     // link.style.innerHTML = link.style.innerHTML.strike();
//   //     // link.classList.add("strikethrough");
//   //   });
//   //   delete_item.addEventListener("mouseout", () => {
//   //     delete_item.style.color = "gray";
//   //     delete_item.parentNode.childNodes[1].style.textDecoration = "none";
//   //     // delete_item.parentNode.style.innerHTML = delete_item.parentNode.style.innerHTML.strike()
//   //     // link.classList.remove('strikethrough');
//   //   });
//   // });
//   // console.log(delete_attachments);
// }

// });

// function toggleBold(element) {
//   // Toggle the 'font-weight' style between 'bold' and 'normal'
//   // if (element.style.fontWeight === "bold") {
//   //   element.style.fontWeight = "normal";
//   // } else {
//   //   element.style.fontWeight = "bold";
//   // }
// }
// document
//   .getElementById("institutionSelect")
//   .addEventListener("change", function () {
//     var selectElement = this;
//     var selectedIndex = selectElement.selectedIndex;
//     var SelectLocation = document.getElementById("SelectLocation");

//     // console.log(
//     //   "clicked",
//     //   selectedIndex,
//     //   typeof selectElement[selectedIndex].innerHTML
//     // );
//     if (selectedIndex === 0) {
//       alert("Select head Institution first");
//       SelectLocation.setAttribute("disabled", "disabled");
//       SelectLocation.selectedIndex = 0;
//     } else {
//       var selectedOption = selectElement.options[selectedIndex].text;
//       SelectLocation.removeAttribute("disabled");
//       // console.log(SelectLocation.innerHTML, SelectLocation.innerText);
//       var ticket_data = {
//         "AMC JANGAON": [
//           {
//             city: "AMC JANGAON",
//             id: 235,
//             machine_no: " AMC-J",
//             state: "TELANGANA",
//           },
//         ],
//         ANANT: [
//           {
//             city: "AnantLocation",
//             id: 233,
//             machine_no: "11008",
//             state: "null",
//           },
//         ],
//         APSCSCL: [
//           {
//             city: "hyderabad-office",
//             id: 203,
//             machine_no: "1235",
//             state: "null",
//           },
//         ],
//         Canada: [
//           {
//             city: "ETG Commodities INC",
//             id: 229,
//             machine_no: "CAN-1",
//             state: "Swift current",
//           },
//         ],
//         "ENAM GUJARAT12": [
//           { city: "8999", id: 199, machine_no: "898", state: "Rajasthan" },
//         ],
//         "ENAM Haryana": [
//           { city: "Adampur", id: 144, machine_no: "1155", state: "Haryana" },
//           { city: "Ambala", id: 145, machine_no: "1156", state: "Haryana" },
//           { city: "Assandh", id: 146, machine_no: "1157", state: "Haryana" },
//           { city: "Barwala", id: 147, machine_no: "1158", state: "Haryana" },
//         ],
//         "ENAM Rajasthan": [
//           { city: "Mandawri", id: 5, machine_no: "1013", state: "Rajasthan" },
//           {
//             city: "Mandore Jodhpur",
//             id: 6,
//             machine_no: "1014",
//             state: "Rajasthan",
//           },
//           { city: "Shahpura", id: 7, machine_no: "1015", state: "Rajasthan" },
//           {
//             city: "Bhagat ki kothi",
//             id: 8,
//             machine_no: "1016",
//             state: "Rajasthan",
//           },
//         ],
//         FCI: [
//           {
//             city: "RS Miryalaguda",
//             id: 443,
//             machine_no: "1355",
//             state: "Telangana",
//           },
//           {
//             city: "Sultanabad",
//             id: 444,
//             machine_no: "1346",
//             state: "Telangana",
//           },
//           {
//             city: "PSWC Bagli- Chawapail",
//             id: 526,
//             machine_no: "1438",
//             state: "Punjab",
//           },
//           {
//             city: "PSWC Rahon - RSD Khanna",
//             id: 527,
//             machine_no: "1440",
//             state: "Punjab",
//           },
//         ],
//         "FRL-GUJRAT": [
//           {
//             city: "Food Research Lab",
//             id: 198,
//             machine_no: "FRL",
//             state: "Gujarat",
//           },
//         ],
//         GHANA: [{ city: "ACCRA", id: 221, machine_no: "G1", state: "GHANA" }],
//         "Gujarat SAMB": [
//           {
//             city: "Gujarat SAMB",
//             id: 236,
//             machine_no: "SAMB",
//             state: "gujarat",
//           },
//         ],
//         Jharkhand: [
//           { city: "JSAMB", id: 234, machine_no: "JSAMB-1", state: "Jharkhand" },
//         ],
//         LIM: [
//           { city: "LIMAGRAIN", id: 223, machine_no: "101", state: "TELANGANA" },
//         ],
//         "McCain Foods (India) Pvt Ltd": [
//           {
//             city: "McCain Foods (India) Pvt Ltd",
//             id: 230,
//             machine_no: "McCain-1",
//             state: "Gujarat",
//           },
//         ],
//         "NAGA LIMITED": [
//           {
//             city: "DINDIGUL",
//             id: 222,
//             machine_no: "11002",
//             state: "TAMIL-NADU",
//           },
//         ],
//         NBHC: [
//           { city: "nbhc1", id: 204, machine_no: "8001", state: "Telangana" },
//           { city: "nbhc2", id: 206, machine_no: "8002", state: "null" },
//           { city: "nbhc3", id: 207, machine_no: "8003", state: "null" },
//           { city: "nbhc4", id: 208, machine_no: "8004", state: "null" },
//         ],
//         "NEBULAA-DELHI": [
//           { city: "NEBULAA", id: 220, machine_no: "NEB", state: "DELHI" },
//         ],
//         Nebulaa: [
//           {
//             city: "Nebulaa-Hyderabad",
//             id: 141,
//             machine_no: "null",
//             state: "Telangana",
//           },
//           {
//             city: "Nebulaa-Jaipur",
//             id: 202,
//             machine_no: "NEBJ",
//             state: "RAJASTHAN",
//           },
//         ],
//         "Nebulaa-Jaipur": [
//           {
//             city: "Nebulaa-Jaipur",
//             id: 205,
//             machine_no: "NEBJA",
//             state: "Rajasthan",
//           },
//         ],
//         "ORANGE SORTER": [
//           {
//             city: "ORANGE SORTER COIMBATOR",
//             id: 232,
//             machine_no: "ORANGE-1",
//             state: "TAMIL-NADU",
//           },
//         ],
//         TSDOIT: [
//           { city: "Nizamabad1", id: 231, machine_no: "1237", state: "null" },
//           {
//             city: "Mahbubnagar",
//             id: 218,
//             machine_no: "1235",
//             state: "TELANGANA",
//           },
//           {
//             city: "Nizamabad",
//             id: 219,
//             machine_no: "1236",
//             state: "TELANGANA",
//           },
//         ],
//         hello: [
//           { city: "demo", id: 200, machine_no: "3422", state: "Rajasthan" },
//         ],
//         test: [{ city: "TEST1", id: 201, machine_no: "TEST", state: "DD" }],
//       };

//       ticket_data = ticket_data[selectedOption];
//       // console.log("Ticket data : ",ticket_data, selectedOption);
//       var options = "";
//       for (let index = 0; index < ticket_data.length; index++) {
//         const element = ticket_data[index]["city"];
//         options += `<option>${element}</option>`;
//       }
//       SelectLocation.innerHTML = `<option>Select Location</option>` + options;
//       // console.log("tdata", tdata["FCI"], typeof tdata);
//       // console.log(SelectLocation.innerHTML, SelectLocation.innerText);
//     }
//   });

// document
//   .getElementById("SelectLocation")
//   .addEventListener("change", function () {
//     var head = document.getElementById("institutionSelect").value;
//     var SelectLocation = this;
//     var SelectIndex = SelectLocation.selectedIndex;
//     var selectedOption = SelectLocation.options[SelectIndex].text;
//     // console.log(head, selectedOption);
//     var SelectMachineNo = document.getElementById("SelectMachineNo");

//     if (SelectIndex === 0) {
//       SelectMachineNo.setAttribute("disabled", "disabled");
//       SelectMachineNo.selectedIndex = 0;
//     } else {
//       var ticket_data = {
//         "AMC JANGAON": [
//           {
//             city: "AMC JANGAON",
//             id: 235,
//             machine_no: " AMC-J",
//             state: "TELANGANA",
//           },
//         ],
//         ANANT: [
//           {
//             city: "AnantLocation",
//             id: 233,
//             machine_no: "11008",
//             state: "null",
//           },
//         ],
//         APSCSCL: [
//           {
//             city: "hyderabad-office",
//             id: 203,
//             machine_no: "1235",
//             state: "null",
//           },
//         ],
//         Canada: [
//           {
//             city: "ETG Commodities INC",
//             id: 229,
//             machine_no: "CAN-1",
//             state: "Swift current",
//           },
//         ],
//         "ENAM GUJARAT12": [
//           { city: "8999", id: 199, machine_no: "898", state: "Rajasthan" },
//         ],
//         "ENAM Haryana": [
//           { city: "Adampur", id: 144, machine_no: "1155", state: "Haryana" },
//           { city: "Ambala", id: 145, machine_no: "1156", state: "Haryana" },
//           { city: "Assandh", id: 146, machine_no: "1157", state: "Haryana" },
//           { city: "Barwala", id: 147, machine_no: "1158", state: "Haryana" },
//         ],
//         "ENAM Rajasthan": [
//           { city: "Mandawri", id: 5, machine_no: "1013", state: "Rajasthan" },
//           {
//             city: "Mandore Jodhpur",
//             id: 6,
//             machine_no: "1014",
//             state: "Rajasthan",
//           },
//           { city: "Shahpura", id: 7, machine_no: "1015", state: "Rajasthan" },
//           {
//             city: "Bhagat ki kothi",
//             id: 8,
//             machine_no: "1016",
//             state: "Rajasthan",
//           },
//         ],
//         FCI: [
//           {
//             city: "RS Miryalaguda",
//             id: 443,
//             machine_no: "1355",
//             state: "Telangana",
//           },
//           {
//             city: "Sultanabad",
//             id: 444,
//             machine_no: "1346",
//             state: "Telangana",
//           },
//           {
//             city: "PSWC Bagli- Chawapail",
//             id: 526,
//             machine_no: "1438",
//             state: "Punjab",
//           },
//           {
//             city: "PSWC Rahon - RSD Khanna",
//             id: 527,
//             machine_no: "1440",
//             state: "Punjab",
//           },
//         ],
//         "FRL-GUJRAT": [
//           {
//             city: "Food Research Lab",
//             id: 198,
//             machine_no: "FRL",
//             state: "Gujarat",
//           },
//         ],
//         GHANA: [{ city: "ACCRA", id: 221, machine_no: "G1", state: "GHANA" }],
//         "Gujarat SAMB": [
//           {
//             city: "Gujarat SAMB",
//             id: 236,
//             machine_no: "SAMB",
//             state: "gujarat",
//           },
//         ],
//         Jharkhand: [
//           { city: "JSAMB", id: 234, machine_no: "JSAMB-1", state: "Jharkhand" },
//         ],
//         LIM: [
//           { city: "LIMAGRAIN", id: 223, machine_no: "101", state: "TELANGANA" },
//         ],
//         "McCain Foods (India) Pvt Ltd": [
//           {
//             city: "McCain Foods (India) Pvt Ltd",
//             id: 230,
//             machine_no: "McCain-1",
//             state: "Gujarat",
//           },
//         ],
//         "NAGA LIMITED": [
//           {
//             city: "DINDIGUL",
//             id: 222,
//             machine_no: "11002",
//             state: "TAMIL-NADU",
//           },
//         ],
//         NBHC: [
//           { city: "nbhc1", id: 204, machine_no: "8001", state: "Telangana" },
//           { city: "nbhc2", id: 206, machine_no: "8002", state: "null" },
//           { city: "nbhc3", id: 207, machine_no: "8003", state: "null" },
//           { city: "nbhc4", id: 208, machine_no: "8004", state: "null" },
//         ],
//         "NEBULAA-DELHI": [
//           { city: "NEBULAA", id: 220, machine_no: "NEB", state: "DELHI" },
//         ],
//         Nebulaa: [
//           {
//             city: "Nebulaa-Hyderabad",
//             id: 141,
//             machine_no: "null",
//             state: "Telangana",
//           },
//           {
//             city: "Nebulaa-Jaipur",
//             id: 202,
//             machine_no: "NEBJ",
//             state: "RAJASTHAN",
//           },
//         ],
//         "Nebulaa-Jaipur": [
//           {
//             city: "Nebulaa-Jaipur",
//             id: 205,
//             machine_no: "NEBJA",
//             state: "Rajasthan",
//           },
//         ],
//         "ORANGE SORTER": [
//           {
//             city: "ORANGE SORTER COIMBATOR",
//             id: 232,
//             machine_no: "ORANGE-1",
//             state: "TAMIL-NADU",
//           },
//         ],
//         TSDOIT: [
//           { city: "Nizamabad1", id: 231, machine_no: "1237", state: "null" },
//           {
//             city: "Mahbubnagar",
//             id: 218,
//             machine_no: "1235",
//             state: "TELANGANA",
//           },
//           {
//             city: "Nizamabad",
//             id: 219,
//             machine_no: "1236",
//             state: "TELANGANA",
//           },
//         ],
//         hello: [
//           { city: "demo", id: 200, machine_no: "3422", state: "Rajasthan" },
//         ],
//         test: [{ city: "TEST1", id: 201, machine_no: "TEST", state: "DD" }],
//       };
//       SelectMachineNo.removeAttribute("disabled");
//       head_data = ticket_data[head];
//       var options = "";
//       for (let index = 0; index < head_data.length; index++) {
//         if (head_data[index]["city"] === selectedOption) {
//           const element = head_data[index]["machine_no"];
//           options += `<option>${element}</option>`;
//         }
//       }
//       SelectMachineNo.innerHTML =
//         `<option>Select Machine No.</option>` + options;
//     }
//   });

// sort card
// function getStatusValue(cardElement) {
//   const statusElement = cardElement.querySelector(".position-absolute.badge");

//   if (statusElement) {
//     const statusText = statusElement.textContent.trim().toLowerCase();
//     return statusText;
//   }

//   return "unknown_status";
// }

// get head_instituion data using fetch
// async function get_head_institution_data(){
//   const data = await fetch('http://127.0.0.1:5000/get_head_institution_data');
//   return data;
// }
