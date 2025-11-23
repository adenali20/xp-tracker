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
  const [remoteMuted, setRemoteMuted] = useState(true);
  const [inCall, setInCall] = useState(false);

  // NOTE: put a TURN server here for production if you have one
  const servers = {
    // keep relay if you want forced TURN; remove/adjust if you want STUN+TURN fallback
    iceTransportPolicy: "relay",
    iceServers: [
      {
        urls: [
          // UDP fallbacks (common), then TCP and TLS
          "turn:global.relay.metered.ca:3478?transport=udp",
          "turn:global.relay.metered.ca:80?transport=udp",
          "turn:global.relay.metered.ca:443?transport=tcp",
          "turns:global.relay.metered.ca:443?transport=tcp" // TLS fallback
        ],
        username: "44c31ceccfa165e958e6d7b0",
        credential: "u+cYRNuJyt6Vvdc3",
      }
    ],
  };

  // ---------- Helper: dump getStats ----------
  const dumpStats = async (label = "") => {
    if (!pcRef.current) {
      console.log("[STATS] no pc to dump stats for", label);
      return;
    }
    try {
      const stats = await pcRef.current.getStats();
      console.log(`[STATS] dump start (${label})`);
      stats.forEach((r) => {
        if (r.type === "candidate-pair" && r.state === "succeeded") {
          console.log("[STATS] succeeded candidate-pair:", r);
        }
        if (r.type === "local-candidate" || r.type === "remote-candidate") {
          console.log(`[STATS] ${r.type}:`, r);
        }
      });
      console.log(`[STATS] dump end (${label})`);
    } catch (e) {
      console.error("[STATS] getStats error:", e);
    }
  };

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

    socket.on("incomingCall", ({ from, offer }) => {
      console.log("[SIGNAL] incomingCall from", from);
      setIncomingCaller(from);
      setIncomingCallOffer(offer);
      setStatus("incoming");
    });

    socket.on("callAnswered", async ({ answer }) => {
      console.log("[SIGNAL] callAnswered received");
      if (!pcRef.current) {
        console.warn("[SIGNAL] received answer but no pcRef");
        return;
      }
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setStatus("in-call");
        setInCall(true);
        // small delay then dump stats
        setTimeout(() => dumpStats("after callAnswered"), 1500);
      } catch (err) {
        console.error("[SIGNAL] Error setting remote description (callAnswered):", err);
      }
    });

    // Remote ICE candidates incoming from signaling server
    socket.on("iceCandidate", async ({ candidate, from }) => {
      console.log("[SIGNAL] received iceCandidate from", from, candidate && candidate.candidate);
      if (!pcRef.current) {
        console.warn("[SIGNAL] No pcRef when remote candidate arrives - buffering not implemented");
        return;
      }
      if (!candidate) {
        console.warn("[SIGNAL] remote candidate is null/empty");
        return;
      }
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("[PC] addIceCandidate OK");
      } catch (err) {
        console.error("[PC] addIceCandidate ERROR:", err, candidate);
      }
    });

    socket.on("callEnded", () => {
      console.log("[SIGNAL] callEnded received from remote");
      endCall();
    });

    // cleanup
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

  // Create and wire up a new RTCPeerConnection
  const createPeerConnection = (targetFriend) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    // ontrack: handle remote stream(s) — attach only once on video track
    pc.ontrack = (event) => {
      try {
        console.log("[PC] ontrack fired with:", event.track?.kind, "streams:", event.streams);
        // prefer event.streams[0] when available
        let remoteStream = (event.streams && event.streams[0]) || null;

        // if streams empty, construct from track
        if (!remoteStream) {
          remoteStream = new MediaStream();
          if (event.track) remoteStream.addTrack(event.track);
        }

        const videoEl = remoteVideoRef.current;
        if (!videoEl) return;

        // Only attach when the video track arrives (prevents replacing srcObject on audio track)
        if (event.track && event.track.kind === "video") {
          if (videoEl.srcObject !== remoteStream) {
            console.log("[PC] ### attaching remote VIDEO stream");
            videoEl.srcObject = remoteStream;
            // ensure element remains mounted (we hide/show it with CSS)
            setInCall(true);

            // use rAF + small timeout to avoid race/play interruption
            requestAnimationFrame(() => {
              setTimeout(() => {
                // attempt to play; if blocked by autoplay, user must unmute/interact
                videoEl.play().catch((err) => {
                  console.warn("[PC] video play error (may be autoplay):", err);
                });
              }, 40);
            });
          }
        } else {
          // If event.track.kind === 'audio' and video already attached this is fine.
          console.log("[PC] audio track arrived");
        }
      } catch (e) {
        console.error("[PC] ontrack handler error:", e);
      }
    };

    // Send ICE candidates to remote through your signaling server
    pc.onicecandidate = (event) => {
      console.log("[PC] onicecandidate event:", event && event.candidate && event.candidate.candidate);
      if (event.candidate && socketRef.current) {
        console.log("[PC] emitting local ICE candidate ->", event.candidate.candidate, " to:", targetFriend);
        socketRef.current.emit("iceCandidate", {
          to: targetFriend,
          candidate: event.candidate,
          from: sessionStorage.getItem("userName"),
        });
      } else {
        console.log("[PC] candidate is null (gathering complete)");
      }
    };

    pc.onicecandidateerror = (ev) => {
      console.error("[PC] onicecandidateerror:", ev);
    };

    pc.onicegatheringstatechange = () => {
      console.log("[PC] iceGatheringState:", pc.iceGatheringState);
    };

    pc.onconnectionstatechange = () => {
      console.log("[PC] connectionState:", pc.connectionState);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        // consider ending call or restarting ICE
        console.warn("[PC] connectionState indicates problem:", pc.connectionState);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[PC] iceConnectionState:", pc.iceConnectionState);
    };

    return pc;
  };

  // Stop and cleanup local stream + RTCPeerConnection
  const endCall = () => {
    console.log("[APP] Ending call and cleaning up");
    const prevFriend = friend;
    setFriend(null);
    setIncomingCallOffer(null);
    setIncomingCaller(null);
    setStatus("idle");
    setInCall(false);

    // stop local tracks
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.warn("[APP] error stopping local tracks", e);
      }
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      try {
        localVideoRef.current.srcObject = null;
      } catch (e) {}
    }

    // stop remote video
    if (remoteVideoRef.current) {
      try {
        remoteVideoRef.current.srcObject = null;
      } catch (e) {}
    }

    // close pc
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (e) {
        console.warn("[APP] error closing pc", e);
      }
      pcRef.current = null;
    }

    // Tell remote we ended (optional depending on your server)
    if (socketRef.current && prevFriend) {
      try {
        socketRef.current.emit("callEnded", { to: prevFriend });
      } catch (e) {}
    }
  };

  // Caller: start a call to friend
  const startCall = async (toFriend) => {
    setFriend(toFriend);
    setStatus("calling");

    try {
      const pc = createPeerConnection(toFriend);

      // IMPORTANT: getUserMedia BEFORE creating offer so tracks are present in offer
      const constraints = { video: { facingMode: "user" }, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // add tracks to pc BEFORE createOffer
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      console.log("[APP] Local tracks:", stream.getTracks().map((t) => t.kind));
      console.log("[APP] pc senders after addTrack:", pc.getSenders().map((s) => s.track?.kind));

      // create offer AFTER tracks added
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // send to signaling server
      if (socketRef.current) {
        socketRef.current.emit("callUser", {
          to: toFriend,
          offer,
          from: sessionStorage.getItem("userName"),
        });
      }
    } catch (err) {
      console.error("[APP] startCall error:", err);
      endCall();
    }
  };

  // Callee: accept incoming call
  const handleIncomingCall = async () => {
    if (!incomingCallOffer || !incomingCaller) return;
    setFriend(incomingCaller);

    try {
      const pc = createPeerConnection(incomingCaller);

      // IMPORTANT: getUserMedia BEFORE setRemoteDescription/createAnswer
      const constraints = { video: { facingMode: "user" }, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // add tracks BEFORE createAnswer
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      console.log("[APP] Local tracks (callee):", stream.getTracks().map((t) => t.kind));
      console.log("[APP] pc senders after addTrack (callee):", pc.getSenders().map((s) => s.track?.kind));

      // set remote offer & create answer
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // send answer
      if (socketRef.current) {
        socketRef.current.emit("answerCall", { to: incomingCaller, answer });
      }

      setStatus("in-call");
      setIncomingCallOffer(null);
      setIncomingCaller(null);
      setInCall(true);

      // dump stats slightly after connecting
      setTimeout(() => dumpStats("after handleIncomingCall"), 1500);
    } catch (err) {
      console.error("[APP] handleIncomingCall error:", err);
      endCall();
    }
  };

  // Unmute remote audio (user gesture required for many browsers)
  const unmuteRemote = () => {
    setRemoteMuted(false);
    try {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.play().catch((err) => console.log("[APP] play after unmute error:", err));
      }
    } catch (e) {
      console.warn("[APP] unmuteRemote error:", e);
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
          {remoteMuted && (
            <button onClick={unmuteRemote} style={{ marginLeft: 8 }}>
              Unmute Remote Audio
            </button>
          )}
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
    background: "black",
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
      <div style={{ width: "640px", height: "360px", background: "#000" }}>
        {/* Remote video is always mounted (do NOT conditionally mount) — we hide it via CSS.
            It's muted initially (remoteMuted) to improve autoplay reliability. */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={remoteMuted}
          // show/hide visually instead of unmounting to avoid play() interruption
          style={{
            width: "640px",
            height: "360px",
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

export default Friends;
