import jsPDF from 'jspdf';
import type { ItineraryItem } from '../types';

export interface TripDetails {
  destination: string;
  startDate: Date;
  endDate: Date;
  travelers: number;
  budget: string;
}

export class PDFService {
  static generateItineraryPDF(itinerary: ItineraryItem[], tripDetails: TripDetails): void {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 20;
      const lineHeight = 8;
      const marginLeft = 20;
      const marginRight = 20;
      const contentWidth = pageWidth - marginLeft - marginRight;

      // Helper function to add a new page if needed
      const checkPageBreak = (requiredSpace: number = 20) => {
        if (currentY + requiredSpace > pageHeight - 20) {
          doc.addPage();
          currentY = 20;
        }
      };

      // Helper function to wrap text and handle special characters
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
        doc.setFontSize(fontSize);
        // Clean text of any special characters that might cause encoding issues
        const cleanText = text.replace(/[^\x00-\x7F]/g, "").trim() || text;
        const lines = doc.splitTextToSize(cleanText, maxWidth);
        let lineY = y;
        
        for (const line of lines) {
          checkPageBreak();
          doc.text(line, x, lineY);
          lineY += lineHeight;
          currentY = lineY;
        }
        
        return lineY;
      };

      // Header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Travel Itinerary', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Trip Details
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Trip Overview', marginLeft, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const tripInfo = [
        `Destination: ${tripDetails.destination}`,
        `Travel Dates: ${tripDetails.startDate.toLocaleDateString()} - ${tripDetails.endDate.toLocaleDateString()}`,
        `Number of Travelers: ${tripDetails.travelers}`,
        `Budget: $${tripDetails.budget}`
      ];

      tripInfo.forEach(info => {
        checkPageBreak();
        doc.text(info, marginLeft, currentY);
        currentY += lineHeight;
      });

      currentY += 10;

      // Group activities by day
      const activitiesByDay = itinerary.reduce((acc, activity) => {
        const day = activity.day || 1;
        if (!acc[day]) acc[day] = [];
        acc[day].push(activity);
        return acc;
      }, {} as Record<number, ItineraryItem[]>);

      // Render each day
      Object.keys(activitiesByDay)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(dayKey => {
          const day = parseInt(dayKey);
          const dayActivities = activitiesByDay[day];

          checkPageBreak(30);

          // Day header
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(`Day ${day}`, marginLeft, currentY);
          currentY += 12;

          // Activities for this day
          dayActivities
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
            .forEach((activity) => {
              checkPageBreak(25);

              // Time
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              const timeText = activity.time || 'Time TBD';
              doc.text(timeText, marginLeft, currentY);

              // Activity type badge
              const typeColor = this.getTypeColor(activity.type);
              const activityType = (activity.type?.toUpperCase() || 'ACTIVITY').substring(0, 8);
              doc.setFillColor(typeColor.r, typeColor.g, typeColor.b);
              doc.rect(marginLeft + 40, currentY - 6, 30, 8, 'F');
              doc.setTextColor(255, 255, 255);
              doc.setFontSize(7);
              doc.text(activityType, marginLeft + 42, currentY - 1);
              doc.setTextColor(0, 0, 0);

              currentY += 10;

              // Activity title
              doc.setFontSize(12);
              doc.setFont('helvetica', 'bold');
              currentY = addWrappedText(
                activity.activity,
                marginLeft,
                currentY,
                contentWidth - 60,
                12
              );

              // Location
              if (activity.location && activity.location !== tripDetails.destination) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(100, 100, 100);
                currentY = addWrappedText(
                  `Location: ${activity.location}`,
                  marginLeft,
                  currentY,
                  contentWidth - 60,
                  10
                );
                doc.setTextColor(0, 0, 0);
              }

              // Description
              if (activity.description && activity.description.trim()) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                currentY = addWrappedText(
                  activity.description,
                  marginLeft,
                  currentY,
                  contentWidth - 60,
                  10
                );
              }

              // Cost and duration
              const details = [];
              if (activity.estimatedCost && activity.estimatedCost > 0) {
                details.push(`$${activity.estimatedCost}`);
              }
              if (activity.duration && activity.duration > 0) {
                details.push(`${activity.duration} min`);
              }

              if (details.length > 0) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80, 80, 80);
                doc.text(details.join(' • '), marginLeft, currentY);
                doc.setTextColor(0, 0, 0);
                currentY += lineHeight;
              }

              currentY += 8; // Space between activities
            });

          currentY += 5; // Space between days
        });

      // Footer
      checkPageBreak(20);
      currentY = pageHeight - 30;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by TravelMind - AI-Powered Travel Planner', pageWidth / 2, currentY, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY + 8, { align: 'center' });

      // Calculate total estimated cost
      const totalCost = itinerary.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
      if (totalCost > 0) {
        currentY += 16;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Estimated Cost: $${totalCost}`, pageWidth / 2, currentY, { align: 'center' });
      }

      // Download the PDF
      const fileName = `${tripDetails.destination.replace(/[^a-zA-Z0-9]/g, '_')}_Itinerary_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  private static getTypeColor(type?: string): { r: number; g: number; b: number } {
    const colors = {
      meal: { r: 34, g: 197, b: 94 },      // Green
      transport: { r: 59, g: 130, b: 246 }, // Blue  
      accommodation: { r: 168, g: 85, b: 247 }, // Purple
      sightseeing: { r: 245, g: 158, b: 11 }, // Orange
      activity: { r: 236, g: 72, b: 153 },    // Pink
    };
    
    return colors[type as keyof typeof colors] || { r: 107, g: 114, b: 128 }; // Gray default
  }

  static generateJSONBackup(itinerary: ItineraryItem[], tripDetails: TripDetails): void {
    const data = {
      tripDetails: {
        destination: tripDetails.destination,
        startDate: tripDetails.startDate.toISOString(),
        endDate: tripDetails.endDate.toISOString(),
        travelers: tripDetails.travelers,
        budget: tripDetails.budget,
      },
      itinerary: itinerary,
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tripDetails.destination.replace(/[^a-zA-Z0-9]/g, '_')}_Itinerary_Backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
