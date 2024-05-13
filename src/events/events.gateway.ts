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
  currentQuestionIndex: number
  users: {
    score: number
    id: string
    socket: Socket
    userInfo: { name: string; avatar: string; account: string }
    selectedOption: number[] // 存储用户选择的选项
  }[] // 存储客户端的 Socket ID 和 Socket 实例
  downTimer?: {
    instance: NodeJS.Timeout
    time: number
  }
}

type Question = {
  type: string
  options: string[]
  word: string
  zh: string
  correctIndex: number
  tittle?: string
  description?: string
}

@WebSocketGateway(8080)
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly wordService: WordsService) {}

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
        currentQuestionIndex: 0,
        users: [
          {
            id: userData.account,
            score: 0,
            socket: client,
            userInfo: {
              name: userData.name,
              avatar: userData.avatar,
              account: userData.account,
            },
            selectedOption: [],
          },
        ],
        downTimer: {
          instance: null,
          time: 10,
        },
        quizzes: [],
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
        score: 0,
        userInfo: {
          name: userData.name,
          avatar: userData.avatar,
          account: userData.account,
        },
        selectedOption: [],
      })
      // 开始游戏
      const questions = await this.startGame(room)
      // 提示客人进入成功
      client.send(
        JSON.stringify({
          type: "joinSuccess",
          message: "Joined room successfully.",
          roomId: room.id,
          hostInfo: room.users[0].userInfo,
          //questions: [questions[0]],
        }),
      )
      // 提示房主客人进来了
      room.users[0].socket.send(
        JSON.stringify({
          type: "guestEntered",
          message: `${userData.name} (${userData.account}) entered the room.`,
          guestInfo: userData,
          roomId: room.id,
          //questions: [questions[0]],
        }),
      )

      // 发送第一题
      setTimeout(() => {
        this.sendQuestionToRoom(room, questions[0])
      }, 3000)

      //this.setTimerToRoom(room)

      setTimeout(() => {
        //clearInterval(room.downTimer.instance)
        room.downTimer.time = 10
      }, 1000 * 101)
    }
  }

  // 处理用户选择答案的消息
  @SubscribeMessage("selectOption")
  // 在处理用户选择答案的方法中
  handleSelectOption(
    @MessageBody()
    data: {
      roomId: string
      account: string
      selectedOptionIndex: number
    },
  ) {
    const room = this.rooms.find((room) => room.id === data.roomId)
    if (!room) {
      return // 房间不存在
    }
    const user = room.users.find(
      (user) => user.userInfo.account === data.account,
    )
    if (!user) {
      return // 用户不存在
    }

    user.selectedOption.push(data.selectedOptionIndex)

/*     const userTimeOut = setTimeout(() => {
      this.evaluateAnswers(room)
    }, 1000 * 10) */

    // 检查是否所有用户都已经选择了答案
    const allUsersAnswered = room.users.every(
      (user) => user.selectedOption.length > 0,
    )
    if (allUsersAnswered) {
      user.socket.send(
        JSON.stringify({
          type: "allUsersAnswered",
          myselfScore: this.evaluateAnswer(
            room,
            user,
            data.selectedOptionIndex,
          ),
          otherScore: this.getOtherUser(room, data.account).score,
        }),
      )
      this.evaluateAnswers(room)
      clearTimeout(userTimeOut)
    } else {
      // 告知用户等待对手的选择
      user.socket.send(
        JSON.stringify({
          type: "waiting",
          message: "Please wait for your opponent's choice.",
          myselfScore: this.evaluateAnswer(
            room,
            user,
            data.selectedOptionIndex,
          ),
        }),
      )
    }
  }

  getOtherUser(room: IRoom, account: string) {
    return room.users.find((user) => user.userInfo.account !== account)
  }

  evaluateAnswer(room: IRoom, user, selectedOptionIndex: number) {
    const currentQuestion = room.quizzes[room.currentQuestionIndex]
    if (!currentQuestion) {
      return // 当前题目不存在，可能已经完成了所有题目
    }
    if (selectedOptionIndex === currentQuestion.correctIndex) {
      user.score += 100
      return user.score
    } else {
      return user.score
    }
  }
  // 评估答案并更新用户的分数
  evaluateAnswers(room: IRoom) {
    const currentQuestion = room.quizzes[room.currentQuestionIndex]
    if (!currentQuestion) {
      return // 当前题目不存在，可能已经完成了所有题目
    }

    room.users.forEach((user) => {
      if (!user.selectedOption?.[room.currentQuestionIndex]) {
        user.selectedOption[room.currentQuestionIndex] = -1
      }
      const selectedOptionIndex = user.selectedOption[room.currentQuestionIndex]
      if (selectedOptionIndex !== undefined) {
        if (selectedOptionIndex === currentQuestion.correctIndex) {
          // 回答正确，加100分
          user.score += 100
        } else {
          // 回答错误
          // 这里可以根据实际需求进行处理，例如扣分或者其他操作
        }
      }
      // 清空用户的选择
      user.selectedOption = []
    })

    // 向每个用户发送得分和下一题的信息

    room.users.forEach((user) => {
      const nextQuestionIndex = room.currentQuestionIndex + 1
      const nextQuestion = room.quizzes[nextQuestionIndex]
      const message = nextQuestion
        ? {
            type: "nextQuestion",
            message: "Next question.",
            question: nextQuestion,
          }
        : {
            type: "gameOver",
            message: "Game over.",
            myselfScore: user.score,
            otherScore: this.getOtherUser(room, user.userInfo.account).score,
            winner:
              user.score > this.getOtherUser(room, user.userInfo.account).score
                ? user.userInfo.name
                : this.getOtherUser(room, user.userInfo.account).userInfo.name,
          }
      user.socket.send(JSON.stringify(message))
    })

    // 增加当前题目的索引以便进入下一题
    room.currentQuestionIndex++
  }

  setTimerToRoom(room: IRoom) {
    room.downTimer.instance = setInterval(() => {
      if (room.downTimer.time === 0) {
        clearInterval(room.downTimer.instance)
        this.evaluateAnswers(room)
        return
      }
      room.downTimer.time = room.downTimer.time - 1
      room.users.forEach((user) => {
        user.socket.send(
          JSON.stringify({
            type: "downTime",
            downTime: room.downTimer.time,
          }),
        )
      })
    }, 1000)
  }

  // 发送题目给房间内的所有用户
  private sendQuestionToRoom(room: IRoom, question: Question) {
    room.users.forEach((user) => {
      user.socket.send(JSON.stringify({ type: "question", question: question }))
    })
  }

  async startGame(room: IRoom) {
    const questions: Question[] = []
    const res = await this.wordService.getAnyWords(10)
    for (let index = 0; index < res.length; index++) {
      const word = res[index]
      const wordsAsOptions = await this.wordService.getAnyWords(30)
      const startIndex = index * 3
      const endIndex = startIndex + 3
      const randomWords = wordsAsOptions.slice(startIndex, endIndex)
      const question = generateQuestion(word, randomWords)
      questions.push(question)
    }
    room.quizzes = questions
    return questions
  }

  handleConnection(client: Socket, ...args: any[]) {}

  handleDisconnect(client: Socket) {
    console.log("to beeeeee close")
  }
}

function generateQuestion(word: Word, optionItems: Word[]) {
  const [options, correctIndex] = insertRandomElement(
    optionItems.map((item) => item.translation),
    word.translation,
  )
  const question = {
    type: "translate:en-zh",
    word: word.word,
    zh: word.translation,
    options: options.map((option) => option.substring(0, 8)),
    correctIndex,
  }
  return question
}

function insertRandomElement(
  arr: string[],
  element: string,
): [string[], number] {
  // 随机生成一个插入位置的索引
  const index = Math.floor(Math.random() * (arr.length + 1))

  // 将新元素插入数组
  arr.splice(index, 0, element)

  // 返回被插入元素的索引
  return [arr, index]
}

