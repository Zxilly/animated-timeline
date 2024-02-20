import Matter, {Bodies, World} from 'matter-js'
import {backgroundColor, boxSize, HEIGHT, WIDTH} from './const'

export function setBounds(world: Matter.World) {
  const ground = Bodies.rectangle(
    WIDTH / 2,
    HEIGHT + boxSize,
    WIDTH + boxSize,
    boxSize * 2,
    {
      isStatic: true,
      render: {
        fillStyle: backgroundColor
      }
    }
  )
  const left = Bodies.rectangle(-boxSize, HEIGHT / 2, boxSize * 2, HEIGHT, {
    isStatic: true,
    render: {
      fillStyle: backgroundColor
    }
  })
  const right = Bodies.rectangle(
    WIDTH + boxSize,
    HEIGHT / 2,
    boxSize * 2,
    HEIGHT,
    {
      isStatic: true,
      render: {
        fillStyle: backgroundColor
      }
    }
  )
  World.add(world, [ground, left, right])
}
