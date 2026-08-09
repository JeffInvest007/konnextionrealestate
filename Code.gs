/**
 * KONNEXTION REAL ESTATE GROUP — thank-you autoresponder
 * ---------------------------------------------------------------------------
 * Web3Forms only sends auto-replies on their paid Pro plan, and even then you
 * can't control the design. This does it for free, from Bernadette's own Gmail,
 * with a fully branded email.
 *
 * SETUP (5 minutes, one time)
 *  1. Sign in to Gmail as Konnextionbbp@gmail.com
 *  2. Go to  script.google.com  ->  New project
 *  3. Delete everything in the editor, paste this whole file, hit Save
 *  4. Click  Deploy  ->  New deployment  ->  gear icon  ->  Web app
 *       Description:   Konnextion thank-you email
 *       Execute as:    Me (Konnextionbbp@gmail.com)
 *       Who has access: Anyone            <-- this matters, it must be "Anyone"
 *  5. Click Deploy, then Authorize access, pick the Konnextion account,
 *     click "Advanced" -> "Go to (project name)" -> Allow
 *  6. Copy the Web app URL it gives you (ends in /exec)
 *  7. Paste that URL into CONFIG.THANKYOU_URL at the top of index.html
 *
 * Gmail sends up to 100 emails/day on a free account, 1,500/day on Workspace.
 */

