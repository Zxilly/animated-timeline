import {Weeks} from '../github/calendar'
import Matter, {Bodies, World} from 'matter-js'
import {boxSize, WIDTH, xMargin, yMargin} from './const'
import {type ContributionLevel} from '@octokit/graphql-schema'
import {ContributionShape} from './type/shape'

function levelToDensity(level: ContributionLevel): number {
  switch (level) {
    case 'FIRST_QUARTILE':
      return 4
    case 'SECOND_QUARTILE':
      return 8
    case 'THIRD_QUARTILE':
      return 12
    case 'FOURTH_QUARTILE':
      return 16
    case 'NONE':
      throw new Error('Should be stripped out before calling this function')
  }
}

export function drawCalendar(
  world: Matter.World,
  weeks: Weeks,
  shape: ContributionShape
): void {
  const xOffset =
    WIDTH / 2 - (weeks.length / 2) * boxSize - (weeks.length / 2 - 1) * xMargin
  const yOffset = -160

  const entities: Matter.Body[] = []
  for (let i = 0; i < weeks.length; i++) {
    for (let j = 0; j < weeks[i].contributionDays.length; j++) {
      const day = weeks[i].contributionDays[j]
      if (day.contributionCount === 0) continue

      const density = levelToDensity(day.contributionLevel)

      const x = xOffset + i * boxSize + (i - 1) * xMargin
      const y = yOffset + j * boxSize + (j - 1) * yMargin
      switch (shape) {
        case 'square': {
          const square = Bodies.rectangle(x, y, boxSize, boxSize, {
            render: {
              fillStyle: day.color
            },
            density
          })
          entities.push(square)
          break
        }
        case 'circle': {
          const circle = Bodies.circle(x, y, boxSize / 2, {
            render: {
              fillStyle: day.color
            },
            density
          })
          entities.push(circle)
          break
        }
        case 'triangle': {
          const triangle = Bodies.polygon(x, y, 3, boxSize / 1.5, {
            render: {
              fillStyle: day.color
            },
            density
          })
          entities.push(triangle)
          break
        }
      }
    }
  }

  World.add(world, entities)
}
