import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import Logo from "../../../assets/images/logo.png";
import Myna from "../../../assets/images/myna.png";
import dayjs from "dayjs";
import "../../../assets/fonts/GandhiFont-bold.js";
import "../../../assets/fonts/GandhiSans-Regular-normal orig.js";
import { PDFDocument } from 'pdf-lib';

import {
  removeSpace,
  generateCompleteListOfSpeciesData,
  generateEndemicData,
  generateIUCNData,
  generateSOIBData,
  generateWaterBirdCongregationData,
  addPageIfLessSpaceLeft,
  generateHotspotData,
  isHeadingRequired,
  generateCustomFirstCellWithScientificName,
  generateObservationList,
  createHyperlinkForYear,
  createHyperlinkForYearSoib
  // genrateSoibConcernStatus
} from "./generateReportTableData";
// import { data } from "autoprefixer";
import { generateFirstPage } from "./generateFirstPage";

function hideGoogleMapControls(container, indices) {
    const gm = container?.querySelector(".gm-style");
    if (!gm) return [];

    const hidden = [];

    indices.forEach(i => {
        if (gm.children[i]) {
            hidden.push({
                node: gm.children[i],
                display: gm.children[i].style.display
            });
            gm.children[i].style.display = "none";
        }
    });

    return hidden;
}

function restoreGoogleMapControls(hidden) {
    hidden.forEach(item => {
        item.node.style.display = item.display;
    });
}

function fixGoogleMapControlsForPdf(doc) {

  doc.querySelectorAll(".gm-style-cc").forEach(cc => {

  const span = cc.querySelector("span");

  if (span && span.textContent.includes("Map data")) {

    cc.style.height = "18px";

    const bg = cc.firstElementChild;

    if (bg)
      bg.style.height = "18px";

  }

});
  
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitForNextPaint = () =>
  new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

const waitForImages = async (element, timeoutMs = 6000) => {
  if (!element) return;

  const images = Array.from(element.querySelectorAll("img"));
  const pendingImages = images.filter(img => !img.complete || img.naturalWidth === 0);

  if (pendingImages.length === 0) return;

  await Promise.race([
    Promise.all(
      pendingImages.map(img => new Promise(resolve => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      }))
    ),
    wait(timeoutMs)
  ]);
};

const waitForCaptureTarget = async (element, timeoutMs = 6000) => {
  if (!element) return;

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await waitForImages(element, timeoutMs);
  await waitForNextPaint();
};

