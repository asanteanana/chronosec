import { addHours, addDays, addMinutes } from "date-fns"

export const incidentTypes = [
  { id: "ransomware", name: "Ransomware Attack" },
  { id: "phishing", name: "Phishing Campaign" },
  { id: "data_breach", name: "Data Breach" },
  { id: "ddos", name: "DDoS Attack" },
  { id: "malware", name: "Malware Infection" },
  { id: "insider_threat", name: "Insider Threat" },
  { id: "physical_breach", name: "Physical Security Breach" },
]

export const regulationFrameworks = [
  { id: "nerc_cip", name: "NERC CIP-008" },
  { id: "gdpr", name: "GDPR" },
  { id: "hipaa", name: "HIPAA" },
  { id: "pci_dss", name: "PCI DSS" },
  { id: "ferc", name: "FERC" },
  { id: "nist", name: "NIST Cybersecurity Framework" },
  { id: "ccpa", name: "CCPA" },
]

interface TimelineItem {
  id: string
  title: string
  description: string
  time: Date
  type: "identify" | "notify" | "contain" | "document" | "remediate" | "report" | "assess" | "analyze" | "review"
}

export function generateTimeline(incidentType: string, startTime: Date, framework: string): TimelineItem[] {
  const timeline: TimelineItem[] = []

  // Common initial detection
  timeline.push({
    id: "detect",
    title: "Initial Detection",
    description: "Incident is first detected by monitoring systems or reported by users",
    time: new Date(startTime),
    type: "identify",
  })

  // Framework-specific timelines
  switch (framework) {
    case "nerc_cip":
      generateNercCipTimeline(timeline, startTime, incidentType)
      break
    case "gdpr":
      generateGdprTimeline(timeline, startTime, incidentType)
      break
    case "hipaa":
      generateHipaaTimeline(timeline, startTime, incidentType)
      break
    case "pci_dss":
      generatePciDssTimeline(timeline, startTime, incidentType)
      break
    case "ferc":
      generateFercTimeline(timeline, startTime, incidentType)
      break
    case "nist":
      generateNistTimeline(timeline, startTime, incidentType)
      break
    case "ccpa":
      generateCcpaTimeline(timeline, startTime, incidentType)
      break
    default:
      generateDefaultTimeline(timeline, startTime, incidentType)
  }

  // Sort timeline by time
  return timeline.sort((a, b) => a.time.getTime() - b.time.getTime())
}

function generateNercCipTimeline(timeline: TimelineItem[], startTime: Date, incidentType: string) {
  // NERC CIP-008 requires initial notification within 1 hour for reportable incidents
  timeline.push({
    id: "internal_notify",
    title: "Internal Team Notification",
    description: "Notify internal cybersecurity and management teams",
    time: addHours(startTime, 1),
    type: "notify",
  })

  // Begin containment efforts
  timeline.push({
    id: "containment",
    title: "Begin Containment",
    description: "Initiate containment procedures to limit impact",
    time: addHours(startTime, 2),
    type: "contain",
  })

  // NERC CIP requires notification to E-ISAC within 1 hour of determination
  timeline.push({
    id: "regulator_notify",
    title: "E-ISAC Notification",
    description: "Notify E-ISAC of reportable cyber security incident",
    time: addHours(startTime, 3),
    type: "notify",
  })

  // Initial documentation
  timeline.push({
    id: "initial_documentation",
    title: "Initial Documentation",
    description: "Document incident details, actions taken, and initial assessment",
    time: addHours(startTime, 4),
    type: "document",
  })

  // Begin remediation
  timeline.push({
    id: "remediation",
    title: "Begin Remediation",
    description: "Start remediation efforts to restore systems and services",
    time: addDays(startTime, 1),
    type: "remediate",
  })

  // NERC CIP requires initial report within 5 calendar days
  timeline.push({
    id: "initial_report",
    title: "Initial Report Submission",
    description: "Submit initial report to E-ISAC and NERC",
    time: addDays(startTime, 5),
    type: "report",
  })

  // NERC CIP requires final report within 90 calendar days
  timeline.push({
    id: "final_report",
    title: "Final Report Submission",
    description: "Submit final report with detailed analysis and lessons learned",
    time: addDays(startTime, 90),
    type: "report",
  })
}

