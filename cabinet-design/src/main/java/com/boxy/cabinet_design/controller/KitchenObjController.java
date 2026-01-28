package com.boxy.cabinet_design.controller;

import com.boxy.cabinet_design.dto.*;
import com.boxy.cabinet_design.service.ExcelExportUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;

import com.boxy.cabinet_design.service.KitchenLayoutWallGenerator;

@CrossOrigin(origins = "http://localhost")
@RestController
@RequestMapping("/api")
public class KitchenObjController {
    private static final Logger logger = LoggerFactory.getLogger(KitchenObjController.class);
    private final KitchenLayoutWallGenerator kitchenLayoutWallGenerator;


    @Autowired
    public KitchenObjController(KitchenLayoutWallGenerator kitchenLayoutWallGenerator) {
        this.kitchenLayoutWallGenerator = kitchenLayoutWallGenerator;
    }

    @PostMapping("/postKitObj")
    public KitchenDto saveKitchen(@RequestBody KitchenObjectReqDto kitchenObj) {
        logger.info("postKitObj saveKitchen", kitchenObj.getKitchenObject().getId());

        // 使用服务保存厨房对象
        KitchenDto kitchenDto = kitchenLayoutWallGenerator.saveKitchen(kitchenObj);
    //    // 返回 kitchenId
    //     Map<String, Integer> response = new HashMap<>();
    //     response.put("id", kitchenId);
        return kitchenDto;
        //return kitchenId;
    }

    @PostMapping("/updateCabinetObject")
    public CanvasData updateCabinetObject(@RequestBody CanvasData canvasDto) {
        logger.info("postKitObj updateCabinetObject");

        // 使用服务保存厨房对象
        CanvasData responseData = kitchenLayoutWallGenerator.updateCabinetObject(canvasDto);

        return responseData;
        //return kitchenId;
    }

    @GetMapping("/generateKitObj")
    public CanvasData  getKitObj(@RequestParam Integer kitchenId,@RequestParam Integer flag ) {
        logger.info("postKitObj generateKitObjkitchenId:"+kitchenId + " flag:"+flag);
        //Kitchen kitchen = kitchenLayoutWallGenerator.getKitchenById(kitchenId); // 调用服务层的方法获取所有厨房对象

        CanvasData canvasObjects = kitchenLayoutWallGenerator.generateCanvasObjectById(kitchenId, flag);
        System.out.println(canvasObjects);
        return canvasObjects ;
        //return ResponseEntity.ok(kitchen); // 返回 HTTP 200 和厨房列表
    }

    @GetMapping("/getKitUpperObj")
    public CanvasData  getKitUpperObj(@RequestParam Integer kitchenId) {
        logger.info("postKitObj getKitUpperObjkitchenId:"+kitchenId);
        //Kitchen kitchen = kitchenLayoutWallGenerator.getKitchenById(kitchenId); // 调用服务层的方法获取所有厨房对象

        CanvasData canvasObjects = kitchenLayoutWallGenerator.getUpperCanvasObjectById(kitchenId);
        System.out.println(canvasObjects);
        return canvasObjects ;
        //return ResponseEntity.ok(kitchen); // 返回 HTTP 200 和厨房列表
    }

    @GetMapping("/getKitElevationObj")
    public List<CabinetDto>  getKitElevationObj(@RequestParam Integer kitchenId, @RequestParam Integer wallid, @RequestParam String typeFlg ) {
        logger.info("postKitObj getKitElevationObj kitchenId:"+kitchenId+" wallid:"+wallid);
        //Kitchen kitchen = kitchenLayoutWallGenerator.getKitchenById(kitchenId); // 调用服务层的方法获取所有厨房对象

        List<CabinetDto> canvasObjects = kitchenLayoutWallGenerator.getConstructionById(kitchenId, wallid, typeFlg);
        System.out.println(canvasObjects);
        return canvasObjects ;
        //return ResponseEntity.ok(kitchen); // 返回 HTTP 200 和厨房列表
    }

    @GetMapping("/searchKitchenInfo")
    public List<Map<String, Object>>  searchKitchenInfo(@RequestParam String searchData ) {
        logger.info("postKitObj searchKitchenInfo searchData:"+searchData);
        //Kitchen kitchen = kitchenLayoutWallGenerator.getKitchenById(kitchenId); // 调用服务层的方法获取所有厨房对象

        List<Map<String, Object>> ret = kitchenLayoutWallGenerator.searchKitchenResult(searchData);
        System.out.println(ret);
        return ret;
        //return ResponseEntity.ok(kitchen); // 返回 HTTP 200 和厨房列表
    }

    @GetMapping("/getKitchenInfo")
    public KitchenDto  getKitchenInfo(@RequestParam Integer kitchenId ) {
        logger.info("postKitObj getKitchenInfo kitchenId:"+kitchenId);
        //Kitchen kitchen = kitchenLayoutWallGenerator.getKitchenById(kitchenId); // 调用服务层的方法获取所有厨房对象

        KitchenDto ret = kitchenLayoutWallGenerator.getKitchenInfo(kitchenId);
        System.out.println(ret);
        return ret;

    }

    @GetMapping("/getKitchenItemList")
    public List<ItemListDto>  getKitchenItemList(@RequestParam Integer kitchenId ) {
        logger.info("postKitObj getKitchenItemList kitchenId:"+kitchenId);
        //Kitchen kitchen = kitchenLayoutWallGenerator.getKitchenById(kitchenId); // 调用服务层的方法获取所有厨房对象

        List<ItemListDto> ret = kitchenLayoutWallGenerator.getKitchenItemList(kitchenId);
        System.out.println(ret);
        return ret;

    }

    @PostMapping("/exportItemsFile")
    public ResponseEntity<byte[]> exportItemsFile(@RequestBody List<ItemListDto> items) throws IOException {
        logger.info("postKitObj exportItemsFile ");
        if (items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().body("Items list cannot be empty.".getBytes());
        }

        byte[] excelData = ExcelExportUtil.exportItemListToExcel(items);

        // 设置 HTTP 头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ItemList.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelData);

    }
    
    @PostMapping("/exportItemsCSV")
    public ResponseEntity<byte[]> exportItemsCsv(
            @RequestParam Integer kitchenId,
            @RequestParam String po,
            @RequestParam String estimateId) {

        logger.info("exportItemsCSV kitchenId={}, po={}", kitchenId, po);

        List<ItemListCsvDto> ret = kitchenLayoutWallGenerator.getKitchenItemListCSV(kitchenId, po);

        byte[] raw = ExcelExportUtil.exportItemListCsv(ret, estimateId);

        // BOM for Excel
        byte[] bom = new byte[] {(byte)0xEF,(byte)0xBB,(byte)0xBF};
        byte[] csvData = new byte[bom.length + raw.length];
        System.arraycopy(bom, 0, csvData, 0, bom.length);
        System.arraycopy(raw, 0, csvData, bom.length, raw.length);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8");
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"ItemList.csv\"; filename*=UTF-8''ItemList.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @PostMapping("/updateKitchenNotes")
    public ResponseEntity<Map<String, Object>> updateKitchenNotes(@RequestBody KitchenNotesDto kitchenNotesDto) {
        logger.info("updateKitchenNotes kitchenId:{}, notes:{}", kitchenNotesDto.getKitchenId(), kitchenNotesDto.getNotes());

        boolean success = kitchenLayoutWallGenerator.updateKitchenNotes(kitchenNotesDto.getKitchenId(), kitchenNotesDto.getNotes());

        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("success", true);
            response.put("message", "Notes updated successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Failed to update notes");
            return ResponseEntity.badRequest().body(response);
        }
    }



}
