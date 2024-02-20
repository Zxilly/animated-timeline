import Matter from 'matter-js'
import {
  angularSpeedLimit,
  FRAME_RATE,
  lastSecondMaxSpeed,
  speedLimit
} from './const'

export function isWorldStopped(world: Matter.World): boolean {
  const [max, maxAngular] = maxWorldSpeed(world)
  lastSecondMaxSpeed.push(max)
  if (lastSecondMaxSpeed.length > FRAME_RATE) {
    lastSecondMaxSpeed.shift()
  }
  const avgSpeed =
    lastSecondMaxSpeed.reduce((acc, cur) => acc + cur, 0) /
    lastSecondMaxSpeed.length
  return (
    avgSpeed < speedLimit ||
    (maxAngular < angularSpeedLimit && avgSpeed < speedLimit * 2)
  )
}

export function maxWorldSpeed(world: Matter.World): [number, number] {
  let maxSpeed = 0
  let maxAngularSpeed = 0
  for (const body of world.bodies) {
    if (body.isStatic) continue
    if (body.speed > maxSpeed) maxSpeed = body.speed
    if (body.angularSpeed > maxAngularSpeed) maxAngularSpeed = body.angularSpeed
  }
  return [maxSpeed, maxAngularSpeed]
}
