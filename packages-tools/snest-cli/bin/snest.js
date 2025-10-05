#!/usr/bin/env node

const cliModule = require('../dist/cli.js');

async function run() {
  try {
    if (typeof cliModule === 'function') {
      await cliModule();
    } else if (typeof cliModule.main === 'function') {
      await cliModule.main();
    } else {
      throw new Error('Unable to find CLI entry point');
    }
  } catch (error) {
    console.error('[snest] CLI failed to start');
    if (error instanceof Error) {
      console.error(error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

run();