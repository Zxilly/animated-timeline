import { renderAnimatedGif } from "./render/render";
import * as process from "process";

async function run(): Promise<void> {
  // try {
  //
  // } catch (error) {
  //   if (error instanceof Error) core.setFailed(error.message)
  // }

  await renderAnimatedGif(process.env.TOKEN!)
}

run()
