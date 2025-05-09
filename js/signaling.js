let socket;

// Achex 経由でシグナリング
function connectAchex(userId) {
  socket = new WebSocket(window.ACHEX_URL);
  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ auth:{user:userId, pass:''} }));
    socket.send(JSON.stringify({ room:window.ROOM_ID, data:{type:'join', user:userId} }));
  });
  socket.addEventListener('message', async ev => {
    const msg = JSON.parse(ev.data);
    if (msg.data?.type === 'join' && msg.from !== userId) {
      createPeerConnection(msg.from, true);
    }
    if (msg.data?.type === 'signal') {
      await handleSignal(msg.from, msg.data.signal);
    }
  });
}

function sendSignal(to, signal) {
  socket.send(JSON.stringify({
    room: window.ROOM_ID,
    to,
    data: { type:'signal', signal }
  }));
}

// グローバル公開
window.connectAchex = connectAchex;
window.sendSignal   = sendSignal;
