import { envConfig } from './src/config/env.config.js';
import { app } from './src/app.js';

let port = envConfig.port;

app.listen(port, () => {
  console.log(`Server running on PORT ${port}`);
});
