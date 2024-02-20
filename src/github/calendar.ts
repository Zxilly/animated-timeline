import * as github from '@actions/github'
import type {User} from '@octokit/graphql-schema'
import {ContributionCalendarWeek} from '@octokit/graphql-schema'

// language=GraphQL
const query = `
    query ($login: String!) {
        user(login: $login) {
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

export type Weeks = Pick<ContributionCalendarWeek, 'contributionDays'>[]

export async function getCalendar(
  login: string,
  token: string
): Promise<[string, Weeks]> {
  const octokit = github.getOctokit(token)

  if (login === '') {
    const current = await octokit.rest.users.getAuthenticated()
    login = current.data.login
  }

  const ret = await octokit.graphql<{user: User}>(query, {
    login
  })

  const weeks = ret.user.contributionsCollection.contributionCalendar.weeks
  const name = ret.user.name
  const userLogin = ret.user.login

  const display = name ? name : userLogin
  return [
    display,
    weeks as Pick<ContributionCalendarWeek, 'contributionDays'>[]
  ]
}
