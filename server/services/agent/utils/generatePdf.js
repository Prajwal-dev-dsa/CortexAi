import PDFDocument from "pdfkit";

/**
 * Builds a beautifully formatted PDF document in memory and returns it as a Buffer.
 * @param {Object} data - Structured document data containing title, subtitle, and sections.
 * @returns {Promise<Buffer>}
 */
export const generatePdfBuffer = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margins: { top: 60, bottom: 70, left: 60, right: 60 },
                bufferPages: true,
            });

            const buffers = [];
            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));

            const colors = {
                primary: "#1D0B3B",
                accent: "#9333EA",
                textMain: "#334155",
                textMuted: "#94A3B8",
                white: "#FFFFFF",
                lilac: "#D8B4FE"
            };

            doc.rect(0, 0, doc.page.width, 160).fill(colors.primary);
            doc.rect(0, 160, doc.page.width, 4).fill(colors.accent);

            doc.y = 55;
            doc.x = 60;
            if (data.title) {
                doc.fillColor(colors.white)
                    .fontSize(32)
                    .font("Helvetica-Bold")
                    .text(data.title, { width: doc.page.width - 120, align: "left" });
            }

            if (data.subtitle) {
                doc.moveDown(0.2);
                doc.fillColor(colors.lilac)
                    .fontSize(14)
                    .font("Helvetica")
                    .text(data.subtitle, { width: doc.page.width - 120, align: "left" });
            }

            doc.y = 210;
            if (Array.isArray(data.sections)) {
                data.sections.forEach((section) => {
                    if (doc.y > 680) doc.addPage();

                    if (section.heading) {
                        const cleanHeading = section.heading.replace(/^\d+\.\s*/, '');

                        doc.moveDown(1.5);
                        doc.fillColor(colors.primary)
                            .fontSize(18)
                            .font("Helvetica-Bold")
                            .text(cleanHeading);

                        doc.rect(60, doc.y - 2, 40, 2).fill(colors.accent);
                        doc.moveDown(0.8);
                    }

                    if (Array.isArray(section.points)) {
                        section.points.forEach((point) => {
                            if (doc.y > 720) doc.addPage();

                            const cleanPoint = point.replace(/^[-•*]\s*/, '');
                            const currentY = doc.y;

                            doc.circle(68, currentY + 6, 3).fill(colors.accent);

                            doc.fillColor(colors.textMain)
                                .fontSize(11.5)
                                .font("Helvetica")
                                .text(cleanPoint, 85, currentY, {
                                    lineGap: 5,
                                    paragraphGap: 10,
                                    width: doc.page.width - 145
                                });

                            doc.x = 60;
                        });
                    }
                });
            }

            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);

                const oldBottomMargin = doc.page.margins.bottom;
                doc.page.margins.bottom = 0;

                doc.rect(60, doc.page.height - 65, doc.page.width - 120, 1).fill("#E2E8F0");

                doc.fillColor(colors.accent)
                    .fontSize(10)
                    .font("Helvetica-Bold")
                    .text("CortexAI", 60, doc.page.height - 50, { lineBreak: false });

                doc.fillColor(colors.textMuted)
                    .fontSize(9)
                    .font("Helvetica")
                    .text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 50, {
                        align: "right",
                        width: doc.page.width - 60,
                        lineBreak: false
                    });

                doc.page.margins.bottom = oldBottomMargin;
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};