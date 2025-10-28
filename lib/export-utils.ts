import { format } from "date-fns"

interface TimelineItem {
  id: string
  title: string
  description: string
  time: Date
  type: string
}

// Generate a unique document ID
export function generateDocumentId(): string {
  const timestamp = new Date().getTime().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `DOC-${timestamp}-${randomPart}`
}

// Function to ensure text is properly embedded in the PDF
export function ensureTextExtractability(html: string): string {
  // Add text extraction helper script
  const textLayerScript = `
  <script>
    // This script ensures text content is properly extractable
    window.onload = function() {
      // Mark document as text-extractable for PDF generators
      document.documentElement.setAttribute('data-extractable', 'true');
      
      // Add data attributes to all text elements for better extraction
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, div, td, th');
      textElements.forEach(el => {
        if (el.textContent && el.textContent.trim() !== '') {
          // Add data attribute with text content
          el.setAttribute('data-text-content', el.textContent.trim());
          
          // Ensure text is not rendered as an image
          el.style.textRendering = 'geometricPrecision';
          el.style.webkitFontSmoothing = 'antialiased';
          
          // Add aria-label for accessibility and better text extraction
          if (!el.hasAttribute('aria-label')) {
            el.setAttribute('aria-label', el.textContent.trim());
          }
        }
      });
    }
  </script>
  `

  // Add meta tags for better text extraction
  const metaTags = `
  <meta name="pdf-engine" content="html2pdf">
  <meta name="text-rendering" content="geometricPrecision">
  <meta name="pdf-text-extractable" content="true">
  `

  // Add the meta tags to the head
  html = html.replace("<head>", `<head>\n${metaTags}`)

  // Add the script before the closing body tag
  return html.replace("</body>", `${textLayerScript}\n</body>`)
}

// Add the following functions after the generateDocumentId function

// Function to generate page numbers and table of contents
export function addPageNumbersAndTOC(html: string): string {
  // Add page number styling
  const styleEnd = "</style>"
  const pageNumberStyles = `
    .page-number {
      position: absolute;
      bottom: 40px; /* Position above the classification footer */
      right: 40px;
      font-size: 10px;
      color: var(--gray-500);
    }
    
    .page-break {
      page-break-after: always;
      position: relative;
      height: 0;
    }
    
    .toc {
      margin-bottom: 32px;
      page-break-after: always;
    }
    
    .toc-title {
      font-weight: 700;
      color: var(--gray-800);
      margin: 0 0 16px;
      font-size: 22px;
      letter-spacing: -0.01em;
    }
    
    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--gray-700);
    }
    
    .toc-item-title {
      font-weight: 500;
    }
    
    .toc-item-page {
      color: var(--gray-500);
    }
    
    .toc-item-dots {
      flex: 1;
      margin: 0 8px;
      border-bottom: 1px dotted var(--gray-300);
    }
  </style>`

  let modifiedHtml = html.replace(styleEnd, `${pageNumberStyles}\n${styleEnd}`)

  // Add table of contents after the summary section
  const summaryEnd = "</div>\n      </div>"
  const tableOfContents = `
      </div>
      
      <div class="toc">
        <h2 class="toc-title">Table of Contents</h2>
        <div class="toc-item">
          <span class="toc-item-title">1. Executive Overview</span>
          <span class="toc-item-dots"></span>
          <span class="toc-item-page">1</span>
        </div>
        <div class="toc-item">
          <span class="toc-item-title">2. Incident Information</span>
          <span class="toc-item-dots"></span>
          <span class="toc-item-page">1</span>
        </div>
        <div class="toc-item">
          <span class="toc-item-title">3. Timeline</span>
          <span class="toc-item-dots"></span>
          <span class="toc-item-page">2</span>
        </div>
        <div class="toc-item">
          <span class="toc-item-title">4. References & Resources</span>
          <span class="toc-item-dots"></span>
          <span class="toc-item-page">5</span>
        </div>
        <div class="toc-item">
          <span class="toc-item-title">5. Revision History</span>
          <span class="toc-item-dots"></span>
          <span class="toc-item-page">6</span>
        </div>
      </div>`

  modifiedHtml = modifiedHtml.replace(summaryEnd, `${tableOfContents}`)

  // Add page breaks and page numbers
  const phaseContainerEnd = "</div>\n          </div>"
  const pageBreak = `</div>\n          </div>\n          <div class="page-break"></div>\n          <div class="page-number">Page <span class="page-number-value"></span></div>`

  modifiedHtml = modifiedHtml.replace(new RegExp(phaseContainerEnd, "g"), pageBreak)

  // Add page numbering script
  const bodyEnd = "</body>"
  const pageNumberScript = `
  <script>
    // Add page numbers when printing
    window.onload = function() {
      const pageNumbers = document.querySelectorAll('.page-number-value');
      pageNumbers.forEach((el, index) => {
        el.textContent = index + 2; // Start from page 2 (after TOC)
      });
    }
  </script>
  </body>`

  modifiedHtml = modifiedHtml.replace(bodyEnd, pageNumberScript)

  return modifiedHtml
}

// Function to add handling instructions based on classification
export function addHandlingInstructions(html: string, classification: string): string {
  let instructions = ""

  switch (classification.toUpperCase()) {
    case "PUBLIC":
      instructions = `
        <div class="callout-box info">
          <div class="callout-title">Handling Instructions - PUBLIC</div>
          <div class="callout-content">
            <p>This document is classified as PUBLIC and may be freely distributed both internally and externally.</p>
            <p>No specific handling precautions are required.</p>
          </div>
        </div>`
      break
    case "INTERNAL USE ONLY":
    case "INTERNAL":
      instructions = `
        <div class="callout-box warning">
          <div class="callout-title">Handling Instructions - INTERNAL USE ONLY</div>
          <div class="callout-content">
            <p>This document is for internal use only and should not be shared outside the organization without approval.</p>
            <p>Store electronic copies only on approved internal systems. Do not store on personal devices.</p>
          </div>
        </div>`
      break
    case "CONFIDENTIAL":
      instructions = `
        <div class="callout-box danger">
          <div class="callout-title">Handling Instructions - CONFIDENTIAL</div>
          <div class="callout-content">
            <p>This document contains sensitive information. Access should be limited to authorized personnel only.</p>
            <p>Do not share electronically without encryption. Physical copies must be stored in locked containers when not in use.</p>
            <p>Disposal must be via secure shredding or deletion.</p>
          </div>
        </div>`
      break
    case "RESTRICTED":
      instructions = `
        <div class="callout-box danger" style="border-color: var(--classification-restricted); background-color: rgba(127, 29, 29, 0.1);">
          <div class="callout-title" style="color: var(--classification-restricted);">Handling Instructions - RESTRICTED</div>
          <div class="callout-content">
            <p>This document contains highly sensitive information. Access is restricted to named individuals only.</p>
            <p>Do not print unless absolutely necessary. Electronic copies must be encrypted at rest and in transit.</p>
            <p>Do not forward or share without explicit authorization. All access must be logged.</p>
            <p>Disposal must be witnessed and documented.</p>
          </div>
        </div>`
      break
    default:
      instructions = `
        <div class="callout-box info">
          <div class="callout-title">Handling Instructions</div>
          <div class="callout-content">
            <p>Handle according to your organization's information security policies.</p>
          </div>
        </div>`
  }

  // Add handling instructions after the info section
  const infoSectionEnd = "</div>\n      </div>"
  return html.replace(infoSectionEnd, `${infoSectionEnd}\n      ${instructions}`)
}

