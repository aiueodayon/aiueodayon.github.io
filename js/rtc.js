const peers = {};

async function createPeerConnection(peerId, isInitiator) {
  if (peers[peerId]) return;
  const pc = new RTCPeerConnection({ iceServers:[{urls:'stun:stun.l.google.com:19302'}] });
  peers[peerId] = pc;

  pc.onicecandidate = e => e.candidate && sendSignal(peerId, { candidate:e.candidate });
  let dc;
  if (isInitiator) {
    dc = pc.createDataChannel('chat');
    setupDataChannel(dc);
    peers[peerId].dataChannel = dc;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal(peerId, { sdp:pc.localDescription });
  } else {
    pc.ondatachannel = e => {
      setupDataChannel(e.channel);
      peers[peerId].dataChannel = e.channel;
    };
  }

  async function handleSignal(from, signal) {
    if (signal.sdp) {
      await pc.setRemoteDescription(signal.sdp);
      if (signal.sdp.type === 'offer') {
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        sendSignal(from, { sdp:pc.localDescription });
      }
    } else if (signal.candidate) {
      await pc.addIceCandidate(signal.candidate);
    }
  }

  window.handleSignal = handleSignal;
}

function setupDataChannel(channel) {
  channel.onopen = () => console.log('DataChannel open');
  channel.onmessage = e => {
    const msg = JSON.parse(e.data);
    renderMessage(msg);
    saveMessageToDB(msg);
  };
}
