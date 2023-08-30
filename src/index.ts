import { init } from './App';
import { Environment } from './helpers';
const port = process.env.SERVER_PORT;

Environment.init(process.env.APP_ENV).then(() => {
  init().then(app => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}/`);
    });
  });
});
