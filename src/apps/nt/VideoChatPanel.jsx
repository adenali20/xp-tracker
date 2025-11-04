import { useRef, useEffect } from "react";

const VideoChatPanel = ({ socket, selectedFriend }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef(null); // use ref instead of state

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    if (!socket || !selectedFriend) return;

    // Clean up old connection if exists
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    // Add local stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (!pcRef.current) return; // in case connection closed
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
    });

    pc.ontrack = (event) => (remoteVideoRef.current.srcObject = event.streams[0]);

    pc.onicecandidate = (event) => {
      if (event.candidate) socket.emit("iceCandidate", { to: selectedFriend.username, candidate: event.candidate });
    };

    socket.on("incomingCall", async ({ from, offer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit("answerCall", { to: from, answer });
    });

    socket.on("callAnswered", async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [socket, selectedFriend]);

  const callUser = async () => {
    if (!pcRef.current) return;
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socket.emit("callUser", {
      to: selectedFriend.username,
      offer,
      from: sessionStorage.getItem("userName"),
    });
  };

  return (
    <div className="video-chat-panel">
      <div>
        <video ref={localVideoRef} autoPlay muted style={{ width: "200px" }} />
        <video ref={remoteVideoRef} autoPlay style={{ width: "200px" }} />
      </div>
      <button onClick={callUser}>Call {selectedFriend.name}</button>
    </div>
  );
};

export default VideoChatPanel;
