import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Beijer.ink server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
