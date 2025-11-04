import React, { useRef, useEffect, useMemo } from "react";

const VideoChatPanel = ({ socket, selectedFriend }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef(null);

  // ✅ Stable ICE servers reference
  const servers = useMemo(
    () => ({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }),
    []
  );

  useEffect(() => {
    if (!socket || !selectedFriend) return;

    // Clean up old connection if exists
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    // Add local media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (!pcRef.current) return;
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
    });

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: selectedFriend.username,
          candidate: event.candidate,
        });
      }
    };

    // Socket event handlers
    const handleIncomingCall = async ({ from, offer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit("answerCall", { to: from, answer });
    };

    const handleCallAnswered = async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAnswered", handleCallAnswered);
    socket.on("iceCandidate", handleIceCandidate);

    // Cleanup
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callAnswered", handleCallAnswered);
      socket.off("iceCandidate", handleIceCandidate);
    };
  }, [socket, selectedFriend, servers]);

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
