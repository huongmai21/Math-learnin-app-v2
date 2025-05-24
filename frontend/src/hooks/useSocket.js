"use client"

import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import io from "socket.io-client"

const useSocket = () => {
  const { token, user } = useSelector((state) => state.auth)
  const socketRef = useRef(null)

  useEffect(() => {
    if (token && user) {
      // Khởi tạo kết nối socket
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
      socketRef.current = io(socketUrl, {
        auth: { token },
        query: { token },
      })

      // Xử lý sự kiện kết nối
      socketRef.current.on("connect", () => {
        console.log("Socket connected")
      })

      // Xử lý lỗi
      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message)
      })

      // Xử lý sự kiện ngắt kết nối
      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason)
      })

      // Dọn dẹp khi component unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect()
        }
      }
    }
  }, [token, user])

  return socketRef.current
}

export default useSocket
