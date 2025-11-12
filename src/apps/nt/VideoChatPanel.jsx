/* eslint-disable */
import React, { useRef, useState, useEffect, useCallback } from "react";

const VideoChatPanel = ({ socket, selectedFriend, incomingCallOffer }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pcRef = useRef(null);
  const [inCall, setInCall] = useState(false);

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  // 🔹 Handle incoming call
  useEffect(() => {
    const openMedia = async () => {
      if (!incomingCallOffer) return;
      console.log("###########incoming call offer changed", incomingCallOffer);

      try {
        initPeerConnection();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // set local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // add local tracks
        stream.getTracks().forEach((track) =>
          pcRef.current.addTrack(track, stream)
        );

        // set remote description and create answer
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(incomingCallOffer)
        );
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("answerCall", { to: selectedFriend.name, answer });
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    openMedia();
  }, [incomingCallOffer]);

  // 🔹 Initialize peer connection
  const initPeerConnection = useCallback(() => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

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

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: selectedFriend.name,
          candidate: event.candidate,
        });
      }
    };

    socket.on("callAnswered", async ({ answer }) => {
      console.log("Call answered________");
      try {
        if (!pcRef.current) return;
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (err) {
        console.error("Error setting remote description:", err);
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      try {
        if (!pcRef.current) return;
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    socket.on("callEnded", () => {
      console.log("Remote user ended call");
      endCallLocal();
    });
  }, [socket, selectedFriend.name]);

  const startCall = async () => {
    setInCall(true);
    if (!socket || !selectedFriend || inCall) return;

    initPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
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

  const stopCall = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setInCall(false);
    } else {
      console.log("No stream available on the video element yet.");
    }
  };

  const endCallLocal = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (localVideoRef.current) {
      const stream = localVideoRef.current.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      localVideoRef.current.srcObject = null;
    }
    setInCall(false);
  };

  return (
    <div
      className="video-chat-panel"
      style={{ textAlign: "center", padding: "10px" }}
    >
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "200px", border: "1px solid gray" }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "200px", border: "1px solid gray" }}
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
