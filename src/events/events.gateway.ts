import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets"
import { Server, Socket } from "ws"
import { v4 as uuidv4 } from "uuid"
import { WordsService } from "src/words/words.service"
import { Word } from "src/words/word.entity"

interface IRoom {
  id: string
  quizzes: Question[]
  users: {
    id: string
    socket: Socket
    userInfo: { name: string; avatar: string; account: string }
    selectedOption: number[]; // 存储用户选择的选项
  }[] // 存储客户端的 Socket ID 和 Socket 实例
}


type Question = {
  type: string,
  options: string[];
  word: string;
  zh: string;
  correctIndex: number;
  tittle?: string;
  description?: string;
};


const questions: Question[] = [
  {
    "type": "translate:en-zh",
    "word": "unify",
    "zh": "v. 统一, 使成一体",
    "options": [
      "v. 统一, 使",
      "n. 茶碟, 茶",
      "pron. 她的",
      "a. 遥远的, "
    ],
    "correctIndex": 0
  },
  {
    "type": "translate:en-zh",
    "word": "biology",
    "zh": "n. 生物学\\n[化] 生物; 生物学",
    "options": [
      "n. 生物学\\n",
      "n. 肝脏, 生",
      "n. 打字机",
      "n. 船货, 运"
    ],
    "correctIndex": 0
  },
  {
    "type": "translate:en-zh",
    "word": "senior",
    "zh": "n. 年长者, 资深者, 毕业班学生\\na. 年长的, 高级的, 资深的",
    "options": [
      "n. 升, 公升",
      "n. 大气, 空",
      "n. 汉堡(德国",
      "n. 年长者, "
    ],
    "correctIndex": 3
  },
  {
    "type": "translate:en-zh",
    "word": "roundabout",
    "zh": "a. 迂回的, 委婉的\\nn. 迂回路线",
    "options": [
      "a. 迂回的, ",
      "n. 硬件, 五",
      "a. 敌人的, ",
      "n. 课, 课业"
    ],
    "correctIndex": 0
  },
  {
    "type": "translate:en-zh",
    "word": "delicate",
    "zh": "a. 细致优雅的, 微妙的, 美味的\\n[医] 柔弱的",
    "options": [
      "a. 细致优雅的",
      "n. 咒骂, 诅",
      "n. 交通, 通",
      "vt. 占领, "
    ],
    "correctIndex": 0
  },
  {
    "type": "translate:en-zh",
    "word": "forge",
    "zh": "n. 熔炉, 铁工厂\\nvt. 打制, 锻造, 伪造\\nvi. 锻造, 伪造",
    "options": [
      "n. 价格, 代",
      "vt. 描绘..",
      "vt. 假定, ",
      "n. 熔炉, 铁"
    ],
    "correctIndex": 3
  },
  {
    "type": "translate:en-zh",
    "word": "advantage",
    "zh": "n. 优点, 便利, 好处, 优势\\nvt. 有助于",
    "options": [
      "n. 氧\\n[化",
      "a. 笔直的, ",
      "n. 实在, 事",
      "n. 优点, 便"
    ],
    "correctIndex": 3
  },
  {
    "type": "translate:en-zh",
    "word": "baseball",
    "zh": "n. 棒球\\n[计] 棒球系统",
    "options": [
      "n. 棒球\\n[",
      "vi. 繁荣, ",
      "n. 生产力\\n",
      "a. 赤裸的, "
    ],
    "correctIndex": 0
  },
  {
    "type": "translate:en-zh",
    "word": "learn",
    "zh": "vt. 学习；认识到；得知",
    "options": [
      "a. 非常的, ",
      "vt. 学习；认",
      "n. 个性, 字",
      "n. 现在, 现"
    ],
    "correctIndex": 1
  },
  {
    "type": "translate:en-zh",
    "word": "anniversary",
    "zh": "n. 周年纪念",
    "options": [
      "a. 连续的, ",
      "n. 周年纪念",
      "a. 错误的, ",
      "a. 音频的, "
    ],
    "correctIndex": 1
  }
]


@WebSocketGateway(8080)
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly wordService: WordsService) { }


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
  async handleJoining(
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
            selectedOption: []
          },
        ],
        quizzes: []
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
        selectedOption: []
      })
      // 开始游戏
      const questions = await this.startGame(room);
      // 提示客人进入成功
      client.send(
        JSON.stringify({
          type: "joinSuccess",
          message: "Joined room successfully.",
          roomId: room.id,
          hostInfo: room.users[0].userInfo,
          questions
        }),
      )
      // 提示房主客人进来了
      room.users[0].socket.send(
        JSON.stringify({
          type: "guestEntered",
          message: `${userData.name} (${userData.account}) entered the room.`,
          guestInfo: userData,
          roomId: room.id,
          questions
        }),
      )
    }
  }


  async startGame(room: IRoom) {
    const questions: Question[] = [];
    const res = await this.wordService.getAnyWords(10);
    for (let index = 0; index < res.length; index++) {
      const word = res[index];
      const wordsAsOptions = await this.wordService.getAnyWords(30);
      const startIndex = index * 3;
      const endIndex = startIndex + 3;
      const randomWords = wordsAsOptions.slice(startIndex, endIndex);
      const question = generateQuestion(word, randomWords);
      questions.push(question);
    }
    room.quizzes = questions;
    return questions;
  }

  handleConnection(client: Socket, ...args: any[]) { }

  handleDisconnect(client: Socket) {
    console.log("to beeeeee close")
  }

}


function generateQuestion(word: Word, optionItems: Word[]) {
  const [options, correctIndex] = insertRandomElement(
    optionItems.map((item) => item.translation),
    word.translation
  );
  const question = {
    type: "translate:en-zh",
    word: word.word,
    zh: word.translation,
    options: options.map(option => option.substring(0, 8)),
    correctIndex,
  };
  return question;
}

function insertRandomElement(
  arr: string[],
  element: string
): [string[], number] {
  // 随机生成一个插入位置的索引
  const index = Math.floor(Math.random() * (arr.length + 1));

  // 将新元素插入数组
  arr.splice(index, 0, element);

  // 返回被插入元素的索引
  return [arr, index];
}