import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';

export const exportDashboardToWord = async (elementId: string = 'dashboard-main') => {
  const mainElement = document.getElementById(elementId) || document.querySelector('main');
  if (!mainElement) return;

  try {
    const clone = mainElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = '1200px'; 
    clone.style.backgroundColor = '#ffffff';

    const originalWrappers = mainElement.querySelectorAll('.recharts-wrapper');
    const cloneWrappers = clone.querySelectorAll('.recharts-wrapper');

    // MHTML boundaries
    const boundary = "=_MHT_Boundary_" + Math.random().toString(36).substring(2);
    let imageParts = "";

    // Process SVGs into images and MHTML parts
    for (let i = 0; i < originalWrappers.length; i++) {
      const orig = originalWrappers[i] as HTMLElement;
      const cloneW = cloneWrappers[i] as HTMLElement;
      
      const base64full = await toPng(orig, { pixelRatio: 2 });
      const base64data = base64full.split(',')[1];
      const imageId = `image_${i}.png`;
      
      const img = document.createElement('img');
      img.src = `cid:${imageId}`;
      img.style.width = '100%';
      img.style.maxWidth = '600px';
      
      if (cloneW && cloneW.parentNode) {
        cloneW.parentNode.replaceChild(img, cloneW);
      }

      // Add to MHTML parts
      imageParts += `
--${boundary}
Content-Location: ${imageId}
Content-Transfer-Encoding: base64
Content-Type: image/png

${base64data}
`;
    }

    const elementsToRemove = clone.querySelectorAll('button, select, .no-print');
    elementsToRemove.forEach(el => el.remove());

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Informe Comfamiliar</title>
        <style>
          body { font-family: 'Arial', sans-serif; color: #333; }
          h2, h3 { color: #1e293b; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; }
        </style>
      </head>
      <body>
        ${clone.innerHTML}
      </body>
      </html>
    `;

    document.body.removeChild(clone);

    // Construct full MHTML
    const mhtml = `MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Location: document.html
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: quoted-printable

${htmlContent.replace(/=/g, "=3D")}
${imageParts}
--${boundary}--
`;

    const blob = new Blob([mhtml], { type: 'application/msword' });
    saveAs(blob, 'informe_recreacion_y_deportes_profesional.doc');

  } catch (error: any) {
    console.error("Error exporting to Word:", error);
    alert("Hubo un error al exportar el documento a Word: " + (error?.message || error));
  }
};
