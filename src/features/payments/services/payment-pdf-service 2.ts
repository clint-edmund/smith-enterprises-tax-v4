import {
  toPng,
} from "html-to-image"

import jsPDF from "jspdf"

export async function downloadPaymentReceiptPdf(
  receiptElement: HTMLElement,
  receiptNumber: string,
): Promise<void> {
  const imageData =
    await toPng(
      receiptElement,
      {
        backgroundColor: "#ffffff",
        cacheBust: true,
        pixelRatio: 2,
      },
    )

  const pdf =
    new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    })

  const pageWidth =
    pdf.internal.pageSize.getWidth()

  const pageHeight =
    pdf.internal.pageSize.getHeight()

  const margin = 10

  const printableWidth =
    pageWidth - margin * 2

  const printableHeight =
    pageHeight - margin * 2

  const imageProperties =
    pdf.getImageProperties(imageData)

  const imageHeight =
    (
      imageProperties.height *
      printableWidth
    ) /
    imageProperties.width

  let heightRemaining =
    imageHeight

  let position =
    margin

  pdf.addImage(
    imageData,
    "PNG",
    margin,
    position,
    printableWidth,
    imageHeight,
    undefined,
    "FAST",
  )

  heightRemaining -=
    printableHeight

  while (heightRemaining > 0) {
    pdf.addPage()

    position =
      margin -
      (
        imageHeight -
        heightRemaining
      )

    pdf.addImage(
      imageData,
      "PNG",
      margin,
      position,
      printableWidth,
      imageHeight,
      undefined,
      "FAST",
    )

    heightRemaining -=
      printableHeight
  }

  const safeReceiptNumber =
    receiptNumber
      .trim()
      .replace(
        /[^a-zA-Z0-9-_]/g,
        "-",
      )

  const fileName =
    safeReceiptNumber
      ? `Receipt-${safeReceiptNumber}.pdf`
      : "Payment-Receipt.pdf"

  pdf.save(fileName)
}