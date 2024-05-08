import axios from "axios"
const client_id = "6bLMhxeHDTPoh1ihdtKEhEiD"
const client_secret = "BixgrVtKDUibTayQHrz7P0heD6ZTPu1x"
export async function getAccessTokenForBaidu() {
  try {
    const response = await axios({
      method: "post",
      url: "https://aip.baidubce.com/oauth/2.0/token",
      data: {
        grant_type: "client_credentials",
        client_id: client_id, // 替换为你的client_id
        client_secret: client_secret, // 替换为你的client_secret
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // 注意这里通常是x-www-form-urlencoded
      },
      transformRequest: [
        function (data) {
          // 因为我们发送的是x-www-form-urlencoded数据，所以需要转换对象到URL编码的字符串
          let ret = ""
          for (const it in data) {
            ret +=
              encodeURIComponent(it) + "=" + encodeURIComponent(data[it]) + "&"
          }
          return ret.slice(0, -1)
        },
      ],
    })
  } catch (error) {
    console.error(error)
  }
}
