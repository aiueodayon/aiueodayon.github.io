(async ()=>{
  const messagesEl = document.getElementById('messages');
  const chatEl     = document.getElementById('chat');
  const loginEl    = document.getElementById('login');
  const nickEl     = document.getElementById('nickname');
  const joinBtn    = document.getElementById('joinBtn');
  const inputEl    = document.getElementById('messageInput');
  const sendBtn    = document.getElementById('sendBtn');
  const errorEl    = document.getElementById('error');

  window.onerror = (message, source, lineno, colno, error) => {
    const stack = error?.stack || '';
    errorEl.innerHTML = `
      <strong>エラー:</strong> ${message}<br/>
      <strong>ファイル:</strong> ${source}（${lineno}:${colno}）<br/>
      <strong>詳細:</strong> ${error?.name || '不明'}<br/>
      <pre style="white-space:pre-wrap;">${stack}</pre>
    `;
    errorEl.classList.remove('hidden');
    return true;
  };
  

  function renderMessage({from, text, timestamp}) {
    const div = document.createElement('div');
    div.className = 'msg';
    
    // 日付と時刻のフォーマットを追加
    const date = new Date(timestamp);
    const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    
    div.innerHTML = `<span class="from">${from}</span>: ${text} <span class="timestamp">(${formattedDate})</span>`;
    messagesEl.append(div);
  }
  

  try {
    const history = await loadHistory();
    history.forEach(renderMessage);
  } catch (e) {
    window.onerror(e.message, 'storage.js', 0, 0, e);
  }

  joinBtn.onclick = ()=>{
    try {
      const userId = nickEl.value.trim() || '匿名';
      loginEl.classList.add('hidden');
      chatEl.classList.remove('hidden');
      connectAchex(userId);
      window.renderMessage = renderMessage;
    } catch (e) {
      window.onerror(e.message, 'main.js', 0, 0, e);
    }
  };

  sendBtn.onclick = ()=>{
    try {
      const text = inputEl.value.trim();
      if (!text) return;
      const msg = { from: nickEl.value, text, timestamp: Date.now() };
      Object.values(peers).forEach(pc=>pc.dataChannel?.send(JSON.stringify(msg)));
      renderMessage(msg);
      saveMessageToDB(msg);
      inputEl.value = '';
    } catch (e) {
      window.onerror(e.message, 'main.js', 0, 0, e);
    }
  };
})();