// Function to add document revision history
export function addRevisionHistory(html: string, documentId: string): string {
  const currentDate = format(new Date(), "MMMM d, yyyy")

  const revisionHistory = `
    <div class="references-section">
      <h3 class="references-title">Document Revision History</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background-color: var(--gray-100); text-align: left;">
            <th style="padding: 8px; border-bottom: 1px solid var(--gray-300);">Version</th>
            <th style="padding: 8px; border-bottom: 1px solid var(--gray-300);">Date</th>
            <th style="padding: 8px; border-bottom: 1px solid var(--gray-300);">Author</th>
            <th style="padding: 8px; border-bottom: 1px solid var(--gray-300);">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);">1.0</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);">${currentDate}</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);">ChronoSec System</td>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);">Initial document creation</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);"></td>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);"></td>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);"></td>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);"></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);"></td>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);"></td>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);"></td>
            <td style="padding: 8px; border-bottom: 1px solid var(--gray-200);"></td>
          </tr>
        </tbody>
      </table>
      <p style="font-size: 12px; color: var(--gray-500); margin-top: 12px;">Document ID: ${documentId}</p>
    </div>`

  // Add revision history before the footer
  const footerStart = '<div class="footer">'
  return html.replace(footerStart, `${revisionHistory}\n      ${footerStart}`)
}

