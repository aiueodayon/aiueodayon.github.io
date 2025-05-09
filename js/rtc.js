const peers = {};

// 新しい PeerConnection を作成 or 既存を再利用
async function createPeerConnection(peerId, isInitiator) {
  if (peers[peerId]) return;
  const pc = new RTCPeerConnection({
    iceServers:[{ urls:'stun:stun.l.google.com:19302' }]
  });
  peers[peerId] = pc;

  pc.onicecandidate = e => {
    if (e.candidate) {
      sendSignal(peerId, { candidate: e.candidate });
    }
  };

  if (isInitiator) {
    const dc = pc.createDataChannel('chat');
    setupDataChannel(dc);
    pc.dataChannel = dc;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal(peerId, { sdp: pc.localDescription });
  } else {
    pc.ondatachannel = e => {
      setupDataChannel(e.channel);
      pc.dataChannel = e.channel;
    };
  }

  // シグナルの受信処理をグローバル化
  window.handleSignal = async (from, signal) => {
    const conn = peers[from];
    if (signal.sdp) {
      await conn.setRemoteDescription(signal.sdp);
      if (signal.sdp.type === 'offer') {
        const ans = await conn.createAnswer();
        await conn.setLocalDescription(ans);
        sendSignal(from, { sdp: conn.localDescription });
      }
    } else if (signal.candidate) {
      await conn.addIceCandidate(signal.candidate);
    }
  };
}

// DataChannel の共通セットアップ
function setupDataChannel(channel) {
  channel.onopen = () => console.log('DataChannel open');
  channel.onmessage = e => {
    const msg = JSON.parse(e.data);
    renderMessage(msg);
    saveMessageToDB(msg);
  };
}
