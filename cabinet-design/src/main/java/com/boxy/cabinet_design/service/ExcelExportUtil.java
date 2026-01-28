package com.boxy.cabinet_design.service;

import com.boxy.cabinet_design.dto.ItemListCsvDto;
import com.boxy.cabinet_design.dto.ItemListDto;
import com.boxy.cabinet_design.repository.CabinetRepository;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ExcelExportUtil {

    public static byte[] exportItemListToExcel(List<ItemListDto> items) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Item List");

            // 设置列宽，10个字符大小
//            for (int i = 0; i < 5; i++) {
//                sheet.setColumnWidth(i, 10 * 256); // 256是Excel列宽单位的基数
//            }
            sheet.setColumnWidth(0, 5 * 256); // 256是Excel列宽单位的基数
            sheet.setColumnWidth(1, 20 * 256); // 256是Excel列宽单位的基数
            sheet.setColumnWidth(2, 20 * 256); // 256是Excel列宽单位的基数
            sheet.setColumnWidth(3, 10 * 256); // 256是Excel列宽单位的基数
            sheet.setColumnWidth(4, 10 * 256); // 256是Excel列宽单位的基数
            sheet.setColumnWidth(5, 15 * 256); // 256是Excel列宽单位的基数
            

            // 创建字体样式
            Font titleFont = workbook.createFont();
            titleFont.setFontHeightInPoints((short) 15); // 5号字体约等于10pt
            titleFont.setBold(true);

            Font textFont = workbook.createFont();
            textFont.setFontHeightInPoints((short) 10);
            textFont.setFontName("Arial"); // 英语常用字体

            Font numberFont = workbook.createFont();
            numberFont.setFontHeightInPoints((short) 10);
            numberFont.setFontName("Arial"); // 英语常用字体

            // 单元格样式 - 标题
            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            
            // 单元格样式 - ID
            CellStyle idStyle = workbook.createCellStyle();
            idStyle.setFont(textFont);
            idStyle.setAlignment(HorizontalAlignment.CENTER);

            // 单元格样式 - 文本
            CellStyle textStyle = workbook.createCellStyle();
            textStyle.setFont(textFont);
            textStyle.setAlignment(HorizontalAlignment.LEFT);
            
            // 单元格样式 - Qty
            CellStyle qtyStyle = workbook.createCellStyle();
            qtyStyle.setFont(numberFont);
            qtyStyle.setDataFormat(workbook.createDataFormat().getFormat("0")); // 保留两位小数
            qtyStyle.setAlignment(HorizontalAlignment.RIGHT);

            // 单元格样式 - 数字
            CellStyle numberStyle = workbook.createCellStyle();
            numberStyle.setFont(numberFont);
            numberStyle.setDataFormat(workbook.createDataFormat().getFormat("0.00")); // 保留两位小数
            numberStyle.setAlignment(HorizontalAlignment.RIGHT);

            // 创建标题行
            Row headerRow = sheet.createRow(0);
            String[] titles = {"ID", "Manufcode","Name", "Qty", "Price", "sumPrice"};
            for (int i = 0; i < titles.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(titles[i]);
                cell.setCellStyle(titleStyle);
            }

            // 填充数据
            int rowNum = 1;
            for (ItemListDto item : items) {
                Row row = sheet.createRow(rowNum++);
                
                // Id 
                Cell idCell = row.createCell(0);
                idCell.setCellValue(item.getId());
                idCell.setCellStyle(idStyle);

                // name 和 construction
                Cell nameCell = row.createCell(1);
                nameCell.setCellValue(item.getManufcode());
                nameCell.setCellStyle(textStyle);

                Cell constructionCell = row.createCell(2);
                constructionCell.setCellValue(item.getName());
                constructionCell.setCellStyle(textStyle);

                // count，price，sumPrice
                Cell countCell = row.createCell(3);
                countCell.setCellValue(item.getQty());
                countCell.setCellStyle(qtyStyle);

                Cell priceCell = row.createCell(4);
                priceCell.setCellValue(item.getPrice());
                priceCell.setCellStyle(numberStyle);

                Cell sumPriceCell = row.createCell(5);
                sumPriceCell.setCellValue(item.getSum());
                sumPriceCell.setCellStyle(numberStyle);
            }

            // 将数据写入 ByteArrayOutputStream
            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                workbook.write(out);
                return out.toByteArray();
            }
        }
    }
    
    public static byte[] exportItemListCsv(List<ItemListCsvDto> items, String estimateId) {

    String[] headers = {
        "Estimate ID",
        "PO#",
        "Customer",
        "Status",
        "Expected Close Date",
        "Item Name",
        "Quantity"
    };

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yy");
    String today = LocalDate.now().format(formatter);

    try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
         OutputStreamWriter writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8)) {

        // 写入表头
        writer.append(String.join(",", headers));
        writer.append("\n");

        // 写入每一行
        for (ItemListCsvDto item : items) {

        	String itemName = String.format(
                    "%s-%s %s",
                    safe(item.getCabName()),
                    safe(item.getSeriesCode()),
                    safe(item.getSeriesColor())
            );
        	
            writer.append(escapeCsv(estimateId)).append(",");
            writer.append(escapeCsv(item.getPo())).append(",");
            writer.append(escapeCsv(item.getCustomer())).append(",");
            writer.append(escapeCsv("Proposal")).append(",");
//            writer.append(escapeCsv(today)).append(",");    
            writer.append("\"'").append(today).append("\"").append(",");
            writer.append(escapeCsv(itemName)).append(",");

            writer.append(String.valueOf(item.getQuantity()));
            writer.append("\n");
        }

        writer.flush();   // ⚠️重要
        return baos.toByteArray();

    } catch (IOException e) {
        throw new RuntimeException("CSV export failed", e);
    }
}

    private static String safe(String v){
        return v == null ? "" : v;
    }
    // 处理 CSV 特殊字符（逗号、双引号等）
    private static String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        // 如果包含逗号、双引号或换行符，就用双引号包裹，并将内部双引号替换成两个双引号
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            value = value.replace("\"", "\"\"");
            return "\"" + value + "\"";
        }
        return value;
    }
    	
}
