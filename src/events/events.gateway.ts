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
  users: {
    id: string
    socket: Socket
    userInfo: { name: string; avatar: string; account: string }
  }[] // 存储客户端的 Socket ID 和 Socket 实例
}

@WebSocketGateway(8080)
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  rooms: IRoom[] = []

  @SubscribeMessage("leaving")
  handleLeaving(@MessageBody() data: { roomId: string; account: string }) {
    // Find the room
    const roomIndex = this.rooms.findIndex((room) => room.id === data.roomId)
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex]
      // Find the user to remove
      const userIndex = room.users.findIndex(
        (user) => user.userInfo.account === data.account,
      )
      if (userIndex !== -1) {
        const removedUser = room.users.splice(userIndex, 1)[0]
        // Notify the leaving user
        removedUser.socket.send(
          JSON.stringify({
            type: "myselfLeft",
            message: "You have left the room.",
          }),
        )

        // If the leaving user is the host, notify all guests
        if (userIndex === 0 && room.users.length > 0) {
          room.users.forEach((user) => {
            user.socket.send(
              JSON.stringify({
                type: "hostLeft",
                message: "The host has left the room.",
              }),
            )
          })
        } else if (room.users.length > 0) {
          // If the leaving user is a guest, notify the host
          room.users[0].socket.send(
            JSON.stringify({
              type: "guestLeft",
              message: `${removedUser.userInfo.name} (${removedUser.userInfo.account}) has left the room.`,
            }),
          )
        }

        // If the room is empty, remove it
        if (room.users.length === 0) {
          this.rooms.splice(roomIndex, 1)
        }
      }
    }
  }

  @SubscribeMessage("joining")
  handleJoining(
    @MessageBody() userData: { name: string; avatar: string; account: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomIndex = this.rooms.findIndex((room) => room.users.length === 1) // 寻找空房间
    if (roomIndex === -1) {
      // 如果没有空房间，创建一个新房间
      const roomId = uuidv4()
      this.rooms.push({
        id: roomId,
        users: [
          {
            id: userData.account,
            socket: client,
            userInfo: {
              name: userData.name,
              avatar: userData.avatar,
              account: userData.account,
            },
          },
        ],
      })
      // 提示房主创建成功
      client.send(
        JSON.stringify({
          type: "createSuccess",
          message: "Room created successfully.",
          roomId: roomId,
        }),
      )
    } else {
      // 如果存在空房间，加入其中
      const room = this.rooms[roomIndex]
      room.users.push({
        id: userData.account,
        socket: client,
        userInfo: {
          name: userData.name,
          avatar: userData.avatar,
          account: userData.account,
        },
      })
      // 提示客人进入成功
      client.send(
        JSON.stringify({
          type: "joinSuccess",
          message: "Joined room successfully.",
          roomId: room.id,
          hostInfo: room.users[0].userInfo,
        }),
      )
      // 提示房主客人进来了
      room.users[0].socket.send(
        JSON.stringify({
          type: "guestEntered",
          message: `${userData.name} (${userData.account}) entered the room.`,
          guestInfo: userData,
          roomId: room.id,
        }),
      )
    }
  }

  handleConnection(client: Socket, ...args: any[]) {}

  handleDisconnect(client: Socket) {
    console.log("to beee close")
  }
}
