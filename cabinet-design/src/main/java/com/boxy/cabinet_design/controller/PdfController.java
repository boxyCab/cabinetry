package com.boxy.cabinet_design.controller;
import com.boxy.cabinet_design.dto.*;
import com.boxy.cabinet_design.service.KitchenLayoutWallGenerator;
import com.boxy.cabinet_design.repository.KitchenRepository;
import com.boxy.cabinet_design.entity.Kitchen;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.apache.pdfbox.io.MemoryUsageSetting;
import org.apache.pdfbox.io.RandomAccessStreamCache;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.io.IOUtils;
import org.apache.pdfbox.Loader; 


import org.apache.pdfbox.io.MemoryUsageSetting;
import org.apache.pdfbox.multipdf.PDFMergerUtility;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.imageio.ImageIO;
import java.awt.*;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;

import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;


@CrossOrigin(origins = "http://localhost")
@RestController
@RequestMapping("/api")
public class PdfController {
    private static final Logger logger = LoggerFactory.getLogger(PdfController.class);

    @Autowired
    private KitchenRepository kitchenRepository;
    @PostMapping("/save-canvas-data")
    public ResponseEntity<String> saveCanvasData(@RequestBody CanvasRequest canvasRequest) {
        try {
            Path outputPath = Paths.get(canvasRequest.getPath(), "canvas_page_" + canvasRequest.getPageIndex() + ".pdf");
            Files.createDirectories(outputPath.getParent());

            // 解码 Base64 图像
            String base64Image = canvasRequest.getCanvasData().replace("data:image/png;base64,", "");
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            BufferedImage bufferedImage = ImageIO.read(new ByteArrayInputStream(imageBytes));

            // 创建 PDF 文档（A4 尺寸）
            PDDocument document = new PDDocument();
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            float pageWidth = PDRectangle.A4.getWidth();
            float pageHeight = PDRectangle.A4.getHeight();

            // === 1. 绘制居中图像 ===
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // 缩放图像以适应页面（保持宽高比）
                float imgWidth = bufferedImage.getWidth();
                float imgHeight = bufferedImage.getHeight();
                float scale = Math.min((pageWidth - 40) / imgWidth, (pageHeight - 100) / imgHeight); // 留边距
                float scaledW = imgWidth * scale;
                float scaledH = imgHeight * scale;
                float x = (pageWidth - scaledW) / 2;
                float y = (pageHeight - scaledH) / 2;

                // 将 BufferedImage 转为 PDImageXObject
                PDImageXObject pdImage = LosslessFactory.createFromImage(document, bufferedImage);
                contentStream.drawImage(pdImage, x, y, scaledW, scaledH);
            }

            // === 2. 添加右下角信息（logo + 日期文字）===
            // 布局设计：Logo在右上角，日期信息在Logo下方，垂直排列
            PDPageContentStream footerStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);

            // 设置字体
            PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

            String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));

            // 先加载并绘制 logo（在最右边）
            try {
                File logoFile = new File("path/boxylogo.jpg");
                if (logoFile.exists()) {
                    BufferedImage logoImg = ImageIO.read(logoFile);
                    PDImageXObject logo = LosslessFactory.createFromImage(document, logoImg);

                    // 计算logo的宽高比，保持原始比例等比例缩放
                    float logoOriginalWidth = logoImg.getWidth();
                    float logoOriginalHeight = logoImg.getHeight();
                    float aspectRatio = logoOriginalWidth / logoOriginalHeight;

                    // 设置logo的目标高度，宽度根据宽高比自动计算
                    float targetHeight = 35f;  // logo高度
                    float targetWidth = targetHeight * aspectRatio;  // 等比例计算宽度

                    // 定位logo：右下角最右侧，距离右边10
                    float logoX = pageWidth - targetWidth - 10;
                    float logoY = 28;  // 距离底部28

                    footerStream.drawImage(logo, logoX, logoY, targetWidth, targetHeight);

                    // 绘制日期文字（在logo左侧）
                    footerStream.setFont(fontBold, 9);
                    footerStream.setNonStrokingColor(Color.BLACK);

                    float textX = logoX - 10;  // 文字在logo左侧，留10像素间距

                    // 计算文字宽度以便右对齐
                    float designedWidth = fontBold.getStringWidth("Designed: " + date) / 1000 * 9;
                    float printedWidth = fontBold.getStringWidth("Printed: " + date) / 1000 * 9;

                    footerStream.beginText();

                    // Designed 行（上方的文字，与logo顶部对齐）
                    footerStream.newLineAtOffset(textX - designedWidth, 48);
                    footerStream.showText("Designed: " + date);

                    // Printed 行（下方文字，与logo底部对齐）
                    footerStream.newLineAtOffset((designedWidth - printedWidth), -12);
                    footerStream.showText("Printed: " + date);

                    footerStream.endText();
                } else {
                    // 如果没有logo，日期信息显示在右下角
                    logger.warn("Logo file not found: path/boxylogo.jpg");

                    footerStream.setFont(fontBold, 9);
                    footerStream.setNonStrokingColor(Color.BLACK);

                    footerStream.beginText();
                    footerStream.newLineAtOffset(pageWidth - 120, 35);
                    footerStream.showText("Designed: " + date);
                    footerStream.newLineAtOffset(0, -12);
                    footerStream.showText("Printed: " + date);
                    footerStream.endText();
                }
            } catch (Exception e) {
                logger.error("Error loading logo image", e);
                // 即使logo加载失败，也显示日期信息
                footerStream.setFont(fontBold, 9);
                footerStream.setNonStrokingColor(Color.BLACK);

                footerStream.beginText();
                footerStream.newLineAtOffset(pageWidth - 120, 35);
                footerStream.showText("Designed: " + date);
                footerStream.newLineAtOffset(0, -12);
                footerStream.showText("Printed: " + date);
                footerStream.endText();
            }

            footerStream.close();

            // 保存 PDF
            document.save(outputPath.toFile());
            document.close();

            return ResponseEntity.ok("Canvas data saved successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save canvas data.");
        }
    }