function generateGdprTimeline(timeline: TimelineItem[], startTime: Date, incidentType: string) {
  // GDPR internal notification
  timeline.push({
    id: "internal_notify",
    title: "Internal Team Notification",
    description: "Notify DPO and internal security teams",
    time: addHours(startTime, 1),
    type: "notify",
  })

  // Begin containment
  timeline.push({
    id: "containment",
    title: "Begin Containment",
    description: "Initiate containment procedures to limit data exposure",
    time: addHours(startTime, 3),
    type: "contain",
  })

  // Initial documentation
  timeline.push({
    id: "initial_documentation",
    title: "Initial Documentation",
    description: "Document incident details, data affected, and initial assessment",
    time: addHours(startTime, 6),
    type: "document",
  })

  // GDPR requires notification to supervisory authority within 72 hours
  timeline.push({
    id: "authority_notification",
    title: "Supervisory Authority Notification",
    description: "Notify relevant data protection authority within 72-hour deadline",
    time: addHours(startTime, 72),
    type: "notify",
  })

  // Data subject notification
  timeline.push({
    id: "data_subject_notification",
    title: "Data Subject Notification",
    description: "Notify affected individuals without undue delay",
    time: addHours(startTime, 96),
    type: "notify",
  })

  // Begin remediation
  timeline.push({
    id: "remediation",
    title: "Begin Remediation",
    description: "Implement measures to address the breach and prevent recurrence",
    time: addDays(startTime, 5),
    type: "remediate",
  })

  // Final documentation
  timeline.push({
    id: "final_documentation",
    title: "Final Documentation",
    description: "Complete documentation of incident, response actions, and outcomes",
    time: addDays(startTime, 14),
    type: "document",
  })
}

function generateHipaaTimeline(timeline: TimelineItem[], startTime: Date, incidentType: string) {
  // Immediate actions after detection
  timeline.push({
    id: "immediate_actions",
    title: "Immediate Response Actions",
    description: "Isolate affected systems and implement emergency measures to prevent further exposure",
    time: addMinutes(startTime, 30),
    type: "contain",
  })

  // HIPAA internal notification
  timeline.push({
    id: "internal_notify",
    title: "Internal Team Notification",
    description: "Notify Privacy Officer, Security Officer, and response team",
    time: addHours(startTime, 1),
    type: "notify",
  })

  // Risk assessment
  timeline.push({
    id: "risk_assessment",
    title: "Risk Assessment",
    description:
      "Conduct formal risk assessment to determine scope, impact, and whether the incident constitutes a breach under HIPAA",
    time: addHours(startTime, 4),
    type: "assess",
  })

  // Legal consultation
  timeline.push({
    id: "legal_consultation",
    title: "Legal Consultation",
    description: "Consult with legal counsel regarding breach determination and reporting obligations",
    time: addHours(startTime, 8),
    type: "assess",
  })

  // Begin containment
  timeline.push({
    id: "containment",
    title: "Complete Containment",
    description: "Complete containment procedures to limit PHI exposure and prevent further compromise",
    time: addHours(startTime, 12),
    type: "contain",
  })

  // Forensic analysis
  timeline.push({
    id: "forensic_analysis",
    title: "Forensic Analysis",
    description: "Conduct forensic investigation to determine attack vectors, compromised data, and extent of breach",
    time: addHours(startTime, 24),
    type: "analyze",
  })

  // Initial documentation
  timeline.push({
    id: "initial_documentation",
    title: "Initial Documentation",
    description: "Document incident details, PHI affected, and initial assessment findings",
    time: addHours(startTime, 36),
    type: "document",
  })

  // Begin remediation
  timeline.push({
    id: "remediation",
    title: "Begin Remediation",
    description: "Implement measures to address the breach and mitigate harm",
    time: addDays(startTime, 2),
    type: "remediate",
  })

  // Third-party vendor notification
  if (incidentType === "phishing" || incidentType === "data_breach") {
    timeline.push({
      id: "vendor_notification",
      title: "Third-Party Vendor Notification",
      description: "Notify relevant business associates and third-party vendors that may be affected",
      time: addDays(startTime, 3),
      type: "notify",
    })
  }

  // Law enforcement notification
  if (incidentType === "ransomware" || incidentType === "data_breach") {
    timeline.push({
      id: "law_enforcement",
      title: "Law Enforcement Notification",
      description: "Notify appropriate law enforcement agencies of the security incident",
      time: addDays(startTime, 5),
      type: "notify",
    })
  }

  // HIPAA requires notification to individuals within 60 days
  timeline.push({
    id: "individual_notification",
    title: "Individual Notification",
    description: "Notify affected individuals of the breach (required within 60 days of discovery)",
    time: addDays(startTime, 30),
    type: "notify",
  })

  // HIPAA requires notification to HHS for breaches affecting 500+ individuals
  timeline.push({
    id: "hhs_notification",
    title: "HHS Notification",
    description: "Submit breach report to HHS Office for Civil Rights (required within 60 days for 500+ individuals)",
    time: addDays(startTime, 45),
    type: "report",
  })

  // Media notification for large breaches
  if (incidentType === "data_breach" || incidentType === "phishing") {
    timeline.push({
      id: "media_notification",
      title: "Media Notification",
      description:
        "Provide notice to prominent media outlets for breaches affecting 500+ individuals in a state or jurisdiction",
      time: addDays(startTime, 45),
      type: "notify",
    })
  }

  // Employee training
  timeline.push({
    id: "employee_training",
    title: "Employee Training",
    description: "Conduct targeted security awareness training to prevent similar incidents",
    time: addDays(startTime, 60),
    type: "remediate",
  })

  // Post-incident review
  timeline.push({
    id: "post_incident_review",
    title: "Post-Incident Review",
    description: "Conduct comprehensive review to identify lessons learned and implement security improvements",
    time: addDays(startTime, 75),
    type: "review",
  })

  // Annual breach reporting for smaller breaches
  timeline.push({
    id: "annual_report",
    title: "Annual Breach Report",
    description: "Include in annual report to HHS for breaches affecting fewer than 500 individuals",
    time: addDays(startTime, 90),
    type: "report",
  })
}

