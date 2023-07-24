declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CAR: string
      LOGIN: string
      PASSWORD: string
    }
  }
}

export {}
