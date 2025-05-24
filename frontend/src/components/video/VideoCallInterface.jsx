"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import "./VideoCallInterface.css"

const VideoCallInterface = forwardRef(({ roomId, participants, user, onEndCall }, ref) => {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({})
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeSpeaker, setActiveSpeaker] = useState(null)
  const [layout, setLayout] = useState("grid") // grid, spotlight

  const localVideoRef = useRef(null)
  const screenShareRef = useRef(null)
  const peerConnections = useRef({})
  const containerRef = useRef(null)

  const socket = useSelector((state) => state.socket)

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    endCall: () => {
      stopLocalStream()
      onEndCall()
    },
    toggleMute: () => toggleMute(),
    toggleVideo: () => toggleVideo(),
    toggleScreenShare: () => toggleScreenShare(),
  }))

  // Initialize video call
  useEffect(() => {
    if (!roomId || !user || !socket) return

    // Join video call room
    socket.emit("join_video_call", { roomId, userId: user._id, username: user.username })

    // Start local stream
    startLocalStream()

    // Listen for new participants
    socket.on("user_joined_video", handleUserJoined)

    // Listen for offer
    socket.on("video_offer", handleVideoOffer)

    // Listen for answer
    socket.on("video_answer", handleVideoAnswer)

    // Listen for ICE candidate
    socket.on("ice_candidate", handleIceCandidate)

    // Listen for user left
    socket.on("user_left_video", handleUserLeft)

    return () => {
      stopLocalStream()
      socket.off("user_joined_video")
      socket.off("video_offer")
      socket.off("video_answer")
      socket.off("ice_candidate")
      socket.off("user_left_video")
    }
  }, [roomId, user, socket])

  // Start local stream
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Notify other participants
      if (socket) {
        participants.forEach((participant) => {
          if (participant._id !== user._id) {
            createPeerConnection(participant._id, stream)
          }
        })
      }
    } catch (error) {
      console.error("Error accessing media devices:", error)
      toast.error("Không thể truy cập camera hoặc microphone")
    }
  }

  // Stop local stream
  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }

    // Close all peer connections
    Object.values(peerConnections.current).forEach((pc) => pc.close())
    peerConnections.current = {}
    setRemoteStreams({})
  }

  // Create peer connection
  const createPeerConnection = (peerId, stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    })

    // Add local stream
    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    // Handle ICE candidate
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", {
          roomId,
          candidate: event.candidate,
          to: peerId,
          from: user._id,
        })
      }
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [peerId]: event.streams[0],
      }))
    }

    // Create offer
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => {
        socket.emit("video_offer", {
          roomId,
          offer: pc.localDescription,
          to: peerId,
          from: user._id,
        })
      })
      .catch((error) => {
        console.error("Error creating offer:", error)
        toast.error("Lỗi kết nối video")
      })

    peerConnections.current[peerId] = pc
    return pc
  }

  // Handle user joined
  const handleUserJoined = ({ userId, username }) => {
    if (userId !== user._id && localStream) {
      createPeerConnection(userId, localStream)
      toast.info(`${username} đã tham gia cuộc gọi video`)
    }
  }

  // Handle video offer
  const handleVideoOffer = async ({ offer, from }) => {
    if (from === user._id) return

    let pc = peerConnections.current[from]

    if (!pc && localStream) {
      pc = createPeerConnection(from, localStream)
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    socket.emit("video_answer", {
      roomId,
      answer,
      to: from,
      from: user._id,
    })
  }

  // Handle video answer
  const handleVideoAnswer = async ({ answer, from }) => {
    const pc = peerConnections.current[from]

    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
    }
  }

  // Handle ICE candidate
  const handleIceCandidate = ({ candidate, from }) => {
    const pc = peerConnections.current[from]

    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(candidate))
    }
  }

  // Handle user left
  const handleUserLeft = ({ userId, username }) => {
    const pc = peerConnections.current[userId]

    if (pc) {
      pc.close()
      delete peerConnections.current[userId]
    }

    setRemoteStreams((prev) => {
      const newStreams = { ...prev }
      delete newStreams[userId]
      return newStreams
    })

    toast.info(`${username} đã rời khỏi cuộc gọi video`)
  }

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenShareRef.current && screenShareRef.current.srcObject) {
        screenShareRef.current.srcObject.getTracks().forEach((track) => track.stop())
        screenShareRef.current.srcObject = null
      }
      setIsScreenSharing(false)
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })

        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream
        }

        // Add screen track to all peer connections
        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video")
          if (sender) {
            sender.replaceTrack(screenStream.getVideoTracks()[0])
          }
        })

        // Listen for end of screen sharing
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare()
        }

        setIsScreenSharing(true)
      } catch (error) {
        console.error("Error sharing screen:", error)
        toast.error("Không thể chia sẻ màn hình")
      }
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen()
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }

    setIsFullscreen(!isFullscreen)
  }

  // Toggle layout
  const toggleLayout = () => {
    setLayout(layout === "grid" ? "spotlight" : "grid")
  }

  // Find active speaker
  useEffect(() => {
    if (!localStream) return

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const microphone = audioContext.createMediaStreamSource(localStream)
    microphone.connect(analyser)
    analyser.fftSize = 512
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    let speakingDetectionInterval

    const detectSpeaking = () => {
      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength
      if (average > 100) {
        setActiveSpeaker(user._id)
      } else {
        setActiveSpeaker(null)
      }
    }

    speakingDetectionInterval = setInterval(detectSpeaking, 100)

    return () => {
      clearInterval(speakingDetectionInterval)
      audioContext.close()
    }
  }, [localStream])

  return (
    <div className="video-call-interface" ref={containerRef}>
      <div className={`video-grid ${layout}`}>
        {/* Local video */}
        <div className="video-container local-video">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <div className="video-label">
            {user.username} {isScreenSharing ? "(Đang chia sẻ màn hình)" : ""}
          </div>
        </div>

        {/* Remote videos */}
        {Object.entries(remoteStreams).map(([participantId, stream]) => {
          const participant = participants.find((p) => p._id === participantId)
          if (!participant) return null

          return (
            <div
              key={participantId}
              className={`video-container remote-video ${activeSpeaker === participantId ? "active-speaker" : ""}`}
            >
              <video
                autoPlay
                playsInline
                ref={(videoEl) => {
                  if (videoEl && stream) {
                    videoEl.srcObject = stream
                  }
                }}
              />
              <div className="video-label">{participant.username}</div>
            </div>
          )
        })}
      </div>

      <div className="video-controls">
        <button
          className={`control-button ${isMuted ? "active" : ""}`}
          onClick={toggleMute}
          title={isMuted ? "Bật microphone" : "Tắt microphone"}
        >
          <i className={`fas ${isMuted ? "fa-microphone-slash" : "fa-microphone"}`}></i>
        </button>

        <button
          className={`control-button ${isVideoOff ? "active" : ""}`}
          onClick={toggleVideo}
          title={isVideoOff ? "Bật camera" : "Tắt camera"}
        >
          <i className={`fas ${isVideoOff ? "fa-video-slash" : "fa-video"}`}></i>
        </button>

        <button
          className={`control-button ${isScreenSharing ? "active" : ""}`}
          onClick={toggleScreenShare}
          title={isScreenSharing ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"}
        >
          <i className="fas fa-desktop"></i>
        </button>

        <button
          className="control-button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
        >
          <i className={`fas ${isFullscreen ? "fa-compress" : "fa-expand"}`}></i>
        </button>

        <button
          className="control-button"
          onClick={toggleLayout}
          title={layout === "grid" ? "Chuyển sang bố cục spotlight" : "Chuyển sang bố cục grid"}
        >
          <i className={`fas ${layout === "grid" ? "fa-columns" : "fa-user-circle"}`}></i>
        </button>

        <button className="control-button end-call" onClick={onEndCall} title="Kết thúc cuộc gọi">
          <i className="fas fa-phone-slash"></i>
        </button>
      </div>
    </div>
  )
})

export default VideoCallInterface
