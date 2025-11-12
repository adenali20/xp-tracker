/* eslint-disable */
import React, { useRef, useState, useEffect, useCallback } from "react";

const VideoChatPanel = ({ socket, selectedFriend, incomingCallOffer }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef(null);
  const [inCall, setInCall] = useState(false);

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  const initPeerConnection = useCallback(() => {
    if (pcRef.current) return;
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteStream) {
        if (remoteVideoRef.current.srcObject !== remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      }
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

    socket.on("callEnded", () => {
      endCallLocal();
    });
  }, [socket, selectedFriend.name]);

  useEffect(() => {
    const openMedia = async () => {
      if (!incomingCallOffer) return;
      initPeerConnection();

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(incomingCallOffer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit("answerCall", { to: selectedFriend.name, answer });
    };

    openMedia();
  }, [incomingCallOffer, initPeerConnection, selectedFriend.name, socket]);

  const startCall = async () => {
    setInCall(true);
    if (!socket || !selectedFriend || inCall) return;

    initPeerConnection();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socket.emit("callUser", {
      to: selectedFriend.name,
      offer,
      from: sessionStorage.getItem("userName"),
    });
  };

  const stopCall = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setInCall(false);
  };

  const videoContainerStyle = {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: "900px",
    height: "500px",
    margin: "0 auto",
    backgroundColor: "#000",
    borderRadius: "8px",
    overflow: "hidden",
  };

  const remoteVideoStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const localVideoStyle = {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    width: "200px",
    height: "140px",
    borderRadius: "8px",
    border: "2px solid white",
    objectFit: "cover",
    zIndex: 10,
  };

  return (
    <div className="video-chat-panel" style={{ textAlign: "center", padding: "10px" }}>
      <div style={videoContainerStyle}>
        <video ref={remoteVideoRef} autoPlay playsInline style={remoteVideoStyle} />
        <video ref={localVideoRef} autoPlay muted playsInline style={localVideoStyle} />
      </div>

      {inCall ? (
        <button
          onClick={stopCall}
          style={{ marginTop: "10px", backgroundColor: "red", color: "white" }}
        >
          End Call
        </button>
      ) : (
        <button onClick={startCall} style={{ marginTop: "10px" }}>
          Call {selectedFriend.name}
        </button>
      )}
    </div>
  );
};

export default VideoChatPanel;