//    private Cell createLabelCell(String text, PdfFont font, int r, int g, int b, TextAlignment alignment) {
//        Cell cell = new Cell().add(
//            new Paragraph(text)
//                .setFont(font)
//                .setFontSize(8)
//                .setFontColor(new DeviceRgb(r, g, b)) // 直接创建 iText 颜色
//        );
//        cell.setBorder(null);
//        cell.setTextAlignment(alignment);
//        cell.setPadding(0);
//        return cell;
//    }
//
//    private Cell createValueCell(String text, PdfFont font, int r, int g, int b) {
//        Cell cell = new Cell().add(
//            new Paragraph(text)
//                .setFont(font)
//                .setFontSize(8)
//                .setFontColor(new DeviceRgb(r, g, b)) // 直接创建 iText 颜色
//        );
//        cell.setBorder(null);
//        cell.setPadding(0);
//        return cell;
//    }


    @PostMapping("/merge-pdfs")
	public ResponseEntity<byte[]> mergePdfs(@RequestBody PdfMergeRequest request) {
	    File tempCanvasFile = null;
	    try {
	        File dir = new File(request.getDirectoryPath());
	        if (!dir.exists() || !dir.isDirectory()) {
	            return ResponseEntity.badRequest().build();
	        }

	        // 获取 Kitchen notes
	        String notes = "";
	        if (request.getKitchenId() != null) {
	            Kitchen kitchen = kitchenRepository.findById(request.getKitchenId()).orElse(null);
	            if (kitchen != null && kitchen.getNotes() != null) {
	                notes = kitchen.getNotes();
	            }
	        }

	        // 在合并前，为 canvas_page_1.pdf 创建带 notes 的临时文件
	        File canvasPage1File = new File(dir, "canvas_page_1.pdf");
	        if (canvasPage1File.exists() && !notes.isEmpty()) {
	            tempCanvasFile = createNotesPdfCopy(canvasPage1File, notes);
	        }

	        File[] pdfFiles = dir.listFiles((d, name) -> name.toLowerCase().endsWith(".pdf"));
	        if (pdfFiles == null || pdfFiles.length == 0) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
	        }

	        // 排序（可选，按文件名）
	        Arrays.sort(pdfFiles, Comparator.comparing(File::getName));

	        ByteArrayOutputStream baos = new ByteArrayOutputStream();
	        PDFMergerUtility merger = new PDFMergerUtility();
	        merger.setDestinationStream(baos);

	        for (File file : pdfFiles) {
	            // 如果是 canvas_page_1.pdf 且有临时文件，使用临时文件代替
	            if (file.getName().equals("canvas_page_1.pdf") && tempCanvasFile != null) {
	                merger.addSource(tempCanvasFile);
	            } else {
	                merger.addSource(file);
	            }
	        }

	        // 3.x 合并 PDF 必须传入 StreamCacheCreateFunction
	        merger.mergeDocuments(IOUtils.createMemoryOnlyStreamCache());

	        byte[] result = baos.toByteArray();
	        HttpHeaders headers = new HttpHeaders();
	        headers.add("Content-Disposition", "attachment; filename=merged.pdf");

	        return ResponseEntity.ok()
	                .headers(headers)
	                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
	                .body(result);

	    } catch (Exception e) {
	        e.printStackTrace();
	        logger.error("Error merging PDFs", e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    } finally {
	        // 清理临时文件
	        if (tempCanvasFile != null && tempCanvasFile.exists()) {
	            try {
	                tempCanvasFile.delete();
	            } catch (Exception e) {
	                logger.warn("Failed to delete temporary file: " + tempCanvasFile.getPath(), e);
	            }
	        }
	    }
	}

	/**
	 * 创建带 notes 的 PDF 副本（不修改原文件）
	 */
	private File createNotesPdfCopy(File pdfFile, String notes) throws IOException {
	    PDDocument document = null;
	    File tempFile = null;
	    try {
	        // 加载原 PDF
	        document = Loader.loadPDF(pdfFile);

	        if (document.getNumberOfPages() == 0) {
	            return null;
	        }

	        PDPage firstPage = document.getPage(0);
	        PDRectangle pageSize = firstPage.getMediaBox();
	        float pageWidth = pageSize.getWidth();
	        float pageHeight = pageSize.getHeight();

	        // 创建临时文件保存带 notes 的副本
	        tempFile = File.createTempFile("canvas_with_notes_", ".pdf");

	        PDPageContentStream contentStream = new PDPageContentStream(
	            document, firstPage, PDPageContentStream.AppendMode.APPEND, true, true);

	        // 设置字体
	        PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
	        PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

	        float margin = 50;
	        float startY = pageHeight - 50;
	        float lineHeight = 15;  // 增加行高到15像素
	        float maxWidth = pageWidth - 2 * margin;

	        // 绘制标题 "Notes:"
	        contentStream.setFont(fontBold, 12);
	        contentStream.setNonStrokingColor(new Color(100, 100, 100)); // 深灰色标题
	        contentStream.beginText();
	        contentStream.newLineAtOffset(margin, startY);
	        contentStream.showText("Notes:");
	        contentStream.endText();

	        // Notes内容
	        float notesStartY = startY - 18;  // 标题下方18像素
	        contentStream.setFont(fontRegular, 11);
	        contentStream.setNonStrokingColor(new Color(80, 80, 80)); // 更深的灰色内容

	        List<String> lines = wrapText(notes, maxWidth, fontRegular, 11);

	        contentStream.beginText();
	        contentStream.newLineAtOffset(margin, notesStartY);

	        for (String line : lines) {
	            contentStream.showText(line);
	            contentStream.newLineAtOffset(0, -lineHeight);
	        }

	        contentStream.endText();
	        contentStream.close();

	        // 保存到临时文件
	        document.save(tempFile);
	        return tempFile;
	    } finally {
	        if (document != null) {
	            document.close();
	        }
	    }
	}

	/**
	 * 文本换行处理
	 */
	private List<String> wrapText(String text, float maxWidth, PDType1Font font, float fontSize) throws IOException {
	    List<String> lines = new ArrayList<>();
	    String[] paragraphs = text.split("\n");

	    for (String paragraph : paragraphs) {
	        String[] words = paragraph.split(" ");
	        StringBuilder currentLine = new StringBuilder();

	        for (String word : words) {
	            String testLine = currentLine.length() == 0 ? word : currentLine + " " + word;
	            float width = font.getStringWidth(testLine) / 1000 * fontSize;

	            if (width <= maxWidth) {
	                currentLine = new StringBuilder(testLine);
	            } else {
	                if (currentLine.length() > 0) {
	                    lines.add(currentLine.toString());
	                }
	                currentLine = new StringBuilder(word);
	            }
	        }

	        if (currentLine.length() > 0) {
	            lines.add(currentLine.toString());
	        }
	    }

	    return lines;
	}



    public void convertImageToSvg(String imagePath, String svgPath) throws IOException {
        ProcessBuilder processBuilder = new ProcessBuilder(
                "C:\\Users\\Faye\\Downloads\\potrace-1.16.win64\\potrace.exe", "-s", "-o", svgPath, imagePath);
        Process process = processBuilder.start();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line); // 输出日志
            }
        }

        try {
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Potrace conversion failed with exit code " + exitCode);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Potrace process was interrupted", e);
        }
    }
//    private void emPDF(String svgPath, String pdfPath) throws IOException {
//        PdfWriter writer = new PdfWriter(pdfPath);
//        PdfDocument pdfDocument = new PdfDocument(writer);
//        Document document = new Document(pdfDocument);
//        document.close();
//    }

        public static BufferedImage sharpenImage(BufferedImage originalImage) {
            float[] sharpenKernel = {
                    0f, -1f, 0f,
                    -1f, 5f, -1f,
                    0f, -1f, 0f
            };
            Kernel kernel = new Kernel(3, 3, sharpenKernel);
            ConvolveOp convolveOp = new ConvolveOp(kernel);
            return convolveOp.filter(originalImage, null);
        }

}

