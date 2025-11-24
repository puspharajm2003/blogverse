import html2pdf from "html2pdf.js/dist/html2pdf.umd";

export const exportArticleToPDF = (
  title: string,
  content: string,
  author: string = "",
  publishDate: string = ""
) => {
  const element = document.createElement("div");
  element.innerHTML = `
    <div style="font-family: serif; padding: 40px; max-width: 800px;">
      <h1 style="font-size: 32px; margin-bottom: 10px; font-weight: bold;">${title}</h1>
      ${author ? `<p style="color: #666; font-size: 14px; margin-bottom: 5px;">By ${author}</p>` : ""}
      ${publishDate ? `<p style="color: #999; font-size: 12px; margin-bottom: 30px;">${publishDate}</p>` : ""}
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <div style="font-size: 16px; line-height: 1.8; color: #333;">
        ${content}
      </div>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `${title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
  };

  html2pdf().set(opt).from(element).save();
};

export const exportArticleAsDocx = (
  title: string,
  content: string,
  author: string = "",
  publishDate: string = ""
) => {
  // Creates a simple Word document format
  const docContent = `
TITLE: ${title}
${author ? `AUTHOR: ${author}\n` : ""}
${publishDate ? `DATE: ${publishDate}\n` : ""}
${"=".repeat(80)}

${content.replace(/<[^>]*>/g, "")}
  `;

  const element = document.createElement("a");
  const file = new Blob([docContent], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = `${title.replace(/\s+/g, "-").toLowerCase()}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
