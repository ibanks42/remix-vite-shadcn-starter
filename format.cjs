const { exec } = require('node:child_process');
const glob = require('glob');

const patterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.json'];
const batchSize = 50; // Adjust the batch size if needed

const options = {
  ignore: ['node_modules/**', 'build/**', '.git/**', 'dist/**'],
};

const files = patterns.flatMap((pattern) => glob.sync(pattern, options));

const runBatch = (fileBatch, callback) => {
  const lint = `biome lint --write "${fileBatch.join('" "')}"`;
  const format = `biome format --write "${fileBatch.join('" "')}"`;

  exec(lint, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
  exec(format, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
    callback();
  });
};

const processFilesInBatches = (files) => {
  if (files.length === 0) {
    return;
  }

  const batch = files.slice(0, batchSize);
  const remaining = files.slice(batchSize);

  runBatch(batch, () => processFilesInBatches(remaining));
};

processFilesInBatches(files);
