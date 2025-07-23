document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    document.getElementById('notes').focus();
  });

  document.getElementById('saveUrlButton').addEventListener('click', () => {
    const saveButton = document.getElementById('saveUrlButton');
    const statusDiv = document.getElementById('status');
    
    if (saveButton.disabled) return;
    
    const notes = document.getElementById('notes').value.trim();
    if (!notes) {
      statusDiv.textContent = 'Please enter notes';
      statusDiv.className = 'error';
      return;
    }
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      const title = tabs[0].title || '';
      
      const difficultyRadios = document.getElementsByName('difficulty');
      let difficulty = 'Easy'; 
      
      for (const radio of difficultyRadios) {
        if (radio.checked) {
          difficulty = radio.value;
          break;
        }
      }
      
      saveButton.textContent = 'Saving...';
      saveButton.disabled = true;
      statusDiv.textContent = '';
      statusDiv.className = '';
      
      const itemData = {
        id: generateUUID(),
        name: title,
        url: url, 
        notes: notes, 
        difficulty: difficulty,
        completed: false,
        saved: true,
        revisitCount: 0,
        date: new Date().toISOString()
      };

      chrome.storage.local.get(['revister_items'], (result) => {
        const existingItems = result.revister_items || [];
        const updatedItems = [itemData, ...existingItems];
        
        chrome.storage.local.set({ revister_items: updatedItems }, () => {
          console.log('Item saved to extension storage:', itemData);

          chrome.tabs.query({ url: ["http://localhost:*/*", "https://revister-getconsistent.vercel.app"] }, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { type: 'ITEM_ADDED', item: itemData })
                .catch(() => {
                });
            });
          });
          
          saveButton.textContent = 'Save to Revister';
          saveButton.disabled = false;
          statusDiv.textContent = 'Saved successfully! Open Revister app to sync.';
          statusDiv.className = 'success';
          
          document.getElementById('notes').value = '';
          
          setTimeout(() => {
            window.close();
          }, 2000);
        });
      });
    });
  });
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}