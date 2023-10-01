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

export async function getCalendar(
  token: string
): Promise<[string, Pick<ContributionCalendarWeek, 'contributionDays'>[]]> {
  const octokit = github.getOctokit(token)
  const ret = await octokit.graphql<{user: User}>(query, {
    login: github.context.repo.owner
  })

  const weeks = ret.user.contributionsCollection.contributionCalendar.weeks
  const name = ret.user.name
  const login = ret.user.login

  const display = name ? name : login
  return [
    display,
    weeks as Pick<ContributionCalendarWeek, 'contributionDays'>[]
  ]
}