const getCaptureWindowSize = (element, fallbackWidth = 1600) => {
  const rect = element.getBoundingClientRect();

  return {
    windowWidth: Math.ceil(Math.max(element.scrollWidth || 0, rect.width || 0, fallbackWidth)),
    windowHeight: Math.ceil(Math.max(element.scrollHeight || 0, rect.height || 0, 900)),
  };
};
export const handleDownloadPdf = async (
  PrintScreen,
  otherScreen,
  heatmapRef,
  chartRef,
  mostCommonSpeciesDiv,
  seasonalChartDiv,
  citationMetadataRef,
  header,
  footer,
  getDataForIucnRedListTable,
  getDataForEndemicSpeciesTable,
  getDataForWaterbirdCongregation,
  completeListOfSpecies,
  selectedState,
  selectedCounty,
  selectedLocality,
  getHotspotAreas,
  setPdfDownloadStatus,
  setChangeLayoutForReport,
  reportName,
  formattedDate,
  Group86,
  Group_26,
  Layer_1,
  Layer_2,
  whiteLogo,
  India,
  NT_Logo,
  EN_Logo,
  CR_Logo,
  VU_Logo,
  indiaEndemicCount,
  scheduleICount,
  soibHighPriorityCount,
  iucnRedListCount,
  migrateCount,
  totalCount,
  cmsAppendixSpecies,
  citesAppendixSpecies,
  soibConservationConcernSpecies,
  NT_Count,
  VU_Count,
  EN_Count,
  CR_Count,
  effortDetails,
  getSoibConcernStatus,
  startDate,
  endDate,
  getSeasonalChartData,

) => {
  const shouldDrawTable = (data) => {
    return data.length > 0 ? true : false;
  };
  let tableStartPage = 0;
  let tableEndPage = 0;
  let backgroundColorForHeading = [];
  let headerRequiredOnPageNumber = [];
  const rowColors = ["#F3EDE8", "#C8D8DC"];
  setPdfDownloadStatus("Creating Layout..");
  const pdf = new jsPDF({ format: "a4" });
  // capturing multiple images
  const captureCanvasOld = async (ref, options = {}) => {
    if (!ref?.current) {
      console.warn("Skipping capture: Element not found.");
      return null;
    }

    await waitForCaptureTarget(ref.current);

    const captureWindow = getCaptureWindowSize(
      ref.current,
      options.windowWidth || 1600
    );

    return await html2canvas(ref.current, {
      ...captureWindow,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: options.scale || 1.5,
      scrollX: 0,
      scrollY: 0,
      onclone: fixGoogleMapControlsForPdf,
      ...options,
    });
  };

  const captureCanvas = async (elementRef, options = {}) => {
    if (!elementRef?.current) return null;

    await waitForCaptureTarget(elementRef.current);
    
    const captureWindow = getCaptureWindowSize(
      elementRef.current,
      options.windowWidth || 1600
    );

    return await html2canvas(elementRef.current, {
      ...captureWindow,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: options.scale || 1.5,
      scrollX: 0,
      scrollY: 0,
      onclone: fixGoogleMapControlsForPdf,
      ...options,
    });
  };
  setPdfDownloadStatus("Gathering Data...");

  
  const hidden = hideGoogleMapControls(otherScreen.current, [3,7,12]);
  
  const otherScreenCanvas = await captureCanvas(otherScreen);
  restoreGoogleMapControls(hidden);
  const chartRefCanvas = await captureCanvas(chartRef);
  
  const hiddenHeatmap = hideGoogleMapControls(heatmapRef.current, [3,7,12]);
  const heatmapRefCanvas = await captureCanvasOld(heatmapRef);
  restoreGoogleMapControls(hiddenHeatmap);

  const citationCanvas = await captureCanvas(citationMetadataRef);



  const lockPdf = async (jsPDFDoc, pdfName) => {
  // Convert jsPDF output to bytes
  const jsPdfBytes = jsPDFDoc.output('arraybuffer');

  // Load into pdf-lib
  const pdfDoc = await PDFDocument.load(jsPdfBytes);

  // (Optional) Flatten all form fields – if using interactive content
  const form = pdfDoc.getForm();
  form.flatten(); // Makes text permanent (not editable)

  // Save the PDF
  const lockedPdfBytes = await pdfDoc.save();

  // Trigger download
  const blob = new Blob([lockedPdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const downloadName = pdfName.toLowerCase().endsWith('.pdf')
    ? pdfName
    : `${pdfName}.pdf`;

  a.href = url;
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  setPdfDownloadStatus("Completed");
  setTimeout(() => {
      setPdfDownloadStatus("");
      setChangeLayoutForReport(false);
    }, 2000);
  };


  setPdfDownloadStatus("Creating Tables...");
            
  const mostCommonSpeciesDivCanvas = await captureCanvas(mostCommonSpeciesDiv, {
    windowWidth: 2000,
  });

  setPdfDownloadStatus("Writing Images...");
  let seasonalChartCanvas = null;

  if (getSeasonalChartData?.length > 0) {
      seasonalChartCanvas = await captureCanvas(seasonalChartDiv, {
          windowWidth: 2000,
      });
  }
  
  setPdfDownloadStatus("Almost Done...");
  setPdfDownloadStatus("Please wait...");
  const canvas6 = await captureCanvas(footer, {
    windowWidth: 1300,
  });
  // Generating data for various tables
  const iucnData = generateIUCNData(getDataForIucnRedListTable);

  const soibData = generateSOIBData(getSoibConcernStatus);
  // const soibConcernData = genrateSoibConcernStatus(getSoibConcernStatus);
  const endemicData = generateEndemicData(getDataForEndemicSpeciesTable);
  const waterBirdCongregationsData = generateWaterBirdCongregationData(
    getDataForWaterbirdCongregation
  );
  const completeListOfSpeciesData = generateCompleteListOfSpeciesData(
    completeListOfSpecies
  );

  const hotspotList = generateHotspotData(getHotspotAreas);
  const observationsList = generateObservationList(effortDetails);
  //writing first page with basic details to pdf in image format
  const pdfWidth = pdf.internal.pageSize.getWidth();
  generateFirstPage(
    pdf,
    Group86,
    Group_26,
    Layer_1,
    Layer_2,
    whiteLogo,
    India,
    NT_Logo,
    EN_Logo,
    CR_Logo,
    VU_Logo,
    indiaEndemicCount,
    scheduleICount,
    soibHighPriorityCount,
    iucnRedListCount,
    migrateCount,
    totalCount,
    cmsAppendixSpecies,
    citesAppendixSpecies,
    soibConservationConcernSpecies,
    NT_Count,
    VU_Count,
    EN_Count,
    CR_Count,
  );
  
  //working on next page which has IUCN RED... table
  const footerImg = canvas6.toDataURL("image/png");
  const footerImgProperty = pdf.getImageProperties(footerImg);

  const footerImgHeight =
    (footerImgProperty.height * pdfWidth) / footerImgProperty.width;
  (soibData.length > 0 ||
    endemicData.length > 0 ||
    waterBirdCongregationsData > 0 || iucnData.length > 0) &&
    pdf.addPage();
  if (shouldDrawTable(soibData)) {
    pdf.autoTable({
      headStyles: {
      fillColor: [154, 114, 105],
      cellPadding: 5,
      halign: "center",
      font: "GandhiFont",
      fontStyle: "bold",
      },
      head: [["SOIB HIGH CONSERVATION PRIORITY SPECIES"]],
      margin: { top: 30 },
      body: [],
      startY: 40,
      font: "GandhiSans-Regular",
      fontStyle: "normal",
      rowPageBreak: "avoid",
    });
    // defining header image data
    //second table
    //tableStartPage and tableEndPage is repeated at start and end of table to know pagenumber on which repeater table title is required
    tableStartPage = pdf.internal.getNumberOfPages();
    pdf.autoTable({
      margin: { top: 0 },
      body: soibData,
      headStyles: {
        fillColor: [232, 232, 232],
        textColor: [54, 54, 54],
        font: "GandhiFont",
        fontStyle: "bold",
      },
      head: [["Species",  "Frequency of Reporting", "Year of Latest Report"]],
      styles: {
        cellPadding: 4, // Set padding for all cells
        font: "GandhiSans-Regular",
        fontStyle: "normal",
      },
      rowPageBreak: "avoid",
      startY: removeSpace(pdf.previousAutoTable.finalY),
      didParseCell: function (data) {
        data.cell.styles.fontStyle = "bold";
        const { row } = data;
        const fillColor = rowColors[row.index % 2];
        if (fillColor && row.section !== "head") {
          data.cell.styles.fillColor = fillColor;
        }
        const doesExist = backgroundColorForHeading.find(
          (item) => item.pageNo === data.doc.internal.getNumberOfPages()
        );
        if (doesExist) {
          const foundIndex = backgroundColorForHeading.indexOf(doesExist);
          backgroundColorForHeading.splice(foundIndex, 1, {
            color: fillColor,
            pageNo: data.doc.internal.getNumberOfPages(),
          });
          return;
        }
        backgroundColorForHeading.push({
          color: fillColor,
          pageNo: data.doc.internal.getNumberOfPages(),
        });
      },
      didDrawCell: (data) => {
        generateCustomFirstCellWithScientificName(data, pdf, rowColors);
        createHyperlinkForYearSoib(pdf,data,rowColors)
      },
      didDrawPage: function (data) {
        data.settings.margin.top = 54;
      },
    });
    tableEndPage = pdf.internal.getNumberOfPages();
    isHeadingRequired(
      tableStartPage,
      tableEndPage,
      backgroundColorForHeading,
      ["SOIB HIGH CONSERVATION PRIORITY SPECIES"],
      ["Species", "Frequency of Reporting", "Year of Latest Report"],
      headerRequiredOnPageNumber
    );
    addPageIfLessSpaceLeft(pdf.previousAutoTable.finalY) && pdf.addPage();
  }

  if (shouldDrawTable(iucnData)) {
    pdf.autoTable({
      headStyles: {
        fillColor: [154, 114, 105],
        cellPadding: 5,
        halign: "center",
        font: "GandhiFont",
        fontStyle: "bold",
      },
      head: [["IUCN RED LIST SPECIES"]],
      body: [],
      startY: addPageIfLessSpaceLeft(
        pdf.previousAutoTable.finalY,
        "createMargin"
      ),
      font: "GandhiSans-Regular",
      fontStyle: "normal",
      rowPageBreak: "avoid",
    });
   
    tableStartPage = pdf.internal.getNumberOfPages();
    pdf.autoTable({
      body: iucnData,
      headStyles: {
        fillColor: [232, 232, 232],
        textColor: [54, 54, 54],
        font: "GandhiFont",
        fontStyle: "bold",
      },
      head: [["Species", "IUCN Status", "Frequency of Reporting", "Year of Latest Report"]],
      styles: {
        cellPadding: 4, // Set padding for all cells
        font: "GandhiSans-Regular",
        fontStyle: "normal",
      },
      rowPageBreak: "avoid",
      startY: removeSpace(pdf.previousAutoTable.finalY),
      didParseCell: function (data) {
        data.cell.styles.fontStyle = "bold";
        const { row } = data;
        const fillColor = rowColors[row.index % 2];
        if (fillColor && row.section !== "head") {
          data.cell.styles.fillColor = fillColor;
        }
        const doesExist = backgroundColorForHeading.find(
          (item) => item.pageNo === data.doc.internal.getNumberOfPages()
        );
        if (doesExist) {
          const foundIndex = backgroundColorForHeading.indexOf(doesExist);
          backgroundColorForHeading.splice(foundIndex, 1, {
            color: fillColor,
            pageNo: data.doc.internal.getNumberOfPages(),
          });
          return;
        }
        backgroundColorForHeading.push({
          color: fillColor,
          pageNo: data.doc.internal.getNumberOfPages(),
        });
      },
      // didDrawCell: (data) => {
      //   generateCustomFirstCellWithScientificName(data, pdf, rowColors);
      // },
      didDrawCell: (data) => {
        generateCustomFirstCellWithScientificName(data, pdf, rowColors);
        createHyperlinkForYear(pdf,data,rowColors)
      },
     
      didDrawPage: function (data) {
        data.settings.margin.top = 54;
      },
    });
    tableEndPage = pdf.internal.getNumberOfPages();
    isHeadingRequired(
      tableStartPage,
      tableEndPage,
      backgroundColorForHeading,
      ["IUCN RED LIST SPECIES"],
      ["Species", "IUCN Status", "Frequency of Reporting", "Year of Latest Report"],
      headerRequiredOnPageNumber
    );
    addPageIfLessSpaceLeft(pdf.previousAutoTable.finalY) && pdf.addPage();
  }
  if (shouldDrawTable(endemicData)) {
    pdf.autoTable({
      headStyles: {
        fillColor: [154, 114, 105],
        cellpadding: 4,
        halign: "center",
        cellPadding: 5,
        font: "GandhiFont",
        fontStyle: "bold",
      },
      head: [["ENDEMIC SPECIES"]],
      body: [],
      font: "GandhiSans-Regular",
      fontStyle: "normal",
      rowPageBreak: "avoid",
      startY: addPageIfLessSpaceLeft(
        pdf.previousAutoTable.finalY,
        "createMargin"
      ),
    });
    tableStartPage = pdf.internal.getNumberOfPages();
    pdf.autoTable({
      body: endemicData,
      headStyles: {
        fillColor: [232, 232, 232],
        textColor: [54, 54, 54],
        font: "GandhiFont",
        fontStyle: "bold",
      },
      head: [["Species", "Endemic Region", "Frequency of Reporting", "Year of Latest Report"]],
      styles: {
        cellPadding: 4, // Set padding for all cells
        font: "GandhiSans-Regular",
        fontStyle: "normal",
      },
      rowPageBreak: "avoid",
      startY: removeSpace(pdf.previousAutoTable.finalY),
      didParseCell: function (data) {
        const { row } = data;
        const fillColor = rowColors[row.index % 2];
        if (fillColor && row.section !== "head") {
          data.cell.styles.fillColor = fillColor;
        }
        const doesExist = backgroundColorForHeading.find(
          (item) => item.pageNo === data.doc.internal.getNumberOfPages()
        );
        if (doesExist) {
          const foundIndex = backgroundColorForHeading.indexOf(doesExist);
          backgroundColorForHeading.splice(foundIndex, 1, {
            color: fillColor,
            pageNo: data.doc.internal.getNumberOfPages(),
          });
          return;
        }
        backgroundColorForHeading.push({
          color: fillColor,
          pageNo: data.doc.internal.getNumberOfPages(),
        });
      },
      alternateRowStyles: {
        fillColor: [200, 216, 220], // Light gray
      },
      didDrawPage: function (data) {
        data.settings.margin.top = 54;
      },
      didDrawCell: (data) => {
        generateCustomFirstCellWithScientificName(data, pdf, rowColors);
        createHyperlinkForYear(pdf,data,rowColors)
      },
    });
    tableEndPage = pdf.internal.getNumberOfPages();
    isHeadingRequired(
      tableStartPage,
      tableEndPage,
      backgroundColorForHeading,
      ["ENDEMIC SPECIES"],
      ["Species", "Endemic Region", "Frequency of Reporting", "Year of Latest Report"],
      headerRequiredOnPageNumber
    );
    addPageIfLessSpaceLeft(pdf.previousAutoTable.finalY) && pdf.addPage();
  }
  if (shouldDrawTable(waterBirdCongregationsData)) {
    pdf.autoTable({
      headStyles: {
        fillColor: [154, 114, 105],
        cellpadding: 4,
        halign: "center",
        cellPadding: 5,
        font: "GandhiFont",
        fontStyle: "bold",
      },
      head: [["WATERBIRD CONGREGATIONS"]],
      body: [],
      font: "GandhiSans-Regular",
      fontStyle: "normal",
      rowPageBreak: "avoid",
      startY: addPageIfLessSpaceLeft(
        pdf.previousAutoTable.finalY,
        "createMargin"
      ),
    });
    tableStartPage = pdf.internal.getNumberOfPages();
    pdf.autoTable({
      headStyles: {
        fillColor: [232, 232, 232],
        textColor: [54, 54, 54],
        font: "GandhiFont",
        fontStyle: "bold",
      },
      head: [["Species", "Highest Count", "1% of Biogeographic Population","Year of Report"]],
      body: waterBirdCongregationsData,
      rowPageBreak: "avoid",
      startY: removeSpace(pdf.previousAutoTable.finalY),
      styles: {
        cellPadding: 4, // Set padding for all cells
        font: "GandhiSans-Regular",
        fontStyle: "normal",
      },
      didParseCell: function (data) {
        const { row } = data;
        const fillColor = rowColors[row.index % 2];
        if (fillColor && row.section !== "head") {
          data.cell.styles.fillColor = fillColor;
        }
        const doesExist = backgroundColorForHeading.find(
          (item) => item.pageNo === data.doc.internal.getNumberOfPages()
        );
        if (doesExist) {
          const foundIndex = backgroundColorForHeading.indexOf(doesExist);
          backgroundColorForHeading.splice(foundIndex, 1, {
            color: fillColor,
            pageNo: data.doc.internal.getNumberOfPages(),
          });
          return;
        }
        backgroundColorForHeading.push({
          color: fillColor,
          pageNo: data.doc.internal.getNumberOfPages(),
        });
      },

      didDrawPage: function (data) {
        data.settings.margin.top = 54;
      },
      didDrawCell: (data) => {
        generateCustomFirstCellWithScientificName(data, pdf, rowColors);
        createHyperlinkForYear(pdf,data,rowColors)
      },
    });
    tableEndPage = pdf.internal.getNumberOfPages();
    isHeadingRequired(
      tableStartPage,
      tableEndPage,
      backgroundColorForHeading,
      ["WATERBIRD CONGREGATIONS"],
      ["Species", "Highest Count", "1% of Biogeographic Population"],
      headerRequiredOnPageNumber
    );
  }
  (!shouldDrawTable(waterBirdCongregationsData) && !addPageIfLessSpaceLeft(pdf.previousAutoTable.finalY)) && pdf.addPage();
  shouldDrawTable(waterBirdCongregationsData) && pdf.addPage();

  if (mostCommonSpeciesDivCanvas) {
    
    const mostCommonSpeciesImg = mostCommonSpeciesDivCanvas.toDataURL("image/png");
    const mostCommonSpeciesImgProperty =
      pdf.getImageProperties(mostCommonSpeciesImg);
    const mostCommonSpeciesHeight =
      (mostCommonSpeciesImgProperty.height * pdfWidth) /
      mostCommonSpeciesImgProperty.width;
    
    pdf.addImage(
      mostCommonSpeciesImg,
      "PNG",
      0,
      40,
      pdfWidth,
      mostCommonSpeciesHeight,
      "one",
      "fast"
    );
  }

  if (getSeasonalChartData?.length > 0) {
  pdf.addPage();
  
  const sesonalChartImg = seasonalChartCanvas.toDataURL("image/png");
  const seasonalChartImgProperties = pdf.getImageProperties(sesonalChartImg);
  const seasonalChartHeight =
    (seasonalChartImgProperties.height * pdfWidth) /
    seasonalChartImgProperties.width;
    pdf.addImage(
      sesonalChartImg,
      "PNG",
      0,
      40,
      pdfWidth,
      seasonalChartHeight,
      "two",
      "fast"
    );
  }

  if (otherScreenCanvas) {
    pdf.addPage();

    
    const secondImg = otherScreenCanvas.toDataURL("image/png");
    const hotspotImageProperties = pdf.getImageProperties(secondImg);
    const hotspotImageHeight =
      (hotspotImageProperties.height * 100) / hotspotImageProperties.width;
      pdf.addImage(
      secondImg,
      "PNG",
      15,
      40,
      100,
      hotspotImageHeight,
      "three",
      "fast"
    );
    let isShiftingRequiredafterHotspot = false;
    if (hotspotList?.length > 3) {
      isShiftingRequiredafterHotspot = true;
    }
    pdf.setFillColor("#000000");
  
     pdf.autoTable({
      body: hotspotList,
      headStyles: {
        fillColor: [154, 114, 105],
        cellpadding: 4,
        textColor: [255, 255, 255],
        font: "GandhiFont",
        fontStyle: "bold",
      },
      head: [["Top Hotspots", "No of Species"]],
      styles: {
        cellPadding: 3, // Set padding for all cells
        font: "GandhiSans-Regular",
        fontStyle: "normal",
      },
      rowPageBreak: "avoid",
      startY: 40,
      // startY: 60,
      margin: { left: 116 },
      didParseCell: function (data) {
        const { row } = data;
        if (row.section !== "head") {
          const fillColor = rowColors[row.index % 2];
          if (fillColor && row.section !== "head") {
            data.cell.styles.fillColor = fillColor;
          }
        }
      },
    });
  }


      
      if (chartRefCanvas && getSeasonalChartData?.length > 0) {
        pdf.addPage();
        const secondImg2 = chartRefCanvas.toDataURL("image/png");
          // console.log(secondImg2,"secondImg2")
          if (secondImg2 && secondImg2.startsWith("data:image/png")) {
            const hotspotImageProp = pdf.getImageProperties(secondImg2);
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgAspectRatio = hotspotImageProp.width / hotspotImageProp.height;
            let imgWidth = pageWidth + 60 ;
            let imgHeight = imgWidth / imgAspectRatio;

            if (imgHeight > pageHeight - 80) {
              imgHeight = pageHeight - 80;
              imgWidth = imgHeight * imgAspectRatio;
            }

            const xPos = (pageWidth - imgWidth) / 2;
            const yPos = 60;

            pdf.addImage(
              secondImg2,
              "PNG",
              xPos,
              yPos,
              imgWidth,
              imgHeight,
              "five",
              "fast"
            );
        }
      }
  
  
      
      const seventhImg = heatmapRefCanvas?.toDataURL("image/png");
      
      if(seventhImg && seventhImg.startsWith("data:image/png")){ 
      pdf.addPage();
      
      const heatmapImageProperties = pdf.getImageProperties(seventhImg);
      const pageWidthHmap = pdf.internal.pageSize.getWidth();
      const imgWidthHmap = 280; // Fixed width (you can modify this)
      const xPosHmap = (pageWidthHmap - imgWidthHmap) / 2; // Center horizontally
      const mapYPosition = 60; // Starting position of the heatmap image
      
      const heatmapImageHeight =
        (heatmapImageProperties.height * imgWidthHmap) / heatmapImageProperties.width;
        const heatmapEndY = mapYPosition + heatmapImageHeight;
        const marginBelowSeventhImg = 10; // Adjust this value as needed
        const yPos = heatmapEndY + marginBelowSeventhImg;
        
          pdf.addImage(
            seventhImg,
            "PNG",
            xPosHmap,
            mapYPosition,
            imgWidthHmap,
            heatmapImageHeight,
            "seven",
            "fast"
          );
        }


  if (shouldDrawTable(completeListOfSpeciesData)) {
    pdf.addPage();
    pdf.autoTable({
      headStyles: {
        fillColor: [154, 114, 105],
        cellpadding: 4,
        halign: "center",
        cellPadding: 5,
        font: "GandhiFont",
        fontStyle: "bold",
      },
      head: [["COMPLETE LIST OF SPECIES"]],
      body: [],
      font: "GandhiSans-Regular",
      margin: { top: 0},
      fontStyle: "normal",
      rowPageBreak: "avoid",
      startY:40,
    });
      tableStartPage = pdf.internal.getNumberOfPages();
      pdf.autoTable({
        body: completeListOfSpeciesData,
        headStyles: {
          fillColor: [232, 232, 232],
          textColor: [54, 54, 54],
          font: "GandhiFont",
          fontStyle: "bold",
        },
        head: [["Species", "SoIB Priority", "IUCN", "Endemic Region", "WLPA"]],
        styles: {
          cellPadding: 3, // Set padding for all cells
          font: "GandhiSans-Regular",
          fontStyle: "normal",
        },
        rowPageBreak: "avoid",
        startY: removeSpace(pdf.previousAutoTable.finalY),
        alternateRowStyles: {
          fillColor: [200, 216, 220], // Light gray
        },
        didParseCell: function (data) {
          const { row } = data;
          const fillColor = rowColors[row.index % 2];
          if (fillColor && row.section !== "head") {
            data.cell.styles.fillColor = fillColor;
          }
        const doesExist = backgroundColorForHeading.find(
          (item) => item.pageNo === data.doc.internal.getNumberOfPages()
        );
        if (doesExist) {
          const foundIndex = backgroundColorForHeading.indexOf(doesExist);
          backgroundColorForHeading.splice(foundIndex, 1, {
            color: fillColor,
            pageNo: data.doc.internal.getNumberOfPages(),
          });
          return;
        }
        backgroundColorForHeading.push({
          color: fillColor,
          pageNo: data.doc.internal.getNumberOfPages(),
        });
      },
      didDrawPage: function (data) {
        data.settings.margin.top = 54;
      },
      didDrawCell: (data) => {
        generateCustomFirstCellWithScientificName(data, pdf, rowColors);
      },
    });
    tableEndPage = pdf.internal.getNumberOfPages();
    isHeadingRequired(
      tableStartPage,
      tableEndPage,
      backgroundColorForHeading,
      ["COMPLETE LIST OF SPECIES"],
      ["Species", "SoIB Priority", "IUCN", "Endemic Region", "WLPA"],
      headerRequiredOnPageNumber
    );
    addPageIfLessSpaceLeft(pdf.previousAutoTable.finalY) && pdf.addPage();
  }

  if (true) {
    pdf.autoTable({
      headStyles: {
        fillColor: [154, 114, 105],
        cellpadding: 4,
        halign: "center",
        cellPadding: 5,
        font: "GandhiFont",
        fontStyle: "bold",
      },
      head: [["DATA CONTRIBUTIONS"]],
      body: [],
      font: "GandhiSans-Regular",
      fontStyle: "normal",
      rowPageBreak: "avoid",
      startY:
        completeListOfSpeciesData.length > 0
          ? addPageIfLessSpaceLeft(pdf.previousAutoTable.finalY, "createMargin")
          : 120,
      margin: { right: 40, left: 40 },
    });
    tableStartPage = pdf.internal.getNumberOfPages();
    pdf.autoTable({
      body: observationsList,
      styles: {
        cellPadding: 3,
      },
      rowPageBreak: "avoid",
      startY: removeSpace(pdf.previousAutoTable.finalY),
      alternateRowStyles: {
        fillColor: [200, 216, 220], // Light gray
        font: "GandhiSans-Regular",
        fontStyle: "normal",
      },
      margin: { left: 40, right: 40 },
      didParseCell: function (data) {
        const { row } = data;
        const fillColor = rowColors[row.index % 2];
        if (fillColor && row.section !== "head") {
          data.cell.styles.fillColor = fillColor;
        }
        const doesExist = backgroundColorForHeading.find(
          (item) => item.pageNo === data.doc.internal.getNumberOfPages()
        );
        if (doesExist) {
          const foundIndex = backgroundColorForHeading.indexOf(doesExist);
          backgroundColorForHeading.splice(foundIndex, 1, {
            color: fillColor,
            pageNo: data.doc.internal.getNumberOfPages(),
          });
          return;
        }
        backgroundColorForHeading.push({
          color: fillColor,
          pageNo: data.doc.internal.getNumberOfPages(),
          font: "GandhiSans-Regular",
          fontStyle: "normal",
        });
      },
      didDrawPage: function (data) {
        data.settings.margin.top = 54;
      },
    });
    tableEndPage = pdf.internal.getNumberOfPages();
    isHeadingRequired(
      tableStartPage,
      tableEndPage,
      backgroundColorForHeading,
      ["DATA CONTRIBUTIONS"],
      ["Species", "SoIB Priority", "IUCN", "Endemic Region", "WLPA"],
      headerRequiredOnPageNumber
    );
  }

  if (citationCanvas) {
    pdf.addPage();

    const citationImg =
      citationCanvas.toDataURL("image/png");

    const citationProps =
      pdf.getImageProperties(citationImg);

    const citationHeight =
      (citationProps.height * pdfWidth) /
      citationProps.width;

    const margin = 15;
    const contentWidth = pdfWidth - margin * 2;
    
    pdf.addImage(
      citationImg,
      "PNG",
      margin,
      40,
      contentWidth,
      (citationProps.height * contentWidth) / citationProps.width,
      "citation",
      "FAST"
    );
  }

  // drawing anything on every page
  const pageCount = pdf.internal.getNumberOfPages(); //Total Page Number
  for (let i = 0; i < pageCount; i++) {
    pdf.setPage(i);
    let pageCurrent = pdf.internal.getCurrentPageInfo().pageNumber; //Current Page
    pdf.setFillColor(218, 184, 48);
    pdf.rect(0, 0, 210, 38, "F");
    pdf.addImage(Logo, "PNG", 3, 3, 20, 16, "hederlogo", "FAST");
    pdf.setFontSize(18);
    pdf.addImage(Myna, "PNG", 3, 20, 18, 5, "myna", "fast");
    // console.log(pdf.getFontList())
    pdf.setFont('GandhiSans-Regular', 'normal')
    pdf.setFontSize(18);
    // Set the font as the default font
    pdf.setFont("GandhiFont", "bold");
    pdf.setTextColor("#ffffff");
    const pdfReportName = reportName.toUpperCase();
    pdf.text("Birds of " + pdfReportName, 105, 14, "center");
    pdf.setFontSize(12);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pdfLocality = (selectedLocality || "")
      .replace(/\s*\([^)]*\)/g, "") // Remove "(ಕನ್ನಡ)" etc.
      .trim();
    if (selectedState) {
      pdf.text("State: " + selectedState, 70, 23, "center");
      pdf.text("District: " + selectedCounty, 140, 23, "center");

      if (pdfLocality) {
      pdf.text(
        "Locality: " + pdfLocality,
        pageWidth / 2,
        30,
        { align: "center" }
      );
    }
    }
    pdf.setFontSize(10);
    const dateRange =
      `${dayjs(startDate).format("DD/MM/YYYY")} – ${dayjs(endDate).format("DD/MM/YYYY")}`;

    pdf.text(`Dates: ${dateRange}`, 183, 35, "center");
    pdf.setFontSize(12);

    pdf.setFont('GandhiSans-Regular', 'normal')
    pdf.addImage(
      footerImg,
      "PNG",
      0,
      284,
      pdfWidth,
      footerImgHeight,
      "footer",
      "fast"
    );
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(218, 184, 48);
    pdf.circle(196, 291, 3, "F");
    pageCurrent < 10
      ? pdf.text(pageCurrent.toString(), 195, 292.3)
      : pdf.text(pageCurrent.toString(), 193.8, 292.3);
  }
  headerRequiredOnPageNumber.map((item) => {
    pdf.setPage(item.page);
    item.header !== "DATA CONTRIBUTIONS"
      ? pdf.autoTable({
        headStyles: {
          fillColor: [154, 114, 105],
          cellPadding: 5,
          halign: "center",
          font: "GandhiFont",
          fontStyle: "bold",
        },
        head: [item.header],
        font: "GandhiFont",
        fontStyle: "bold",
        rowPageBreak: "avoid",
        margin: { top: 30 },
        body: [],
        startY: 40,
      })
      : pdf.autoTable({
        headStyles: {
          fillColor: [154, 114, 105],
          cellPadding: 5,
          halign: "center",
          font: "GandhiFont",
          fontStyle: "bold",
        },
        head: [item.header],
        font: "GandhiFont",
        fontStyle: "bold",
        rowPageBreak: "avoid",
        margin: { top: 30, right: 40, left: 40 },
        body: [],
        startY: 40,
      });
  });
  const pdfName =
    (reportName === "" ? "MYNA Himalyan Birds" : reportName) +
    " " +
    formattedDate;
  // pdf.save(pdfName);
  await lockPdf(pdf, pdfName);
  setPdfDownloadStatus("Completed");
  const handleClick = () => {
    setTimeout(() => {
      setPdfDownloadStatus("");
      setChangeLayoutForReport(false);
    }, 2000);
  };

  handleClick();
};