// Add a new parameter to the exportToPDF function for classification level
// Modify the exportToPDF function to include a documentId parameter and use the new functions
export function exportToPDF(
  timeline: TimelineItem[],
  incidentType: string,
  framework: string,
  startTime: Date,
  classification = "", // Default to empty string instead of "CONFIDENTIAL"
  documentId?: string, // Optional document ID parameter
) {
  const incidentTypeName = getIncidentTypeName(incidentType)
  const frameworkName = getFrameworkName(framework)

  // Generate a document ID if not provided
  const docId = documentId || generateDocumentId()
  const generationDate = new Date()

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Incident Response Timeline - ${incidentTypeName}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
      
      :root {
        /* Organization branding colors */
        --org-primary-color: #041E42;
        --org-secondary-color: #4FD1C5;
        --org-accent-color: #805AD5;
        --org-text-color: #2D3748;
        --org-background-color: #F7FAFC;
        
        /* Custom color scheme */
        --primary-color: var(--org-primary-color);
        --primary-light: #E6F6F8;
        --secondary-color: var(--org-secondary-color);
        --accent-color: var(--org-accent-color);
        --success-color: #38B2AC;
        --warning-color: #DD6B20;
        --danger-color: #E53E3E;
        --gray-50: #F7FAFC;
        --gray-100: #EDF2F7;
        --gray-200: #E2E8F0;
        --gray-300: #CBD5E0;
        --gray-400: #A0AEC0;
        --gray-500: #718096;
        --gray-600: #4A5568;
        --gray-700: #2D3748;
        --gray-800: #1A202C;
        --gray-900: #171923;
      }
      
      body { 
        font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        line-height: 1.5; /* Improved line spacing */
        color: var(--gray-900);
        background-color: white;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-size: 12pt; /* Preferred font size */
      }
      
      .container {
        max-width: 95%; /* Wider content area */
        margin: 0 auto;
        padding: 0;
        background-color: white;
      }
      
      .header {
        padding: 30px 30px 20px;
        text-align: center;
        background: white;
        color: var(--gray-800);
        border-bottom: 1px solid var(--gray-200);
      }
      
      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
      }
      
      .logo-icon {
        width: 50px;
        height: 50px;
        background: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        color: var(--primary-color);
        font-weight: 600;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      h1 {
        color: var(--gray-800);
        font-weight: 700;
        margin: 0;
        font-size: 32px;
        letter-spacing: -0.01em;
      }
      
      .subtitle {
        color: rgba(255, 255, 255, 0.85);
        font-weight: 400;
        font-size: 15px;
        margin: 8px 0 0;
        letter-spacing: 0.2px;
      }
      
      .version-badge {
        display: inline-block;
        background-color: var(--gray-200);
        color: var(--gray-700);
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        margin-left: 8px;
        vertical-align: middle;
      }
      
      .content {
        padding: 30px 30px; /* Reduced padding for less dead space */
      }
      
      .info-section, .summary-section {
        padding: 20px; /* Reduced from 24px */
        margin-bottom: 24px; /* Reduced from 32px */
      }
      
      .info-row {
        display: flex;
        margin-bottom: 16px;
        align-items: baseline;
      }
      
      .info-row:last-child {
        margin-bottom: 0;
      }
      
      .info-label {
        font-weight: 600;
        width: 140px;
        color: var(--gray-700);
        font-size: 15px;
      }
      
      .info-value {
        flex: 1;
        color: var(--gray-800);
        font-weight: 500;
        font-size: 15px;
      }
      
      /* Document ID styling */
      .info-row.document-id {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--gray-200);
        font-family: monospace;
      }
      
      .info-value.document-id {
        font-weight: 600;
        letter-spacing: 0.5px;
        font-size: 14px;
      }
      
      .summary-section {
        background-color: var(--primary-light);
        padding: 20px; /* Reduced from 24px */
        border-radius: 16px;
        margin-bottom: 24px; /* Reduced from 32px */
        border-left: 4px solid var(--primary-color);
      }
      
      .summary-title {
        color: var(--primary-color);
        font-weight: 600;
        margin: 0 0 16px;
        font-size: 16px;
        display: flex;
        align-items: center;
      }
      
      .summary-content {
        color: var(--gray-700);
        font-size: 14px;
        line-height: 1.6;
      }
      
      .timeline-section {
        margin-bottom: 32px;
      }
      
      .section-title {
        font-weight: 700;
        color: var(--gray-800);
        margin: 0 0 24px;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--primary-light);
        font-size: 22px;
        letter-spacing: -0.01em;
      }
      
      .phase-container {
        margin-bottom: 30px; /* Reduced from 40px */
        padding: 20px; /* Reduced from 24px */
        border-radius: 12px;
        background-color: var(--gray-50);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        border-left: 4px solid var(--org-secondary-color);
        page-break-inside: avoid; /* Prevent breaking inside a phase container */
      }
      
      .phase-title {
        font-weight: 700;
        color: var(--org-primary-color);
        margin: 0 0 16px;
        font-size: 18px;
        display: flex;
        align-items: center;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--org-secondary-color);
      }
      
      .phase-description {
        color: var(--gray-700);
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 16px;
      }
      
      .timeline-item {
        margin-bottom: 20px; /* Reduced from 28px */
        padding: 20px; /* Reduced from 24px */
        border-radius: 12px;
        background-color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        position: relative;
        border-left: 4px solid transparent;
        transition: transform 0.2s ease;
        page-break-inside: avoid; /* Prevent breaking inside a timeline item */
      }
      
      .timeline-item:hover {
        transform: translateY(-2px);
      }
      
      .timeline-item:last-child {
        margin-bottom: 0;
      }
      
      .timeline-header, .timeline-description, .timeline-context, 
      .timeline-responsibility, .timeline-dependencies, 
      .timeline-checklist, .timeline-estimated-time, .timeline-reference {
        page-break-inside: avoid;
      }
      
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }
      
      .timeline-title-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .timeline-title {
        font-weight: 700;
        font-size: 18px;
        color: var(--gray-900);
        letter-spacing: -0.01em;
        margin-bottom: 4px;
      }
      
      .timeline-time {
        color: var(--gray-500);
        font-size: 14px;
        font-weight: 500;
        background-color: var(--gray-100);
        padding: 4px 10px;
        border-radius: 8px;
      }
      
      .timeline-description {
        color: var(--gray-700);
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 14px;
      }
      
      .timeline-type {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .timeline-reference {
        font-size: 12px;
        color: var(--gray-500);
        font-style: italic;
        border-top: 1px solid var(--gray-200);
        padding-top: 8px;
      }
      
      /* Callout box for important information */
      .callout-box {
        margin: 20px 0;
        padding: 16px;
        border-radius: 8px;
        border-left: 4px solid;
        background-color: var(--gray-50);
      }
      
      .callout-box.info {
        border-color: var(--secondary-color);
        background-color: rgba(79, 209, 197, 0.1);
      }
      
      .callout-box.warning {
        border-color: var(--warning-color);
        background-color: rgba(221, 107, 32, 0.1);
      }
      
      .callout-box.danger {
        border-color: var(--danger-color);
        background-color: rgba(229, 62, 62, 0.1);
      }
      
      .callout-title {
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .callout-content {
        font-size: 14px;
        line-height: 1.5;
      }
      
      .timeline-context, .timeline-checklist {
        margin-top: 10px; /* Reduced from 12px/16px */
        padding: 10px; /* Reduced from 12px */
      }
      
      .timeline-context-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--gray-800);
      }
      
      .timeline-responsibility {
        display: flex;
        align-items: center;
        margin-top: 12px;
        font-size: 13px;
      }
      
      .timeline-responsibility-label {
        font-weight: 600;
        color: var(--gray-700);
        margin-right: 8px;
      }
      
      .timeline-responsibility-value {
        color: var(--gray-800);
        background-color: var(--gray-100);
        padding: 2px 8px;
        border-radius: 4px;
      }
      
      .timeline-dependencies {
        margin-top: 12px;
        font-size: 13px;
        color: var(--gray-700);
      }
      
      .timeline-dependencies-title {
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .timeline-dependencies-list {
        margin: 0;
        padding-left: 20px;
      }
      
      .timeline-checklist-title {
        font-weight: 600;
        font-size: 13px;
        color: var(--gray-800);
        margin-bottom: 8px;
      }
      
      .timeline-checklist-items {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }
      
      .timeline-checklist-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 6px;
        font-size: 13px;
        color: var(--gray-700);
      }
      
      .timeline-checklist-item:before {
        content: "☐";
        margin-right: 8px;
        color: var(--gray-500);
      }
      
      .timeline-estimated-time {
        display: inline-block;
        margin-top: 12px;
        font-size: 12px;
        color: var(--gray-600);
        background-color: var(--gray-100);
        padding: 2px 8px;
        border-radius: 4px;
      }
      
      /* Type-specific colors */
      .identify { 
        border-left-color: var(--primary-color);
      }
      .identify .timeline-type { 
        background-color: var(--primary-light);
        color: var(--primary-color);
      }
      
      .notify { 
        border-left-color: var(--warning-color);
      }
      .notify .timeline-type { 
        background-color: #FFF8E0;
        color: var(--warning-color);
      }
      
      .contain { 
        border-left-color: var(--danger-color);
      }
      .contain .timeline-type { 
        background-color: #FFEFEE;
        color: var(--danger-color);
      }
      
      .document { 
        border-left-color: var(--accent-color);
      }
      .document .timeline-type { 
        background-color: #F7EEFF;
        color: var(--accent-color);
      }
      
      .remediate { 
        border-left-color: var(--success-color);
      }
      .remediate .timeline-type { 
        background-color: #E8F8ED;
        color: var(--success-color);
      }
      
      .report { 
        border-left-color: var(--secondary-color);
      }
      .report .timeline-type { 
        background-color: #E0F7FF;
        color: var(--secondary-color);
      }
      
      .assess { 
        border-left-color: var(--secondary-color);
      }
      .assess .timeline-type { 
        background-color: #EBF8FF;
        color: var(--secondary-color);
      }
      
      .analyze { 
        border-left-color: var(--accent-color);
      }
      .analyze .timeline-type { 
        background-color: #F5EBFF;
        color: var(--accent-color);
      }
      
      .review { 
        border-left-color: var(--secondary-color);
      }
      .review .timeline-type { 
        background-color: #EAFCFF;
        color: var(--secondary-color);
      }
      
      .references-section {
        background-color: var(--gray-50);
        padding: 24px;
        border-radius: 16px;
        margin-bottom: 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        page-break-inside: avoid; /* Prevent breaking inside references section */
      }
      
      .references-title {
        font-weight: 600;
        color: var(--gray-800);
        margin: 0 0 16px;
        font-size: 16px;
        letter-spacing: -0.01em;
      }
      
      .references-list {
        margin: 0;
        padding-left: 20px;
        color: var(--gray-600);
        font-size: 13px;
        line-height: 1.6;
      }
      
      .references-list li {
        margin-bottom: 8px;
      }
      
      .references-list li:last-child {
        margin-bottom: 0;
      }
      
      .footer {
        margin-top: 40px;
        padding: 24px 40px;
        background-color: white;
        color: var(--gray-600);
        font-size: 12px;
        text-align: center;
        border-top: 1px solid var(--gray-200);
      }
      
      .footer-branding {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
      }
      
      .footer-logo {
        height: 40px;
        max-width: 120px;
        object-fit: contain;
      }
      
      .footer-text {
        margin: 0;
        line-height: 1.6;
      }
      
      .footer-contact {
        margin: 8px 0 0;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.8);
      }
      
      .footer-copyright {
        margin: 4px 0 0;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.6);
      }
      
      /* Document metadata footer */
      .document-metadata {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: var(--gray-500);
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--gray-200);
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .container {
          margin: 0;
          max-width: 100%;
        }
        
        .page-break {
          page-break-after: always;
        }
      }

      .logo-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chronosec-logo {
        width: 40px;
        height: 40px;
      }

      .logo-text {
        font-size: 24px;
        font-weight: 700;
        color: var(--gray-800);
      }

      .footer-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .footer-logo-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .footer-logo {
        width: 20px;
        height: 20px;
      }

      .footer-logo-text {
        font-size: 16px;
        font-weight: 600;
        color: var(--gray-700);
      }

      .footer-text {
        margin: 0;
        line-height: 1.6;
      }
      
      /* Document metadata footer */
      .document-metadata {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: var(--gray-500);
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--gray-200);
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .container {
          margin: 0;
          max-width: 100%;
        }
        
        .page-break {
          page-break-after: always;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div>
          <h1>chronosec<span class="version-badge">v1.0</span></h1>
        </div>
        <p class="subtitle">Comprehensive incident documentation and compliance reporting</p>
      </div>
      
      <div class="content">
        <!-- Executive Overview Section -->
        <div class="info-section">
          <div class="info-row">
            <div class="info-label">Incident Type</div>
            <div class="info-value">${incidentTypeName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Framework</div>
            <div class="info-value">${frameworkName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Start Time</div>
            <div class="info-value">${format(startTime, "MMMM d, yyyy h:mm a")}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Generated</div>
            <div class="info-value">${format(generationDate, "MMMM d, yyyy h:mm a")}</div>
          </div>
          <div class="info-row document-id">
            <div class="info-label">Document ID</div>
            <div class="info-value document-id">${docId}</div>
          </div>
        </div>
        
        <div class="summary-section">
          <h3 class="summary-title">Executive Overview</h3>
          <div class="summary-content">
            <p>
              This timeline includes ${timeline.length} steps across 
              ${Math.ceil((new Date(timeline[timeline.length - 1].time).getTime() - new Date(timeline[0].time).getTime()) / (1000 * 60 * 60 * 24))} days, 
              following ${frameworkName} requirements for a ${incidentTypeName.toLowerCase()}.
            </p>
            <p>
              The timeline begins with the initial detection on ${format(timeline[0].time, "MMMM d, yyyy")} 
              and concludes with ${timeline[timeline.length - 1].title} on 
              ${format(timeline[timeline.length - 1].time, "MMMM d, yyyy")}.
            </p>
          </div>
        </div>
        
        <!-- Important information callout -->
        <div class="callout-box info">
          <div class="callout-title">Important Information</div>
          <div class="callout-content">
            This document contains information related to a security incident. Handle according to your organization's information handling procedures.
          </div>
        </div>
        
        <!-- Reorganized Timeline Section with Phases -->
        <div class="timeline-section">
          <h2 class="section-title">Incident Response Timeline</h2>
          
          <!-- Phase 1: Detection & Initial Response -->
          <div class="phase-container">
            <h3 class="phase-title">Phase 1: Detection & Initial Response</h3>
            <p class="phase-description">
              This phase focuses on identifying the incident, gathering initial information, and taking immediate containment actions.
              Quick and accurate detection is critical to minimizing the impact of security incidents.
            </p>
            
            ${timeline
              .filter((item) => ["identify", "assess", "analyze"].includes(item.type))
              .map(
                (item, index) => `
              <div class="timeline-item ${item.type}">
                <div class="timeline-header">
                  <div class="timeline-title-group">
                    <span class="timeline-title">${item.title}</span>
                    <span class="timeline-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                  </div>
                  <span class="timeline-time">${format(item.time, "MMM d, yyyy h:mm a")}</span>
                </div>
                <div class="timeline-description">${item.description}</div>
                
                <!-- Added contextual information -->
                <div class="timeline-context">
                  <div class="timeline-context-title">Why This Matters:</div>
                  <p>${getContextualInformation(item.type)}</p>
                </div>
                
                <!-- Added role responsibility -->
                <div class="timeline-responsibility">
                  <span class="timeline-responsibility-label">Responsible:</span>
                  <span class="timeline-responsibility-value">${getResponsibleRole(item.type)}</span>
                </div>
                
                <!-- Added dependencies if applicable -->
                ${
                  index > 0
                    ? `
                <div class="timeline-dependencies">
                  <div class="timeline-dependencies-title">Dependencies:</div>
                  <ul class="timeline-dependencies-list">
                    <li>Complete previous steps before proceeding</li>
                  </ul>
                </div>
                `
                    : ""
                }
                
                <!-- Added practical checklist -->
                <div class="timeline-checklist">
                  <div class="timeline-checklist-title">Action Checklist:</div>
                  <ul class="timeline-checklist-items">
                    ${getActionChecklist(item.type)
                      .map((action) => `<li class="timeline-checklist-item">${action}</li>`)
                      .join("")}
                  </ul>
                </div>
                
                <!-- Added estimated time -->
                <div class="timeline-estimated-time">
                  Estimated time: ${getEstimatedTime(item.type)}
                </div>
                
                <div class="timeline-reference">
                  Reference: ${getReferenceCitation(item.type, framework)}
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <!-- Phase 2: Documentation & Notification -->
          <div class="phase-container">
            <h3 class="phase-title">Phase 2: Documentation & Notification</h3>
            <p class="phase-description">
              This phase focuses on properly documenting the incident and notifying all required stakeholders according to compliance requirements.
              Proper documentation and timely notification are critical for regulatory compliance.
            </p>
            
            ${timeline
              .filter((item) => ["document", "notify"].includes(item.type))
              .map(
                (item, index) => `
              <div class="timeline-item ${item.type}">
                <div class="timeline-header">
                  <div class="timeline-title-group">
                    <span class="timeline-title">${item.title}</span>
                    <span class="timeline-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                  </div>
                  <span class="timeline-time">${format(item.time, "MMM d, yyyy h:mm a")}</span>
                </div>
                <div class="timeline-description">${item.description}</div>
                
                <!-- Added contextual information -->
                <div class="timeline-context">
                  <div class="timeline-context-title">Why This Matters:</div>
                  <p>${getContextualInformation(item.type)}</p>
                </div>
                
                <!-- Added role responsibility -->
                <div class="timeline-responsibility">
                  <span class="timeline-responsibility-label">Responsible:</span>
                  <span class="timeline-responsibility-value">${getResponsibleRole(item.type)}</span>
                </div>
                
                <!-- Added dependencies if applicable -->
                <div class="timeline-dependencies">
                  <div class="timeline-dependencies-title">Dependencies:</div>
                  <ul class="timeline-dependencies-list">
                    <li>Complete Phase 1 before proceeding with notifications</li>
                    ${item.type === "notify" ? "<li>Ensure documentation is complete before external notification</li>" : ""}
                  </ul>
                </div>
                
                <!-- Added practical checklist -->
                <div class="timeline-checklist">
                  <div class="timeline-checklist-title">Action Checklist:</div>
                  <ul class="timeline-checklist-items">
                    ${getActionChecklist(item.type)
                      .map((action) => `<li class="timeline-checklist-item">${action}</li>`)
                      .join("")}
                  </ul>
                </div>
                
                <!-- Added estimated time -->
                <div class="timeline-estimated-time">
                  Estimated time: ${getEstimatedTime(item.type)}
                </div>
                
                <div class="timeline-reference">
                  Reference: ${getReferenceCitation(item.type, framework)}
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <!-- Phase 3: Containment & Remediation -->
          <div class="phase-container">
            <h3 class="phase-title">Phase 3: Containment & Remediation</h3>
            <p class="phase-description">
              This phase focuses on containing the incident to prevent further damage and implementing remediation measures to restore normal operations.
              Effective containment and remediation are essential to limiting the impact of the incident.
            </p>
            
            ${timeline
              .filter((item) => ["contain", "remediate"].includes(item.type))
              .map(
                (item, index) => `
              <div class="timeline-item ${item.type}">
                <div class="timeline-header">
                  <div class="timeline-title-group">
                    <span class="timeline-title">${item.title}</span>
                    <span class="timeline-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                  </div>
                  <span class="timeline-time">${format(item.time, "MMM d, yyyy h:mm a")}</span>
                </div>
                <div class="timeline-description">${item.description}</div>
                
                <!-- Added contextual information -->
                <div class="timeline-context">
                  <div class="timeline-context-title">Why This Matters:</div>
                  <p>${getContextualInformation(item.type)}</p>
                </div>
                
                <!-- Added role responsibility -->
                <div class="timeline-responsibility">
                  <span class="timeline-responsibility-label">Responsible:</span>
                  <span class="timeline-responsibility-value">${getResponsibleRole(item.type)}</span>
                </div>
                
                <!-- Added dependencies if applicable -->
                <div class="timeline-dependencies">
                  <div class="timeline-dependencies-title">Dependencies:</div>
                  <ul class="timeline-dependencies-list">
                    <li>Complete initial assessment before containment</li>
                    ${item.type === "remediate" ? "<li>Ensure containment is complete before full remediation</li>" : ""}
                  </ul>
                </div>
                
                <!-- Added practical checklist -->
                <div class="timeline-checklist">
                  <div class="timeline-checklist-title">Action Checklist:</div>
                  <ul class="timeline-checklist-items">
                    ${getActionChecklist(item.type)
                      .map((action) => `<li class="timeline-checklist-item">${action}</li>`)
                      .join("")}
                  </ul>
                </div>
                
                <!-- Added estimated time -->
                <div class="timeline-estimated-time">
                  Estimated time: ${getEstimatedTime(item.type)}
                </div>
                
                <div class="timeline-reference">
                  Reference: ${getReferenceCitation(item.type, framework)}
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <!-- Phase 4: Reporting & Review -->
          <div class="phase-container">
            <h3 class="phase-title">Phase 4: Reporting & Review</h3>
            <p class="phase-description">
              This phase focuses on formal reporting to authorities and conducting a post-incident review to identify lessons learned.
              Thorough reporting and review help improve future incident response capabilities.
            </p>
            
            ${timeline
              .filter((item) => ["report", "review"].includes(item.type))
              .map(
                (item, index) => `
              <div class="timeline-item ${item.type}">
                <div class="timeline-header">
                  <div class="timeline-title-group">
                    <span class="timeline-title">${item.title}</span>
                    <span class="timeline-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                  </div>
                  <span class="timeline-time">${format(item.time, "MMM d, yyyy h:mm a")}</span>
                </div>
                <div class="timeline-description">${item.description}</div>
                
                <!-- Added contextual information -->
                <div class="timeline-context">
                  <div class="timeline-context-title">Why This Matters:</div>
                  <p>${getContextualInformation(item.type)}</p>
                </div>
                
                <!-- Added role responsibility -->
                <div class="timeline-responsibility">
                  <span class="timeline-responsibility-label">Responsible:</span>
                  <span class="timeline-responsibility-value">${getResponsibleRole(item.type)}</span>
                </div>
                
                <!-- Added dependencies if applicable -->
                <div class="timeline-dependencies">
                  <div class="timeline-dependencies-title">Dependencies:</div>
                  <ul class="timeline-dependencies-list">
                    <li>Complete remediation before final reporting</li>
                    ${item.type === "review" ? "<li>Ensure all documentation and reports are finalized before review</li>" : ""}
                  </ul>
                </div>
                
                <!-- Added practical checklist -->
                <div class="timeline-checklist">
                  <div class="timeline-checklist-title">Action Checklist:</div>
                  <ul class="timeline-checklist-items">
                    ${getActionChecklist(item.type)
                      .map((action) => `<li class="timeline-checklist-item">${action}</li>`)
                      .join("")}
                  </ul>
                </div>
                
                <!-- Added estimated time -->
                <div class="timeline-estimated-time">
                  Estimated time: ${getEstimatedTime(item.type)}
                </div>
                
                <div class="timeline-reference">
                  Reference: ${getReferenceCitation(item.type, framework)}
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
        
        <div class="references-section">
          <h3 class="references-title">References & Resources</h3>
          <ol class="references-list">
            ${getFrameworkReferences(framework)}
          </ol>
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-content">
          <p class="footer-text">
            Generated on ${format(generationDate, "MMMM d, yyyy h:mm a")} • chronosec
          </p>
          <div class="document-metadata">
            <span>Document ID: ${docId}</span>
            <span>Version: 1.0</span>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
`

  // Apply text extraction enhancements
  const enhancedHtml = ensureTextExtractability(htmlContent)

  try {
    // Create a blob from the HTML content
    const blob = new Blob([enhancedHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    // Create a link to download the HTML file
    const a = document.createElement("a")
    a.href = url
    a.download = `${incidentTypeName.replace(/\s+/g, "-").toLowerCase()}-timeline-${format(new Date(), "yyyy-MM-dd")}.html`
    document.body.appendChild(a)

    // Check if html2pdf is available and use it if possible
    if (typeof window !== "undefined" && window.html2pdf) {
      // Create a temporary container for the HTML content
      const container = document.createElement("div")
      container.innerHTML = enhancedHtml
      document.body.appendChild(container)

      // Configure html2pdf options
      const options = {
        margin: [15, 15, 15, 15],
        filename: `${incidentTypeName.replace(/\s+/g, "-").toLowerCase()}-timeline-${format(new Date(), "yyyy-MM-dd")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          foreignObjectRendering: false, // Disable foreignObject rendering to avoid issues
          logging: false,
          removeContainer: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: false, // Disable compression for better text extraction
          textRenderingMode: "fill", // Ensure text is rendered as text, not paths
          putOnlyUsedFonts: true,
          floatPrecision: 16, // Higher precision for better text positioning
        },
        download: true,
      }

      // Generate PDF
      window
        .html2pdf()
        .from(container)
        .set(options)
        .save()
        .then(() => {
          // Remove the temporary container after PDF generation
          document.body.removeChild(container)
          URL.revokeObjectURL(url)
          document.body.removeChild(a)

          // Show success message
          const successMessage = document.createElement("div")
          successMessage.style.position = "fixed"
          successMessage.style.bottom = "20px"
          successMessage.style.right = "20px"
          successMessage.style.padding = "10px 20px"
          successMessage.style.backgroundColor = "#10b981"
          successMessage.style.color = "white"
          successMessage.style.borderRadius = "8px"
          successMessage.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"
          successMessage.style.zIndex = "9999"
          successMessage.style.fontFamily = "system-ui, -apple-system, sans-serif"
          successMessage.style.fontSize = "14px"
          successMessage.textContent = "PDF downloaded successfully!"

          document.body.appendChild(successMessage)

          setTimeout(() => {
            document.body.removeChild(successMessage)
          }, 3000)
        })
        .catch((error) => {
          console.error("PDF generation error:", error)
          // Fallback to HTML download
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          alert("PDF generation failed. An HTML version has been downloaded instead.")
        })
    } else {
      // Fallback to HTML download if html2pdf is not available
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.warn("html2pdf library not available, falling back to HTML download")

      // Show message
      const message = document.createElement("div")
      message.style.position = "fixed"
      message.style.bottom = "20px"
      message.style.right = "20px"
      message.style.padding = "10px 20px"
      message.style.backgroundColor = "#f59e0b"
      message.style.color = "white"
      message.style.borderRadius = "8px"
      message.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"
      message.style.zIndex = "9999"
      message.style.fontFamily = "system-ui, -apple-system, sans-serif"
      message.style.fontSize = "14px"
      message.textContent = "HTML file downloaded (PDF conversion not available)"

      document.body.appendChild(message)

      setTimeout(() => {
        document.body.removeChild(message)
      }, 3000)
    }
  } catch (error) {
    console.error("Export error:", error)
    alert("There was an error generating the document. Please try again later.")
  }
}

// Helper function to get classification styling
export function getClassificationStyle(classification: string): string {
  switch (classification.toUpperCase()) {
    case "PUBLIC":
      return "background-color: var(--classification-public);"
    case "INTERNAL USE ONLY":
    case "INTERNAL":
      return "background-color: var(--classification-internal);"
    case "CONFIDENTIAL":
      return "background-color: var(--classification-confidential);"
    case "RESTRICTED":
      return "background-color: var(--classification-restricted);"
    default:
      return "background-color: var(--classification-confidential);"
  }
}

export function exportToCustomPDF(
  timeline: TimelineItem[],
  incidentType: string,
  framework: string,
  startTime: Date,
  customizeHtml: (html: string) => string,
) {
  const incidentTypeName = getIncidentTypeName(incidentType)
  const frameworkName = getFrameworkName(framework)
  const documentId = generateDocumentId()

  // Create the base HTML content
  let htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Incident Response Timeline - ${incidentTypeName}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      :root {
        --apple-gray-50: #f9fafb;
        --apple-gray-100: #f3f4f6;
        --apple-gray-200: #e5e7eb;
        --apple-gray-300: #d1d5db;
        --apple-gray-400: #9ca3af;
        --apple-gray-500: #6b7280;
        --apple-gray-600: #4b5563;
        --apple-gray-700: #374151;
        --apple-gray-800: #1f2937;
        --apple-gray-900: #111827;
        --apple-blue: #0077ED;
        --apple-blue-light: #E8F3FF;
        --apple-red: #FF3B30;
        --apple-green: #34C759;
        --apple-yellow: #FFCC00;
        --apple-purple: #AF52DE;
        --apple-orange: #FF9500;
      }
      
      body { 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif;
        margin: 0;
        padding: 0;
        line-height: 1.5; /* Improved line spacing */
        color: var(--apple-gray-900);
        background-color: white;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-size: 12pt; /* Preferred font size */
      }
      
      .container {
        max-width: 800px; /* Controls line length */
        margin: 0 auto;
        padding: 0;
        background-color: white;
      }
      
      .header {
        padding: 40px 40px 30px;
        text-align: center;
        border-bottom: 1px solid var(--apple-gray-200);
      }
      
      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
      }
      
      .logo-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, var(--apple-blue), #5AC8FA);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        color: white;
        font-weight: 600;
        font-size: 20px;
        box-shadow: 0 2px 8px rgba(0, 119, 237, 0.2);
      }
      
      h1 {
        color: var(--apple-gray-900);
        font-weight: 700;
        margin: 0 0 8px;
        font-size: 28px;
        letter-spacing: -0.02em;
      }
      
      .subtitle {
        color: var(--apple-gray-500);
        font-weight: 400;
        font-size: 16px;
        margin: 0;
      }
      
      .version-badge {
        display: inline-block;
        background-color: var(--apple-blue);
        color: white;
        font-size: 12px;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 10px;
        margin-left: 8px;
        vertical-align: middle;
      }
      
      .content {
        padding: 40px 60px; /* Increased horizontal padding */
      }
      
      .info-section {
        background-color: var(--apple-gray-50);
        padding: 24px;
        border-radius: 16px;
        margin-bottom: 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      .info-row {
        display: flex;
        margin-bottom: 12px;
      }
      
      .info-row:last-child {
        margin-bottom: 0;
      }
      
      .info-label {
        font-weight: 500;
        width: 150px;
        color: var(--apple-gray-700);
      }
      
      .info-value {
        flex: 1;
        color: var(--apple-gray-600);
      }
      
      /* Document ID styling */
      .info-row.document-id {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px dashed var(--apple-gray-300);
        font-family: monospace;
      }
      
      .info-value.document-id {
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      
      .summary-section {
        background-color: var(--apple-blue-light);
        padding: 24px;
        border-radius: 16px;
        margin-bottom: 32px;
        border-left: 4px solid var(--apple-blue);
      }
      
      .summary-title {
        color: var(--apple-blue);
        font-weight: 600;
        margin: 0 0 16px;
        font-size: 16px;
        display: flex;
        align-items: center;
      }
      
      .summary-content {
        color: var(--apple-gray-700);
        font-size: 14px;
        line-height: 1.6;
      }
      
      .timeline-section {
        margin-bottom: 32px;
      }
      
      .section-title {
        font-weight: 600;
        color: var(--apple-gray-800);
        margin: 0 0 24px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--apple-gray-200);
        font-size: 20px;
        letter-spacing: -0.01em;
      }
      
      .timeline-item {
        margin-bottom: 28px; /* Increased spacing between items */
        padding: 24px; /* Increased padding inside items */
        border-radius: 12px;
        background-color: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
        position: relative;
        border-left: 4px solid transparent;
      }
      
      .timeline-item:last-child {
        margin-bottom: 0;
      }
      
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }
      
      .timeline-title-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .timeline-title {
        font-weight: 600;
        font-size: 17px; /* Slightly larger */
        color: var(--apple-gray-900);
        letter-spacing: -0.01em;
        margin-bottom: 4px; /* Add some space below the title */
      }
      
      .timeline-time {
        color: var(--apple-gray-500);
        font-size: 14px;
        font-weight: 500;
        background-color: var(--apple-gray-100);
        padding: 4px 10px;
        border-radius: 8px;
      }
      
      .timeline-description {
        color: var(--apple-gray-600);
        font-size: 14.5px; /* Slightly larger */
        line-height: 1.6;
        margin-bottom: 14px; /* More space before references */
      }
      
      .timeline-type {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .timeline-reference {
        font-size: 12px;
        color: var(--apple-gray-500);
        font-style: italic;
        border-top: 1px solid var(--apple-gray-200);
        padding-top: 8px;
      }
      
      .identify { 
        border-left-color: var(--apple-blue);
      }
      .identify .timeline-type { 
        background-color: var(--apple-blue-light);
        color: var(--apple-blue);
      }
      
      .notify { 
        border-left-color: var(--apple-yellow);
      }
      .notify .timeline-type { 
        background-color: #FFF8E0;
        color: #B38600;
      }
      
      .contain { 
        border-left-color: var(--apple-red);
      }
      .contain .timeline-type { 
        background-color: #FFEFEE;
        color: var(--apple-red);
      }
      
      .document { 
        border-left-color: var(--apple-purple);
      }
      .document .timeline-type { 
        background-color: #F7EEFF;
        color: var(--apple-purple);
      }
      
      .remediate { 
        border-left-color: var(--apple-green);
      }
      .remediate .timeline-type { 
        background-color: #E8F8ED;
        color: var(--apple-green);
      }
      
      .report { 
        border-left-color: var(--apple-orange);
      }
      .report .timeline-type { 
        background-color: #FFF2E6;
        color: var(--apple-orange);
      }
      
      .assess { 
        border-left-color: #5AC8FA;
      }
      .assess .timeline-type { 
        background-color: #EBF8FF;
        color: #0088CC;
      }
      
      .analyze { 
        border-left-color: #BF5AF2;
      }
      .analyze .timeline-type { 
        background-color: #F5EBFF;
        color: #9F2FE0;
      }
      
      .review { 
        border-left-color: #64D2FF;
      }
      .review .timeline-type { 
        background-color: #EAFCFF;
        color: #00A3D7;
      }
      
      .references-section {
        background-color: var(--apple-gray-50);
        padding: 24px;
        border-radius: 16px;
        margin-bottom: 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      .references-title {
        font-weight: 600;
        color: var(--apple-gray-800);
        margin: 0 0 16px;
        font-size: 16px;
        letter-spacing: -0.01em;
      }
      
      .references-list {
        margin: 0;
        padding-left: 20px;
        color: var(--apple-gray-600);
        font-size: 13px;
        line-height: 1.6;
      }
      
      .references-list li {
        margin-bottom: 8px;
      }
      
      .references-list li:last-child {
        margin-bottom: 0;
      }
      
      .footer {
        margin-top: 40px;
        padding: 24px 40px;
        border-top: 1px solid var(--apple-gray-200);
        color: var(--apple-gray-500);
        font-size: 12px;
        text-align: center;
      }
      
      .footer-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
      }
      
      .footer-text {
        margin: 0;
        line-height: 1.6;
      }

      .footer-copyright {
        margin: 4px 0 0;
        font-size: 10px;
        color: var(--apple-gray-400);
        opacity: 0.7;
      }
      
      /* Document metadata footer */
      .document-metadata {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: var(--apple-gray-500);
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--apple-gray-200);
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .container {
          margin: 0;
          max-width: 100%;
        }
        
        .page-break {
          page-break-after: always;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div>
          <h1>chronosec<span class="version-badge">v1.0</span></h1>
        </div>
        <p class="subtitle">Compliance-aligned incident response timelines, delivered on time, every time</p>
      </div>
      
      <div class="content">
        <div class="info-section">
          <div class="info-row">
            <div class="info-label">Incident Type</div>
            <div class="info-value">${incidentTypeName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Framework</div>
            <div class="info-value">${frameworkName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Start Time</div>
            <div class="info-value">${format(startTime, "MMMM d, yyyy h:mm a")}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Generated</div>
            <div class="info-value">${format(new Date(), "MMMM d, yyyy h:mm a")}</div>
          </div>
          <div class="info-row document-id">
            <div class="info-label">Document ID</div>
            <div class="info-value document-id">${documentId}</div>
          </div>
        </div>
        
        <div class="summary-section">
          <h3 class="summary-title">Timeline Summary</h3>
          <div class="summary-content">
            <p>
              This timeline includes ${timeline.length} steps across 
              ${Math.ceil((new Date(timeline[timeline.length - 1].time).getTime() - new Date(timeline[0].time).getTime()) / (1000 * 60 * 60 * 24))} days, 
              following ${frameworkName} requirements for a ${incidentTypeName.toLowerCase()}.
            </p>
            <p>
              The timeline begins with the initial detection on ${format(timeline[0].time, "MMMM d, yyyy")} 
              and concludes with ${timeline[timeline.length - 1].title} on 
              ${format(timeline[timeline.length - 1].time, "MMMM d, yyyy")}.
            </p>
          </div>
        </div>
        
        <div class="timeline-section">
          <h2 class="section-title">Incident Response Timeline</h2>
          
          ${timeline
            .map(
              (item, index) => `
            <div class="timeline-item ${item.type}">
              <div class="timeline-header">
                <div class="timeline-title-group">
                  <span class="timeline-title">${item.title}</span>
                  <span class="timeline-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                </div>
                <span class="timeline-time">${format(item.time, "MMM d, yyyy h:mm a")}</span>
              </div>
              <div class="timeline-description">${item.description}</div>
              <div class="timeline-reference">
                Reference: ${getReferenceCitation(item.type, framework)}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="references-section">
          <h3 class="references-title">References & Sources</h3>
          <ol class="references-list">
            ${getFrameworkReferences(framework)}
          </ol>
        </div>
      </div>
      
      <div class="footer">
        <p class="footer-text">
          Generated on ${format(new Date(), "MMMM d, yyyy")} by chronosec • Compliance-aligned incident response timelines
        </p>
        <p class="footer-copyright">
          © ${new Date().getFullYear()} chronosec. All rights reserved.
        </p>
        <div class="document-metadata">
          <span>Document ID: ${documentId}</span>
          <span>Version: 1.0</span>
        </div>
      </div>
    </div>
  </body>
  </html>
  `

  // Apply custom modifications to the HTML
  htmlContent = customizeHtml(htmlContent)

  // Apply text extraction enhancements
  htmlContent = ensureTextExtractability(htmlContent)

  // Rest of the PDF generation code remains the same as in exportToPDF
  try {
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    // Create a link to download the HTML file
    const a = document.createElement("a")
    a.href = url
    a.download = `${incidentTypeName.replace(/\s+/g, "-").toLowerCase()}-timeline-${format(new Date(), "yyyy-MM-dd")}.html`
    document.body.appendChild(a)

    // Check if html2pdf is available and use it if possible
    if (typeof window !== "undefined" && window.html2pdf) {
      // Create a temporary container for the HTML content
      const container = document.createElement("div")
      container.innerHTML = htmlContent
      document.body.appendChild(container)

      // Configure html2pdf options
      const options = {
        margin: [15, 15, 15, 15] /* Increased margins */,
        filename: `${incidentTypeName.replace(/\s+/g, "-").toLowerCase()}-timeline-${format(new Date(), "yyyy-MM-dd")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2 /* Reduced scale for better compatibility */,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          foreignObjectRendering: false,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: false,
        },
        download: true,
      }

      // Generate PDF
      window
        .html2pdf()
        .from(container)
        .set(options)
        .save()
        .then(() => {
          // Remove the temporary container after PDF generation
          document.body.removeChild(container)
          URL.revokeObjectURL(url)
          document.body.removeChild(a)

          // Show success message
          const successMessage = document.createElement("div")
          successMessage.style.position = "fixed"
          successMessage.style.bottom = "20px"
          successMessage.style.right = "20px"
          successMessage.style.padding = "10px 20px"
          successMessage.style.backgroundColor = "#34C759"
          successMessage.style.color = "white"
          successMessage.style.borderRadius = "8px"
          successMessage.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"
          successMessage.style.zIndex = "9999"
          successMessage.style.fontFamily = "system-ui, -apple-system, sans-serif"
          successMessage.style.fontSize = "14px"
          successMessage.textContent = "PDF downloaded successfully!"

          document.body.appendChild(successMessage)

          setTimeout(() => {
            document.body.removeChild(successMessage)
          }, 3000)
        })
        .catch((error) => {
          console.error("PDF generation error:", error)
          // Fallback to HTML download
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          alert("PDF generation failed. An HTML version has been downloaded instead.")
        })
    } else {
      // Fallback to HTML download if html2pdf is not available
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.warn("html2pdf library not available, falling back to HTML download")

      // Show message
      const message = document.createElement("div")
      message.style.position = "fixed"
      message.style.bottom = "20px"
      message.style.right = "20px"
      message.style.padding = "10px 20px"
      message.style.backgroundColor = "#f59e0b"
      message.style.color = "white"
      message.style.borderRadius = "8px"
      message.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"
      message.style.zIndex = "9999"
      message.style.fontFamily = "system-ui, -apple-system, sans-serif"
      message.style.fontSize = "14px"
      message.textContent = "HTML file downloaded (PDF conversion not available)"

      document.body.appendChild(message)

      setTimeout(() => {
        document.body.removeChild(message)
      }, 3000)
    }
  } catch (error) {
    console.error("Export error:", error)
    alert("There was an error generating the document. Please try again later.")
  }
}

// Update the exportToMarkdown function to match the naming convention
export function exportToMarkdown(timeline: TimelineItem[], incidentType: string, framework: string, startTime: Date) {
  const incidentTypeName = getIncidentTypeName(incidentType)
  const frameworkName = getFrameworkName(framework)
  const documentId = generateDocumentId()

  const markdownContent = `
# Incident Response Timeline

## Document ID: ${documentId}

## Overview

**Incident Type:** ${incidentTypeName}  
**Framework:** ${frameworkName}  
**Start Time:** ${format(startTime, "MMMM d, yyyy h:mm a")}  
**Generated:** ${format(new Date(), "MMMM d, yyyy h:mm a")}

## Timeline

${timeline
  .map(
    (item) => `
### ${item.title}
**Time:** ${format(item.time, "MMM d, yyyy h:mm a")}  
**Type:** ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}

${item.description}
`,
  )
  .join("\n")}

---
*Generated on ${format(new Date(), "MMMM d, yyyy")} using the Incident Response Timeline Simulator*  
*Document ID: ${documentId}*
`

  // Create a blob and download it
  const blob = new Blob([markdownContent], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `incident-timeline-${format(new Date(), "yyyy-MM-dd")}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getIncidentTypeName(incidentType: string): string {
  const incidentTypes: Record<string, string> = {
    ransomware: "Ransomware Attack",
    phishing: "Phishing Campaign",
    data_breach: "Data Breach",
    ddos: "DDoS Attack",
    malware: "Malware Infection",
    insider_threat: "Insider Threat",
    physical_breach: "Physical Security Breach",
  }

  return incidentTypes[incidentType] || incidentType
}

function getFrameworkName(framework: string): string {
  const frameworks: Record<string, string> = {
    nerc_cip: "NERC CIP-008",
    gdpr: "GDPR",
    hipaa: "HIPAA",
    pci_dss: "PCI DSS",
    ferc: "FERC",
    nist: "NIST Cybersecurity Framework",
    ccpa: "CCPA",
  }

  return frameworks[framework] || framework
}

// Helper function to get reference citation based on incident type and framework
function getReferenceCitation(type: string, framework: string): string {
  const citations: Record<string, Record<string, string>> = {
    hipaa: {
      identify: "HIPAA Security Rule, 45 CFR § 164.308(a)(6)(ii)",
      notify: "HIPAA Breach Notification Rule, 45 CFR §§ 164.400-414",
      contain: "HHS Guidance on HIPAA Security Rule Contingency Planning",
      document: "HIPAA Security Rule, 45 CFR § 164.308(a)(6)(ii)",
      remediate: "HIPAA Security Rule, 45 CFR § 164.308(a)(7)(ii)",
      report: "HIPAA Breach Notification Rule, 45 CFR § 164.404",
      assess: "HIPAA Security Rule, 45 CFR § 164.308(a)(1)(ii)(A)",
      analyze: "HIPAA Security Rule, 45 CFR § 164.308(a)(6)(ii)",
      review: "HIPAA Security Rule, 45 CFR § 164.308(a)(8)",
    },
    gdpr: {
      identify: "GDPR Article 33(1)",
      notify: "GDPR Articles 33-34",
      contain: "GDPR Article 32",
      document: "GDPR Article 33(5)",
      remediate: "GDPR Article 32",
      report: "GDPR Article 33(1)",
      assess: "GDPR Article 35",
      analyze: "GDPR Article 33(3)(d)",
      review: "GDPR Article 32(1)(d)",
    },
    nist: {
      identify: "NIST SP 800-61r2, Section 3.2.1",
      notify: "NIST SP 800-61r2, Section 3.2.7",
      contain: "NIST SP 800-61r2, Section 3.3.1",
      document: "NIST SP 800-61r2, Section 3.3.2",
      remediate: "NIST SP 800-61r2, Section 3.4",
      report: "NIST SP 800-61r2, Section 3.4.3",
      assess: "NIST SP 800-61r2, Section 3.2.6",
      analyze: "NIST SP 800-61r2, Section 3.2.4",
      review: "NIST SP 800-61r2, Section 3.4.1",
    },
    pci_dss: {
      identify: "PCI DSS v4.0, Requirement 12.10.1",
      notify: "PCI DSS v4.0, Requirement 12.10.4",
      contain: "PCI DSS v4.0, Requirement 12.10.5",
      document: "PCI DSS v4.0, Requirement 12.10.6",
      remediate: "PCI DSS v4.0, Requirement 12.10.7",
      report: "PCI DSS v4.0, Requirement 12.10.4",
      assess: "PCI DSS v4.0, Requirement 12.10.3",
      analyze: "PCI DSS v4.0, Requirement 12.10.6",
      review: "PCI DSS v4.0, Requirement 12.10.8",
    },
  }

  // Default citations for any framework
  const defaultCitations: Record<string, string> = {
    identify: "ISO/IEC 27035-1:2016, Section 7.2",
    notify: "ISO/IEC 27035-1:2016, Section 7.4",
    contain: "SANS Incident Handler's Handbook, Section 4.3",
    document: "ISO/IEC 27035-2:2016, Section 7.3",
    remediate: "ISO/IEC 27035-2:2016, Section 7.5",
    report: "FIRST CSIRT Framework v2.1, Section 3.4",
    assess: "ISO/IEC 27035-1:2016, Section 7.2",
    analyze: "SANS Incident Handler's Handbook, Section 4.4",
    review: "ISO/IEC 27035-2:2016, Section 7.6",
  }

  return citations[framework]?.[type] || defaultCitations[type] || "Industry best practice"
}

// Update the getFrameworkReferences function to ensure all references are accurate:
function getFrameworkReferences(framework: string): string {
  switch (framework) {
    case "hipaa":
      return `
        <li>U.S. Department of Health & Human Services. (2013). <em>HIPAA Breach Notification Rule, 45 CFR §§ 164.400-414</em>. <a href="https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html" target="_blank" rel="noopener noreferrer">HHS.gov</a></li>
        <li>Office for Civil Rights. (2023). <em>Guidance on HIPAA & Contingency Planning</em>. <a href="https://www.hhs.gov/hipaa/for-professionals/security/guidance/contingency-planning/index.html" target="_blank" rel="noopener noreferrer">HHS.gov</a></li>
        <li>U.S. Department of Health & Human Services. (2013). <em>HIPAA Security Rule, 45 CFR § 164.308</em>. <a href="https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html" target="_blank" rel="noopener noreferrer">HHS.gov</a></li>
      `
    case "gdpr":
      return `
        <li>European Data Protection Board. (2022). <em>Guidelines on Personal Data Breach Notification under GDPR</em>. <a href="https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-012021-examples-regarding-personal-data-breach_en" target="_blank" rel="noopener noreferrer">EDPB.europa.eu</a></li>
        <li>Information Commissioner's Office. (2023). <em>Guide to the UK General Data Protection Regulation</em>. <a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/" target="_blank" rel="noopener noreferrer">ICO.org.uk</a></li>
        <li>European Union. (2016). <em>General Data Protection Regulation</em>. Articles 32-34. <a href="https://gdpr-info.eu/" target="_blank" rel="noopener noreferrer">GDPR-info.eu</a></li>
      `
    case "pci_dss":
      return `
        <li>PCI Security Standards Council. (2022). <em>Payment Card Industry Data Security Standard v4.0</em>. Section 12.10. <a href="https://www.pcisecuritystandards.org/document_library/" target="_blank" rel="noopener noreferrer">PCISecurityStandards.org</a></li>
        <li>PCI Security Standards Council. (2018). <em>Information Supplement: Best Practices for Implementing a Security Incident Response Program</em>. <a href="https://www.pcisecuritystandards.org/document_library/?category=best_practices" target="_blank" rel="noopener noreferrer">PCISecurityStandards.org</a></li>
        <li>PCI Security Standards Council. (2022). <em>PCI DSS v4.0 Template for Report on Compliance</em>. <a href="https://www.pcisecuritystandards.org/document_library/?category=reporting_templates" target="_blank" rel="noopener noreferrer">PCISecurityStandards.org</a></li>
      `
    case "nist":
      return `
        <li>Cichonski, P., et al. (2012). <em>Computer Security Incident Handling Guide</em>. NIST Special Publication 800-61 Revision 2. <a href="https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final" target="_blank" rel="noopener noreferrer">NIST.gov</a></li>
        <li>National Institute of Standards and Technology. (2023). <em>Framework for Improving Critical Infrastructure Cybersecurity</em>, Version 1.1. <a href="https://www.nist.gov/cyberframework" target="_blank" rel="noopener noreferrer">NIST.gov</a></li>
        <li>Souppaya, M., & Scarfone, K. (2013). <em>Guide to Enterprise Patch Management Technologies</em>. NIST Special Publication 800-40 Revision 3. <a href="https://csrc.nist.gov/publications/detail/sp/800-40/rev-3/final" target="_blank" rel="noopener noreferrer">NIST.gov</a></li>
      `
    default:
      return `
        <li>International Organization for Standardization. (2016). <em>ISO/IEC 27035:2016 Information Security Incident Management</em>. <a href="https://www.iso.org/standard/60803.html" target="_blank" rel="noopener noreferrer">ISO.org</a></li>
        <li>FIRST.org. (2019). <em>Computer Security Incident Response Team (CSIRT) Services Framework</em>, Version 2.1. <a href="https://www.first.org/standards/frameworks/csirts/" target="_blank" rel="noopener noreferrer">FIRST.org</a></li>
        <li>SANS Institute. (2020). <em>Incident Handler's Handbook</em>. <a href="https://www.sans.org/white-papers/33901/" target="_blank" rel="noopener noreferrer">SANS.org</a></li>
      `
  }
}

// Dummy functions for contextual information, role responsibility, action checklist, and estimated time
function getContextualInformation(type: string): string {
  switch (type) {
    case "identify":
      return "Identifying the scope and nature of the incident is crucial for effective response."
    case "notify":
      return "Timely notification ensures all stakeholders are aware and can take appropriate action."
    case "contain":
      return "Containment prevents further damage and limits the impact of the incident."
    case "document":
      return "Proper documentation provides a record of the incident and supports compliance efforts."
    case "remediate":
      return "Remediation restores systems to normal operation and prevents recurrence."
    case "report":
      return "Reporting to authorities ensures compliance and helps prevent future incidents."
    case "assess":
      return "Assessing the impact helps prioritize response efforts."
    case "analyze":
      return "Analyzing the root cause helps prevent similar incidents in the future."
    case "review":
      return "Reviewing the incident response process helps identify areas for improvement."
    default:
      return "Understanding the context is essential for effective incident response."
  }
}

function getResponsibleRole(type: string): string {
  switch (type) {
    case "identify":
      return "Security Analyst"
    case "notify":
      return "Incident Manager"
    case "contain":
      return "Security Engineer"
    case "document":
      return "Compliance Officer"
    case "remediate":
      return "System Administrator"
    case "report":
      return "Legal Counsel"
    case "assess":
      return "Security Analyst"
    case "analyze":
      return "Forensic Investigator"
    case "review":
      return "Incident Response Team"
    default:
      return "Incident Response Team"
  }
}

function getActionChecklist(type: string): string[] {
  switch (type) {
    case "identify":
      return ["Verify the incident", "Determine the scope", "Document initial findings"]
    case "notify":
      return ["Identify stakeholders", "Prepare notification message", "Send notifications"]
    case "contain":
      return ["Isolate affected systems", "Disable compromised accounts", "Implement temporary security measures"]
    case "document":
      return ["Record all actions taken", "Collect evidence", "Maintain a timeline of events"]
    case "remediate":
      return ["Apply patches", "Restore from backups", "Rebuild compromised systems"]
    case "report":
      return ["Prepare a formal report", "Submit to relevant authorities", "Document lessons learned"]
    case "assess":
      return ["Determine the impact on business operations", "Identify affected assets", "Prioritize response efforts"]
    case "analyze":
      return ["Identify the root cause", "Determine the attack vector", "Analyze malware samples"]
    case "review":
      return [
        "Evaluate the effectiveness of the response",
        "Identify areas for improvement",
        "Update incident response plan",
      ]
    default:
      return ["Review the incident", "Identify lessons learned", "Update procedures"]
  }
}

function getEstimatedTime(type: string): string {
  switch (type) {
    case "identify":
      return "1-2 hours"
    case "notify":
      return "30 minutes"
    case "contain":
      return "2-4 hours"
    case "document":
      return "1-2 hours"
    case "remediate":
      return "4-8 hours"
    case "report":
      return "2-4 hours"
    case "assess":
      return "1-2 hours"
    case "analyze":
      return "4-8 hours"
    case "review":
      return "2-4 hours"
    default:
      return "Varies"
  }
}
