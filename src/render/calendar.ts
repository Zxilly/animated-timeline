import {Weeks} from '../github/calendar'
import Matter, {Bodies, World} from 'matter-js'
import {boxSize, WIDTH, xMargin, yMargin} from './const'
import {type ContributionLevel} from '@octokit/graphql-schema'

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

export function drawCalendar(world: Matter.World, weeks: Weeks): void {
  const xOffset =
    WIDTH / 2 - (weeks.length / 2) * boxSize - (weeks.length / 2 - 1) * xMargin
  const yOffset = -160

  const squares: Matter.Body[] = []
  for (let i = 0; i < weeks.length; i++) {
    for (let j = 0; j < weeks[i].contributionDays.length; j++) {
      const day = weeks[i].contributionDays[j]
      if (day.contributionCount === 0) continue

      const density = levelToDensity(day.contributionLevel)

      const x = xOffset + i * boxSize + (i - 1) * xMargin
      const y = yOffset + j * boxSize + (j - 1) * yMargin
      const square = Bodies.rectangle(x, y, boxSize, boxSize, {
        render: {
          fillStyle: day.color
        },
        density
      })

      squares.push(square)
    }
  }

  World.add(world, squares)
}
