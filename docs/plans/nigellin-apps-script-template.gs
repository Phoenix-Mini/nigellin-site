function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Nigellin')
    .addItem('Publish site', 'publishNigellinSite')
    .addToUi();
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function publishNigellinSite() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) throw new Error('Sheet1 not found');

  const STATUS_CELL = 'Z3';
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
        status_callback_mode: callbackUrl ? 'apps_script_webapp' : 'none',
        status_callback_url: callbackUrl,
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

    if (!callbackUrl || !callbackToken) {
      SpreadsheetApp.getUi().alert('Publish requested. Callback is not configured yet, so final status may stay on Publishing….');
      return;
    }

    SpreadsheetApp.getUi().alert('Publish requested. Status will update in the sheet when the workflow finishes.');
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const expectedToken = scriptProps.getProperty('NIGELLIN_STATUS_CALLBACK_TOKEN') || '';
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const callbackToken = String(payload.callback_token || '');

    if (!expectedToken || callbackToken !== expectedToken) {
      return jsonResponse({ ok: false, error: 'Unauthorized' });
    }

    const sheetId = String(payload.sheet_id || '');
    const sheetTab = String(payload.sheet_tab || 'Sheet1');
    const status = String(payload.status || 'Publish failed');
    const publishedAt = String(payload.published_at || '');
    const commitHash = String(payload.commit_hash || '');
    const errorText = String(payload.error || '');
    const requestId = String(payload.request_id || '');

    if (!sheetId || !requestId || !status) {
      return jsonResponse({ ok: false, error: 'Missing required callback fields' });
    }

    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName(sheetTab);
    if (!sheet) {
      return jsonResponse({ ok: false, error: 'Sheet tab not found' });
    }

    sheet.getRange('Z3').setValue(status);
    sheet.getRange('Z4').setValue(publishedAt);
    sheet.getRange('Z5').setValue(commitHash);
    sheet.getRange('Z6').setValue(errorText);

    return jsonResponse({ ok: true, request_id: requestId });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}
