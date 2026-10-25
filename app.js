const STORAGE_KEY = 'fatigueActivities';
const activityForm = document.getElementById('addActivityForm');
const decisionButtonsContainer = document.getElementById('colorButtonsContainer');
const recommendationText = document.getElementById('recommendationText');
const activitiesPresentListEl = document.getElementById('activitiesPresent');

let activitiesData = [];

/** Register sw.js */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js') // 👈 This is the key line! Register the service worker file path
      .then(registration => {
        console.log('Service Worker registered successfully with scope:', registration.scope);
        // Optional: You can now use this 'registration' object for updates/notifications
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });

} else {
  // Fallback for older browsers that don't support Service Workers (though most modern ones do)
  console.log('Service Workers are not supported in this browser.');
}


/** 1. Initialization and Data Loading **/
document.addEventListener('DOMContentLoaded', () => {
    loadActivities();
    attachEventListeners();
});


function loadActivities() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        activitiesData = JSON.parse(storedData);
        renderActivityListManagement(); // Show existing activities on load
    } else {
        console.log("No existing activities found in Local Storage.");
    }
}

function saveActivities() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activitiesData));
    // Re-render the list after saving changes through the form/deletion logic (optional but good practice)
    renderActivityListManagement(); 
}


/** 2. Input Mechanism: Adding Activities **/

function addActivityHandler(event) {
    event.preventDefault();

    const nameInput = document.getElementById('activityName');
    const categoryInput = document.getElementById('activityCategory');

    const newActivity = {
        id: Date.now(), // Simple unique ID generation
        name: nameInput.value.trim(),
        category: categoryInput.value, // e.g., "Amber"
    };

    activitiesData.push(newActivity);
    saveActivities(); 

    // Clear form fields for next entry
    activityForm.reset();
}


/** 3. Decision Flow: Randomization and Recommendation **/

function handleDecisionClick(event) {
    const selectedState = event.currentTarget.dataset.state; // e.g., "Amber"
    console.log(`User requested activities for state: ${selectedState}`);

    // a, b, c: Query and Filter Activities based on the chosen state
    const filteredActivities = activitiesData.filter(activity => 
        activity.category === selectedState
    );

    if (filteredActivities.length === 0) {
        recommendationText.textContent = `❌ No activities found tagged as ${selectedState}. Please add some!`;
        return; // Stop execution if nothing matches the filter
    }

    // d: Select exactly one activity using uniform randomization (Dice Roll)
    const randomIndex = Math.floor(Math.random() * filteredActivities.length);
    const chosenActivity = filteredActivities[randomIndex];

    // e & f: Display and return (the choice is NOT consumed)
    recommendationText.textContent = `🌟 Try this: ${chosenActivity.name} (${selectedState})`;
}


/** 4. Rendering and Management **/

function attachEventListeners() {
    activityForm.addEventListener('submit', addActivityHandler);

    // Attach the main decision listener to all color buttons dynamically (or by binding them in HTML)
    document.querySelectorAll('.energy-button').forEach(button => {
        button.addEventListener('click', handleDecisionClick);
    });
}

function renderActivityListManagement() {
     activitiesPresentListEl.innerHTML = ''; // Clear old list

     if (activitiesData.length === 0) {
         activitiesPresentListEl.innerHTML = '<li>No activities have been saved yet.</li>';
         return;
     }

    activitiesData.forEach(activity => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${activity.name}</strong> - Tagged as: <span class="tag-${activity.category}">${activity.category}</span> 
                        <button data-id="${activity.id}" class="delete-btn" aria-label="Delete ${activity.name}">🗑️</button>`;
        activitiesPresentListEl.appendChild(li);
    });

    // Add delete functionality to the rendered list items for usability testing/cleanup
     document.querySelectorAll('.delete-btn').forEach(button => {
         button.addEventListener('click', (e) => {
             const idToDelete = parseInt(e.target.dataset.id);
             activitiesData = activitiesData.filter(a => a.id !== idToDelete);
             saveActivities(); // Save after deletion
         });
     });

}


// Export functions for clarity, though in this small project it's mostly internal calls:
window.FatigueManager = { 
    addActivityHandler, 
    handleDecisionClick, 
    renderActivityListManagement 
};
