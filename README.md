# Chronosec

A comprehensive cybersecurity incident response timeline generator with AI-powered compliance analysis and documentation tools.

## Overview

Chronosec is a specialized tool designed for cybersecurity incident response teams to generate compliance-aligned incident timelines. The application automatically creates detailed timelines based on regulatory frameworks, supports AI-driven analysis and recommendations, and exports professional documentation for audit and reporting purposes.

## Features

### Incident Response Timeline Generation

Generate structured incident response timelines customized for major regulatory frameworks:

- **NERC CIP-008**: Power and utility sector regulations with 1-hour notification requirements
- **GDPR**: European data protection with 72-hour breach notification mandates
- **HIPAA**: Healthcare data protection with comprehensive breach response procedures
- **PCI DSS**: Payment card industry standards for cardholder data incidents
- **FERC**: Federal energy regulatory compliance requirements
- **NIST CSF**: Voluntary cybersecurity framework for comprehensive incident handling
- **CCPA**: California consumer privacy act breach notification requirements

### AI-Powered Capabilities

- **Compliance Analysis**: Automated gap analysis against framework requirements
- **Timeline Enhancement**: AI-generated recommendations to strengthen incident documentation
- **Smart Recommendations**: Actionable suggestions based on incident type and regulatory context

### Multiple View Modes

- **Timeline View**: Chronological event visualization with color-coded incident types
- **Calendar View**: Event scheduling and deadline tracking
- **Gantt View**: Project management style visualization for complex incidents

### Export & Documentation

- **PDF Export**: Professional, formatted reports with table of contents and handling instructions
- **Markdown Export**: Structured documentation for version control and collaboration
- **Compliance Markers**: Automatic classification and handling instructions based on data sensitivity

### Incident Types Supported

- Ransomware attacks
- Phishing campaigns
- Data breaches
- DDoS attacks
- Malware infections
- Insider threats
- Physical security breaches

## Technology Stack

- **Framework**: Next.js 15
- **UI Components**: Radix UI primitives with Tailwind CSS
- **AI Integration**: OpenAI SDK for intelligent analysis
- **Date Management**: date-fns for timeline calculations
- **Animations**: Framer Motion for smooth user experience
- **Charts**: Recharts for visualization components

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Usage

1. Select the incident type from the dropdown menu
2. Choose the applicable regulatory framework
3. Set the incident start date/time
4. View the generated timeline in your preferred format (timeline, calendar, or Gantt)
5. Run AI analysis for compliance checking and recommendations
6. Export documentation as PDF or Markdown

## Architecture

```
/app              - Next.js app router pages and API routes
/components       - React components and UI primitives
/lib              - Core utilities for timeline generation and export
/public           - Static assets
```

## API Routes

- `/api/ai/analyze` - AI-powered timeline analysis
- `/api/ai/compliance-check` - Regulatory compliance gap analysis
- `/api/ai/enhance-timeline` - AI-enhanced timeline recommendations

## Contributing

This project focuses on supporting incident response teams with accurate, framework-specific timelines and documentation tools.

## License

Private project for cybersecurity incident response use.
