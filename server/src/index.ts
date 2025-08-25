import { createApp } from './app';
import { SqliteUrlRepository } from './repositories/SqliteUrlRepository';
import { config } from './config';

/** Entry point that wires dependencies and starts the HTTP server. */
async function main() {
  const repo = new SqliteUrlRepository();
  const app = createApp(repo);
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`✅ API new listening on http://localhost:${config.port}`);
  });
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Fatal:', err);
  process.exit(1);
});
