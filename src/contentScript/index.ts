import _ from 'lodash';

(async function() {
  'use strict';
  await new Promise((res) => setTimeout(res, 3500));
  const issueKeyToDomMap: Record<string, Element> = {};
  document.querySelectorAll('div[data-testid="issue-line-card.card-container"]').forEach((dom) => {
    const issueKey = dom.querySelector('a')?.innerHTML;
    if (!issueKey) {
      return;
    }

    issueKeyToDomMap[issueKey] = dom;
  });

  const issueKeys = _.chunk(Object.keys(issueKeyToDomMap), 100);

  issueKeys.map(async (keys) => {
    const resp = await fetch('https://botrista-sw.atlassian.net/rest/api/3/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expand: ['names'],
        fields: ['summary', 'parent', 'customfield_10076',],
        fieldsByKeys: false,
        jql: `key in (${keys.join(", ")})`,
        maxResults: 500,
        startAt: 0,
      }),
    });

    const responseBody = await resp.json();
    responseBody.issues.forEach((issue: any) => {
      const pointDom = document.createElement('span');
      const domStyle = document.createAttribute('style');
      domStyle.value = `
        box-sizing: border-box;
        appearance: none;
        border: none;
        background-color: var(--ds-background-neutral, #DFE1E6);
        padding-inline: var(--ds-space-075, 6px);
        border-radius: var(--ds-border-radius-200, 8px);
        display: inline-flex;
        block-size: min-content;
      `;
      pointDom.setAttributeNode(domStyle);
      const style = `
        box-sizing: border-box;
        margin: var(--ds-space-0, 0px);
        padding: var(--ds-space-0, 0px);
        font-family: var(--ds-font-family-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif);
        color: var(--ds-text, #172B4D);
        font-size: var(--ds-font-size-075, 12px);
        line-height: var(--ds-font-lineHeight-100, 16px);
        text-align: center;
      `;
      pointDom.innerHTML = `<span style="${style}">${issue.fields.customfield_10076 || 0}</span>`;
      const refEl = issueKeyToDomMap[issue.key].querySelector('div:nth-of-type(4)') as Element;
      const parentEl = refEl.parentNode as Element;
      parentEl.insertBefore(pointDom, refEl);
    });
  });
})();