function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Nigellin')
    .addItem('Publish site', 'publishNigellinSite')
    .addToUi();
}

function publishNigellinSite() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) throw new Error('Sheet1 not found');

  const STATUS_CELL = 'Z3';
  const LAST_PUBLISHED_CELL = 'Z4';
  const LAST_COMMIT_CELL = 'Z5';
  const LAST_ERROR_CELL = 'Z6';

  const scriptProps = PropertiesService.getScriptProperties();
  const repoDispatchUrl = scriptProps.getProperty('NIGELLIN_REPO_DISPATCH_URL');
  const repoDispatchToken = scriptProps.getProperty('NIGELLIN_REPO_DISPATCH_TOKEN');
  const callbackUrl = scriptProps.getProperty('NIGELLIN_STATUS_CALLBACK_URL') || '';
  const callbackToken = scriptProps.getProperty('NIGELLIN_STATUS_CALLBACK_TOKEN') || '';
  const requestedBy = Session.getActiveUser().getEmail() || 'Nigellin editor';

  if (!repoDispatchUrl || !repoDispatchToken) {
    sheet.getRange(STATUS_CELL).setValue('Publish failed');
    sheet.getRange(LAST_ERROR_CELL).setValue('Missing dispatch URL/token script properties');
    throw new Error('Missing dispatch configuration');
  }

  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(5000)) {
    SpreadsheetApp.getUi().alert('A publish request is already running. Please wait a moment and try again.');
    return;
  }

  try {
    const now = new Date();
    const requestId = 'nigellin-' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Utilities.getUuid().slice(0, 8);

    sheet.getRange(STATUS_CELL).setValue('Publishing…');
    sheet.getRange(LAST_ERROR_CELL).setValue('');

    const payload = {
      event_type: 'nigellin_publish_requested',
      client_payload: {
        sheet_id: SpreadsheetApp.getActiveSpreadsheet().getId(),
        sheet_tab: 'Sheet1',
        request_time: now.toISOString(),
        requested_by: requestedBy,
        request_source: 'apps_script_menu',
        request_id: requestId,
        status_callback_mode: 'apps_script_webapp',
        status_callback_url: callbackUrl,
        status_callback_token: callbackToken,
      },
    };

    const response = UrlFetchApp.fetch(repoDispatchUrl, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + repoDispatchToken,
        Accept: 'application/vnd.github+json',
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    const code = response.getResponseCode();
    const body = response.getContentText();

    if (code < 200 || code >= 300) {
      sheet.getRange(STATUS_CELL).setValue('Publish failed');
      sheet.getRange(LAST_ERROR_CELL).setValue(('Dispatch failed: ' + code + ' ' + body).slice(0, 180));
      throw new Error('Dispatch failed: ' + code + ' ' + body);
    }

    SpreadsheetApp.getUi().alert('Publish requested. Status will update in the sheet when the workflow finishes.');
  } finally {
    lock.releaseLock();
  }
}
