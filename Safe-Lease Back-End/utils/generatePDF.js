const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateAgreementPDF = (agreementData, outputPath) => {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
  });

  doc.pipe(fs.createWriteStream(outputPath));

  doc.fontSize(20).text('Rental Agreement', { align: 'center' });
  doc.moveDown(2);

  // Helper for section titles
  const sectionTitle = (num, title) => {
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(14).text(`${num}. ${title}`);
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12);
  };

  // 1. Property
  sectionTitle('1', 'Property:');
  doc.text(`The Landlord hereby leases to the Tenant the Property titled:\n"${agreementData.property?.title || 'Property Title'}"`, {
    indent: 20,
  });
  doc.text('Address: ____________________________', { indent: 20 });
  doc.text('Square Footage: __________ sq. ft.', { indent: 20 });

  // 2. Term
  sectionTitle('2', 'Term:');
  doc.text('The lease term shall commence on ', { continued: true, indent: 20 });
  doc.text(agreementData.startDate.toDateString(), { continued: true, underline: true });
  doc.text(' and shall continue until ', { continued: true });
  doc.text(agreementData.endDate.toDateString(), { underline: true });
  doc.text(', unless terminated earlier in accordance with this Agreement.');

  // 3. Rent
  sectionTitle('3', 'Rent:');
  doc.text('The Tenant agrees to pay a monthly rent of ', { continued: true, indent: 20 });
  doc.text(`₹${agreementData.rentAmount}`, { underline: true });
  doc.text(', payable in advance on or before the 5th day of each month.');

  // 4. Use of Premises
  sectionTitle('4', 'Use of Premises:');
  doc.text('The Tenant agrees to use the property solely for residential purposes and shall not engage in any unlawful activities.', {
    indent: 20,
  });

  // 5. Maintenance and Repairs
  sectionTitle('5', 'Maintenance and Repairs:');
  doc.text('The Landlord shall maintain the structural integrity of the property.', { indent: 20 });
  doc.text('The Tenant shall keep the property clean and shall be responsible for any damage caused by negligence or misuse.', {
    indent: 20,
  });

  // 6. Agreement Terms
  sectionTitle('6', 'Agreement Terms:');
  if (agreementData.agreementTerms) {
    doc.text(agreementData.agreementTerms, { underline: true, indent: 20 });
  } else {
    doc.text('No terms provided.', { indent: 20 });
  }

  // 7. Termination
  sectionTitle('7', 'Termination:');
  doc.text('Either party may terminate this Agreement by providing written notice in accordance with the terms agreed upon.', {
    indent: 20,
  });

  // 8. Signed Status
  sectionTitle('8', 'Signed Status:');
  doc.text(agreementData.signed ? 'Signed by both parties.' : 'Not yet signed', { indent: 20 });
  doc.moveDown(2);

  // Signatures
  doc.text('IN WITNESS WHEREOF, the parties have executed this Rental Agreement.\n', { align: 'center' });
  doc.moveDown(1);

  doc.text(`Landlord: ${agreementData.landlord?.name || 'Landlord Name'}`, { indent: 20 });
  doc.text('Signature: ___________________________     Date: _______________', { indent: 20 });
  doc.moveDown(1);
  doc.text(`Tenant: ${agreementData.tenant?.name || 'Tenant Name'}`, { indent: 20 });
  doc.text('Signature: ___________________________     Date: _______________', { indent: 20 });

  doc.end();
};

module.exports = generateAgreementPDF;
