/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import io from "socket.io-client";

const UserFriends = () => {
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
  const [remoteMuted, setRemoteMuted] = useState(true);
  const [inCall, setInCall] = useState(false);

  // TURN config: TCP-only to ensure connection even on UDP-blocked networks
  const servers = {
    iceTransportPolicy: "all", // allow both P2P and relay
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302" // public STUN server
      },
      {
        urls: "turn:138.68.247.139:3478",
        username: "turnuser",
        credential: "turnpassword",
      }
    ]
  };


  // Initialize socket
  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    const socket = io("https://dev.adenali.com", {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("incomingCall", ({ from, offer }) => {
      console.log("[SIGNAL] incomingCall from", from);
      setIncomingCaller(from);
      setIncomingCallOffer(offer);
      setStatus("incoming");
    });

    socket.on("callAnswered", async ({ answer }) => {
      console.log("[SIGNAL] callAnswered received");
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setStatus("in-call");
        setInCall(true);

        // Dump ICE stats for debugging
        dumpStats();
      } catch (err) {
        console.error("Error setting remote description (callAnswered):", err);
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (!pcRef.current || !candidate) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("[PC] addIceCandidate OK");
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    socket.on("callEnded", () => {
      console.log("[SIGNAL] callEnded received from remote");
      endCall();
    });

    return () => {
      try {
        socket.off("incomingCall");
        socket.off("callAnswered");
        socket.off("iceCandidate");
        socket.off("callEnded");
        socket.disconnect();
      } catch (e) {}
      socketRef.current = null;
    };
  }, []);

  // Create peer connection
  const createPeerConnection = (targetFriend) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      console.log("[PC] ontrack fired with:", event.track?.kind, "streams:", event.streams);
      let remoteStream = (event.streams && event.streams[0]) || null;

      if (!remoteStream) {
        remoteStream = new MediaStream();
        if (event.track) remoteStream.addTrack(event.track);
      }

      const videoEl = remoteVideoRef.current;
      if (!videoEl) return;

      if (event.track && event.track.kind === "video") {
        if (videoEl.srcObject !== remoteStream) {
          console.log("[PC] ### attaching remote VIDEO stream");
          videoEl.srcObject = remoteStream;
          setInCall(true);

          requestAnimationFrame(() => {
            setTimeout(() => {
              videoEl.play().catch((err) => {
                console.warn("video play error (may be autoplay):", err);
              });
            }, 40);
          });
        }
      } else {
        console.log("[PC] audio track arrived");
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log("[PC] emitting local ICE candidate");
        socketRef.current.emit("iceCandidate", {
          to: targetFriend,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[PC] iceConnectionState:", pc.iceConnectionState);
      if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        console.warn("[PC] connection failed/disconnected");
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[PC] connectionState:", pc.connectionState);
    };

    pc.onicecandidateerror = (err) => {
      console.error("[PC] onicecandidateerror:", err);
    };

    pc.onicegatheringstatechange = () => {
      console.log("[PC] iceGatheringState:", pc.iceGatheringState);
    };

    return pc;
  };

  const endCall = () => {
    console.log("[PC] Ending call and cleaning up");
    const prevFriend = friend;
    setFriend(null);
    setIncomingCallOffer(null);
    setIncomingCaller(null);
    setStatus("idle");
    setInCall(false);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (socketRef.current && prevFriend) {
      socketRef.current.emit("callEnded", { to: prevFriend });
    }
  };

  const startCall = async (toFriend) => {
    setFriend(toFriend);
    setStatus("calling");

    try {
      const pc = createPeerConnection(toFriend);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit("callUser", {
          to: toFriend,
          offer,
          from: sessionStorage.getItem("userName"),
        });
      }
    } catch (err) {
      console.error("[PC] startCall error:", err);
      endCall();
    }
  };

  const handleIncomingCall = async () => {
    if (!incomingCallOffer || !incomingCaller) return;
    setFriend(incomingCaller);

    try {
      const pc = createPeerConnection(incomingCaller);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit("answerCall", { to: incomingCaller, answer });
      }

      setStatus("in-call");
      setIncomingCallOffer(null);
      setIncomingCaller(null);
      setInCall(true);
    } catch (err) {
      console.error("[PC] handleIncomingCall error:", err);
      endCall();
    }
  };

  const unmuteRemote = () => {
    setRemoteMuted(false);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(err => console.warn("play after unmute error:", err));
    }
  };

  const renderControls = () => {
    if (status === "idle") {
      return <div>{friends.map(f => <button key={f} onClick={() => startCall(f)}>Call {f}</button>)}</div>;
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
          <button onClick={() => { setIncomingCaller(null); setIncomingCallOffer(null); setStatus("idle"); }}>Decline</button>
        </div>
      );
    }
    if (status === "in-call") {
      return (
        <div>
          <p>In call with {friend}</p>
          <button onClick={endCall}>End Call</button>
          {remoteMuted && <button onClick={unmuteRemote} style={{ marginLeft: 8 }}>Unmute Remote Audio</button>}
        </div>
      );
    }
    return null;
  };

  const localVideoStyle = { width: 200, height: 140, borderRadius: 8, objectFit: "cover", background: "black" };

  const dumpStats = async () => {
    if (!pcRef.current) return;
    try {
      console.log("[STATS] dump start");
      const stats = await pcRef.current.getStats();
      stats.forEach(report => {
        if (report.type.includes("candidate")) {
          console.log("[STATS] candidate:", report);
        }
      });
      console.log("[STATS] dump end");
    } catch (err) {
      console.warn("[STATS] dump error:", err);
    }
  };

  return (
    <div className="friends-container">
      <h1>Friends</h1>
      <p>This is the UserFriends component.</p>

      {renderControls()}

      <div style={{ position: "relative", marginTop: 12 }}>
        <video ref={localVideoRef} autoPlay playsInline muted style={localVideoStyle} />
      </div>

      <hr />

      <h2>Remote</h2>
      <div style={{ width: 640, height: 360, background: "#000" }}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={remoteMuted}
          style={{
            width: 640,
            height: 360,
            background: "black",
            objectFit: "cover",
            zIndex: 10,
            position: "relative",
            display: inCall ? "block" : "none",
          }}
        />
      </div>
    </div>
  );
};

export default UserFriends;
