/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import io from "socket.io-client";

const Friends = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [friends] = useState(["aden", "rashka"]);
  const [friend, setFriend] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | calling | incoming | in-call
  const [incomingCallOffer, setIncomingCallOffer] = useState(null);
  const [incomingCaller, setIncomingCaller] = useState(null);

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  // Initialize socket once
  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    const socket = io("https://dev.adenali.com", {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    // Incoming call from other peer
    socket.on("incomingCall", ({ from, offer }) => {
      console.log("incomingCall from", from);
      setIncomingCaller(from);
      setIncomingCallOffer(offer);
      setStatus("incoming");
    });

    // Peer answered our call (we were caller)
    socket.on("callAnswered", async ({ answer }) => {
      console.log("callAnswered received");
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setStatus("in-call");
      } catch (err) {
        console.error("Error setting remote description (callAnswered):", err);
      }
    });

    // Incoming ICE candidates from server/remote
    socket.on("iceCandidate", async ({ candidate }) => {
      if (!pcRef.current || !candidate) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    return () => {
      // cleanup socket listeners + disconnect
      socket.off("incomingCall");
      socket.off("callAnswered");
      socket.off("iceCandidate");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // run once

  // Create and wire up a new RTCPeerConnection
  const createPeerConnection = (targetFriend) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    // ontrack: handle remote stream(s)
    pc.ontrack = (event) => {
      // event.streams is preferred when available (most browsers)
      let remoteStream = event.streams && event.streams[0];

      // If event.streams is empty, build a MediaStream from the tracks
      if (!remoteStream) {
        remoteStream = new MediaStream();
        if (event.track) remoteStream.addTrack(event.track);
      }

      // Attach the remote stream only if it's different / not already attached
      const current = remoteVideoRef.current;
      if (current && current.srcObject !== remoteStream) {
        current.srcObject = remoteStream;

        // Ensure play is called after metadata is loaded so play() isn't interrupted
        const onLoaded = () => {
          current.play().catch((err) => {
            // Not fatal — log for debugging
            console.log("remote play() error (may be autoplay policy):", err);
          });
          current.removeEventListener("loadedmetadata", onLoaded);
        };
        current.addEventListener("loadedmetadata", onLoaded);
      }
    };

    // Send ICE candidates to remote through your signaling server
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("iceCandidate", {
          to: targetFriend,
          candidate: event.candidate,
        });
      }
    };

    // Optional: connection state logging
    pc.onconnectionstatechange = () => {
      console.log("PC state:", pc.connectionState);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        // Consider ending call
      }
    };

    return pc;
  };

  // Stop and cleanup local stream + RTCPeerConnection
  const endCall = () => {
    setFriend(null);
    setIncomingCallOffer(null);
    setIncomingCaller(null);
    setStatus("idle");

    // stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // stop remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // close pc
    if (pcRef.current) {
      try {
        pcRef.current.getSenders()?.forEach((s) => {
          // optionally replaceTrack(null) for graceful stop
        });
      } catch {}
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }

    // Tell remote we ended (optional depending on your server)
    if (socketRef.current && friend) {
      socketRef.current.emit("callEnded", { to: friend });
    }
  };

  // Caller: start a call to friend
  const startCall = async (toFriend) => {
    setFriend(toFriend);
    setStatus("calling");

    try {
      const pc = createPeerConnection(toFriend);

      // get local media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // add tracks to pc
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // send to signaling server
      socketRef.current.emit("callUser", {
        to: toFriend,
        offer,
        from: sessionStorage.getItem("userName"),
      });
    } catch (err) {
      console.error("startCall error:", err);
      endCall();
    }
  };

  // Callee: accept incoming call
  const handleIncomingCall = async () => {
    if (!incomingCallOffer || !incomingCaller) return;
    setFriend(incomingCaller);

    try {
      const pc = createPeerConnection(incomingCaller);

      // get local media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // add tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // set remote offer & create answer
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // send answer
      socketRef.current.emit("answerCall", { to: incomingCaller, answer });

      setStatus("in-call");
      setIncomingCallOffer(null);
      setIncomingCaller(null);
    } catch (err) {
      console.error("handleIncomingCall error:", err);
      endCall();
    }
  };

  // Small helper to render buttons per state
  const renderControls = () => {
    if (status === "idle") {
      return (
        <div>
          {friends.map((f) => (
            <button key={f} onClick={() => startCall(f)}>
              Call {f}
            </button>
          ))}
        </div>
      );
    }

    if (status === "calling") {
      return (
        <div>
          <p>Calling {friend}...</p>
          <button onClick={endCall}>Cancel</button>
        </div>
      );
    }

    if (status === "incoming") {
      return (
        <div>
          <p>{incomingCaller} is calling...</p>
          <button onClick={handleIncomingCall}>Accept</button>
          <button
            onClick={() => {
              // optionally notify server about rejection
              setIncomingCallOffer(null);
              setIncomingCaller(null);
              setStatus("idle");
            }}
          >
            Decline
          </button>
        </div>
      );
    }

    if (status === "in-call") {
      return (
        <div>
          <p>In call with {friend}</p>
          <button onClick={endCall}>End Call</button>
        </div>
      );
    }

    return null;
  };

  const localVideoStyle = {
    width: "200px",
    height: "140px",
    borderRadius: "8px",
    objectFit: "cover",
  };

  return (
    <div className="friends-container">
      <h1>Friends</h1>
      <p>This is the UserFriends component.</p>

      {renderControls()}

      <div style={{ position: "relative", marginTop: 12 }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={localVideoStyle}
        />
      </div>

      <hr />

      <h2>Remote</h2>
      <div style={{ width: "640px", height: "360px", background: "#000" }}>
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
};

export default Friends;
