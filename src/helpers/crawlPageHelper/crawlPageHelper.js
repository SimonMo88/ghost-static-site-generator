const { execSync } = require('child_process');
const { argv } = require('yargs');
const OPTIONS = require('../../constants/OPTIONS');

const crawlHistory = new Set();

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

const crawlPageHelper = (url) => {
  if (crawlHistory.has(url)) {
    return;
  }
  const wgetCommand = `${OPTIONS.MIRROR_COMMAND} -q ${OPTIONS.SHOW_PROGRESS_BAR}--recursive `
    + `${OPTIONS.X_FORWARDED_PROTO}`
    + '--timestamping '
    + '--page-requisites '
    + '--no-parent '
    + '--no-host-directories '
    + '--restrict-file-name=unix '
    + ((OPTIONS.MIRROR_COMMAND === 'wpull') ? '--no-robots ' : '')
    + ((OPTIONS.MIRROR_COMMAND === 'wpull') ? '--sitemaps ' : '')
    + ((OPTIONS.MIRROR_COMMAND === 'wpull') ? `--plugin-script ${OPTIONS.PLUGIN_SCRIPT} ` : '')
    + `--directory-prefix ${OPTIONS.STATIC_DIRECTORY} ${contentOnError()} `
    + `${saveAsReferer()}`
    + `${url}`;

  try {
    console.log(`Fetching: ${url}`);
    execSync(
      wgetCommand,
      { stdio: 'inherit' },
    );

    crawlHistory.add(url);
  } catch (execSyncError) {
  	if (execSyncError.stdout != null) {
  		console.log(`ERROR: ${execSyncError.stdout}`);
    	console.log(`Using Command: ${wgetCommand}`);

	    if (argv.failOnError) {
	      process.exit(1);
	    }
	}
  }
};

module.exports = crawlPageHelper;
