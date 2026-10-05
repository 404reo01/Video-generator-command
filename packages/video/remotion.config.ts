import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Episode audio and sprites are copied here by `npm run sync`.
Config.setPublicDir('public');
