import * as github from '@actions/github'
import type {User} from '@octokit/graphql-schema'
import {ContributionCalendarWeek} from '@octokit/graphql-schema'

// language=GraphQL
const query = `
    query {
        viewer {
            contributionsCollection {
                contributionCalendar {
                    weeks {
                        contributionDays {
                            color
                            contributionCount
                            contributionLevel
                            date
                            weekday
                        }
                    }
                }
            }
            name
            login
        }
    }
`

export async function getCalendar(
  token: string
): Promise<[string, Pick<ContributionCalendarWeek, 'contributionDays'>[]]> {
  const octokit = github.getOctokit(token)
  const ret = await octokit.graphql<{viewer: User}>(query)

  const weeks = ret.viewer.contributionsCollection.contributionCalendar.weeks
  const name = ret.viewer.name
  const login = ret.viewer.login

  const display = name ? name : login
  return [
    display,
    weeks as Pick<ContributionCalendarWeek, 'contributionDays'>[]
  ]
}
