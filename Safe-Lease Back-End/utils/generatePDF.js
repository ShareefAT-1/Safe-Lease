// Safe-Lease Back-End/utils/generatePDF.js

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateAgreementPDF = async (agreementData, outputPath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Helper function for adding sections
        const addSection = (title, content, bold = false) => {
            doc.moveDown(0.8);
            doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(14).text(title);
            doc.moveDown(0.3);
            doc.font('Helvetica').fontSize(12).text(content, { indent: 20 });
        };

        // --- Document Header ---
        doc.fontSize(22).font('Helvetica-Bold').text('LEASE AGREEMENT', { align: 'center' });
        doc.moveDown(0.7);
        doc.fontSize(12).font('Helvetica').text(`Agreement ID: ${agreementData.agreementId || 'N/A'}`, { align: 'center' });
        doc.moveDown(1.5);

        // --- Parties Involved ---
        doc.fontSize(16).font('Helvetica-Bold').text('1. PARTIES INVOLVED', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12).font('Helvetica-Bold').text('LANDLORD:');
        doc.font('Helvetica').text(`Name: ${agreementData.landlordDetails?.name || ''} ${agreementData.landlordDetails?.lastName || ''}`);
        doc.text(`Email: ${agreementData.landlordDetails?.email || 'N/A'}`);
        doc.text(`Contact No: ${agreementData.landlordDetails?.contactNumber || 'N/A'}`);
        doc.moveDown(0.8);

        doc.font('Helvetica-Bold').text('TENANT:');
        doc.font('Helvetica').text(`Name: ${agreementData.tenantDetails?.name || ''} ${agreementData.tenantDetails?.lastName || ''}`);
        doc.text(`Email: ${agreementData.tenantDetails?.email || 'N/A'}`);
        doc.text(`Contact No: ${agreementData.tenantDetails?.contactNumber || 'N/A'}`);
        doc.moveDown(1.5);

        // --- Property Details ---
        doc.fontSize(16).font('Helvetica-Bold').text('2. PROPERTY DETAILS', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Property Title: ${agreementData.propertyDetails?.title || 'N/A'}`);
        if (agreementData.propertyDetails?.address) {
            const address = agreementData.propertyDetails.address;
            doc.text(`Address: ${address.street}, ${address.city}, ${address.state}, ${address.zipCode || 'N/A'}`);
        } else {
            doc.text('Address: N/A');
        }
        doc.text(`Listed Rent (as per property listing): ₹${agreementData.propertyDetails?.rent?.toLocaleString('en-IN') || 'N/A'}`);
        doc.moveDown(1.5);

        // --- Lease Terms ---
        doc.fontSize(16).font('Helvetica-Bold').text('3. LEASE TERMS', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Monthly Rent: ₹${agreementData.rentAmount?.toLocaleString('en-IN') || 'N/A'}`);
        doc.text(`Security Deposit: ₹${agreementData.depositAmount?.toLocaleString('en-IN') || 'N/A'}`);
        doc.text(`Lease Start Date: ${agreementData.startDate || 'N/A'}`);
        doc.text(`Lease End Date: ${agreementData.endDate || 'N/A'}`);
        doc.text(`Lease Term: ${agreementData.leaseTermMonths || 'N/A'} months`);
        doc.moveDown(1.5);

        // --- General Agreement Terms ---
        doc.fontSize(16).font('Helvetica-Bold').text('4. GENERAL AGREEMENT TERMS', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text(agreementData.agreementTerms || 'No specific terms provided.', {
            align: 'justify',
            indent: 20
        });
        doc.moveDown(1.5);

        // --- Signatures ---
        doc.fontSize(16).font('Helvetica-Bold').text('5. SIGNATURES', { underline: true });
        doc.moveDown(1);

        // Landlord Signature
        doc.font('Helvetica-Bold').fontSize(12).text('LANDLORD:');
        if (agreementData.landlordSignaturePath && fs.existsSync(agreementData.landlordSignaturePath)) {
            doc.image(agreementData.landlordSignaturePath, {
                fit: [150, 60], // Adjust size as needed for signatures
                align: 'left',
                valign: 'top'
            });
            doc.moveDown(2.5); // Adjust spacing after image
        } else {
            doc.moveDown(3); // Space for signature line if no image
        }
        doc.font('Helvetica').text('____________________________________');
        doc.text(`Name: ${agreementData.landlordDetails?.name || ''} ${agreementData.landlordDetails?.lastName || ''}`);
        doc.text(`Date: ${agreementData.signedDate || 'N/A'}`);
        doc.moveDown(2);

        // Tenant Signature (initially blank, filled upon tenant signing)
        doc.font('Helvetica-Bold').text('TENANT:');
        if (agreementData.tenantSignaturePath && fs.existsSync(agreementData.tenantSignaturePath)) {
            doc.image(agreementData.tenantSignaturePath, {
                fit: [150, 60], // Adjust size as needed
                align: 'left',
                valign: 'top'
            });
            doc.moveDown(2.5);
        } else {
            doc.moveDown(3);
        }
        doc.font('Helvetica').text('____________________________________');
        doc.text(`Name: ${agreementData.tenantDetails?.name || ''} ${agreementData.tenantDetails?.lastName || ''}`);
        doc.text(`Date: ${agreementData.tenantSignedDate || '_______________________'}`); // Placeholder for tenant signed date
        doc.moveDown(2);


        // --- Footer ---
        doc.fontSize(9).font('Helvetica-Oblique').text(`Generated on ${new Date().toLocaleDateString('en-IN')} by Safe-Lease`, {
            align: 'right',
            lineGap: 4
        });

        // Finalize the PDF and end the stream
        doc.end();

        stream.on('finish', () => {
            resolve();
        });

        stream.on('error', (err) => {
            console.error('Error writing PDF stream:', err);
            reject(err);
        });
    });
};

module.exports = generateAgreementPDF;