(async ()=>{
  const messagesEl = document.getElementById('messages');
  const chatEl     = document.getElementById('chat');
  const loginEl    = document.getElementById('login');
  const nickEl     = document.getElementById('nickname');
  const joinBtn    = document.getElementById('joinBtn');
  const inputEl    = document.getElementById('messageInput');
  const sendBtn    = document.getElementById('sendBtn');
  const errorEl    = document.getElementById('error');

  // グローバルエラーハンドラ
  window.onerror = (message, source, lineno, colno, error) => {
    const stack = error?.stack || '';
    errorEl.innerHTML = `
      <strong>エラー:</strong> ${message}<br>
      <strong>ファイル:</strong> ${source}（${lineno}:${colno}）<br>
      <strong>種類:</strong> ${error?.name || '不明'}<br>
      <pre style="white-space:pre-wrap;">${stack}</pre>
    `;
    errorEl.classList.remove('hidden');
    return true;
  };

  // メッセージ描画
  function renderMessage({from, text, timestamp}) {
    const date = new Date(timestamp);
    const fmt = 
      `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ` +
      `${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}:` +
      `${String(date.getSeconds()).padStart(2,'0')}`;
    const div = document.createElement('div');
    div.className = 'msg';
    div.innerHTML = 
      `<span class="from">${from}</span>: ${text}` +
      `<span class="timestamp">(${fmt})</span>`;
    messagesEl.append(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // 既存履歴の読込
  try {
    const history = await loadHistory();
    history.forEach(renderMessage);
  } catch (e) {
    window.onerror(e.message, 'storage.js', 0, 0, e);
  }

  // 参加ボタン
  joinBtn.onclick = () => {
    try {
      if (typeof connectAchex !== 'function') {
        throw new ReferenceError(
          'connectAchex が未定義です。signaling.js の読み込みを確認してください。'
        );
      }
      const userId = nickEl.value.trim() || '匿名';
      loginEl.classList.add('hidden');
      chatEl.classList.remove('hidden');
      window.renderMessage = renderMessage;  // rtc.js 用に公開
      connectAchex(userId);
    } catch (e) {
      window.onerror(e.message, 'main.js', 0, 0, e);
    }
  };

  // 送信ボタン
  sendBtn.onclick = () => {
    try {
      const text = inputEl.value.trim();
      if (!text) return;
      const msg = { from: nickEl.value || '匿名', text, timestamp: Date.now() };
      Object.values(peers).forEach(pc =>
        pc.dataChannel?.send(JSON.stringify(msg))
      );
      renderMessage(msg);
      saveMessageToDB(msg);
      inputEl.value = '';
    } catch (e) {
      window.onerror(e.message, 'main.js', 0, 0, e);
    }
  };
})();
