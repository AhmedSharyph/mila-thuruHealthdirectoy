 document.addEventListener('DOMContentLoaded', function () {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxI_5lWR-Bvk-FfqFgM2yp_tCgbGcUqxQY1kgPgAMb-7FdpyFTlfp3cvkBNoW2uTou77w/exec";

    const healthCenterSelect = document.getElementById('healthCenter');
    const departmentSelect = document.getElementById('department');
    const roleSelect = document.getElementById('role');
    const confirmDataCheckbox = document.getElementById('confirmDataCheckbox');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('contactForm');

    // Initialize Tom Select for Health Center
    new TomSelect(healthCenterSelect, {
      create: false,
      placeholder: "Select a Health Center",
      maxItems: 1,
      sortField: false,
    });

    // Populate dropdowns from Google Apps Script
    fetch(WEB_APP_URL + "?action=getDropdownData")
      .then(response => response.json())
      .then(data => {
        function populateSelect(selectElem, options, placeholderText, allowCreate = true, sort = true) {
          selectElem.innerHTML = '';
          const defaultOption = new Option(placeholderText, "", true, true);
          defaultOption.disabled = true;
          selectElem.add(defaultOption);

          if (sort) options.sort();
          options.forEach(value => {
            selectElem.add(new Option(value, value));
          });

          new TomSelect(selectElem, {
            create: allowCreate,
            placeholder: placeholderText,
            maxItems: 1,
            sortField: sort ? "text" : undefined,
          });
        }

        populateSelect(departmentSelect, data.departments, "Select a Department");
        populateSelect(roleSelect, data.roles, "Select a Role or Function");
      })
      .catch(err => {
        console.error(err);
        alert('Failed to load dropdown data. Please refresh the page.');
      });

    // Enable submit button only when checkbox is checked
    confirmDataCheckbox.addEventListener('change', () => {
      submitBtn.disabled = !confirmDataCheckbox.checked;
    });

    // Form submission logic
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzL2KKwec0TU0r-WpsrVoSZykstA1v8Am4fvlQN6J-W8manlp32_JWG0UH41OsbQe3ZAA/exec';
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Submitting...';

      const formData = new FormData(form);

      fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => {
          if (!response.ok) throw new Error('Submission failed');
          return response;
        })
        .then(() => {
          alert('Contact details submitted successfully!');
          form.reset();
          confirmDataCheckbox.checked = false;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '✅ Submit';
          setTimeout(() => window.location.reload(), 2000);
        })
        .catch(error => {
          console.error('Error!', error.message);
          alert('Error submitting data. Please try again.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '✅ Submit';
        });
    });

    // 🛑 Hamburger menu toggle removed from here
    // It will now live in loader.js so it only runs after header loads
  });
