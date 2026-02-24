async function main() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
    document.getElementById('output').innerHTML = '<span class="empty">Cannot read cookies on this page</span>';
    return;
  }

  const url = new URL(tab.url);
  const domain = url.hostname;

  document.getElementById('domain').textContent = domain;

  try {
    const cookies = await chrome.cookies.getAll({ url: tab.url });

    if (cookies.length === 0) {
      document.getElementById('output').innerHTML = '<span class="empty">No cookies found on this page</span>';
      return;
    }

    let text = '';

    for (const c of cookies) {
      text += `${c.name.padEnd(24)} = ${c.value}\n`;
      if (c.domain)       text += `  ├─ domain:     ${c.domain}\n`;
      if (c.path)         text += `  ├─ path:       ${c.path}\n`;
      if (c.expirationDate) {
        const d = new Date(c.expirationDate * 1000);
        text += `  ├─ expires:    ${d.toISOString().split('T')[0]} ${d.toTimeString().split(' ')[0]}\n`;
      }
      if (c.secure)       text += `  ├─ secure:     ✓\n`;
      if (c.httpOnly)     text += `  ├─ httpOnly:   ✓\n`;
      if (c.sameSite)     text += `  └─ sameSite:   ${c.sameSite}\n`;
      text += '\n';
    }

    document.getElementById('output').textContent = text.trimEnd();
  } catch (err) {
    document.getElementById('output').textContent = 'Error: ' + err.message;
  }
}

main();