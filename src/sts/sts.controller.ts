import { Controller, Get, Query } from "@nestjs/common"
import axios from "axios"
import { Public } from "src/authGuard/publicAuth"
var STS = require('qcloud-cos-sts');

@Controller("sts")
export class StsController {
  @Get("credentials")
  @Public()
  async getCredentials(): Promise<any> {
    try {
      // 替换为你的腾讯云SecretId和SecretKey
      const secretId = "AKIDHOI1c1DBvueFi4X0LUVK1c9nPFzMestj"
      const secretKey = "mXN1a6Ws580lLjy75rSvSt8KXcYP5f6O"
      // 腾讯云STS服务的请求地址，需要替换成你所在的region对应的STS地址
      const stsHost = "sts.ap-chengdu.tencentcloudapi.com"

      const tempKeys = await new Promise((resolve, reject) => {
        STS.getCredential(
          {
            secretId: secretId,
            secretKey: secretKey,
            policy: {
              version: "2.0",
              statement: [
                {
                  action: ["name/cos:*"],
                  effect: "allow",
                  resource: ["*"],
                },
              ],
            },
          },
          function (err, tempKeys) {
            if (err) {
              reject(err)
            } else {
              resolve(tempKeys)
            }
          },
        )
      })
      return tempKeys
    } catch (error) {
      // 处理异常
      console.error("stsError:", error)
      throw error
    }
  }
}
