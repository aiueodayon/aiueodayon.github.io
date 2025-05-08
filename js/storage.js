function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('chatDB', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveMessageToDB(msg) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    const req = store.add(msg);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

async function loadHistory() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('messages', 'readonly');
    const store = tx.objectStore('messages');
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result || [];
      if (!Array.isArray(all)) return reject(new Error("取得結果が配列ではありません"));
      all.sort((a, b) => a.timestamp - b.timestamp);
      resolve(all);
    };
    req.onerror = () => reject(req.error);
  });
}
