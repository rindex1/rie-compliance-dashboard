import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { Risk, Assessment, Action, Company } from './types';
import { RISK_CATEGORIES_DUTCH, RISK_LEVELS_DUTCH, ACTION_PRIORITIES_DUTCH, ACTION_STATUS_DUTCH } from './types';
import { formatDateDutch } from './utils';

export interface RIEReportData {
  company: Company;
  assessment: Assessment;
  risks: Risk[];
  actions: Action[];
  generatedAt: Date;
  assessor: string;
}

export class DocumentGenerator {
  static async generateRIEReport(data: RIEReportData): Promise<Blob> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title Page
            new Paragraph({
              text: "RI&E RAPPORT",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Bedrijf: ${data.company.name}`,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Datum: ${formatDateDutch(data.generatedAt)}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Beoordelaar: ${data.assessor}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }), // Empty line

            // Executive Summary
            new Paragraph({
              text: "SAMENVATTING",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: `Dit rapport bevat de resultaten van de Risico-Inventarisatie & Evaluatie (RI&E) voor ${data.company.name}. De beoordeling is uitgevoerd op ${formatDateDutch(data.assessment.startDate)} en heeft ${data.risks.length} risico's geïdentificeerd.`,
            }),
            new Paragraph({
              text: `Van de geïdentificeerde risico's zijn er ${data.risks.filter(r => r.riskLevel === 'CRITICAL').length} kritiek, ${data.risks.filter(r => r.riskLevel === 'HIGH').length} hoog, ${data.risks.filter(r => r.riskLevel === 'MEDIUM').length} gemiddeld en ${data.risks.filter(r => r.riskLevel === 'LOW').length} laag.`,
            }),
            new Paragraph({
              text: `Er zijn ${data.actions.length} acties gepland om de geïdentificeerde risico's aan te pakken.`,
            }),
            new Paragraph({ text: "" }),

            // Company Information
            new Paragraph({
              text: "BEDRIJFSINFORMATIE",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: `Bedrijfsnaam: ${data.company.name}`,
            }),
            new Paragraph({
              text: `Adres: ${data.company.address || 'Niet opgegeven'}`,
            }),
            new Paragraph({
              text: `Plaats: ${data.company.city || 'Niet opgegeven'}`,
            }),
            new Paragraph({
              text: `Postcode: ${data.company.postalCode || 'Niet opgegeven'}`,
            }),
            new Paragraph({
              text: `KvK nummer: ${data.company.kvkNumber || 'Niet opgegeven'}`,
            }),
            new Paragraph({ text: "" }),

            // Risk Assessment Results
            new Paragraph({
              text: "RISICO-INVENTARISATIE",
              heading: HeadingLevel.HEADING_1,
            }),
            ...this.generateRiskSections(data.risks),

            // Action Plan
            new Paragraph({
              text: "PLAN VAN AANPAK",
              heading: HeadingLevel.HEADING_1,
            }),
            ...this.generateActionPlan(data.actions),

