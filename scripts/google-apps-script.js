/**
 * Google Apps Script — Internal Feedback Form → GitHub Issues
 *
 * This script runs inside Google Apps Script (not Node.js).
 * It triggers on Google Form submissions and creates GitHub Issues.
 *
 * Setup:
 *   1. Create Google Form (see docs/process/bug-reporting-pipeline.md)
 *   2. Open the form → three-dot menu → Script editor
 *   3. Paste this entire file into Code.gs
 *   4. Run setGitHubToken() once to store your token securely
 *   5. Run createTrigger() once to set up the form submission trigger
 *   6. Submit a test response to verify
 */

// ── Configuration ──
const GITHUB_REPO = 'mrthames/simple-pitch-counter';

/**
 * Store the GitHub token securely in Script Properties.
 * Run this function ONCE from the Apps Script editor, then delete the token
 * from the code. Uses the same fine-grained PAT as feedback.php (issues:write).
 */
function setGitHubToken() {
  PropertiesService.getScriptProperties().setProperty(
    'GITHUB_TOKEN',
    'PASTE_YOUR_TOKEN_HERE'  // Replace, run once, then change back to placeholder
  );
  Logger.log('Token saved to Script Properties.');
}

/**
 * Create the form-submit trigger. Run this ONCE from the Apps Script editor.
 */
function createTrigger() {
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(FormApp.getActiveForm())
    .onFormSubmit()
    .create();
  Logger.log('Trigger created.');
}

/**
 * Triggered on every form submission. Reads the response,
 * builds a GitHub Issue, and posts it via the API.
 */
function onFormSubmit(e) {
  const response = e.response;
  const answers = response.getItemResponses();

  // Map ALL form answers by question title and track which ones we use
  const data = {};
  const used = {};
  answers.forEach(a => {
    const title = a.getItem().getTitle();
    const value = a.getResponse();
    if (value && value.toString().trim()) {
      data[title] = value.toString().trim();
    }
  });

  // Log all received data for debugging
  Logger.log('Form data received: ' + JSON.stringify(data));

  // Extract fields — uses flexible partial matching against question titles
  const type      = (extract(data, used, ['type']) || 'bug').toLowerCase();
  const summary   = extract(data, used, ['summary', 'title', 'subject']) || 'No summary provided';
  const name      = extract(data, used, ['name']) || 'Anonymous';
  const role      = extract(data, used, ['role']);
  const severity  = extract(data, used, ['severity', 'priority']);
  const steps     = extract(data, used, ['steps', 'reproduce']);
  const expected  = extract(data, used, ['expected']);
  const actual    = extract(data, used, ['actual']);
  const problem   = extract(data, used, ['problem']);
  const solution  = extract(data, used, ['solution', 'suggestion']);
  const details   = extract(data, used, ['detail', 'description', 'additional']);

  // Build issue title and body
  let issueTitle, body, labels;

  if (type.includes('bug')) {
    issueTitle = 'Bug: ' + truncate(summary, 200);
    body = '## Bug Report (via internal feedback form)\n\n';
    body += '**Submitted by:** ' + name + (role ? ' (' + role + ')' : '') + '\n';
    body += '**Severity:** ' + (severity || 'Not specified') + '\n\n';
    if (steps)    body += '### Steps to Reproduce\n' + steps + '\n\n';
    if (expected) body += '### Expected Behavior\n' + expected + '\n\n';
    if (actual)   body += '### Actual Behavior\n' + actual + '\n\n';
    if (details)  body += '### Additional Details\n' + details + '\n\n';
  } else {
    issueTitle = 'Feature request: ' + truncate(summary, 200);
    body = '## Feature Request (via internal feedback form)\n\n';
    body += '**Submitted by:** ' + name + (role ? ' (' + role + ')' : '') + '\n\n';
    if (problem)  body += '### Problem\n' + problem + '\n\n';
    if (solution) body += '### Suggested Solution\n' + solution + '\n\n';
    if (details)  body += '### Additional Details\n' + details + '\n\n';
  }

  // Append any fields that weren't matched by keyword — ensures nothing is lost
  const unmatched = [];
  for (const title in data) {
    if (!used[title]) {
      unmatched.push('**' + title + ':** ' + data[title]);
    }
  }
  if (unmatched.length > 0) {
    body += '### Other Responses\n' + unmatched.join('\n') + '\n\n';
  }

  body += '---\n*Submitted via internal Google Form*';
  labels = type.includes('bug')
    ? ['type: bug', 'source: internal', 'status: needs-triage']
    : ['type: feature', 'source: internal', 'status: needs-triage'];

  // Create GitHub Issue
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token || token === 'PASTE_YOUR_TOKEN_HERE') {
    Logger.log('ERROR: GitHub token not set. Run setGitHubToken() first.');
    return;
  }

  const apiUrl = 'https://api.github.com/repos/' + GITHUB_REPO + '/issues';
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'SimplePitchCounter-InternalFeedback/1.0',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    payload: JSON.stringify({
      title: issueTitle,
      body: body,
      labels: labels
    }),
    muteHttpExceptions: true
  };

  const resp = UrlFetchApp.fetch(apiUrl, options);
  const code = resp.getResponseCode();

  if (code === 201) {
    const issue = JSON.parse(resp.getContentText());
    Logger.log('Created issue #' + issue.number + ': ' + issue.html_url);
  } else {
    Logger.log('GitHub API error (' + code + '): ' + resp.getContentText());
  }
}

// ── Helpers ──

/** Find a key in the data object by partial match, mark it as used */
function extract(data, used, keywords) {
  for (const key in data) {
    const lower = key.toLowerCase();
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        used[key] = true;
        return data[key];
      }
    }
  }
  return '';
}

/** Truncate string to maxLen characters */
function truncate(str, maxLen) {
  return str.length > maxLen ? str.substring(0, maxLen) : str;
}
