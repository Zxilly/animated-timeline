import process from 'process'

export const WIDTH = 1200
export const HEIGHT = 500

export const MAX_PIC_TIME = 20

export const xMargin = 4
export const yMargin = 4

export const boxSize = 16
export const fontSize = 128
export const lutStep = 10
export const backgroundColor = '#fafafa'

// gif can only set delay as 1/100 sec, so we need to limit the frame rate
// this can help to keep the same speed as the webp
export const FRAME_RATE = 50

export const speedLimit = 0.1
export const angularSpeedLimit = 0.05

export const debug = process.env.DEBUG !== undefined

export const lastSecondMaxSpeed: number[] = []
export const maxTotalFrames = FRAME_RATE * MAX_PIC_TIME
