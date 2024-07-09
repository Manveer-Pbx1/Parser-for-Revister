document.getElementById('saveUrlButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      const notes = document.getElementById('notes').value;
      const difficulty = document.getElementById('difficulty').textContent;
      fetch('http://localhost:5000/save-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url, notes: notes, difficulty: difficulty }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('URL and notes saved:', data);
      })
      .catch(error => {
        console.error('Error saving URL and notes:', error);
      });
    });
  });
  