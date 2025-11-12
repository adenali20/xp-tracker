/* eslint-disable */
import React, { useRef, useState, useEffect, useCallback } from "react";

const VideoChatPanel = ({ socket, selectedFriend, incomingCallOffer }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef(null);
  const [inCall, setInCall] = useState(false);

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  // ------------------ Draggable & Resizable PiP ------------------
  const [dragPos, setDragPos] = useState({ top: 20, left: 20 });
  const [pipSize, setPipSize] = useState({ width: 200, height: 140 });
  const dragRef = useRef({ dragging: false, resizing: false, offsetX: 0, offsetY: 0 });

  const handleMouseDown = (e) => {
    dragRef.current.dragging = true;
    const rect = localVideoRef.current.getBoundingClientRect();
    dragRef.current.offsetX = e.clientX - rect.left;
    dragRef.current.offsetY = e.clientY - rect.top;
    e.stopPropagation();
  };

  const handleResizeMouseDown = (e) => {
    dragRef.current.resizing = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.startWidth = pipSize.width;
    dragRef.current.startHeight = pipSize.height;
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    // Drag
    if (dragRef.current.dragging) {
      let newLeft = e.clientX - dragRef.current.offsetX;
      let newTop = e.clientY - dragRef.current.offsetY;

      const winWidth = window.innerWidth - pipSize.width;
      const winHeight = window.innerHeight - pipSize.height;

      newLeft = Math.max(0, Math.min(newLeft, winWidth));
      newTop = Math.max(0, Math.min(newTop, winHeight));

      setDragPos({ left: newLeft, top: newTop });
    }

    // Resize
    if (dragRef.current.resizing) {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      const newWidth = Math.max(100, dragRef.current.startWidth + deltaX);
      const newHeight = Math.max(70, dragRef.current.startHeight + deltaY);
      setPipSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    dragRef.current.dragging = false;
    dragRef.current.resizing = false;
  };

  // ------------------ Peer Connection ------------------
  const initPeerConnection = useCallback(() => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;
    console.log("SETTING CENNECTION@#########");
    
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log("RECEIVED REMOTE STREAM");
      if (!remoteStream) return;

      const attachStream = () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(() => {});
        } else {
          setTimeout(attachStream, 50);
        }
      };
      attachStream();
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
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error("Error setting remote description:", err);
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    socket.on("callEnded", () => endCallLocal());
  }, [socket, selectedFriend.name]);

  // ------------------ Incoming Call ------------------
  useEffect(() => {
    const handleIncomingCall = async () => {
      if (!incomingCallOffer) return;

      console.log("############");
      
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
        console.error("Error handling incoming call:", err);
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
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setInCall(false);
  };
  const endCallLocal = () => stopCall();

  // ------------------ Styles ------------------
  const videoContainerStyle = {
    position: "relative",
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
    width: `${pipSize.width}px`,
    height: `${pipSize.height}px`,
    borderRadius: "8px",
    border: "2px solid white",
    objectFit: "cover",
    zIndex: 9999,
    cursor: "move",
    left: `${dragPos.left}px`,
    top: `${dragPos.top}px`,
  };

  const resizeHandleStyle = {
    position: "absolute",
    width: "12px",
    height: "12px",
    background: "#fff",
    border: "2px solid #000",
    borderRadius: "50%",
    bottom: "-6px",
    right: "-6px",
    cursor: "se-resize",
    zIndex: 10000,
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
        <video ref={remoteVideoRef} autoPlay playsInline style={remoteVideoStyle} />
        <video
          ref={localVideoRef}
          autoPlay
          // muted
          playsInline
          style={localVideoStyle}
          onMouseDown={handleMouseDown}
        >
          <div
            style={resizeHandleStyle}
            onMouseDown={handleResizeMouseDown}
          />
        </video>
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
