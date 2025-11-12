/* eslint-disable */
import React, { useRef, useState, useEffect, useCallback } from "react";

const VideoChatPanel = ({ socket, selectedFriend, incomingCallOffer }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef(null);
  const [inCall, setInCall] = useState(false);

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  // Draggable local PiP
  const [dragPos, setDragPos] = useState({ top: 20, left: 20 });
  const dragRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

  // ------------------ Peer Connection ------------------
  const initPeerConnection = useCallback(() => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    // 🔹 Remote track
   pc.ontrack = (event) => {
      console.log("ON track event>>>>>>>", event);
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteStream) {
        if (remoteVideoRef.current.srcObject !== remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
          console.log("✅ Remote stream set");
        }
      } else {
        console.log("⚠️ remoteVideoRef not ready or no stream");
      }
    };


    // 🔹 ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: selectedFriend.name,
          candidate: event.candidate,
        });
      }
    };

    // 🔹 Caller receives answer
    socket.on("callAnswered", async ({ answer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error("Error setting remote description:", err);
      }
    });

    // 🔹 Remote ICE candidates
    socket.on("iceCandidate", async ({ candidate }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    // 🔹 Remote call ended
    socket.on("callEnded", () => {
      endCallLocal();
    });
  }, [socket, selectedFriend.name]);

  // ------------------ Incoming Call ------------------
  useEffect(() => {
    const handleIncomingCall = async () => {
      if (!incomingCallOffer) return;
      initPeerConnection();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

        await pcRef.current.setRemoteDescription(new RTCSessionDescription(incomingCallOffer));

        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        socket.emit("answerCall", { to: selectedFriend.name, answer });
        setInCall(true);
      } catch (err) {
        console.error("Error accessing camera or setting remote description:", err);
      }
    };

    handleIncomingCall();
  }, [incomingCallOffer, initPeerConnection, selectedFriend.name, socket]);

  // ------------------ Outgoing Call ------------------
  const startCall = async () => {
    if (!socket || !selectedFriend || inCall) return;

    initPeerConnection();
    try {
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

      setInCall(true);
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  // ------------------ End Call ------------------
  const stopCall = () => {
    const localStream = localVideoRef.current?.srcObject;
    if (localStream) localStream.getTracks().forEach((track) => track.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setInCall(false);
  };

  const endCallLocal = () => {
    stopCall();
  };

  // ------------------ Draggable PiP ------------------
  const handleMouseDown = (e) => {
    dragRef.current.dragging = true;
    const rect = localVideoRef.current.getBoundingClientRect();
    dragRef.current.offsetX = e.clientX - rect.left;
    dragRef.current.offsetY = e.clientY - rect.top;
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.dragging) return;

    let newLeft = e.clientX - dragRef.current.offsetX;
    let newTop = e.clientY - dragRef.current.offsetY;

    const winWidth = window.innerWidth - 200;
    const winHeight = window.innerHeight - 140;
    newLeft = Math.max(0, Math.min(newLeft, winWidth));
    newTop = Math.max(0, Math.min(newTop, winHeight));

    setDragPos({ left: newLeft, top: newTop });
  };

  const handleMouseUp = () => {
    dragRef.current.dragging = false;
  };

  // ------------------ Styles ------------------
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
    position: "fixed",
    width: "200px",
    height: "140px",
    borderRadius: "8px",
    border: "2px solid white",
    objectFit: "cover",
    zIndex: 9999,
    cursor: "move",
    left: `${dragPos.left}px`,
    top: `${dragPos.top}px`,
  };

  // ------------------ Render ------------------
  return (
    <div
      className="video-chat-panel"
      style={{ textAlign: "center", padding: "10px" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div style={videoContainerStyle}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={remoteVideoStyle}
        />
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          style={localVideoStyle}
          onMouseDown={handleMouseDown}
        />
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
