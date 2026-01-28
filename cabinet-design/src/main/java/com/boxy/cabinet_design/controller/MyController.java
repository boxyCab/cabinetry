package com.boxy.cabinet_design.controller;

import com.boxy.cabinet_design.service.ExcelExportUtil;
import org.springframework.data.jpa.domain.JpaSort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.slf4j.Logger;

@RestController
@RequestMapping("/api")
public class MyController {

   @PostMapping("/submit")
	public ResponseEntity<String> handlePost(@RequestBody Map<String, Object> body) {
	    return ResponseEntity.ok("Data received: " + body.toString());
	}

}