function generatePciDssTimeline(timeline: TimelineItem[], startTime: Date, incidentType: string) {
  // PCI DSS internal notification
  timeline.push({
    id: "internal_notify",
    title: "Internal Team Notification",
    description: "Notify security team and management",
    time: addMinutes(startTime, 30),
    type: "notify",
  })

  // Begin containment
  timeline.push({
    id: "containment",
    title: "Begin Containment",
    description: "Initiate containment procedures to limit cardholder data exposure",
    time: addHours(startTime, 2),
    type: "contain",
  })

  // Initial documentation
  timeline.push({
    id: "initial_documentation",
    title: "Initial Documentation",
    description: "Document incident details, cardholder data affected, and initial assessment",
    time: addHours(startTime, 4),
    type: "document",
  })

  // Payment brand notification
  timeline.push({
    id: "payment_brand_notification",
    title: "Payment Brand Notification",
    description: "Notify relevant payment brands of the incident",
    time: addHours(startTime, 24),
    type: "notify",
  })

  // Begin remediation
  timeline.push({
    id: "remediation",
    title: "Begin Remediation",
    description: "Implement measures to address the breach and secure systems",
    time: addDays(startTime, 1),
    type: "remediate",
  })

  // Forensic investigation
  timeline.push({
    id: "forensic_investigation",
    title: "Forensic Investigation",
    description: "Engage PFI (PCI Forensic Investigator) for investigation",
    time: addDays(startTime, 3),
    type: "document",
  })

  // Final report
  timeline.push({
    id: "final_report",
    title: "Final Report Submission",
    description: "Submit final incident report to payment brands and card associations",
    time: addDays(startTime, 30),
    type: "report",
  })
}

function generateFercTimeline(timeline: TimelineItem[], startTime: Date, incidentType: string) {
  // FERC internal notification
  timeline.push({
    id: "internal_notify",
    title: "Internal Team Notification",
    description: "Notify security team and management",
    time: addHours(startTime, 1),
    type: "notify",
  })

  // Begin containment
  timeline.push({
    id: "containment",
    title: "Begin Containment",
    description: "Initiate containment procedures to limit impact",
    time: addHours(startTime, 3),
    type: "contain",
  })

  // Initial documentation
  timeline.push({
    id: "initial_documentation",
    title: "Initial Documentation",
    description: "Document incident details, systems affected, and initial assessment",
    time: addHours(startTime, 6),
    type: "document",
  })

  // FERC notification
  timeline.push({
    id: "ferc_notification",
    title: "FERC Notification",
    description: "Notify FERC of the cybersecurity incident",
    time: addHours(startTime, 24),
    type: "notify",
  })

  // Begin remediation
  timeline.push({
    id: "remediation",
    title: "Begin Remediation",
    description: "Implement measures to address the incident and restore operations",
    time: addDays(startTime, 2),
    type: "remediate",
  })

  // Initial report
  timeline.push({
    id: "initial_report",
    title: "Initial Report Submission",
    description: "Submit initial incident report to FERC",
    time: addDays(startTime, 7),
    type: "report",
  })

  // Final report
  timeline.push({
    id: "final_report",
    title: "Final Report Submission",
    description: "Submit comprehensive incident report with root cause analysis",
    time: addDays(startTime, 60),
    type: "report",
  })
}