var OWNER_EMAIL = 'Konnextionbbp@gmail.com';
var OWNER_PHONE = '(754) 226-9387';
var SITE        = 'konnextionrealestate.com';
var SEND_OWNER_COPY = true;   // set false if Web3Forms already emails you

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var to = (d['Email'] || '').trim();
    var first = firstName(d['Full Name'] || '');

    if (to && /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(to)) {
      MailApp.sendEmail({
        to: to,
        subject: first ? ('Thank you, ' + first + '. A real person has your request.')
                       : 'Thank you. A real person has your request.',
        htmlBody: buildEmail(d, first),
        body: plainText(d, first),
        name: 'BiBi at Konnextion Real Estate Group',
        replyTo: OWNER_EMAIL
      });
    }
    if (SEND_OWNER_COPY) {
      MailApp.sendEmail({
        to: OWNER_EMAIL,
        subject: 'LEAD: ' + (d['Form'] || 'Website') + ' — ' + (d['Full Name'] || to),
        htmlBody: ownerEmail(d),
        name: 'Konnextion Website',
        replyTo: to || OWNER_EMAIL
      });
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() { return json({ ok: true, note: 'Konnextion autoresponder is live.' }); }
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function firstName(full) {
  var n = String(full || '').trim().split(/\s+/)[0] || '';
  return n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : '';
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ------------------------------------------------------------------ */
/*  The thank-you email                                                */
/* ------------------------------------------------------------------ */
function buildEmail(d, first) {
  var hello   = first ? ('Thank you, ' + esc(first) + '.') : 'Thank you.';
  var isVal   = String(d['Form'] || '').indexOf('VALUATION') > -1;
  var address = [d['Street Address'], d['City'], d['ZIP']].filter(String).join(', ');

  var recap = '';
  var rows = [
    ['Property', address],
    ['Property type', d['Property Type']],
    ['Price range', d['Budget']],
    ['Phone to call', d['Phone']],
    ['Email', d['Email']]
  ];
  rows.forEach(function (r) {
    if (r[1]) {
      recap += '<tr>' +
        '<td style="padding:9px 0;font:500 12px/1.5 Arial,Helvetica,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#8b8578;width:44%;vertical-align:top">' + esc(r[0]) + '</td>' +
        '<td style="padding:9px 0;font:400 15px/1.55 Georgia,serif;color:#1c2129">' + esc(r[1]) + '</td></tr>';
    }
  });
  if (recap) {
    recap =
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:6px 0 4px">' +
      recap + '</table>';
  }

  var steps = isVal
    ? [['Tonight', 'BiBi pulls the actual closed sales on and around your street. Not a ZIP-code average. Your street.'],
       ['Within one business day', 'She calls you at ' + esc(d['Phone'] || 'the number you gave us') + ' to walk you through what she found and what it means.'],
       ['Whenever you are ready', 'If you want to go further, she will come see the property in person. If you do not, you keep the numbers and there is no follow-up pressure. That is a promise.']]
    : [['Within one business day', 'BiBi personally calls you at ' + esc(d['Phone'] || 'the number you gave us') + '. Not an assistant, not a dialer. Her.'],
       ['On that call', 'You talk. She listens first, then tells you honestly what she thinks your options are, including the option to do nothing yet.'],
       ['After that', 'You decide. No pressure, no chasing. We will be here when the timing is right for you.']];

  var stepsHtml = '';
  steps.forEach(function (s, i) {
    stepsHtml +=
      '<tr>' +
        '<td width="40" valign="top" style="padding:0 14px 22px 0">' +
          '<div style="width:30px;height:30px;line-height:30px;border-radius:50%;background:#0b1017;color:#14e0d0;' +
          'font:700 13px Arial,Helvetica,sans-serif;text-align:center">' + (i + 1) + '</div>' +
        '</td>' +
        '<td valign="top" style="padding:0 0 22px">' +
          '<div style="font:700 11px/1 Arial,Helvetica,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#0f9d92;padding-bottom:6px">' + s[0] + '</div>' +
          '<div style="font:400 15px/1.65 Georgia,serif;color:#2b3138">' + s[1] + '</div>' +
        '</td>' +
      '</tr>';
  });

  return '' +
'<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
'<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">' +
'<title>Thank you from Konnextion</title></head>' +
'<body style="margin:0;padding:0;background:#0b1017;">' +
'<div style="display:none;max-height:0;overflow:hidden;opacity:0">A real person from our family has your request and will call you within one business day.</div>' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1017;border-collapse:collapse">' +
'<tr><td align="center" style="padding:30px 14px 40px">' +
  '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;border-collapse:collapse">' +

    /* header */
    '<tr><td align="center" style="padding:26px 24px 30px;background:#0b1017">' +
      '<div style="font:800 22px/1 Arial,Helvetica,sans-serif;letter-spacing:.20em;color:#ffffff">' +
        'KONNE<span style="color:#14e0d0">X</span>TION' +
      '</div>' +
      '<div style="font:400 10px/1 Arial,Helvetica,sans-serif;letter-spacing:.34em;color:#7b8797;padding-top:9px">REAL ESTATE GROUP</div>' +
      '<div style="height:2px;width:58px;background:#14e0d0;margin:18px auto 0;font-size:0;line-height:0">&nbsp;</div>' +
    '</td></tr>' +

    /* body card */
    '<tr><td style="background:#fbf8f3;border-radius:14px;padding:44px 40px 38px">' +

      '<div style="font:400 32px/1.2 Georgia,serif;color:#12171f;padding-bottom:18px">' + hello + '</div>' +

      '<div style="font:400 17px/1.7 Georgia,serif;color:#2b3138;padding-bottom:20px">' +
        'Your request came through, and I want you to know something right away: <strong style="color:#12171f">a real person read it.</strong> ' +
        'Not a bot, not an inbox nobody checks. Me.' +
      '</div>' +

      '<div style="font:400 16px/1.75 Georgia,serif;color:#3a424c;padding-bottom:20px">' +
        'Our family has been doing this in South Florida for three generations. In that time I have learned that the moment ' +
        'someone reaches out about a home, they are usually carrying something bigger than a transaction. A move. A change. ' +
        'Sometimes a loss. Whatever brought you here, you are not a lead in a spreadsheet to us. You are a family, and we treat ' +
        'you the way we would want our own to be treated.' +
      '</div>' +

      '<div style="font:400 16px/1.75 Georgia,serif;color:#3a424c;padding-bottom:30px">' +
        'So take a breath. You did the hard part by reaching out. We will take it from here.' +
      '</div>' +

      /* what happens next */
      '<div style="border-top:1px solid #e6ded1;padding-top:28px">' +
        '<div style="font:700 11px/1 Arial,Helvetica,sans-serif;letter-spacing:.20em;text-transform:uppercase;color:#0f9d92;padding-bottom:20px">What happens next</div>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">' + stepsHtml + '</table>' +
      '</div>' +

      /* signature */
      '<div style="border-top:1px solid #e6ded1;padding-top:26px;margin-top:4px">' +
        '<div style="font:italic 400 20px/1.5 Georgia,serif;color:#12171f">Warmly,</div>' +
        '<div style="font:italic 600 30px/1.3 Georgia,serif;color:#12171f;padding-top:4px">BiBi</div>' +
        '<div style="font:400 13px/1.6 Arial,Helvetica,sans-serif;color:#7a7367;padding-top:6px">' +
          'Bernadette &ldquo;BiBi&rdquo; Demosthene-Filiasse<br>Konnextion Real Estate Group' +
        '</div>' +
      '</div>' +

      /* call button */
      '<div style="padding-top:30px">' +
        '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>' +
        '<td style="background:#0b1017;border-radius:999px">' +
          '<a href="tel:+17542269387" style="display:inline-block;padding:16px 34px;font:700 13px/1 Arial,Helvetica,sans-serif;' +
          'letter-spacing:.14em;text-transform:uppercase;color:#14e0d0;text-decoration:none">Call or text ' + OWNER_PHONE + '</a>' +
        '</td></tr></table>' +
        '<div style="font:400 13px/1.6 Arial,Helvetica,sans-serif;color:#8b8578;padding-top:14px">' +
          'If today is urgent, call. Say you filled out the form and we will move you up.' +
        '</div>' +
      '</div>' +

      /* recap */
      (recap ? '<div style="border-top:1px solid #e6ded1;margin-top:30px;padding-top:22px">' +
               '<div style="font:700 11px/1 Arial,Helvetica,sans-serif;letter-spacing:.20em;text-transform:uppercase;color:#8b8578;padding-bottom:6px">What you sent us</div>' +
               recap + '</div>' : '') +

    '</td></tr>' +

    /* footer */
    '<tr><td align="center" style="padding:26px 24px 8px">' +
      '<div style="font:400 12px/1.8 Arial,Helvetica,sans-serif;color:#6b7686">' +
        '<a href="https://' + SITE + '" style="color:#14e0d0;text-decoration:none">' + SITE + '</a>' +
        ' &nbsp;&middot;&nbsp; <a href="mailto:' + OWNER_EMAIL + '" style="color:#6b7686;text-decoration:none">' + OWNER_EMAIL + '</a>' +
        '<br>Miami, Florida &nbsp;&middot;&nbsp; Dallas, Texas' +
        '<br><span style="color:#4c5666">Konnextion Real Estate Group, a d/b/a of Konnextion Multi Service Center, LLC. Equal Housing Opportunity.</span>' +
        '<br><span style="color:#3f4855">You received this because you submitted a request on our website.</span>' +
      '</div>' +
    '</td></tr>' +

  '</table>' +
'</td></tr></table></body></html>';
}

function plainText(d, first) {
  return (first ? 'Thank you, ' + first + '.' : 'Thank you.') + '\n\n' +
    'Your request came through and a real person read it. Me.\n\n' +
    'Our family has been doing this in South Florida for three generations. Whatever brought you here, ' +
    'you are not a lead in a spreadsheet to us.\n\n' +
    'BiBi will personally call you within one business day. If today is urgent, call or text ' + OWNER_PHONE + '.\n\n' +
    'Warmly,\nBiBi\nBernadette "BiBi" Demosthene-Filiasse\nKonnextion Real Estate Group\n' + SITE;
}

function ownerEmail(d) {
  var rows = '';
  Object.keys(d).forEach(function (k) {
    if (['access_key', 'from_name', 'replyto', 'subject', 'botcheck'].indexOf(k) > -1) return;
    rows += '<tr><td style="padding:6px 14px 6px 0;font:700 12px Arial;color:#666;white-space:nowrap;vertical-align:top">' +
            esc(k) + '</td><td style="padding:6px 0;font:400 15px Arial;color:#111">' + esc(d[k]) + '</td></tr>';
  });
  return '<div style="font-family:Arial,sans-serif"><h2 style="margin:0 0 4px">New ' + esc(d['Form'] || 'website') + '</h2>' +
    '<p style="margin:0 0 16px;color:#666">A thank-you email was sent to the client automatically.</p>' +
    '<table style="border-collapse:collapse">' + rows + '</table></div>';
}

/** Run this once from the editor to send yourself a test copy. */
function sendTestEmail() {
  var demo = {
    'Form': 'HOME VALUATION REQUEST', 'Full Name': 'Maria Gonzalez',
    'Street Address': '1234 NW 12th Street', 'City': 'Miami Gardens', 'ZIP': '33169',
    'Phone': '(305) 555-0142', 'Email': OWNER_EMAIL,
    'How did you hear about us': 'Sticky note left at the property'
  };
  MailApp.sendEmail({
    to: OWNER_EMAIL, subject: '[TEST] Thank you, Maria.',
    htmlBody: buildEmail(demo, 'Maria'), body: plainText(demo, 'Maria'),
    name: 'BiBi at Konnextion Real Estate Group'
  });
}
