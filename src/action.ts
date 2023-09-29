import { renderAnimatedGif } from "./render/render";
import * as process from "process";

async function run(): Promise<void> {
  await renderAnimatedGif(process.env.TOKEN!)
}

run()
