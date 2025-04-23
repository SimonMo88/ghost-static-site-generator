const { exec, execSync } = require('child_process');
const { argv } = require('yargs');
const OPTIONS = require('../../constants/OPTIONS');

const contentOnError = () => {
  const contentOnErrorHelpText = execSync(
    `${OPTIONS.MIRROR_COMMAND} --help | grep "content-on-error" || true`,
  ).toString();

  return `${contentOnErrorHelpText}`
    .includes('content-on-error')
    ? '--content-on-error '
    : '';
};

const saveAsReferer = () => {
  if (OPTIONS.SAVE_AS_REFERER) {
    return '';
  }
  return '--trust-server-names ';
};

/**
 * A async version of crawlPageHelper
 */
const crawlPageAsyncHelper = (
  url,
  callback = () => {},
) => {
  const wgetCommand = `${OPTIONS.MIRROR_COMMAND} -v ${OPTIONS.SHOW_PROGRESS_BAR}--recursive `
    + `${OPTIONS.X_FORWARDED_PROTO}`
    + '--timestamping '
    + '--page-requisites '
    + '--no-parent '
    + '--no-host-directories '
    + '--restrict-file-name=unix '
    + ((OPTIONS.MIRROR_COMMAND === 'wpull') ? `--plugin-script ${OPTIONS.PLUGIN_SCRIPT} ` : '')
    + `--directory-prefix ${OPTIONS.STATIC_DIRECTORY} ${contentOnError()} `
    + `${saveAsReferer()}`
    + `${url}`;

  try {
    console.log(`Fetching: ${url}`);
    exec(
      wgetCommand,
      { stdio: 'inherit' },
      callback,
    );
  } catch (execError) {
    console.log(`ERROR: ${execError.stdout}`);
    console.log(`Using Command: ${wgetCommand}`);

    if (argv.failOnError) {
      process.exit(1);
    }
  }
};

module.exports = crawlPageAsyncHelper;
