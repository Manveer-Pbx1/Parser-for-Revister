(function() {
  const syncExtensionToLocalStorage = () => {
    chrome.storage.local.get(['revister_items'], (result) => {
      const extensionItems = result.revister_items || [];
      
      if (extensionItems.length > 0) {
        try {
          const localItems = JSON.parse(localStorage.getItem('revister_items') || '[]');
          
          const localItemsMap = new Map(localItems.map(item => [item.id, item]));
          
          const newItems = extensionItems.filter(item => !localItemsMap.has(item.id));
          
          if (newItems.length > 0) {
            const mergedItems = [...newItems, ...localItems];
            mergedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
            localStorage.setItem('revister_items', JSON.stringify(mergedItems));
            
            window.dispatchEvent(new Event('storage'));
            console.log(`Synced ${newItems.length} new items from extension`);
          }
        } catch (error) {
          console.error('Error syncing extension data:', error);
        }
      }
    });
  };

  const syncLocalStorageToExtension = () => {
    try {
      const localItems = JSON.parse(localStorage.getItem('revister_items') || '[]');
      if (localItems.length > 0) {
        chrome.storage.local.set({ revister_items: localItems }, () => {
          console.log('Synced localStorage to extension');
        });
      }
    } catch (error) {
      console.error('Error syncing to extension:', error);
    }
  };

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data.type === 'REVISTER_SYNC_REQUEST') {
      syncExtensionToLocalStorage();
    } else if (event.data.type === 'REVISTER_EXPORT_REQUEST') {
      syncLocalStorageToExtension();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncExtensionToLocalStorage);
  } else {
    syncExtensionToLocalStorage();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.revister_items) {
      syncExtensionToLocalStorage();
    }
  });
})();
