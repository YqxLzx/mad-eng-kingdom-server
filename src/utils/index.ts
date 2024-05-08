export function checkEmailOrphone(value: string) {
  const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
  const regPhone = /^1[3456789]\d{9}$/
  if (regEmail.test(value)) {
    return "email"
  }
  if (regPhone.test(value)) {
    return "phone"
  }
}

export * from "./baiduAccessToken"
