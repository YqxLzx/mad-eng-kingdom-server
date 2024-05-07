import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets"
import { Server, Socket } from "ws" // 注意这里应该使用 socket.io 而不是 ws
import { v4 as uuidv4 } from "uuid"

interface IRoom {
  id: string
  users: { id: string; socket: Socket }[] // 存储客户端的 Socket ID 和 Socket 实例
}

@WebSocketGateway(8080)
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  rooms: IRoom[] = []

  @SubscribeMessage("leaving")
  handleLeaving(@MessageBody() data: { roomId: string; userId: string }) {
    // Find the room
    const roomIndex = this.rooms.findIndex((room) => room.id === data.roomId)
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex]
      // Find the user to remove
      const userIndex = room.users.findIndex((user) => user.id === data.userId)
      if (userIndex !== -1) {
        const removedUser = room.users.splice(userIndex, 1)[0]
        // Notify the leaving user
        removedUser.socket.send(
          JSON.stringify({
            type: "myselfLeft",
            message: "You have left the room.",
          }),
        )
        // Notify other users in the room about the user leaving
        room.users.forEach((user) => {
          if (user.id !== data.userId) {
            user.socket.send(
              JSON.stringify({
                type: "otherLeft",
                message: `${removedUser.id} has left the room.`,
              }),
            )
          }
        })
        //room.users = room.users.filter((user) => user.id !== data.userId)
        removedUser.socket.close()
      }

      // If the room is empty, remove it
      if (room.users.length === 0) {
        this.rooms.splice(roomIndex, 1)
        console.log("Room emptied and removed:", room.id)
      }
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    // Check if there are available rooms
    const availableRoom = this.rooms.find((room) => room.users.length < 2)
    if (availableRoom) {
      // Add user to existing room
      const userId = uuidv4() // 假设我们需要一个唯一的用户ID，而不是直接使用Socket ID
      availableRoom.users.push({ id: userId, socket: client })
      // Notify user about the room they joined
      availableRoom.users.forEach((user) => {
        if (user.id !== userId) {
          user.socket.send(
            JSON.stringify({
              type: "otherJoined",
              message: `${userId} has joined the room.`,
            }),
          )
        } else if (user.id === userId) {
          client.send(
            JSON.stringify({
              type: "roomJoined",
              roomId: availableRoom.id,
              userId,
            }),
          )
        }

      })
    } else {
      // Create new room
      const newRoomId = uuidv4() + "_room"
      const userId = uuidv4()
      const newRoom: IRoom = {
        id: newRoomId,
        users: [{ id: userId, socket: client }],
      }
      this.rooms.push(newRoom)
      // Notify user about the room they joined
      client.send(
        JSON.stringify({ type: "roomCreated", roomId: newRoomId, userId }),
      ) // 使用 emit 而不是 send，因为 send 是 ws 的方法
    }
  }

  handleDisconnect(client: Socket) {
    console.log("close")
  }
}