            // Compliance Statement
            new Paragraph({
              text: "COMPLIANCE VERKLARING",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: "Deze RI&E is uitgevoerd in overeenstemming met de Arbeidsomstandighedenwet en relevante arbocatalogi. Het bedrijf verbindt zich ertoe om de geïdentificeerde risico's aan te pakken volgens het opgestelde plan van aanpak.",
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: `Ondertekend: ${data.assessor}`,
            }),
            new Paragraph({
              text: `Datum: ${formatDateDutch(data.generatedAt)}`,
            }),
          ],
        },
      ],
    });

    return await Packer.toBlob(doc);
  }

  private static generateRiskSections(risks: Risk[]): Paragraph[] {
    const sections: Paragraph[] = [];
    
    // Group risks by category
    const risksByCategory = risks.reduce((acc, risk) => {
      if (!acc[risk.category]) {
        acc[risk.category] = [];
      }
      acc[risk.category].push(risk);
      return acc;
    }, {} as Record<string, Risk[]>);

    Object.entries(risksByCategory).forEach(([category, categoryRisks]) => {
      sections.push(
        new Paragraph({
          text: RISK_CATEGORIES_DUTCH[category as keyof typeof RISK_CATEGORIES_DUTCH],
          heading: HeadingLevel.HEADING_2,
        })
      );

      categoryRisks.forEach((risk, index) => {
        sections.push(
          new Paragraph({
            text: `${index + 1}. ${risk.title}`,
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: `Beschrijving: ${risk.description}`,
          }),
          new Paragraph({
            text: `Locatie: ${risk.location}`,
          }),
          new Paragraph({
            text: `Risico niveau: ${RISK_LEVELS_DUTCH[risk.riskLevel]}`,
          }),
          new Paragraph({
            text: `Waarschijnlijkheid: ${risk.probability}/5, Impact: ${risk.impact}/5`,
          }),
          new Paragraph({
            text: `Blootgestelde medewerkers: ${risk.exposedEmployees}`,
          }),
          new Paragraph({
            text: `Huidige maatregelen: ${risk.currentMeasures.join(', ') || 'Geen'}`,
          }),
          new Paragraph({
            text: `Voorgestelde maatregelen: ${risk.proposedMeasures.join(', ') || 'Geen'}`,
          }),
          new Paragraph({ text: "" })
        );
      });
    });

    return sections;
  }

  private static generateActionPlan(actions: Action[]): Paragraph[] {
    const sections: Paragraph[] = [];

    if (actions.length === 0) {
      sections.push(
        new Paragraph({
          text: "Geen acties gepland.",
        })
      );
      return sections;
    }

    // Group actions by priority
    const actionsByPriority = actions.reduce((acc, action) => {
      if (!acc[action.priority]) {
        acc[action.priority] = [];
      }
      acc[action.priority].push(action);
      return acc;
    }, {} as Record<string, Action[]>);

    Object.entries(actionsByPriority).forEach(([priority, priorityActions]) => {
      sections.push(
        new Paragraph({
          text: `Prioriteit: ${ACTION_PRIORITIES_DUTCH[priority as keyof typeof ACTION_PRIORITIES_DUTCH]}`,
          heading: HeadingLevel.HEADING_2,
        })
      );

      priorityActions.forEach((action, index) => {
        sections.push(
          new Paragraph({
            text: `${index + 1}. ${action.title}`,
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: `Beschrijving: ${action.description}`,
          }),
          new Paragraph({
            text: `Status: ${ACTION_STATUS_DUTCH[action.status]}`,
          }),
          new Paragraph({
            text: `Toegewezen aan: ${action.assignedToId || 'Niet toegewezen'}`,
          }),
          new Paragraph({
            text: `Deadline: ${action.dueDate ? formatDateDutch(action.dueDate) : 'Geen deadline'}`,
          }),
          new Paragraph({
            text: `Kosten: ${action.cost ? `€${action.cost.toLocaleString()}` : 'Niet opgegeven'}`,
          }),
          new Paragraph({ text: "" })
        );
      });
    });

    return sections;
  }

  static async generatePDFReport(data: RIEReportData): Promise<Blob> {
    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(20);
    pdf.text('RI&E RAPPORT', 105, 20, { align: 'center' });
    
    // Company info
    pdf.setFontSize(12);
    pdf.text(`Bedrijf: ${data.company.name}`, 20, 40);
    pdf.text(`Datum: ${formatDateDutch(data.generatedAt)}`, 20, 50);
    pdf.text(`Beoordelaar: ${data.assessor}`, 20, 60);
    
    // Summary
    pdf.setFontSize(14);
    pdf.text('SAMENVATTING', 20, 80);
    pdf.setFontSize(10);
    pdf.text(`Dit rapport bevat ${data.risks.length} geïdentificeerde risico's.`, 20, 90);
    pdf.text(`Kritieke risico's: ${data.risks.filter(r => r.riskLevel === 'CRITICAL').length}`, 20, 100);
    pdf.text(`Hoge risico's: ${data.risks.filter(r => r.riskLevel === 'HIGH').length}`, 20, 110);
    pdf.text(`Geplande acties: ${data.actions.length}`, 20, 120);
    
    // Risk details
    let yPosition = 140;
    data.risks.forEach((risk, index) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.text(`${index + 1}. ${risk.title}`, 20, yPosition);
      pdf.setFontSize(10);
      pdf.text(`Locatie: ${risk.location}`, 20, yPosition + 10);
      pdf.text(`Risico niveau: ${RISK_LEVELS_DUTCH[risk.riskLevel]}`, 20, yPosition + 20);
      pdf.text(`Beschrijving: ${risk.description.substring(0, 100)}...`, 20, yPosition + 30);
      
      yPosition += 50;
    });
    
    return pdf.output('blob');
  }
}
