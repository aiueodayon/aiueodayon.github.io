// IndexedDB で履歴を管理
function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('chatDB', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('messages', { keyPath:'id', autoIncrement:true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function saveMessageToDB(msg) {
  const db = await initDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('messages','readwrite');
    const store = tx.objectStore('messages');
    const r = store.add(msg);
    r.onsuccess = () => res(true);
    r.onerror   = () => rej(r.error);
  });
}

async function loadHistory() {
  const db = await initDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('messages','readonly');
    const store = tx.objectStore('messages');
    const r = store.getAll();
    r.onsuccess = () => {
      const all = r.result || [];
      if (!Array.isArray(all)) return rej(new Error('取得結果が配列ではありません'));
      all.sort((a,b) => a.timestamp - b.timestamp);
      res(all);
    };
    r.onerror = () => rej(r.error);
  });
}
