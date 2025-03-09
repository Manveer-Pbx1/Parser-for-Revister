document.addEventListener('DOMContentLoaded', () => {
  // Get the current tab's URL and title when the popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    // Focus the notes textarea for immediate input
    document.getElementById('notes').focus();
  });

  // Handle the save button click
  document.getElementById('saveUrlButton').addEventListener('click', () => {
    const saveButton = document.getElementById('saveUrlButton');
    const statusDiv = document.getElementById('status');
    
    // Prevent multiple submissions
    if (saveButton.disabled) return;
    
    // Get the notes value
    const notes = document.getElementById('notes').value.trim();
    if (!notes) {
      statusDiv.textContent = 'Please enter notes';
      statusDiv.className = 'error';
      return;
    }
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      const title = tabs[0].title || '';
      
      // Get the selected difficulty
      const difficultyRadios = document.getElementsByName('difficulty');
      let difficulty = 'Easy'; // Default value
      
      for (const radio of difficultyRadios) {
        if (radio.checked) {
          difficulty = radio.value;
          break;
        }
      }
      
      // Show loading state
      saveButton.textContent = 'Saving...';
      saveButton.disabled = true;
      statusDiv.textContent = '';
      statusDiv.className = '';
      
      fetch('http://localhost:5000/save-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: title,
          url: url, 
          notes: notes, 
          difficulty: difficulty,
          completed: false,
          saved: true,
          revisitCount: 0
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('URL and notes saved:', data);
        saveButton.textContent = 'Save to Revister';
        saveButton.disabled = false;
        statusDiv.textContent = 'Saved successfully!';
        statusDiv.className = 'success';
        
        // Clear the notes field
        document.getElementById('notes').value = '';
        
        // Close the popup after a delay (optional)
        setTimeout(() => {
          window.close();
        }, 1500);
      })
      .catch(error => {
        console.error('Error saving URL and notes:', error);
        saveButton.textContent = 'Save to Revister';
        saveButton.disabled = false;
        statusDiv.textContent = 'Error saving: ' + error.message;
        statusDiv.className = 'error';
      });
    });
  });
});
  