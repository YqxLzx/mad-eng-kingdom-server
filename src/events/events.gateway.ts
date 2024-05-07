import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect
} from "@nestjs/websockets"
import { from, Observable } from "rxjs"
import { map } from "rxjs/operators"
//import { Server, Socket } from "ws"
import { Server, Socket } from 'socket.io';

import { v4 as uuidv4 } from 'uuid';

interface IRoom {
  id: string;
  users: string[]; // 如果已匹配，则存储房间名  
}

@WebSocketGateway(8080)
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  rooms: IRoom[] = [];

  handleConnection(client: Socket) {
    // Check if there are available rooms
    const availableRoom = this.rooms.find(room => room.users.length < 2);

    if (availableRoom) {
      // Add user to existing room
      availableRoom.users.push(client.id);
      client.join(availableRoom.id);
      // Notify user about the room they joined
      client.emit('roomJoined', { roomId: client.rooms[1] });
    } else {
      // Create new room
      const newRoom: IRoom = {
        id: uuidv4(),
        users: [client.id],
      };
      this.rooms.push(newRoom);
      client.join(newRoom.id);
      // Notify user about the room they joined
      client.emit('roomCreated', { roomId: client.rooms[1] });
    }


  }

  handleDisconnect(client: Socket) {
    // Remove user from the room
    this.rooms.forEach(room => {
      const index = room.users.indexOf(client.id);
      if (index !== -1) {
        room.users.splice(index, 1);
        client.leave(room.id);
        // Notify other users in the room about the user leaving
        client.to(room.id).emit('userLeft', { userId: client.id });
      }
    });
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    // Handle messages from clients
    // You can implement message handling logic here
  }
}
