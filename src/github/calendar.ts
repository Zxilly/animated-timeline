import * as github from '@actions/github'
import type {User, ContributionCalendarWeek} from '@octokit/graphql-schema'
import {setFailed} from '@actions/core'

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
    const current = await octokit.rest.users.getAuthenticated().catch(e => {
      setFailed("Couldn't get authenticated user, should set login manually")
      throw e
    })
    login = current.data.login
  }

  const ret = await octokit
    .graphql<{user: User}>(query, {
      login
    })
    .catch(e => {
      setFailed('Failed to fetch calendar data')
      throw e
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
