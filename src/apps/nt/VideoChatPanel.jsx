import React, { useRef, useState, useEffect } from "react";

const VideoChatPanel = ({ socket, selectedFriend, incomingCallOffer }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef(null);
  const [inCall, setInCall] = useState(false);

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  const initPeerConnection = () => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: selectedFriend.name,
          candidate: event.candidate,
        });
      }
    };

    socket.on("callAnswered", async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });
  };

  // Handle outgoing call
  const startCall = async () => {
    if (!socket || !selectedFriend || inCall) return;

    initPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socket.emit("callUser", {
      to: selectedFriend.name,
      offer,
      from: sessionStorage.getItem("userName"),
    });

    setInCall(true);
  };

  // Handle incoming call (triggered when accept button clicked)
  useEffect(() => {
    if (!incomingCallOffer || inCall) return;

    const acceptCall = async () => {
      initPeerConnection();

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(incomingCallOffer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit("answerCall", { to: selectedFriend.name, answer });

      setInCall(true);
    };

    acceptCall();
  }, [incomingCallOffer]);

  const cancelCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
    setInCall(false);
  };

  return (
    <div className="video-chat-panel">
      <div>
        <video ref={localVideoRef} autoPlay muted style={{ width: "200px" }} />
        <video ref={remoteVideoRef} autoPlay style={{ width: "200px" }} />
      </div>
      {inCall ? (
        <button onClick={cancelCall} style={{ backgroundColor: "red", color: "white" }}>
          End Call
        </button>
      ) : (
        <button onClick={startCall}>Call {selectedFriend.name}</button>
      )}
    </div>
  );
};

export default VideoChatPanel;