function generateNistTimeline(timeline: TimelineItem[], startTime: Date, incidentType: string) {
  // NIST internal notification
  timeline.push({
    id: "internal_notify",
    title: "Internal Team Notification",
    description: "Notify CSIRT and management",
    time: addHours(startTime, 1),
    type: "notify",
  })

  // Begin containment
  timeline.push({
    id: "containment",
    title: "Begin Containment",
    description: "Implement containment strategy to limit impact",
    time: addHours(startTime, 4),
    type: "contain",
  })

  // Initial documentation
  timeline.push({
    id: "initial_documentation",
    title: "Initial Documentation",
    description: "Document incident details following NIST SP 800-61 guidelines",
    time: addHours(startTime, 8),
    type: "document",
  })

  // Evidence collection
  timeline.push({
    id: "evidence_collection",
    title: "Evidence Collection",
    description: "Collect and preserve evidence for analysis and potential legal proceedings",
    time: addHours(startTime, 12),
    type: "document",
  })

  // Begin remediation
  timeline.push({
    id: "remediation",
    title: "Begin Remediation",
    description: "Implement eradication and recovery procedures",
    time: addDays(startTime, 1),
    type: "remediate",
  })

  // Stakeholder notification
  timeline.push({
    id: "stakeholder_notification",
    title: "Stakeholder Notification",
    description: "Notify relevant stakeholders based on communication plan",
    time: addDays(startTime, 2),
    type: "notify",
  })

  // Post-incident analysis
  timeline.push({
    id: "post_incident_analysis",
    title: "Post-Incident Analysis",
    description: "Conduct lessons learned meeting and document findings",
    time: addDays(startTime, 14),
    type: "document",
  })
}

function generateCcpaTimeline(timeline: TimelineItem[], startTime: Date, incidentType: string) {
  // CCPA internal notification
  timeline.push({
    id: "internal_notify",
    title: "Internal Team Notification",
    description: "Notify privacy team and management",
    time: addHours(startTime, 1),
    type: "notify",
  })

  // Begin containment
  timeline.push({
    id: "containment",
    title: "Begin Containment",
    description: "Initiate containment procedures to limit data exposure",
    time: addHours(startTime, 4),
    type: "contain",
  })

  // Initial documentation
  timeline.push({
    id: "initial_documentation",
    title: "Initial Documentation",
    description: "Document incident details, California residents' data affected, and initial assessment",
    time: addHours(startTime, 8),
    type: "document",
  })

  // Begin remediation
  timeline.push({
    id: "remediation",
    title: "Begin Remediation",
    description: "Implement measures to address the breach and secure systems",
    time: addDays(startTime, 2),
    type: "remediate",
  })

  // CCPA requires notification to affected California residents
  timeline.push({
    id: "resident_notification",
    title: "California Resident Notification",
    description: "Notify affected California residents of the breach",
    time: addDays(startTime, 15),
    type: "notify",
  })

  // Attorney General notification
  if (incidentType === "data_breach") {
    timeline.push({
      id: "ag_notification",
      title: "Attorney General Notification",
      description: "Notify California Attorney General for breaches affecting 500+ California residents",
      time: addDays(startTime, 15),
      type: "notify",
    })
  }

  // Final documentation
  timeline.push({
    id: "final_documentation",
    title: "Final Documentation",
    description: "Complete documentation of incident, response actions, and outcomes",
    time: addDays(startTime, 30),
    type: "document",
  })
}

function generateDefaultTimeline(timeline: TimelineItem[], startTime: Date, incidentType: string) {
  // Generic timeline for any framework
  timeline.push({
    id: "internal_notify",
    title: "Internal Team Notification",
    description: "Notify security team and management",
    time: addHours(startTime, 1),
    type: "notify",
  })

  timeline.push({
    id: "containment",
    title: "Begin Containment",
    description: "Initiate containment procedures to limit impact",
    time: addHours(startTime, 4),
    type: "contain",
  })

  timeline.push({
    id: "initial_documentation",
    title: "Initial Documentation",
    description: "Document incident details and initial assessment",
    time: addHours(startTime, 8),
    type: "document",
  })

  timeline.push({
    id: "remediation",
    title: "Begin Remediation",
    description: "Implement measures to address the incident and restore operations",
    time: addDays(startTime, 1),
    type: "remediate",
  })

  timeline.push({
    id: "stakeholder_notification",
    title: "Stakeholder Notification",
    description: "Notify relevant stakeholders of the incident",
    time: addDays(startTime, 2),
    type: "notify",
  })

  timeline.push({
    id: "final_report",
    title: "Final Report",
    description: "Complete incident report with findings and recommendations",
    time: addDays(startTime, 14),
    type: "report",
  })
}
