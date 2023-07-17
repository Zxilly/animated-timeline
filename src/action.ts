import * as core from '@actions/core'
import { renderAnimatedGif } from "./render/render";

async function run(): Promise<void> {
  // try {
  //
  // } catch (error) {
  //   if (error instanceof Error) core.setFailed(error.message)
  // }

  await renderAnimatedGif("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")
}

run()
