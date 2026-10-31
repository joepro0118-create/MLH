// frontend/src/exportUtils.js
// Executive Export Utilities for BridgeWise Partnership Brief & 30-Day POC Plan:
// 1. Word Document (.doc) — Microsoft Word / Google Docs rich layout
// 2. PDF Document (.pdf) — Direct vector %PDF-1.4 binary download (zero popup blockers)
// 3. Markdown (.md) — Clean GitHub-flavored Markdown

function safeFileSlug(profile, partner) {
  const s = (profile?.company_name || 'Startup').replace(/[^a-zA-Z0-9_-]+/g, '_')
  const p = (partner?.partner_name || partner?.name || 'Partner')
    .replace(/\(illustrative\)/gi, '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
  return `BridgeWise_Brief_${s}_x_${p}`
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 1. Export Partnership Brief as a rich Microsoft Word (.doc) file
 */
export function exportBriefToWord(profile, partner, brief) {
  if (!brief) return
  const startupName = profile?.company_name || 'Startup'
  const startupCountry = profile?.country || 'ASEAN'
  const startupSector = profile?.sector || 'Technology'
  const partnerName = partner?.partner_name || partner?.name || 'Partner'
  const partnerCountry = partner?.country || 'ASEAN'
  const score = partner?.score ?? 85

  const collab = brief.collaboration_concept || brief.collaborationConcept || ''
  const poc = brief.proposed_poc || brief.proposedPoc || ''
  const timeline = brief.timeline || []
  const metrics = brief.success_metrics || brief.successMetrics || []

  const timelineRows = timeline
    .map((item, idx) => {
      const text = typeof item === 'string' ? item : item.task || JSON.stringify(item)
      return `
        <tr>
          <td style="width:130px;padding:10px 12px;border:1px solid #ddd6fe;background:#f5f3ff;font-weight:bold;color:#5b21b6;vertical-align:top;">
            Week ${idx + 1}<br/>
            <span style="font-size:9pt;color:#6b7280;font-weight:normal;">Days ${idx * 7 + 1}&ndash;${Math.min(30, (idx + 1) * 7 + (idx === 3 ? 2 : 0))}</span>
          </td>
          <td style="padding:10px 14px;border:1px solid #ddd6fe;color:#1e1b4b;vertical-align:top;">
            ${escapeHtml(text)}
          </td>
        </tr>`
    })
    .join('')

  const metricRows = metrics
    .map((m) => {
      const text = typeof m === 'string' ? m : m.metric || JSON.stringify(m)
      return `<li style="margin-bottom:6px;color:#14532d;"><strong>&#10003;</strong> ${escapeHtml(text)}</li>`
    })
    .join('')

  const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:w="urn:schemas-microsoft-com:office:word"
        xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>BridgeWise Partnership Brief - ${escapeHtml(startupName)} x ${escapeHtml(partnerName)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { size: 8.5in 11in; margin: 0.8in; }
    body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; color: #1e1b4b; line-height: 1.55; font-size: 11pt; }
    .banner { background-color: #1e1b4b; color: #ffffff; padding: 20px 24px; border-bottom: 4px solid #7c3aed; }
    .eyebrow { color: #c4b5fd; font-size: 9pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .title { font-size: 20pt; font-weight: bold; margin: 6px 0 4px 0; color: #ffffff; }
    .subtitle { font-size: 10.5pt; color: #e2e8f0; }
    .section-head { font-size: 12pt; font-weight: bold; color: #5b21b6; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 20px; margin-bottom: 8px; border-bottom: 2px solid #ede9fe; padding-bottom: 4px; }
    .objective-box { background-color: #f5f3ff; border-left: 5px solid #7c3aed; padding: 14px 16px; margin-top: 14px; font-size: 11.5pt; font-weight: bold; color: #1e1b4b; }
    .card-box { background-color: #ffffff; border: 1px solid #ddd6fe; padding: 12px 14px; }
    .poc-box { background-color: #f0fdfa; border: 1px solid #99f6e4; padding: 12px 14px; color: #0f766e; }
    .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #ddd6fe; font-size: 9pt; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="banner">
    <div class="eyebrow">BridgeWise &bull; Cross-Border Partnership Action Brief &amp; 30-Day POC Plan</div>
    <div class="title">${escapeHtml(startupName)} &times; ${escapeHtml(partnerName)}</div>
    <div class="subtitle">
      Startup Origin: <strong>${escapeHtml(startupCountry)}</strong> (${escapeHtml(startupSector)}) &nbsp;|&nbsp;
      Partner Market: <strong>${escapeHtml(partnerCountry)}</strong> &nbsp;|&nbsp;
      Compatibility Score: <strong>${escapeHtml(score)}/100</strong>
    </div>
  </div>

  <div class="objective-box">
    <div style="font-size:8.5pt;color:#7c3aed;text-transform:uppercase;margin-bottom:4px;">1. Strategic Objective</div>
    ${escapeHtml(brief.objective)}
  </div>

  <table style="width:100%;border-collapse:collapse;margin-top:16px;">
    <tr>
      <td style="width:50%;padding-right:8px;vertical-align:top;">
        <div class="section-head">2. Collaboration Concept</div>
        <div class="card-box">${escapeHtml(collab)}</div>
      </td>
      <td style="width:50%;padding-left:8px;vertical-align:top;">
        <div class="section-head">3. Proposed 30-Day Proof of Concept</div>
        <div class="poc-box">${escapeHtml(poc)}</div>
      </td>
    </tr>
  </table>

  <div class="section-head">4. 30-Day Implementation Timeline (Week 1 &ndash; Week 4)</div>
  <table style="width:100%;border-collapse:collapse;margin-top:6px;">
    ${timelineRows}
  </table>

  <div class="section-head">5. Measurable Success Metrics &amp; Target KPIs</div>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px 18px;">
    <ul style="margin:0;padding-left:18px;">
      ${metricRows}
    </ul>
  </div>

  <div class="footer">
    Generated by <strong>BridgeWise (AI Cross-Border Startup Partnership Intelligence)</strong> &bull; Powered by <strong>Gemma 4</strong> (open-weight AI) &bull;
    All ecosystem records and partner outcomes are illustrative for demonstration purposes.
  </div>
</body>
</html>`

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${safeFileSlug(profile, partner)}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Clean Unicode strings for standard PDF Type1 Helvetica encoding
 */
function pdfCleanText(str) {
  return String(str || '')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/×/g, 'x')
    .replace(/↔/g, '<->')
    .replace(/[–—]/g, '-')
    .replace(/[•∙]/g, '*')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function pdfEscape(str) {
  return pdfCleanText(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function wrapText(text, maxChars) {
  const words = pdfCleanText(text).split(' ')
  const lines = []
  let current = ''
  for (const w of words) {
    if (!w) continue
    if ((current + ' ' + w).trim().length <= maxChars) {
      current = (current + ' ' + w).trim()
    } else {
      if (current) lines.push(current)
      current = w
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

/**
 * 2. Export Partnership Brief as a genuine styled vector PDF (.pdf)
 */
export function exportBriefToPdf(profile, partner, brief) {
  if (!brief) return

  const startupName = pdfCleanText(profile?.company_name || 'Startup')
  const startupCountry = pdfCleanText(profile?.country || 'ASEAN')
  const startupSector = pdfCleanText(profile?.sector || 'Tech')
  const partnerName = pdfCleanText(partner?.partner_name || partner?.name || 'Partner')
  const partnerCountry = pdfCleanText(partner?.country || 'ASEAN')
  const score = partner?.score ?? 85

  const collab = brief.collaboration_concept || brief.collaborationConcept || ''
  const poc = brief.proposed_poc || brief.proposedPoc || ''
  const timeline = brief.timeline || []
  const metrics = brief.success_metrics || brief.successMetrics || []

  // Page dimensions: A4 (595.28 x 841.89 pt)
  const W = 595.28
  const H = 841.89
  const margin = 42
  const contentW = W - margin * 2

  const ops = []
  let y = H - 36

  const fillRect = (x, rectY, w, h, r, g, b) => {
    ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`)
    ops.push(`${x.toFixed(2)} ${rectY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`)
  }

  const drawText = (text, x, textY, font = 'F1', size = 10, r = 0.12, g = 0.11, b = 0.29) => {
    ops.push('BT')
    ops.push(`/${font} ${size} Tf`)
    ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`)
    ops.push(`${x.toFixed(2)} ${textY.toFixed(2)} Td`)
    ops.push(`(${pdfEscape(text)}) Tj`)
    ops.push('ET')
  }

  // 1. Top Header Banner (Deep Indigo #1e1b4b + Violet stripe #7c3aed)
  const bannerH = 78
  fillRect(0, H - bannerH, W, bannerH, 0.118, 0.106, 0.294)
  fillRect(0, H - bannerH - 4, W, 4, 0.486, 0.227, 0.929)

  drawText('BRIDGEWISE  |  CROSS-BORDER PARTNERSHIP BRIEF & 30-DAY POC PLAN', margin, H - 24, 'F2', 8.5, 0.769, 0.710, 0.992)
  drawText(`${startupName}  x  ${partnerName}`, margin, H - 46, 'F2', 15, 1, 1, 1)
  drawText(
    `Origin: ${startupCountry} (${startupSector})   |   Partner Country: ${partnerCountry}   |   Match Score: ${score}/100`,
    margin,
    H - 64,
    'F1',
    9.5,
    0.886,
    0.910,
    0.941
  )

  y = H - bannerH - 24

  const drawSectionBlock = (title, bodyText, accentRGB = [0.486, 0.227, 0.929], bgRGB = [0.961, 0.953, 1.0]) => {
    const lines = wrapText(bodyText, 88)
    const boxH = 24 + lines.length * 13.5 + 8
    const boxBottom = y - boxH

    fillRect(margin, boxBottom, contentW, boxH, bgRGB[0], bgRGB[1], bgRGB[2])
    fillRect(margin, boxBottom, 4, boxH, accentRGB[0], accentRGB[1], accentRGB[2])

    drawText(title.toUpperCase(), margin + 12, y - 15, 'F2', 8.5, accentRGB[0], accentRGB[1], accentRGB[2])
    let lineY = y - 30
    for (const ln of lines) {
      drawText(ln, margin + 12, lineY, 'F1', 9.5, 0.118, 0.106, 0.294)
      lineY -= 13.5
    }
    y = boxBottom - 12
  }

  // 2. Strategic Objective
  drawSectionBlock('1. Strategic Objective', brief.objective, [0.486, 0.227, 0.929], [0.961, 0.953, 1.0])

  // 3. Collaboration Concept
  drawSectionBlock('2. Collaboration Concept', collab, [0.145, 0.388, 0.922], [0.937, 0.965, 1.0])

  // 4. Proposed 30-Day POC
  drawSectionBlock('3. Proposed 30-Day Proof of Concept (POC)', poc, [0.051, 0.580, 0.533], [0.941, 0.992, 0.980])

  // 5. 30-Day Implementation Timeline
  drawText('4. 30-DAY IMPLEMENTATION TIMELINE (WEEK 1 - WEEK 4)', margin, y - 4, 'F2', 9.5, 0.357, 0.129, 0.714)
  y -= 14

  const weekColors = [
    [0.486, 0.227, 0.929],
    [0.145, 0.388, 0.922],
    [0.051, 0.580, 0.533],
    [0.086, 0.639, 0.290],
  ]

  timeline.forEach((item, idx) => {
    const raw = typeof item === 'string' ? item : item.task || JSON.stringify(item)
    const lines = wrapText(raw, 76)
    const rowH = Math.max(24, lines.length * 12.5 + 10)
    const rowBottom = y - rowH
    const clr = weekColors[idx % 4]

    fillRect(margin, rowBottom, contentW, rowH, 0.98, 0.98, 0.99)
    fillRect(margin, rowBottom, 64, rowH, clr[0], clr[1], clr[2])
    drawText(`WEEK ${idx + 1}`, margin + 10, y - 15, 'F2', 8.5, 1, 1, 1)

    let ly = y - 14
    for (const ln of lines) {
      drawText(ln, margin + 74, ly, 'F1', 9, 0.118, 0.106, 0.294)
      ly -= 12.5
    }
    y = rowBottom - 5
  })

  y -= 8

  // 6. Measurable Success Metrics
  drawText('5. MEASURABLE SUCCESS METRICS & TARGET KPIS', margin, y - 4, 'F2', 9.5, 0.086, 0.639, 0.290)
  y -= 14

  metrics.forEach((m) => {
    const raw = typeof m === 'string' ? m : m.metric || JSON.stringify(m)
    const lines = wrapText(`[KPI]  ${raw}`, 85)
    for (const ln of lines) {
      if (y < 55) break
      drawText(ln, margin + 8, y - 10, 'F1', 9.2, 0.078, 0.325, 0.176)
      y -= 13
    }
    y -= 2
  })

  // 7. Footer
  fillRect(margin, 38, contentW, 0.8, 0.867, 0.839, 0.996)
  drawText(
    'Generated by BridgeWise (AI Cross-Border Startup Partnership Intelligence)  |  Powered by Gemma 4  |  All records illustrative.',
    margin,
    24,
    'F1',
    8,
    0.42,
    0.45,
    0.50
  )

  const contentStream = ops.join('\n')

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W.toFixed(2)} ${H.toFixed(2)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`,
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj',
    `6 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (const obj of objects) {
    offsets.push(pdf.length)
    pdf += obj + '\n'
  }
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${safeFileSlug(profile, partner)}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 3. Export Partnership Brief as Markdown (.md)
 */
export function exportBriefToMarkdown(profile, partner, brief) {
  if (!brief) return
  const md = [
    `# Partnership Action Brief: ${profile.company_name} × ${partner.partner_name || partner.name}\n`,
    `> **Generated by BridgeWise — AI Cross-Border Startup Partnership Intelligence**  `,
    `> Powered by Gemma 4 (gemma-4-26b-a4b-it) · All data illustrative\n\n`,
    `## 1. Strategic Objective\n${brief.objective}\n\n`,
    `## 2. Collaboration Concept\n${brief.collaboration_concept || brief.collaborationConcept}\n\n`,
    `## 3. Proposed 30-Day Proof of Concept\n${brief.proposed_poc || brief.proposedPoc}\n\n`,
    `## 4. 30-Day Implementation Timeline\n`,
    ...(brief.timeline || []).map((t, i) => `- **Week ${i + 1}:** ${t}\n`),
    `\n## 5. Measurable Success Metrics\n`,
    ...(brief.success_metrics || brief.successMetrics || []).map((m) => `- [ ] ${m}\n`),
    `\n---\n*BridgeWise Hackathon Demo · MLH Hacktoberfest KL 2026*`,
  ].join('')

  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${safeFileSlug(profile, partner)}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
