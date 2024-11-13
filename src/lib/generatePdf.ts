import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Generate PDF from an array of HTML elements
export const generatePdf = async (elements: HTMLElement[]) => {
  const pdf = new jsPDF();
  
  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i]);
    const imgData = canvas.toDataURL("image/png");
    
    // Set up the page layout and add the image to the PDF
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth * 0.9;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Position image and add a new page for each element if needed
    pdf.addImage(imgData, "PNG", (pageWidth - imgWidth) / 2, 20, imgWidth, imgHeight);
    if (i < elements.length - 1) pdf.addPage();
  }
  
  pdf.save("dashboard_report.pdf");
};
