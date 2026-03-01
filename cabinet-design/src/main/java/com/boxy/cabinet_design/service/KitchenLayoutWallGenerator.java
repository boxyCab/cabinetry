package com.boxy.cabinet_design.service;

import com.boxy.cabinet_design.dto.*;
import com.boxy.cabinet_design.entity.*;
import com.boxy.cabinet_design.repository.*;
import org.modelmapper.TypeMap;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.stereotype.Service;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.beans.factory.annotation.Autowired;
import com.boxy.cabinet_design.common.Constants;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional // 适用于整个服务类中的所有方法
public class KitchenLayoutWallGenerator {
    private static final Logger logger = LoggerFactory.getLogger(KitchenLayoutWallGenerator.class);
    private final KitchenRepository kitchenRepository;
    private final WallRepository wallRepository;
    private final WindowRepository windowRepository;
    private final DoorRepository doorRepository;
    private final IslandRepository islandRepository;
    private final ApplianceRepository applianceRepository;
    private final CabinetsruleRepository cabinetsruleRepository;
    private final CabinetProductsRepository cabinetproductsRepository;
    private final CanvasobjectRepository canvasobjectRepository;
    private final WallConnectionRepository wallConnectionRepository;
    private final PeninisulaConnectionRepository peninisulaConnectionRepository;
    private final CabinetRepository cabinetRepository;

    @Autowired
    private CanvasObjectGenerator canvasObjectGenerator;

    @Autowired
    public KitchenLayoutWallGenerator(KitchenRepository kitchenRepository,
                                      WallRepository wallRepository, WindowRepository windowRepository, DoorRepository doorRepository, IslandRepository islandRepository, ApplianceRepository applianceRepository,
                                      CabinetsruleRepository cabinetsruleRepository, CabinetProductsRepository cabinetproductsRepository, CanvasobjectRepository canvasobjectRepository, WallConnectionRepository wallConnectionRepository, CabinetRepository cabinetRepository, PeninisulaConnectionRepository peninisulaConnectionRepository) {
        this.kitchenRepository = kitchenRepository;
        this.wallRepository = wallRepository;
        this.windowRepository = windowRepository;
        this.doorRepository = doorRepository;
        this.islandRepository = islandRepository;
        this.applianceRepository = applianceRepository;
        this.cabinetsruleRepository = cabinetsruleRepository;
        this.cabinetproductsRepository = cabinetproductsRepository;
        this.canvasobjectRepository = canvasobjectRepository;
        this.wallConnectionRepository = wallConnectionRepository;
        this.cabinetRepository = cabinetRepository;
        this.peninisulaConnectionRepository = peninisulaConnectionRepository;
    }

    public KitchenDto saveKitchen(KitchenObjectReqDto kitchenInfo) {
        logger.info("saveKitchen kitchenInfo:" + kitchenInfo.getKitchenObject().getId());
    	// 获取 KitchenDto 对象
        KitchenObject kitchenObj = kitchenInfo.getKitchenObject();
        String kichenShape = kitchenObj.getShapeType();

        // check window's width, door's width
        // check appliance'position in wall is right?
        // appliance's position and width is right?
        //

        ModelMapper modelMapperK = new ModelMapper();
        ZonedDateTime serverTime = ZonedDateTime.now(ZoneId.systemDefault());
        // 自定义映射 createdAt 和 updatedAt 字段
        modelMapperK.typeMap(KitchenObject.class, Kitchen.class).addMappings(mapper -> {
            mapper.skip(Kitchen::setCreatedAt);  // Skip if you want to keep the existing value
            mapper.map(src -> serverTime.toInstant(), Kitchen::setUpdatedAt);  // Set updatedAt to current time
            mapper.map(KitchenObject::getKitchenName, Kitchen::setKitchenName); // 显式映射 kitchenName
        });
        // 检查 `kitchenName` 是否为空
        System.out.println(kitchenObj.getKitchenName());
        if (kitchenObj.getKitchenName() == null || kitchenObj.getKitchenName().isEmpty()) {
            throw new IllegalArgumentException("kitchenName cannot be empty");
        }

        // 判断是更新还是插入
        Kitchen kitchen;
        if (kitchenObj.getId() != null && !kitchenObj.getId().isEmpty()) {
            // 如果前端传来了 id，则从数据库加载已有记录进行更新
            Integer kitchenId = Integer.parseInt(kitchenObj.getId());
            kitchen = kitchenRepository.findById(kitchenId)
                    .orElse(new Kitchen());
        } else {
            // 否则创建新记录
            kitchen = new Kitchen();
        }

        // 使用 modelMapper 映射字段（会覆盖已有值）
        modelMapperK.map(kitchenObj, kitchen);

        // 手动设置 `createdAt`，仅当 `kitchen` 是新对象时设置
        if (kitchen.getCreatedAt() == null) {
            kitchen.setCreatedAt(serverTime.toInstant());
        }
        kitchen.setUpdatedAt(serverTime.toInstant());
        kitchen.setKitchenName(kitchenObj.getKitchenName());
        kitchen.setCeilingHeight(Float.parseFloat(kitchenObj.getCeilingHeight()));
        kitchen.setShapeType(kitchenObj.getShapeType());
        kitchen.setConstruction1(kitchenObj.getConstruction1());
        kitchen.setConstruction2(kitchenObj.getConstruction2());
        kitchen.setConstruction3(kitchenObj.getConstruction3());

        // 处理 notes：如果 DTO 中的值为 null，设置为空字符串而不是 null
        String notesValue = kitchenObj.getNotes();
        if (notesValue == null) {
            notesValue = "";
        }
        kitchen.setNotes(notesValue);

        // 调试日志：打印 DTO 和 Entity 的值
        logger.info("DTO values - Name: {}, CeilingHeight: {}, ShapeType: {}, Notes: '{}'",
                kitchenObj.getKitchenName(), kitchenObj.getCeilingHeight(),
                kitchenObj.getShapeType(), kitchenObj.getNotes());

        logger.info("Entity values - ID: {}, Name: {}, CeilingHeight: {}, ShapeType: {}, Notes: '{}'",
                kitchen.getId(), kitchen.getKitchenName(), kitchen.getCeilingHeight(),
                kitchen.getShapeType(), kitchen.getNotes());

        System.out.println(kitchen.getKitchenName());

        // 使用 repository 保存 Kitchen 对象
        logger.info("About to save kitchen...");
        Kitchen kitchenSaved = kitchenRepository.save(kitchen);
        logger.info("Kitchen saved, ID: {}, Name: {}, Notes: '{}'",
                kitchenSaved.getId(), kitchenSaved.getKitchenName(), kitchenSaved.getNotes());


        String ceilingHeight = kitchenObj.getCeilingHeight();
        // 转换并保存 walls
        ModelMapper modelMapperW = new ModelMapper();
        modelMapperW.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        TypeMap<WallDto, Wall> wallTypeMap = modelMapperW.createTypeMap(WallDto.class, Wall.class);
        wallTypeMap.addMappings(mapper -> {
            mapper.map(WallDto::getWidth, Wall::setWidth);
            mapper.map(WallDto::getHeight, Wall::setHeight);
            mapper.map(WallDto::getWallName, Wall::setWallName);
            mapper.map(WallDto::getIsUpperCabinetPlaced, Wall::setIsUpperCabinetPlaced);
            mapper.map(WallDto::getIsLowerCabinetPlaced, Wall::setIsLowerCabinetPlaced);
            mapper.map(WallDto::getPantryRequired, Wall::setPantryRequired);
            mapper.skip(Wall::setKitchen);
            mapper.skip(Wall::setCreatedAt); 
            // 添加需要映射的字段
        });
        List<WallDto> wallDtos = kitchenInfo.getWallObjects();  // 获取 WallDto 列表

        // 将 List<WallDto> 映射为 List<Wall>
        AtomicInteger index = new AtomicInteger(0);
        List<Wall> walls = wallDtos.stream()
                .map(wallDto -> {
                    Wall wall;
                    // 如果前端传来了 id（数据库主键），则加载已有记录进行更新
                    if (wallDto.getId() != null && wallDto.getId() > 0) {
                        wall = wallRepository.findById(wallDto.getId())
                                .orElse(new Wall());
                    } else {
                        wall = new Wall();
                    }

                    // 使用 modelMapper 映射字段（会覆盖已有值）
                    modelMapperW.map(wallDto, wall);

                    wall.setIsLowerCabinetPlaced(wall.getIsLowerCabinetPlaced() != null ? wall.getIsLowerCabinetPlaced() : false); // 设置默认值
                    wall.setIsUpperCabinetPlaced(wall.getIsUpperCabinetPlaced() != null ? wall.getIsUpperCabinetPlaced() : false);
//                    wall.setIsUpperCabinetPlaced(wall.getPantryRequired() ==null ? false : true);
                    wall.setWallName(wall.getWallName() != null ? wall.getWallName() : " ");
                    wall.setHeight(Float.parseFloat(ceilingHeight));
                    // 只在新创建时设置 createdAt
                    if (wall.getCreatedAt() == null) {
                        wall.setCreatedAt(serverTime.toInstant());
                    }
                    wall.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
                    wall.setLeftCorner(false);
                    wall.setRightCorner(false);
                    wall.setKitchen(kitchenSaved);
                    // 根据索引设置角度
                    float[] angles = {90, 0, 270, 180};
                    int currentIndex = index.getAndIncrement();
                    if (currentIndex < angles.length) {
                        wall.setAngle(angles[currentIndex]);
                    }
                    return wall;
                })
                .collect(Collectors.toList());
        // 
        
        if ("I".equals(kitchenSaved.getShapeType())) {
        	walls.get(1).setWidth(0f);
        	walls.get(2).setWidth(0f);
        	walls.get(3).setWidth(0f);
    	} else if ("II".equals(kitchenSaved.getShapeType()) ) {
    		walls.get(2).setWidth(0f);
        	walls.get(3).setWidth(0f);
    	} else if ("L".equals(kitchenSaved.getShapeType())) {
    		walls.get(2).setWidth(0f);
        	walls.get(3).setWidth(0f);
        	if (walls.get(0).getIsLowerCabinetPlaced() && walls.get(1).getIsLowerCabinetPlaced()) {
        		walls.get(0).setRightCorner(true);
        		walls.get(1).setLeftCorner(true);
        	}
    	} else if ("U".equals(kitchenSaved.getShapeType())) {
    		if (walls.get(0).getIsLowerCabinetPlaced() && walls.get(1).getIsLowerCabinetPlaced()) {
        		walls.get(0).setRightCorner(true);
        		walls.get(1).setLeftCorner(true);
        	}
    		if (walls.get(1).getIsLowerCabinetPlaced() && walls.get(2).getIsLowerCabinetPlaced()) {
        		walls.get(1).setRightCorner(true);
        		walls.get(2).setLeftCorner(true);
        	}   		
    		walls.get(3).setWidth(0f);
    	} 
        if ("peninsula".equals(kitchenInfo.getIslandObject().getIslandKind())) {
        	if ("I".equals(kitchen.getShapeType())) {
        		walls.get(0).setLeftCorner(true);
        	} else if ("II".equals(kitchen.getShapeType())) {
        		if ("one".equals(kitchenInfo.getIslandObject().getPeninsulaisadjacentto())) {
        			walls.get(0).setLeftCorner(true);
        		} else if ("two".equals(kitchenInfo.getIslandObject().getPeninsulaisadjacentto()) ) {
        			walls.get(1).setLeftCorner(true);
        		}
        	}  else if ("L".equals(kitchen.getShapeType())) {
        		if ("one".equals(kitchenInfo.getIslandObject().getPeninsulaisadjacentto())) {
        			walls.get(0).setLeftCorner(true);
        		} else if ("two".equals(kitchenInfo.getIslandObject().getPeninsulaisadjacentto()) ) {
        			walls.get(1).setRightCorner(true);
        		}
        	} else if ("U".equals(kitchen.getShapeType())) {
        		if ("one".equals(kitchenInfo.getIslandObject().getPeninsulaisadjacentto())) {
        			walls.get(0).setLeftCorner(true);
        		} else if ("three".equals(kitchenInfo.getIslandObject().getPeninsulaisadjacentto()) ) {
        			walls.get(2).setRightCorner(true);
        		}
        	} 
        }
        List<Wall> wallListSaved = wallRepository.saveAll(walls);

        List<Window> windows = new ArrayList<>();
        ModelMapper modelMapperWin = new ModelMapper();
        modelMapperWin.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        TypeMap<WindowDto, Window> windowTypeMap = modelMapperWin.createTypeMap(WindowDto.class, Window.class);
        windowTypeMap.addMappings(mapper -> {
            mapper.map(WindowDto::getWidth, Window::setWidth);
            mapper.map(WindowDto::getHeight, Window::setHeight);
            mapper.map(WindowDto::getPosition, Window::setStartposition);
            mapper.map(WindowDto::getHasWindow, Window::setHasWindow);
            mapper.map(WindowDto::getWindowName, Window::setWindowName);
            mapper.skip(Window::setWall);  // 跳过 wall 字段
            mapper.skip(Window::setKitchen);  // 跳过 kitchen 字段
            mapper.skip(Window::setCreatedAt);  // 跳过 createdAt 字段
            mapper.skip(Window::setId);
        });
        List<WindowDto> windowsDtos = kitchenInfo.getWindowObjects();
        if (windowsDtos != null) {
            windows = IntStream.range(0, windowsDtos.size())
                    .mapToObj(i -> {
                        WindowDto windowDto = windowsDtos.get(i);
                        Window window;

                        // 如果前端传来了 id（数据库主键），则加载已有记录进行更新
                        if (windowDto.getId() != null && windowDto.getId() > 0) {
                            window = windowRepository.findById(windowDto.getId())
                                    .orElse(new Window());
                        } else {
                            window = new Window();
                        }
                        
                        // 使用 modelMapper 映射字段（会覆盖已有值）
                        modelMapperWin.map(windowDto, window);
                        // 根据 wallId 确定 wall 或 island
                        Wall wallo = null;
                        if (windowDto.getWallId() != null) {
                            switch (windowDto.getWallId()) {
                                case "one":
                                    if (walls.size() > 0) wallo = walls.get(0);
                                    break;
                                case "two":
                                    if (walls.size() > 1) wallo = walls.get(1);
                                    break;
                                case "three":
                                    if (walls.size() > 2) wallo = walls.get(2);
                                    break;
                                case "four":
                                    if (walls.size() > 3) wallo = walls.get(3);
                                    break;
                                default:
                                    logger.warn("Unknown wallId: {}", windowDto.getWallId());
                                    break;
                            }
                        }
                        window.setWall(wallo);

                        // 手动设置必要的字段
                        window.setWindowName(window.getWindowName() != null ? window.getWindowName() : " ");

                        // 只在新创建时设置 createdAt
                        if (window.getCreatedAt() == null) {
                            window.setCreatedAt(serverTime.toInstant());
                        }
                        window.setUpdatedAt(serverTime.toInstant());
                        window.setKitchen(kitchenSaved);

                        if (window.getHasWindow() == null) {
                            window.setHasWindow(false);
                        } else if (window.getHasWindow() == false) {
                            window.setWidth(0f);
                            window.setAngle(0f);
                            window.setHeight(0f);
                            window.setStartposition(0f);
                        }
                        return window;
                    })
                    .collect(Collectors.toList());
        }

        // 智能删除：只删除前端传来的列表中没有的 windows
        List<Integer> windowIdsToKeep = windows.stream()
                .map(Window::getId)
                .filter(Objects::nonNull)
                .toList();

        if (!windowIdsToKeep.isEmpty()) {
            windowRepository.deleteByKitchenIdAndIdNotIn(kitchenSaved.getId(), windowIdsToKeep);
        } else {
            windowRepository.deleteByKitchenId(kitchenSaved.getId());
        }

        List<Window> windowListSaved = windowRepository.saveAll(windows);
        logger.info("Successfully saved {} windows", windowListSaved.size());



        List<Door> doors = new ArrayList<>();
        ModelMapper modelMapperD = new ModelMapper();
        modelMapperD.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        TypeMap<DoorDto, Door> doorTypeMap = modelMapperD.createTypeMap(DoorDto.class, Door.class);
        doorTypeMap.addMappings(mapper -> {
            mapper.map(DoorDto::getWidth, Door::setWidth);
            mapper.map(DoorDto::getHeight, Door::setHeight);
            mapper.map(DoorDto::getPosition, Door::setStartposition);
            mapper.map(DoorDto::getHasDoor, Door::setHasDoor);
            mapper.map(DoorDto::getDoorName, Door::setDoorName);
            mapper.skip(Door::setWall);  // 跳过 wall 字段
            mapper.skip(Door::setKitchen);  // 跳过 kitchen 字段
            mapper.skip(Door::setCreatedAt);  // 跳过 createdAt 字段
            mapper.skip(Door::setId);
        });
        List<DoorDto> doorDtos = kitchenInfo.getDoorObjects();
        if (doorDtos != null) {
            doors = IntStream.range(0, doorDtos.size())
                    .mapToObj(i -> {
                        DoorDto doorDto = doorDtos.get(i);
                        Door door;

                        // 如果前端传来了 id（数据库主键），则加载已有记录进行更新
                        if (doorDto.getId() != null && doorDto.getId() > 0) {
                            door = doorRepository.findById(doorDto.getId())
                                    .orElse(new Door());
                        } else {
                            door = new Door();
                        }
                        // 使用 modelMapper 映射字段（会覆盖已有值）
                        modelMapperD.map(doorDto, door);
                        // 根据 wallId 确定 wall 或 island
                        Wall wallo = null;
                        if (doorDto.getWallId() != null) {
                            switch (doorDto.getWallId()) {
                                case "one":
                                    if (walls.size() > 0) wallo = walls.get(0);
                                    break;
                                case "two":
                                    if (walls.size() > 1) wallo = walls.get(1);
                                    break;
                                case "three":
                                    if (walls.size() > 2) wallo = walls.get(2);
                                    break;
                                case "four":
                                    if (walls.size() > 3) wallo = walls.get(3);
                                    break;
                                default:
                                    logger.warn("Unknown wallId: {}", doorDto.getWallId());
                                    break;
                            }
                        }
                        door.setWall(wallo);
                        // 手动设置必要的字段
                        door.setDoorName(door.getDoorName() != null ? door.getDoorName() : " ");

                        // 只在新创建时设置 createdAt
                        if (door.getCreatedAt() == null) {
                            door.setCreatedAt(serverTime.toInstant());
                        }
                        door.setUpdatedAt(serverTime.toInstant());
                        door.setKitchen(kitchenSaved);

                        if (door.getHasDoor() == null || !door.getHasDoor()) {
                            door.setWidth(0f);
                            door.setAngle(0f);
                            door.setHeight(0f);
                            door.setStartposition(0f);
                        }
                        return door;
                    })
                    .collect(Collectors.toList());
        }
        // 智能删除：只删除前端传来的列表中没有的 doors
        List<Integer> doorIdsToKeep = doors.stream()
                .map(Door::getId)
                .filter(Objects::nonNull)
                .toList();

        if (!doorIdsToKeep.isEmpty()) {
            doorRepository.deleteByKitchenIdAndIdNotIn(kitchenSaved.getId(), doorIdsToKeep);
        } else {
            doorRepository.deleteByKitchenId(kitchenSaved.getId());
        }

        List<Door> doorListSaved = doorRepository.saveAll(doors);
        logger.info("Successfully saved {} doors", doorListSaved.size());

            // 配置 ModelMapper
        ModelMapper modelMapperI = new ModelMapper();
            TypeMap<IslandDto, Island> islandTypeMap = modelMapperI.createTypeMap(IslandDto.class, Island.class);
            islandTypeMap.addMappings(mapper -> {
                // 自定义字段映射规则
                mapper.map(IslandDto::getIslandKind, Island::setIslandKind);
                mapper.map(IslandDto::getLength, Island::setLength);
                mapper.map(IslandDto::getWidth, Island::setWidth);
                mapper.map(IslandDto::getPeninsulaisadjacentto, Island::setPeninsulaisadjacentto);
                mapper.map(IslandDto::getIsOverhang, Island::setIsOverhang);
                mapper.map(IslandDto::getIsWaterfall, Island::setIsWaterfall);
                //mapper.map(IslandDto::getHorverType, Island::setHorverType);
                mapper.skip(Island::setCreatedAt); 
                // 其他自定义映射...
            });

            // 使用 ModelMapper 映射并设置时间字段
            IslandDto islandDto = kitchenInfo.getIslandObject();
            Island island;

            // 判断是更新还是插入
            if (islandDto != null && islandDto.getId() != null && islandDto.getId() > 0) {
                // 如果前端传来了 id，则从数据库加载已有记录进行更新
                island = islandRepository.findById(islandDto.getId())
                        .orElse(new Island());
            } else {
                // 否则创建新记录
                island = new Island();
            }

            // 使用 modelMapper 映射字段（会覆盖已有值）
            modelMapperI.map(islandDto, island);

            // 只在新创建时设置 createdAt
            if (island.getCreatedAt() == null) {
                island.setCreatedAt(serverTime.toInstant());
            }
            island.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            if ("none".equals(islandDto.getIslandKind()) ) {
            	island.setWidth(0);
            	island.setLength(0);
            } else if ("island".equals(islandDto.getIslandKind()) ) {
            	if ("U".equals(kitchenSaved.getShapeType())) {
            		float spaceWidth = walls.get(1).getWidth() - 48 - 40;
                	if (spaceWidth < islandDto.getWidth()) {
                		island.setHorverType("V");
                	} else {
                		island.setHorverType("H");
                	}
            	} else if ("L".equals(kitchenSaved.getShapeType())) {
            		// 如果wall1的长度> wall2的长度 则V 否则是H
            		if (walls.get(0).getWidth() > walls.get(1).getWidth()) {
            			island.setHorverType("V");
            		} else {
            			island.setHorverType("H");
            		}           		
            		
            	} else  {
            	
            		island.setHorverType("H");
            	}
            	
            } else if ("peninsula".equals(islandDto.getIslandKind())) {
            	if ("I".equals(kitchenSaved.getShapeType())) {
            		island.setHorverType("V");
            	} else if ("II".equals(kitchenSaved.getShapeType())) {
            		island.setHorverType("V");
            	} else if ("U".equals(kitchenSaved.getShapeType())) {
            		island.setHorverType("H");
            	} else if ("L".equals(kitchenSaved.getShapeType())) {
            		if ("two".equals(island.getPeninsulaisadjacentto())) {
            			island.setHorverType("V");
            		} else {
            			island.setHorverType("H");
            		}
            		
            	}else {
            		island.setHorverType("H");
            	}

                // 
            }
            island.setKitchen(kitchenSaved);

            // 保存单个 island 实体
            Island islandSaved =   islandRepository.save(island);

        // 处理新的前端电器数据格式
        List<ApplianceItemDto> applianceItems = kitchenInfo.getApplianceObject();
//        List<ApplianceDto> applianceDtos = new ArrayList<>();
     // 设置 ModelMapper 映射
        ModelMapper modelMapperA = new ModelMapper();
        TypeMap<ApplianceDto, Appliance> applianceTypeMap = modelMapperA.createTypeMap(ApplianceDto.class, Appliance.class);
        modelMapperA.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        applianceTypeMap.addMappings(mapper -> {
            mapper.map(ApplianceDto::getWidth, Appliance::setWidth);
            mapper.map(ApplianceDto::getHeight, Appliance::setHeight);
            mapper.map(ApplianceDto::getPosition, Appliance::setPosition);
            mapper.map(ApplianceDto::getName, Appliance::setName);
            mapper.skip(Appliance::setIsland);
            mapper.skip(Appliance::setWall);
            mapper.map(ApplianceDto::getApplianceKind, Appliance::setAppliancekind);
            mapper.skip( Appliance::setKitchen);  // 跳过 kitchen 字段的映射，手动设置
            mapper.skip(Appliance::setCreatedAt); 
        });
        // 如果使用新格式 (appliances 数组)
        List<Appliance> appliancesToSave = new ArrayList<>();
        if (applianceItems != null && !applianceItems.isEmpty()) {
            for (ApplianceItemDto item : applianceItems) {
                Wall wallo = null;
                Island islando = null;

                // 根据 wallId 确定 wall 或 island
                if (item.getWallId() != null) {
                    switch (item.getWallId()) {
                        case "one":
                            if (walls.size() > 0) wallo = walls.get(0);
                            break;
                        case "two":
                            if (walls.size() > 1) wallo = walls.get(1);
                            break;
                        case "three":
                            if (walls.size() > 2) wallo = walls.get(2);
                            break;
                        case "four":
                            if (walls.size() > 3) wallo = walls.get(3);
                            break;
                        case "island":
                            islando = island;
                            break;
                        default:
                            logger.warn("Unknown wallId: {}", item.getWallId());
                            break;
                    }
                }

                // 确定高度：如果前端没有提供，根据 applianceKind 设置默认值
                Float applianceHeight = item.getHeight();
                if (applianceHeight == null || applianceHeight == 0.0f) {
                    String kind = item.getAppliancekind();
                    if ("Refrigerator".equals(kind)) {
                        applianceHeight = 80.0f;
                    } else if ("Dishwasher".equals(kind)) {
                        applianceHeight = 34.5f;
                    } else if ("Range".equals(kind)) {
                        applianceHeight = 36.0f;
                    } else if ("Hood".equals(kind)) {
                        applianceHeight = 30.0f;
                    } else {
                        applianceHeight = 0.0f;  // 其他类型默认为0
                    }
                }

                // 创建 ApplianceDto
                ApplianceDto applianceDto = new ApplianceDto(
                        null,  // id - 由数据库生成
//                        null,  // kitchen - 稍后设置
                        item.getWidth(),
                        applianceHeight,  // 使用计算后的高度
                        0.0f,  // angle - 默认为 0
                        item.getName() != null ? item.getName() : item.getAppliancekind(),  // name - 优先使用name，如果没有则使用appliancekind
                        item.getPosition(),
                        serverTime.toInstant(),  // createdAt
                        serverTime.toInstant(),  // updatedAt
//                        wallo,
//                        islando,
                        item.getAppliancekind()  // applianceKind
                );
               
                Appliance appliance;
                // If frontend sent an id (database primary key), load existing record for update
                if (applianceDto.getId() != null && applianceDto.getId() > 0) {
                    appliance = applianceRepository.findById(applianceDto.getId())
                            .orElse(new Appliance());
                } else {
                    appliance = new Appliance();
                }

                // Use modelMapper to map fields (will overwrite existing values)
                modelMapperA.map(applianceDto, appliance);

                // Only set createdAt when creating new record
                if (appliance.getCreatedAt() == null) {
                    appliance.setCreatedAt(serverTime.toInstant());
                }
                appliance.setUpdatedAt(serverTime.toInstant());
                appliance.setKitchen(kitchenSaved);
                appliance.setWall(wallo);
                appliance.setIsland(islando);

                // Set default name if null
                if (appliance.getName() == null) {
                    appliance.setName(" ");
                }

                appliancesToSave.add(appliance);

                if (applianceDto.getId() != null && applianceDto.getId() > 0) {
                    logger.info("Updating appliance: {}, ID: {}", appliance.getAppliancekind(), appliance.getId());
                } else {
                    logger.info("Creating new appliance: {}", appliance.getAppliancekind());
                }   
            }
        }
         // 保存所有电器（包括更新和新增的）
        List<Integer> idsToKeep = appliancesToSave.stream()
                .map(Appliance::getId)
                .filter(Objects::nonNull)
                .toList();

        if (!idsToKeep.isEmpty()) {
            applianceRepository.deleteByKitchenIdAndIdNotIn(kitchenSaved.getId(), idsToKeep);
        } else {
            applianceRepository.deleteByKitchenId(kitchenSaved.getId());
        }

        List<Appliance> applianceListSaved = applianceRepository.saveAll(appliancesToSave);
        //
        createWallConnection(kitchenSaved, walls, island);

        // 验证：从数据库重新查询 Kitchen，确认数据是否正确保存
        Kitchen verifiedKitchen = kitchenRepository.findById(kitchenSaved.getId()).orElse(null);
        if (verifiedKitchen != null) {
            logger.info("VERIFIED from DB - ID: {}, Name: {}, Notes: '{}', CeilingHeight: {}",
                    verifiedKitchen.getId(), verifiedKitchen.getKitchenName(),
                    verifiedKitchen.getNotes(), verifiedKitchen.getCeilingHeight());
        }

        KitchenDto ret =  new KitchenDto(kitchenSaved.getId(), kitchenSaved.getKitchenName(), kitchenSaved, wallListSaved, islandSaved, windowListSaved, doorListSaved, applianceListSaved);
        return ret;
    }

    public List<CanvasobjectDto> createCanvasObjectById(Integer kitchenId, Integer flag) {
        // 检查是否已经生成，
        long count = canvasobjectRepository.countByKitchenId(kitchenId);
        if (count > 0 ) {
            if (flag ==2) {
                canvasobjectRepository.deleteByKitchenId(kitchenId);
                cabinetRepository.deleteByKitchenId(kitchenId);
            } else {
                // 已经生成，同时不需要再次生成
                List<Canvasobject> canvasobjectN = getKitchenObjectById(kitchenId);
                // 将实体对象转换为 DTO
                List<CanvasobjectDto> canvasObjectDTOs = transformToDto(canvasobjectN);
                return canvasObjectDTOs;
            }

        }
        // 取得厨房信息
        Kitchen kitchen = getKitchenById(kitchenId);
        // 取得墙体信息
        List<Wall> wallList  = getAllKitchenWallById(kitchenId);
        // 取得岛台信息
        Island island  = getKitchenIslandById(kitchenId);
        // 取得窗户信息
        List<Window> windowList  = getAllKitchenWindowById(kitchenId);
        // 取得门信息
        List<Door> doorList  = getAllKitchenDoorById(kitchenId);

        // 取得电器信息
        List<Appliance> applianceList  = getAllKitchenApplianceById(kitchenId);
        List<Cabinetsrule> cabinetsruleList  = getAllCabinetRule();
        List<CabinetProduct> cabinetproductsList = getCabinetProductRef();
        List<Canvasobject> canvasObjectAll = new ArrayList<>();
        List<Canvasobject> canvasWallList = new ArrayList<>();
        List<Canvasobject> canvasIslandList = new ArrayList<>();
        //
        List<Canvasobject> canvasObjectConstruction = canvasObjectGenerator.createKitchenConstruction(kitchen,wallList,island, windowList,doorList );
        canvasObjectAll.addAll(canvasObjectConstruction);
        //
        List<Canvasobject> canvasObject = canvasObjectGenerator.createCabinetCanvasObject(kitchen,wallList,island,windowList,doorList,
                applianceList,cabinetsruleList, canvasWallList, canvasIslandList, cabinetproductsList);
        canvasObjectAll.addAll(canvasObject);
        List<CanvasobjectDto> canvasobjectDtos =  transformToDto(canvasObjectAll);

        return canvasobjectDtos ;
        // 根据厨房信息得到厨房对象描绘信息
        //return kitchenRepository.getKitchenById(kitchenId); // Return null or handle the case when not found;
    }

    public CanvasData generateCanvasObjectById(Integer kitchenId, Integer flag) {
//        List<CanvasobjectDto> dtosNew = new ArrayList<>();
        List<CanvasobjectDto> dtos = createCanvasObjectById(kitchenId, flag);

        List<CanvasobjectDto> filteredList = dtos.stream()
                .filter(obj -> !"upper".equals(obj.getObjectType()))
                .filter(obj -> !"Hood".equals(obj.getObjectType()))
                .collect(Collectors.toList());


        //过滤objecgt的wall，island，doors，windows
//        List<CanvasobjectDto> filteredCanvasObjects = dtos.stream()
//                .filter(canvasObject ->
//                        Constants.commons.OBJECT_NAME_WALL.equals(canvasObject.getObjectType()) ||
//                                Constants.commons.OBJECT_TYPE_WINDOW.equals(canvasObject.getObjectType()) ||
//                                Constants.commons.OBJECT_TYPE_DOOR.equals(canvasObject.getObjectType()) ||
//                                Constants.commons.ISLAND_TYPE_OVERHANG.equals(canvasObject.getObjectType()) ||
//                                Constants.commons.ISLAND_TYPE_ISLAND.equals(canvasObject.getObjectType())
//                )
//                .collect(Collectors.toList());
//        dtosNew.addAll(filteredCanvasObjects);
//        // Appliance
//        List<CanvasobjectDto> filteredAppliance = dtos.stream()
//                .filter(canvasObject ->
//                        Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(canvasObject.getObjectType()) ||
//                                Constants.commons.APPLIANCES_NAME_RANGE.equals(canvasObject.getObjectType()) ||
//                                Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(canvasObject.getObjectType())
//                )
//                .collect(Collectors.toList());
//        dtosNew.addAll(filteredAppliance);
//        // BaseCabinets
//        List<CanvasobjectDto> filteredCabinet = dtos.stream()
//                .filter(canvasObject ->
//                        Constants.commons.CANBINET_TYPE_LOWER.equals(canvasObject.getObjectType())||
//                                Constants.commons.CANBINET_TYPE_HIGH.equals(canvasObject.getObjectType()) ||
//                                Constants.commons.CANBINET_TYPE_ISLAND_INER.equals(canvasObject.getObjectType()) ||
//                                Constants.commons.CANBINET_TYPE_ISLAND_OUTER.equals(canvasObject.getObjectType())
//                )
//                .collect(Collectors.toList());
//        dtosNew.addAll(filteredCabinet);

        List<Cabinet> canvasCabinet = cabinetRepository.findByKitchenId(kitchenId);
        List<CabinetDto> cabinetDto = transformCabinetToDto(canvasCabinet);

        CanvasData canvasDataObject = new CanvasData(kitchenId, 1, filteredList, cabinetDto);

        return canvasDataObject ;

        // 根据厨房信息得到厨房对象描绘信息
        //return kitchenRepository.getKitchenById(kitchenId); // Return null or handle the case when not found;
    }

    public CanvasData getUpperCanvasObjectById(Integer kitchenId) {
        logger.info("saveKitchen kitchenId:" + kitchenId);
        List<Canvasobject> canvasobjectN = new ArrayList<>();
        List<Canvasobject> canvasobject = getKitchenObjectById(kitchenId);
        //过滤objecgt的wall，island，doors，windows
        List<Canvasobject> filteredCanvasObjects = canvasobject.stream()
                .filter(canvasObject ->
                        Constants.commons.OBJECT_NAME_WALL.equals(canvasObject.getObjectType()) ||
                                Constants.commons.OBJECT_TYPE_WINDOW.equals(canvasObject.getObjectType()) ||
                                Constants.commons.OBJECT_TYPE_DOOR.equals(canvasObject.getObjectType()) ||
                                Constants.commons.ISLAND_TYPE_ISLAND.equals(canvasObject.getObjectType())
                )
                .collect(Collectors.toList());
        canvasobjectN.addAll(filteredCanvasObjects);
        // Appliance
        List<Canvasobject> filteredAppliance = canvasobject.stream()
                .filter(canvasObject ->
                        Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(canvasObject.getCabinettype()) ||
                        Constants.commons.APPLIANCES_NAME_HOOD.equals(canvasObject.getCabinettype())
                )
                .collect(Collectors.toList());
        canvasobjectN.addAll(filteredAppliance);
        // BaseCabinets
        List<Canvasobject> filteredCabinet = canvasobject.stream()
                .filter(canvasObject ->
                        Constants.commons.CANBINET_TYPE_UPPER.equals(canvasObject.getObjectType()) ||
                        Constants.commons.CANBINET_TYPE_HIGH.equals(canvasObject.getObjectType())
                )
                .collect(Collectors.toList());
        canvasobjectN.addAll(filteredCabinet);

        // 将实体对象转换为 DTO
        List<CanvasobjectDto> canvasObjectDTOs = transformToDto(canvasobjectN);

        List<Cabinet> canvasCabinet = cabinetRepository.findByKitchenId(kitchenId);
        //List<Wall> wallObjects = getAllKitchenWallById(kitchenId);
//        List<Cabinet> filteredCanvasCabinets = canvasCabinet.stream()
//                .filter(canvasObject ->
//                    Constants.commons.CANBINET_TYPE_UPPER.equals(canvasObject.getType())
//                )
//                .collect(Collectors.toList());
        List<CabinetDto> cabinetDto = transformCabinetToDto(canvasCabinet);

        CanvasData canvasDataObject = new CanvasData(kitchenId, 2, canvasObjectDTOs, cabinetDto);

        return canvasDataObject ;

        // 根据厨房信息得到厨房对象描绘信息
        //return kitchenRepository.getKitchenById(kitchenId); // Return null or handle the case when not found;
    }

    public List<CanvasobjectDto> getCanvasObjectById(Integer kitchenId) {
        logger.info("getCanvasObjectById kitchenId:" + kitchenId);
        List<Canvasobject> canvasobjectN = new ArrayList<>();
        List<Canvasobject> canvasobject = getKitchenObjectById(kitchenId);
        //过滤objecgt的wall，island，doors，windows
        List<Canvasobject> filteredCanvasObjects = canvasobject.stream()
                .filter(canvasObject ->
                        Constants.commons.OBJECT_NAME_WALL.equals(canvasObject.getObjectType()) ||
                                Constants.commons.OBJECT_TYPE_WINDOW.equals(canvasObject.getObjectType()) ||
                                Constants.commons.OBJECT_TYPE_DOOR.equals(canvasObject.getObjectType()) ||
                                Constants.commons.ISLAND_TYPE_ISLAND.equals(canvasObject.getObjectType())
                )
                .collect(Collectors.toList());
        canvasobjectN.addAll(filteredCanvasObjects);
        // Appliance
        List<Canvasobject> filteredAppliance = canvasobject.stream()
                .filter(canvasObject ->
                        Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(canvasObject.getObjectType()) ||
                                Constants.commons.APPLIANCES_NAME_RANGE.equals(canvasObject.getObjectType()) ||
                                Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(canvasObject.getObjectType()) ||
                                Constants.commons.APPLIANCES_NAME_HOOD.equals(canvasObject.getObjectType())
                )
                .collect(Collectors.toList());
        canvasobjectN.addAll(filteredAppliance);
        // BaseCabinets
        List<Canvasobject> filteredCabinet = canvasobject.stream()
                .filter(canvasObject ->
                        Constants.commons.CANBINET_TYPE_LOWER.equals(canvasObject.getObjectType())
                )
                .collect(Collectors.toList());
        canvasobjectN.addAll(filteredCabinet);
        // 将实体对象转换为 DTO
        List<CanvasobjectDto> canvasObjectDTOs = transformToDto(canvasobjectN);
        return canvasObjectDTOs ;
        // 根据厨房信息得到厨房对象描绘信息
        //return kitchenRepository.getKitchenById(kitchenId); // Return null or handle the case when not found;
    }

    //全体对象取得
    public List<Canvasobject> getKitchenObjectById(Integer kitchenId) {
        logger.info("getKitchenObjectById kitchenId:" + kitchenId);
        List<Canvasobject> canvasObjectK = canvasobjectRepository.findByKitchenId(kitchenId);
        return canvasObjectK;
    }

    //wall1对象取得
    public List<CabinetDto> getConstructionById(Integer kitchenId, Integer wallid, String type) {
        logger.info("getConstructionById kitchenId:" + kitchenId + " wallid:" + wallid + " type:" + type);
        List<Cabinet> canvasCabinet = cabinetRepository.findByKitchenId(kitchenId);

        //List<Wall> wallObjects = getAllKitchenWallById(kitchenId);
            List<Cabinet> filteredCanvasCabinets = canvasCabinet.stream()
                .filter(canvasObject -> {
                    System.out.println("wallid: " + wallid + ", canvasObject.getWallid(): " + canvasObject.getWallid());
                    // 判断 wallId 是否匹配
                    boolean wallIdMatch = wallid != null && wallid.equals(canvasObject.getWallid());

                    // 判断 type 是否匹配
                    boolean typeMatch;
                    if ("wall".equals(type)) {
                        typeMatch = "lower".equals(canvasObject.getType()) || "upper".equals(canvasObject.getType()) || "high".equals(canvasObject.getType());
                    } else {
                        typeMatch = type.equals(canvasObject.getType());
                    }

                    // 同时满足 wallId 和 type 条件
                    return wallIdMatch && typeMatch;
                })
                .collect(Collectors.toList());
                List<CabinetDto> cabinetDto = transformCabinetToDto(filteredCanvasCabinets);
                return cabinetDto;
           
    }


    private List<Canvasobject> getConstructionById(Integer kitchenId) {
        logger.info("getConstructionById kitchenId:" + kitchenId );
        List<Canvasobject> canvasObjectK = canvasobjectRepository.findByKitchenId(kitchenId);

        //过滤objecgt的wall，island，doors，windows
        List<Canvasobject> filteredCanvasObjects = canvasObjectK.stream()
                .filter(canvasObject ->
                        Constants.commons.OBJECT_NAME_WALL.equals(canvasObject.getObjectType()) ||
                                Constants.commons.OBJECT_TYPE_WINDOW.equals(canvasObject.getObjectType()) ||
                                Constants.commons.OBJECT_TYPE_DOOR.equals(canvasObject.getObjectType()) ||
                                Constants.commons.ISLAND_TYPE_ISLAND.equals(canvasObject.getObjectType())
                )
                .collect(Collectors.toList());
        return filteredCanvasObjects;
    }

    // 指标是wall，island，doors，windows的场合
    public List<CanvasobjectDto> getConstructionObjectById(Integer kitchenId) {
        logger.info("getConstructionObjectById kitchenId:" + kitchenId );
        //过滤objecgt的wall，island，doors，windows
        List<Canvasobject> filteredCanvasObjects = getConstructionById(kitchenId);
        // 将实体对象转换为 DTO
        List<CanvasobjectDto> canvasObjectDTOs = filteredCanvasObjects.stream()
                .map(canvasObject -> new CanvasobjectDto(
                        canvasObject.getId(),
                        canvasObject.getObjectType(),
                        canvasObject.getX(),
                        canvasObject.getY(),
                        canvasObject.getWidth(),
                        canvasObject.getHeight(),
                        canvasObject.getRotation(),
                        canvasObject.getColor(),
                        canvasObject.getData(),
                        canvasObject.getCreatedAt(),
                        canvasObject.getUpdatedAt(),
                        canvasObject.getRelatedId(),
                        canvasObject.getObjectname(),
                        canvasObject.getKitchen().getId(),  // 使用传递的 kitchenId
                        canvasObject.getScale(),
                        canvasObject.getKitchen(),
                        canvasObject.getCabinettype(),
                        canvasObject.getDepth(),
                        canvasObject.getWallid(), 0,
                        canvasObject.getRelatedId2(),
                        canvasObject.getWidthcabinet() != null ? canvasObject.getWidthcabinet() : 0f,
                        canvasObject.getHeightcabinet() != null ? canvasObject.getHeightcabinet() : 0f,
                        canvasObject.getDepthcabinet() != null ? canvasObject.getDepthcabinet() : 0f
                ))
                .collect(Collectors.toList());
        return canvasObjectDTOs;
    }

    public Kitchen getKitchenById(Integer kitchenId) {
        logger.info("getKitchenById kitchenId:" + kitchenId );
        Optional<Kitchen> optionalKitchen = kitchenRepository.findById(kitchenId);
        Kitchen kitchen = optionalKitchen.orElseThrow(() -> new RuntimeException("The corresponding data for the incoming kitchen ID was not found."));
        return kitchen;
    }

    public List<Wall> getAllKitchenWallById(Integer kitchenId) {
        logger.info("getAllKitchenWallById kitchenId:" + kitchenId );
        return wallRepository.findAllByKitchenId(kitchenId); // Return null or handle the case when not found;
    }

    public List<Window> getAllKitchenWindowById(Integer kitchenId) {
        logger.info("getAllKitchenWindowById kitchenId:" + kitchenId );
        return windowRepository.findAllByKitchenId(kitchenId); // Return null or handle the case when not found;
    }

    public List<Door> getAllKitchenDoorById(Integer kitchenId) {
        logger.info("getAllKitchenDoorById kitchenId:" + kitchenId );
        return doorRepository.findAllByKitchenId(kitchenId); // Return null or handle the case when not found;
    }
    public List<Appliance> getAllKitchenApplianceById(Integer kitchenId) {
        logger.info("getAllKitchenApplianceById kitchenId:" + kitchenId );
        return applianceRepository.findAllByKitchenId(kitchenId); // Return null or handle the case when not found;
    }
    public Island getKitchenIslandById(Integer kitchenId) {
        logger.info("getKitchenIslandById kitchenId:" + kitchenId );
        return islandRepository.findAllByKitchenId(kitchenId); // Return null or handle the case when not found;
    }

    public List<Cabinetsrule> getAllCabinetRule() {
        logger.info("getAllCabinetRule ");
        return cabinetsruleRepository.findAll();
    }

    public List<CabinetProduct> getCabinetProductRef() {
        logger.info("getAllCabinetRule ");
        return cabinetproductsRepository.findAll();
    }

    public List<CanvasobjectDto> transformToDto(List<Canvasobject> canvasObjectK) {
        logger.info("transformToDto ");
        // 将实体对象转换为 DTO
        List<CanvasobjectDto> canvasObjectDTOs = canvasObjectK.stream()
                .map(canvasObject -> new CanvasobjectDto(
                        canvasObject.getId(),
                        canvasObject.getObjectType(),
                        canvasObject.getX(),
                        canvasObject.getY(),
                        canvasObject.getWidth(),
                        canvasObject.getHeight(),
                        canvasObject.getRotation(),
                        canvasObject.getColor(),
                        canvasObject.getData(),
                        canvasObject.getCreatedAt(),
                        canvasObject.getUpdatedAt(),
                        canvasObject.getRelatedId(),
                        canvasObject.getObjectname(),
                        canvasObject.getKitchen().getId(),  // 使用传递的 kitchenId
                        canvasObject.getScale(),
                        canvasObject.getKitchen(),
                        canvasObject.getCabinettype(),
                        canvasObject.getDepth(),
                        canvasObject.getWallid(), 0,
                        canvasObject.getRelatedId2(),
                        canvasObject.getWidthcabinet() != null ? canvasObject.getWidthcabinet() : 0f,
                        canvasObject.getHeightcabinet() != null ? canvasObject.getHeightcabinet() : 0f,
                        canvasObject.getDepthcabinet() != null ? canvasObject.getDepthcabinet() : 0f
                ))
                .collect(Collectors.toList());
        return canvasObjectDTOs;
    }

    public List<CabinetDto> transformCabinetToDto(List<Cabinet> canvasC) {
        logger.info("transformCabinetToDto ");
        // 将实体对象转换为 DTO
        List<CabinetDto> canvasObjectDTOs = canvasC.stream()
                .map(canvasCabinet -> new CabinetDto(canvasCabinet.getId(),
                        canvasCabinet.getHeight(),
                        canvasCabinet.getLength(),
                        canvasCabinet.getName(),
                        canvasCabinet.getWidth(),
                        canvasCabinet.getCeilingHeight(),
                        canvasCabinet.getKitchenId(),
                        canvasCabinet.getWallid(),
                        canvasCabinet.getCabinettype(),
                        canvasCabinet.getType(),
                        canvasCabinet.getStartposition(),
                        canvasCabinet.getDepth(),
                        canvasCabinet.getLeftobject(),
                        canvasCabinet.getRightobject(), 0,
                        canvasCabinet.getCornerKey(),
                        canvasCabinet.getRotation(),
                        canvasCabinet.getConstruction()
                        ))
                .collect(Collectors.toList());
        return canvasObjectDTOs;
    }

    public List<Canvasobject> transformFromDto(List<CanvasobjectDto> canvasObjectDto, Kitchen kitchen) {

        // 将实体对象转换为 DTO
        List<Canvasobject> canvasObjects = canvasObjectDto.stream()
                .map(canvasObject -> new Canvasobject(
                        canvasObject.getId(),
                        kitchen,
                        canvasObject.getObjectType(),
                        canvasObject.getX(),
                        canvasObject.getY(),
                        canvasObject.getWidth(),
                        canvasObject.getHeight(),
                        canvasObject.getRotation(),
                        canvasObject.getColor(),
                        canvasObject.getData(),
                        canvasObject.getCreatedAt(),
                        canvasObject.getUpdatedAt(),
                        canvasObject.getWallid(),
                        canvasObject.getRelatedId(),
                        canvasObject.getObjectname(),
                        canvasObject.getScale(),
                        canvasObject.getCabinettype(),
                        canvasObject.getDepth(),
                        0f,0f,canvasObject.getWidthcabinet(),canvasObject.getHeightcabinet(),canvasObject.getDepthcabinet()
                ))
                .collect(Collectors.toList());
        return canvasObjects;
    }

    public List<Cabinet> transformCabinetFromDto(List<CabinetDto> canvasD) {
        // 将实体对象转换为 DTO
        List<Cabinet> canvasObjects = canvasD.stream()
                .map(canvasCabinet -> new Cabinet(
                        canvasCabinet.getId(),
                        canvasCabinet.getHeight(),
                        canvasCabinet.getLength(),
                        canvasCabinet.getName(),
                        canvasCabinet.getWidth(),
                        canvasCabinet.getCeilingHeight(),
                        canvasCabinet.getKitchenid(),
                        canvasCabinet.getWallid(),
                        canvasCabinet.getCabinettype(),
                        canvasCabinet.getType(),
                        null, null,
                        canvasCabinet.getStartposition(),
                        canvasCabinet.getDepth(),
                        canvasCabinet.getLeftobject(),
                        canvasCabinet.getRightobject(),
                        canvasCabinet.getCornerKey(),
                        canvasCabinet.getRotation(),
                        canvasCabinet.getConstruction()
                        
                ))
                .collect(Collectors.toList());
        return canvasObjects;
    }

    private void createWallConnection(Kitchen kitchenInfo,List<Wall> wallInfoList, Island island) {
        logger.info("createWallConnection kitchenInfo:" + kitchenInfo.getId());
//        kitchenInfo
//        wallInfoList
        // 得到厨房类型
        ZonedDateTime serverTime = ZonedDateTime.now(ZoneId.systemDefault());
        String shapeType = kitchenInfo.getShapeType();
        
        // 先检查数据库中是否已存在该厨房的连接记录
        List<WallConnection> existingConnections = wallConnectionRepository.findAllByKitchenId(kitchenInfo.getId());
        List<PeninisulaConnection> existingPeniniConnections = peninisulaConnectionRepository.findAllByKitchenId(kitchenInfo.getId());
        Map<String, WallConnection> existingConnectionMap = new HashMap<>();
     // 如果存在连接记录，则删除它们
        if (!existingPeniniConnections.isEmpty()) {
        	peninisulaConnectionRepository.deleteAll(existingPeniniConnections);
        }
     // 如果存在连接记录，则删除它们
        if (!existingConnections.isEmpty()) {
            wallConnectionRepository.deleteAll(existingConnections);
        }
        // 将现有连接记录转换为Map，以便快速查找
        if (!existingConnections.isEmpty()) {
            for (WallConnection conn : existingConnections) {
                String key = conn.getWall() +"_" + conn.getAdjacentWall();
                existingConnectionMap.put(key, conn);
            }
        }

        
        if ("I".equals(shapeType) ||"II".equals(shapeType)) {
        	// 检查半岛的链接
            if (Constants.commons.ISLAND_TYPE_PENINISULA.equals(island.getIslandKind())) {
            	PeninisulaConnection connection5 = null;
            	 if (island.getPeninsulaisadjacentto().equals("one")) {
            		 connection5 = new PeninisulaConnection(
            				 kitchenInfo, wallInfoList.get(0), island,
                             true, false);
            	 }  else if (island.getPeninsulaisadjacentto().equals("two")) {
            		 connection5 = new PeninisulaConnection(kitchenInfo, wallInfoList.get(1), island,
            				 true, false);
            	 }
            	 if (connection5 != null) {
            		 connection5.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                     connection5.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
                     peninisulaConnectionRepository.save(connection5);
            	 }
            } else {
            	 // 如果存在连接记录，则删除它们
                if (!existingPeniniConnections.isEmpty()) {
                	peninisulaConnectionRepository.deleteAll(existingPeniniConnections);
                }
            }
            
            // 如果存在连接记录，则删除它们
            if (!existingConnections.isEmpty()) {
                wallConnectionRepository.deleteAll(existingConnections);
            }
            return;
        } else if ("L".equals(shapeType)) {
            boolean lowerConnection = hasLowerCabinetConnection(wallInfoList.get(0), wallInfoList.get(1));
            boolean upperConnection = hasUpperCabinetConnection(wallInfoList.get(0), wallInfoList.get(1));
            
            // 检查是否存在连接记录
            String connectionKey = wallInfoList.get(0).getId() + "_" + wallInfoList.get(1).getId();
            WallConnection connection;
            
            if (existingConnectionMap.containsKey(connectionKey)) {
                // 更新现有记录
                connection = existingConnectionMap.get(connectionKey);
                connection.setIsLowerCabinetConnected(lowerConnection);
                connection.setIsUpperCabinetConnected(upperConnection);
                connection.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            } else {
                // 创建新记录
                connection = new WallConnection(kitchenInfo, wallInfoList.get(0), wallInfoList.get(1),
                        lowerConnection, upperConnection);
                connection.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                connection.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            }
            // 检查半岛的链接
            if (Constants.commons.ISLAND_TYPE_PENINISULA.equals(island.getIslandKind())) {
            	PeninisulaConnection connection5 = null;
            	 if (island.getPeninsulaisadjacentto().equals("one")) {
            		 connection5 = new PeninisulaConnection(
            				 kitchenInfo, wallInfoList.get(0), island,
                             true, false);
            	 }  else if (island.getPeninsulaisadjacentto().equals("two")) {
            		 connection5 = new PeninisulaConnection(kitchenInfo, wallInfoList.get(1), island,
            				 true, false);
            	 }
            	 if (connection5 != null) {
            		 connection5.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                     connection5.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
                     peninisulaConnectionRepository.save(connection5);
            	 }
            } else {
            	 // 如果存在连接记录，则删除它们
                if (!existingPeniniConnections.isEmpty()) {
                	peninisulaConnectionRepository.deleteAll(existingPeniniConnections);
                }
            }
            wallConnectionRepository.save(connection);
            
            // 删除不再需要的连接记录
            existingConnections.stream()
                .filter(conn -> !connectionKey.equals(conn.getWall() + "_" + conn.getAdjacentWall()))
                .forEach(wallConnectionRepository::delete);
            
        } else if ("U".equals(shapeType)) {
            List<WallConnection> connectionList = new ArrayList<>();
            
            // 第一个连接
            boolean lowerConnection1 = hasLowerCabinetConnection(wallInfoList.get(0), wallInfoList.get(1));
            boolean upperConnection1 = hasUpperCabinetConnection(wallInfoList.get(0), wallInfoList.get(1));
            String connectionKey1 = wallInfoList.get(0).getId() + "_" + wallInfoList.get(1).getId();
            WallConnection connection1;
            
            if (existingConnectionMap.containsKey(connectionKey1)) {
                // 更新现有记录
                connection1 = existingConnectionMap.get(connectionKey1);
                connection1.setIsLowerCabinetConnected(lowerConnection1);
                connection1.setIsUpperCabinetConnected(upperConnection1);
                connection1.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            } else {
                // 创建新记录
                connection1 = new WallConnection(kitchenInfo, wallInfoList.get(0), wallInfoList.get(1),
                        lowerConnection1, upperConnection1);
                connection1.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                connection1.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            }
            connectionList.add(connection1);
            
            // 第二个连接
            boolean lowerConnection2 = hasLowerCabinetConnection(wallInfoList.get(1), wallInfoList.get(2));
            boolean upperConnection2 = hasUpperCabinetConnection(wallInfoList.get(1), wallInfoList.get(2));
            String connectionKey2 = wallInfoList.get(1).getId() + "_" + wallInfoList.get(2).getId();
            WallConnection connection2;
            
            if (existingConnectionMap.containsKey(connectionKey2)) {
                // 更新现有记录
                connection2 = existingConnectionMap.get(connectionKey2);
                connection2.setIsLowerCabinetConnected(lowerConnection2);
                connection2.setIsUpperCabinetConnected(upperConnection2);
                connection2.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            } else {
                // 创建新记录
                connection2 = new WallConnection(kitchenInfo, wallInfoList.get(1), wallInfoList.get(2),
                        lowerConnection2, upperConnection2);
                connection2.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                connection2.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            }
            connectionList.add(connection2);
            
            // 检查半岛的链接
            if (Constants.commons.ISLAND_TYPE_PENINISULA.equals(island.getIslandKind())) {
            	PeninisulaConnection connection5 = null;
            	 if (island.getPeninsulaisadjacentto().equals("one")) {
            		 connection5 = new PeninisulaConnection(
            				 kitchenInfo, wallInfoList.get(0), island,
                             true, false);
            	 } else if (island.getPeninsulaisadjacentto().equals("three")) {
            		 connection5 = new PeninisulaConnection(kitchenInfo, wallInfoList.get(2), island,
            				 true, false);
            	 } 
            	 if (connection5 != null) {
            		 connection5.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                     connection5.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
                     peninisulaConnectionRepository.save(connection5);
            	 }
            } else {
            	 // 如果存在连接记录，则删除它们
                if (!existingPeniniConnections.isEmpty()) {
                	peninisulaConnectionRepository.deleteAll(existingPeniniConnections);
                }
            }
            
            wallConnectionRepository.saveAll(connectionList);
            
            // 删除不再需要的连接记录
            existingConnections.stream()
                .filter(conn -> !connectionKey1.equals(conn.getWall() + "_" + conn.getAdjacentWall()) && 
                               !connectionKey2.equals(conn.getWall() + "_" + conn.getAdjacentWall()))
                .forEach(wallConnectionRepository::delete);
            
        } else if ("O".equals(shapeType)) {
            List<WallConnection> connectionList = new ArrayList<>();
            
            // 第一个连接
            boolean lowerConnection1 = hasLowerCabinetConnection(wallInfoList.get(0), wallInfoList.get(1));
            boolean upperConnection1 = hasUpperCabinetConnection(wallInfoList.get(0), wallInfoList.get(1));
            String connectionKey1 = wallInfoList.get(0).getId() + "_" + wallInfoList.get(1).getId();
            WallConnection connection1;
            
            if (existingConnectionMap.containsKey(connectionKey1)) {
                // 更新现有记录
                connection1 = existingConnectionMap.get(connectionKey1);
                connection1.setIsLowerCabinetConnected(lowerConnection1);
                connection1.setIsUpperCabinetConnected(upperConnection1);
                connection1.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            } else {
                // 创建新记录
                connection1 = new WallConnection(kitchenInfo, wallInfoList.get(0), wallInfoList.get(1),
                        lowerConnection1, upperConnection1);
                connection1.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                connection1.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            }
            connectionList.add(connection1);
            
            // 第二个连接
            boolean lowerConnection2 = hasLowerCabinetConnection(wallInfoList.get(1), wallInfoList.get(2));
            boolean upperConnection2 = hasUpperCabinetConnection(wallInfoList.get(1), wallInfoList.get(2));
            String connectionKey2 = wallInfoList.get(1).getId() + "_" + wallInfoList.get(2).getId();
            WallConnection connection2;
            
            if (existingConnectionMap.containsKey(connectionKey2)) {
                // 更新现有记录
                connection2 = existingConnectionMap.get(connectionKey2);
                connection2.setIsLowerCabinetConnected(lowerConnection2);
                connection2.setIsUpperCabinetConnected(upperConnection2);
                connection2.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            } else {
                // 创建新记录
                connection2 = new WallConnection(kitchenInfo, wallInfoList.get(1), wallInfoList.get(2),
                        lowerConnection2, upperConnection2);
                connection2.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                connection2.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            }
            connectionList.add(connection2);


            // 第三个连接
            boolean lowerConnection3 = hasLowerCabinetConnection(wallInfoList.get(2), wallInfoList.get(3));
            boolean upperConnection3 = hasUpperCabinetConnection(wallInfoList.get(2), wallInfoList.get(3));
            String connectionKey3 = wallInfoList.get(2).getId() + "_" + wallInfoList.get(3).getId();
            WallConnection connection3;
            
            if (existingConnectionMap.containsKey(connectionKey3)) {
                // 更新现有记录
                connection3 = existingConnectionMap.get(connectionKey3);
                connection3.setIsLowerCabinetConnected(lowerConnection3);
                connection3.setIsUpperCabinetConnected(upperConnection3);
                connection3.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            } else {
                // 创建新记录
                connection3 = new WallConnection(kitchenInfo, wallInfoList.get(2), wallInfoList.get(3),
                        lowerConnection3, upperConnection3);
                connection3.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                connection3.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            }
            connectionList.add(connection3);

            // 第四个连接  是否完全衔接，需要修改
            boolean lowerConnection4 = hasLowerCabinetConnection(wallInfoList.get(3), wallInfoList.get(0));
            boolean upperConnection4 = hasUpperCabinetConnection(wallInfoList.get(3), wallInfoList.get(0));
            String connectionKey4 = wallInfoList.get(3).getId() + "_" + wallInfoList.get(0).getId();
            WallConnection connection4;
            
            if (existingConnectionMap.containsKey(connectionKey4)) {
                // 更新现有记录
                connection4 = existingConnectionMap.get(connectionKey4);
                connection4.setIsLowerCabinetConnected(lowerConnection4);
                connection4.setIsUpperCabinetConnected(upperConnection4);
                connection4.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            } else {
                // 创建新记录
                connection4 = new WallConnection(kitchenInfo, wallInfoList.get(3), wallInfoList.get(0),
                        lowerConnection4, upperConnection4);
                connection4.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                connection4.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
            }
            connectionList.add(connection4);
           
            
            // 检查半岛的链接
            if (Constants.commons.ISLAND_TYPE_PENINISULA.equals(island.getIslandKind())) {
            	PeninisulaConnection connection5 = null;
            	 if (island.getPeninsulaisadjacentto().equals("one")) {
            		 connection5 = new PeninisulaConnection(
            				 kitchenInfo, wallInfoList.get(0), island,
                             true, false);
            	 } else if (island.getPeninsulaisadjacentto().equals("three")) {
            		 connection5 = new PeninisulaConnection(kitchenInfo, wallInfoList.get(2), island,
            				 true, false);
            	 } else if (island.getPeninsulaisadjacentto().equals("two")) {
            		 connection5 = new PeninisulaConnection(kitchenInfo, wallInfoList.get(1), island,
            				 true, false);
            	 }
            	 if (connection5 != null) {
            		 connection5.setCreatedAt(serverTime.toInstant());  // 设置创建时间
                     connection5.setUpdatedAt(serverTime.toInstant());  // 设置更新时间
                     peninisulaConnectionRepository.save(connection5);
            	 }
            } else {
            	 // 如果存在连接记录，则删除它们
                if (!existingPeniniConnections.isEmpty()) {
                	peninisulaConnectionRepository.deleteAll(existingPeniniConnections);
                }
            }
           
            
            
            wallConnectionRepository.saveAll(connectionList);
            
            // 删除不再需要的连接记录
            existingConnections.stream()
                .filter(conn -> !connectionKey1.equals(conn.getWall() + "_" + conn.getAdjacentWall()) && 
                               !connectionKey2.equals(conn.getWall() + "_" + conn.getAdjacentWall()))
                .forEach(wallConnectionRepository::delete);
        }
        
        // 返回值待定
        return;
    }
    
    // 判断两面墙是否有下柜衔接
    public static boolean hasLowerCabinetConnection(Wall wallA, Wall wallB) {
        return wallA.getIsLowerCabinetPlaced() && wallB.getIsLowerCabinetPlaced();
    }
    // 判断两面墙是否有上柜衔接
    public static boolean hasUpperCabinetConnection(Wall wallA, Wall wallB) {
        return wallA.getIsUpperCabinetPlaced() && wallB.getIsUpperCabinetPlaced();
    }

    // 页面上手动变更cabinet的场合
    public CanvasData updateCabinetObject(CanvasData canvasDto) {
        logger.info("updateCabinetObject kitchenId:" + canvasDto.getKitchenId());
        Integer kitchenId = canvasDto.getKitchenId();
        Integer canvasId = canvasDto.getCanvasId();
        Kitchen kitchen = getKitchenById(kitchenId);
        List<CanvasobjectDto> cabinetObjectDtoList = canvasDto.getCabinetObjectDtoList();
        List<CabinetDto> cabinetDtoList = canvasDto.getCabinetDtoList();

        List<Canvasobject> canvasObjectNew = transformFromDto(cabinetObjectDtoList, kitchen);
        List<Cabinet> cabinetNew = transformCabinetFromDto(cabinetDtoList);

        // DB里面的data
        List<Canvasobject> canvasObjectOld = canvasobjectRepository.findByKitchenId(kitchenId);
        List<Cabinet> cabinetListOld = cabinetRepository.findByKitchenId(kitchenId);


        //过滤Object的wall，island，doors，windows
        List<Canvasobject> filteredCanvasBaseObjectsOld = canvasObjectOld.stream()
                .filter(canvasObject ->
                        Constants.commons.CANBINET_TYPE_LOWER.equals(canvasObject.getObjectType())||
                                Constants.commons.CANBINET_TYPE_HIGH.equals(canvasObject.getObjectType()) ||
                                Constants.commons.CANBINET_TYPE_ISLAND_INER.equals(canvasObject.getObjectType()) ||
                                Constants.commons.CANBINET_TYPE_ISLAND_OUTER.equals(canvasObject.getObjectType())
                )
                .collect(Collectors.toList());
        List<Canvasobject> filteredCanvasBaseNew = canvasObjectNew.stream()
                .filter(canvasObject ->
                        Constants.commons.CANBINET_TYPE_LOWER.equals(canvasObject.getObjectType())||
                                Constants.commons.CANBINET_TYPE_HIGH.equals(canvasObject.getObjectType()) ||
                                Constants.commons.CANBINET_TYPE_ISLAND_INER.equals(canvasObject.getObjectType()) ||
                                Constants.commons.CANBINET_TYPE_ISLAND_OUTER.equals(canvasObject.getObjectType())
                )
                .collect(Collectors.toList());
      //过滤Object的wall，island，doors，windows
        List<Canvasobject> filteredCanvasUpperObjectsOld = canvasObjectOld.stream()
                .filter(canvasObject ->
                        Constants.commons.CANBINET_TYPE_UPPER.equals(canvasObject.getObjectType())||
                                Constants.commons.CANBINET_TYPE_HIGH.equals(canvasObject.getObjectType()) 
                )
                .collect(Collectors.toList());
        List<Canvasobject> filteredCanvasUpperNew = canvasObjectNew.stream()
                .filter(canvasObject ->
                        Constants.commons.CANBINET_TYPE_UPPER.equals(canvasObject.getObjectType())||
                                Constants.commons.CANBINET_TYPE_HIGH.equals(canvasObject.getObjectType())
                )
                .collect(Collectors.toList());

        //过滤objecgt的wall，island，doors，windows
        List<Cabinet> filteredBaseCabinetNew= cabinetNew.stream()
                .filter(canvasObject ->
                        Constants.commons.CANBINET_TYPE_LOWER.equals(canvasObject.getType())||
                                Constants.commons.CANBINET_TYPE_HIGH.equals(canvasObject.getType()) ||
                                Constants.commons.CANBINET_TYPE_ISLAND_INER.equals(canvasObject.getType()) ||
                                Constants.commons.CANBINET_TYPE_ISLAND_OUTER.equals(canvasObject.getType())
                )
                .collect(Collectors.toList());
        List<Cabinet> filteredBaseCabinetOld = cabinetListOld.stream()
                .filter(canvasObject ->
                        Constants.commons.CANBINET_TYPE_LOWER.equals(canvasObject.getType())||
                                Constants.commons.CANBINET_TYPE_HIGH.equals(canvasObject.getType()) ||
                                Constants.commons.CANBINET_TYPE_ISLAND_INER.equals(canvasObject.getType()) ||
                                Constants.commons.CANBINET_TYPE_ISLAND_OUTER.equals(canvasObject.getType())
                )
                .collect(Collectors.toList());
        List<Cabinet> filteredUpperCabinetNew= cabinetNew.stream()
                .filter(canvasObject ->
                        Constants.commons.CANBINET_TYPE_UPPER.equals(canvasObject.getType())||
                                Constants.commons.CANBINET_TYPE_HIGH.equals(canvasObject.getType()) 
                )
                .collect(Collectors.toList());
        List<Cabinet> filteredUpperCabinetOld = cabinetListOld.stream()
                .filter(canvasObject ->
                        Constants.commons.CANBINET_TYPE_UPPER.equals(canvasObject.getType())||
                                Constants.commons.CANBINET_TYPE_HIGH.equals(canvasObject.getType()) 
                )
                .collect(Collectors.toList());
//        List<Canvasobject> toAdd
//        List<Canvasobject> toDelete
//        List<Cabinet> toAddCab
//        List<Cabinet> toDeleteCab
        if (canvasId == 1) {
        	// Base Cabinet
        	 // 使用Stream API找出新增的元素
            List<Canvasobject> toAdd = filteredCanvasBaseNew.stream()
                    .filter(newObj -> filteredCanvasBaseObjectsOld.stream().noneMatch(oldObj -> oldObj.getId().equals(newObj.getId())))
                    .collect(Collectors.toList());

            // 使用Stream API找出需要删除的元素
            List<Canvasobject> toDelete = filteredCanvasBaseObjectsOld.stream()
                    .filter(oldObj -> filteredCanvasBaseNew.stream().noneMatch(newObj -> oldObj.getId().equals(newObj.getId())))
                    .collect(Collectors.toList());

            // 使用Stream API找出新增的元素
            List<Cabinet> toAddCab = filteredBaseCabinetNew.stream()
                    .filter(newObj -> filteredBaseCabinetOld.stream().noneMatch(oldObj -> oldObj.getId().equals(newObj.getId())))
                    .collect(Collectors.toList());

            // 使用Stream API找出需要删除的元素
            List<Cabinet> toDeleteCab = filteredBaseCabinetOld.stream()
                    .filter(oldObj -> filteredBaseCabinetNew.stream().noneMatch(newObj -> oldObj.getId().equals(newObj.getId())))
                    .collect(Collectors.toList());
            List<Map<String, Object>> relatedIdTList = new ArrayList<>();
            List<Cabinet> BBCDCab = new ArrayList<>();
            ZonedDateTime serverTime = ZonedDateTime.now(ZoneId.systemDefault());
            toAddCab.forEach(itemCab -> {
            	Integer relatedIdT = itemCab.getId();
                String cornerKey = itemCab.getCornerKey();
                // 处理 BBC/BBCD 和 BLS/BLSD 的逻辑
                if ("BBC".equals(itemCab.getCabinettype()) || "BBCD".equals(itemCab.getCabinettype()) ||
                		"BBCR".equals(itemCab.getCabinettype()) || "BBCRD".equals(itemCab.getCabinettype()) ||
                		"BBCL".equals(itemCab.getCabinettype()) || "BBCLD".equals(itemCab.getCabinettype()) ||
                        "BLS".equals(itemCab.getCabinettype()) || "BLSD".equals(itemCab.getCabinettype())||
                        "SBD".equals(itemCab.getCabinettype()) || "SBDD".equals(itemCab.getCabinettype())) {
                	if ("BBCD".equals(itemCab.getCabinettype()) || "BBCD".equals(itemCab.getCabinettype()) ||
                    		"BBCLD".equals(itemCab.getCabinettype()) || "BBCRD".equals(itemCab.getCabinettype()) ) {
                		BBCDCab.add(itemCab);
                	}

                	Map<String, Object> result = relatedIdTList.stream()
                		    .filter(cabinet -> Objects.equals(cabinet.get("cornerKey"), cornerKey))
                		    .findFirst()
                		    .orElse(null);

                    if (result != null) {
                        // 已经存在，更新已有的记录
                        itemCab.setId(null);
                        itemCab.setCreatedAt(serverTime.toInstant());
                        itemCab.setUpdatedAt(serverTime.toInstant());
                        Cabinet addEntity = cabinetRepository.save(itemCab);

                        // 根据 cabinettype 类型添加对应的 key
                        if ("BBC".equals(itemCab.getCabinettype())||"BBCR".equals(itemCab.getCabinettype()) ||"BBCL".equals(itemCab.getCabinettype()) 
                        		|| "BBCD".equals(itemCab.getCabinettype())|| "BBCLD".equals(itemCab.getCabinettype())|| "BBCRD".equals(itemCab.getCabinettype())) {
                            // 如果 cabinettype 是 BBC/BBCD，使用一个列表存储多个 cabid
                            List<Integer> cabidList = (List<Integer>) result.getOrDefault("cabidsBBC", new ArrayList<>());
                            cabidList.add(addEntity.getId());
                            result.put("cabidsBBC", cabidList); // 将新的 cabid 添加到列表中
                        } else if ("BLS".equals(itemCab.getCabinettype()) || "BLSD".equals(itemCab.getCabinettype()) ||
                        		"SBD".equals(itemCab.getCabinettype()) || "SBDD".equals(itemCab.getCabinettype())) {
                            // 如果 cabinettype 是 BLS/BLSD，使用一个列表存储多个 cabid
                            List<Integer> cabidList = (List<Integer>) result.getOrDefault("cabidsBLS", new ArrayList<>());
                            cabidList.add(addEntity.getId());
                            result.put("cabidsBLS", cabidList); // 将新的 cabid 添加到列表中
                        }
                    } else {
                        // 不存在 relatedid，创建新记录
                        Map<String, Object> cabinet = new HashMap<>();
                        cabinet.put("cornerKey", cornerKey);
                        cabinet.put("relatedid", relatedIdT);                        

                        itemCab.setId(null);
                        itemCab.setCreatedAt(serverTime.toInstant());
                        itemCab.setUpdatedAt(serverTime.toInstant());
                        Cabinet addEntity = cabinetRepository.save(itemCab);

                        // 根据 cabinettype 类型添加对应的 key
                        if ("BBC".equals(itemCab.getCabinettype())||"BBCR".equals(itemCab.getCabinettype()) ||"BBCL".equals(itemCab.getCabinettype()) 
                        		|| "BBCD".equals(itemCab.getCabinettype())|| "BBCLD".equals(itemCab.getCabinettype())|| "BBCRD".equals(itemCab.getCabinettype())) {
                            List<Integer> cabidList = new ArrayList<>();
                            cabidList.add(addEntity.getId());
                            cabinet.put("cabidsBBC", cabidList); // 创建新的 cabid 列表并添加
                        } else if ("BLS".equals(itemCab.getCabinettype()) || "BLSD".equals(itemCab.getCabinettype()) ||
                        		"SBD".equals(itemCab.getCabinettype()) || "SBDD".equals(itemCab.getCabinettype())) {
                            List<Integer> cabidList = new ArrayList<>();
                            cabidList.add(addEntity.getId());
                            cabinet.put("cabidsBLS", cabidList); // 创建新的 cabid 列表并添加
                        }

                        // 将新的 cabinet 信息加入相关列表
                        relatedIdTList.add(cabinet);
                    }
                } else {
                    itemCab.setId(null);
                    itemCab.setCreatedAt(serverTime.toInstant());
                    itemCab.setUpdatedAt(serverTime.toInstant());
                    Canvasobject canvasAdd = toAdd.stream()
                            .filter(canvasObject -> 
	                            canvasObject.getRelatedId().equals(relatedIdT) ) // 筛选 relatedId 等于指定 id 的对象
                            .findFirst()
                            .orElse(null); // 如果没找到对象，返回 null
                    Cabinet addEntity = cabinetRepository.save(itemCab);
                    if (canvasAdd != null) {
                    	canvasAdd.setId(null);                       
                        canvasAdd.setRelatedId(addEntity.getId());
                        canvasAdd.setData(canvasAdd.toString());
                        canvasAdd.setCreatedAt(serverTime.toInstant());
                        canvasAdd.setUpdatedAt(serverTime.toInstant());
                        canvasobjectRepository.save(canvasAdd);
                    }
                }
            });
            relatedIdTList.forEach(relatedIdItem -> {
                Integer relatedid = (Integer) relatedIdItem.get("relatedid");
                Canvasobject canvasAdd = toAdd.stream()
                        .filter(canvasObject -> canvasObject.getRelatedId().equals(relatedid)|| 
	                            canvasObject.getRelatedId2().equals(relatedid)) // 筛选 relatedId 等于指定 id 的对象
                        .findFirst()
                        .orElse(null); // 如果没找到对象，返回 null

                if (canvasAdd != null) {
                    // 处理 cabidsBBC
                    List<Integer> cabidsBBC = (List<Integer>) relatedIdItem.get("cabidsBBC");
                    if (cabidsBBC != null && cabidsBBC.size() >= 2) {
                        Integer relatedCabid1 = cabidsBBC.get(0);
                        Integer relatedCabid2 = cabidsBBC.get(1);

                        // 设置 canvasAdd 的 relatedId 和 relatedId2
                        if (relatedCabid1 != null) {
                            canvasAdd.setRelatedId(relatedCabid1);
                        }
                        if (relatedCabid2 != null) {
                            canvasAdd.setRelatedId2(relatedCabid2);
                        }
                    }

                    // 处理 cabidsBLS
                    List<Integer> cabidsBLS = (List<Integer>) relatedIdItem.get("cabidsBLS");
                    if (cabidsBLS != null && cabidsBLS.size() >= 2) {
                        Integer relatedCabid1 = cabidsBLS.get(0);
                        Integer relatedCabid2 = cabidsBLS.get(1);

                        // 设置 canvasAdd 的 relatedId 和 relatedId2
                        if (relatedCabid1 != null) {
                            canvasAdd.setRelatedId(relatedCabid1);
                        }
                        if (relatedCabid2 != null) {
                            canvasAdd.setRelatedId2(relatedCabid2);
                        }
                    }
                    canvasAdd.setId(null);  
                    // 更新数据并设置时间戳
                    canvasAdd.setData(canvasAdd.toString());  // 根据需要修改此行
                    canvasAdd.setCreatedAt(serverTime.toInstant());
                    canvasAdd.setUpdatedAt(serverTime.toInstant());

                    // 保存 canvasAdd 对象
                    canvasobjectRepository.save(canvasAdd);
                }
               
                
            });
            // 
            //过滤Object的wall，island，doors，windows
            List<Canvasobject> filteredCanvasBaseWall = canvasObjectOld.stream()
                    .filter(canvasObject ->
                            Constants.commons.OBJECT_NAME_WALL.equals(canvasObject.getObjectType())                   )
                    .collect(Collectors.toList());
            float scaleValue = Optional.ofNullable(filteredCanvasBaseWall)
            	    .filter(list -> !list.isEmpty())
            	    .map(list -> list.get(0))
            	    .map(Canvasobject::getScale) // 
            	    .orElse(null); //

            List<Canvasobject> filteredCanvasBaseIsland = canvasObjectOld.stream()
                    .filter(canvasObject ->
                            Constants.commons.ISLAND_TYPE_ISLAND.equals(canvasObject.getObjectType()) ||
                            Constants.commons.ISLAND_TYPE_PENINISULA.equals(canvasObject.getObjectType()))
                    .collect(Collectors.toList());

            for (Cabinet bbcd : BBCDCab) {
            	Canvasobject canvasObject = canvasObjectGenerator.createCabinetObject(bbcd, null, kitchen, filteredCanvasBaseWall, filteredCanvasBaseIsland, scaleValue);
                canvasobjectRepository.save(canvasObject);
            }
            // 删除数据库中不存在的数据
            for (Canvasobject oldObject : toDelete) {
                // 调用数据库操作方法，删除数据
                canvasobjectRepository.delete(oldObject);
            }
            // 删除数据库中不存在的数据
            for (Cabinet oldObject : toDeleteCab) {
                // 调用数据库操作方法，删除数据
                cabinetRepository.delete(oldObject);
            }
        } else {
        	// Upper Cabinet
        	 // 使用Stream API找出新增的元素
            List<Canvasobject> toAdd = filteredCanvasUpperNew.stream()
                    .filter(newObj -> filteredCanvasUpperObjectsOld.stream().noneMatch(oldObj -> oldObj.getId().equals(newObj.getId())))
                    .collect(Collectors.toList());

            // 使用Stream API找出需要删除的元素
            List<Canvasobject> toDelete = filteredCanvasUpperObjectsOld.stream()
                    .filter(oldObj -> filteredCanvasUpperNew.stream().noneMatch(newObj -> oldObj.getId().equals(newObj.getId())))
                    .collect(Collectors.toList());

            // 使用Stream API找出新增的元素
            List<Cabinet> toAddCab = filteredUpperCabinetNew.stream()
                    .filter(newObj -> filteredUpperCabinetOld.stream().noneMatch(oldObj -> oldObj.getId().equals(newObj.getId())))
                    .collect(Collectors.toList());
            // 使用Stream API找出需要删除的元素
            List<Cabinet> toDeleteCab = filteredUpperCabinetOld.stream()
                    .filter(oldObj -> filteredUpperCabinetNew.stream().noneMatch(newObj -> oldObj.getId().equals(newObj.getId())))
                    .collect(Collectors.toList());
            List<Map<String, Object>> relatedIdTList = new ArrayList<>();
            ZonedDateTime serverTime = ZonedDateTime.now(ZoneId.systemDefault());
            List<Cabinet> WBCDCab = new ArrayList<>();
            
            toAddCab.forEach(itemCab -> {
                Integer relatedIdT = itemCab.getId();
                String cornerKey = itemCab.getCornerKey();
                // 处理 BBC/BBCD 和 BLS/BLSD 的逻辑
                if ("WBC".equals(itemCab.getCabinettype()) || "WBCD".equals(itemCab.getCabinettype()) ||
                		"WBCR".equals(itemCab.getCabinettype()) || "WBCRD".equals(itemCab.getCabinettype()) ||	
                		"WBCL".equals(itemCab.getCabinettype()) || "WBCLD".equals(itemCab.getCabinettype()) ||
                        "WLS".equals(itemCab.getCabinettype()) || "WLSD".equals(itemCab.getCabinettype())||
                        "WDC".equals(itemCab.getCabinettype()) || "WDCD".equals(itemCab.getCabinettype())) {             	
                	if ("WBCD".equals(itemCab.getCabinettype()) || "WBCRD".equals(itemCab.getCabinettype()) ||	
                    		 "WBCLD".equals(itemCab.getCabinettype())) {
                		WBCDCab.add(itemCab);
                	}
                    Map<String, Object> result = relatedIdTList.stream()
                		    .filter(cabinet -> Objects.equals(cabinet.get("cornerKey"), cornerKey))
                		    .findFirst()
                		    .orElse(null);                   

                    if (result != null) {
                        // 已经存在，更新已有的记录
                        itemCab.setId(null);
                        itemCab.setCreatedAt(serverTime.toInstant());
                        itemCab.setUpdatedAt(serverTime.toInstant());
                        Cabinet addEntity = cabinetRepository.save(itemCab);

                        // 根据 cabinettype 类型添加对应的 key
                        if ("WBC".equals(itemCab.getCabinettype()) || "WBCD".equals(itemCab.getCabinettype()) ||
                        		"WBCR".equals(itemCab.getCabinettype()) || "WBCRD".equals(itemCab.getCabinettype()) ||	
                        		"WBCL".equals(itemCab.getCabinettype()) || "WBCLD".equals(itemCab.getCabinettype())) {
                            // 如果 cabinettype 是 BBC/BBCD，使用一个列表存储多个 cabid
                            List<Integer> cabidList = (List<Integer>) result.getOrDefault("cabidsWBC", new ArrayList<>());
                            cabidList.add(addEntity.getId());
                            result.put("cabidsWBC", cabidList); // 将新的 cabid 添加到列表中
                        } else if ("WLS".equals(itemCab.getCabinettype()) || "WLSD".equals(itemCab.getCabinettype())) {
                            // 如果 cabinettype 是 BLS/BLSD，使用一个列表存储多个 cabid
                            List<Integer> cabidList = (List<Integer>) result.getOrDefault("cabidsWLS", new ArrayList<>());
                            cabidList.add(addEntity.getId());
                            result.put("cabidsWLS", cabidList); // 将新的 cabid 添加到列表中
                        } else if ("WDC".equals(itemCab.getCabinettype()) || "WDCD".equals(itemCab.getCabinettype())) {
                            // 如果 cabinettype 是 BLS/BLSD，使用一个列表存储多个 cabid
                            List<Integer> cabidList = (List<Integer>) result.getOrDefault("cabidsWDC", new ArrayList<>());
                            cabidList.add(addEntity.getId());
                            result.put("cabidsWDC", cabidList); // 将新的 cabid 添加到列表中
                        }
                        
                    } else {
                        // 不存在 relatedid，创建新记录
                        Map<String, Object> cabinet = new HashMap<>();
                        cabinet.put("cornerKey", cornerKey);
                        cabinet.put("relatedid", relatedIdT);

                        itemCab.setId(null);
                        itemCab.setCreatedAt(serverTime.toInstant());
                        itemCab.setUpdatedAt(serverTime.toInstant());
                        Cabinet addEntity = cabinetRepository.save(itemCab);

                        // 根据 cabinettype 类型添加对应的 key
                        if ("WBC".equals(itemCab.getCabinettype()) || "WBCD".equals(itemCab.getCabinettype()) ||
                        		"WBCR".equals(itemCab.getCabinettype()) || "WBCRD".equals(itemCab.getCabinettype()) ||	
                        		"WBCL".equals(itemCab.getCabinettype()) || "WBCLD".equals(itemCab.getCabinettype())) {
                            List<Integer> cabidList = new ArrayList<>();
                            cabidList.add(addEntity.getId());
                            cabinet.put("cabidsWBC", cabidList); // 创建新的 cabid 列表并添加
                        } else if ("WLS".equals(itemCab.getCabinettype()) || "WLSD".equals(itemCab.getCabinettype())) {
                            List<Integer> cabidList = new ArrayList<>();
                            cabidList.add(addEntity.getId());
                            cabinet.put("cabidsWLS", cabidList); // 创建新的 cabid 列表并添加
                        } else if ("WDC".equals(itemCab.getCabinettype()) || "WDCD".equals(itemCab.getCabinettype())) {
                            List<Integer> cabidList = new ArrayList<>();
                            cabidList.add(addEntity.getId());
                            cabinet.put("cabidsWDC", cabidList); // 创建新的 cabid 列表并添加
                        }
                        
                        // 将新的 cabinet 信息加入相关列表
                        relatedIdTList.add(cabinet);
                    }
                } else {
                    Canvasobject canvasAdd = toAdd.stream()
                            .filter(canvasObject -> canvasObject.getRelatedId().equals(relatedIdT)) // 筛选 relatedId 等于指定 id 的对象
                            .findFirst()
                            .orElse(null); // 如果没找到对象，返回 null
                    itemCab.setId(null);
                    itemCab.setCreatedAt(serverTime.toInstant());
                    itemCab.setUpdatedAt(serverTime.toInstant());
                    itemCab.setKitchenId(kitchenId);
                    Cabinet addEntity = cabinetRepository.save(itemCab);
                    if (canvasAdd != null) {
                    	canvasAdd.setId(null);
                        canvasAdd.setRelatedId(addEntity.getId());
                        canvasAdd.setData(canvasAdd.toString());
                        canvasAdd.setCreatedAt(serverTime.toInstant());
                        canvasAdd.setUpdatedAt(serverTime.toInstant());
                        canvasobjectRepository.save(canvasAdd);
                    }
                }
            });
            relatedIdTList.forEach(relatedIdItem -> {
                Integer relatedid = (Integer) relatedIdItem.get("relatedid");
                Canvasobject canvasAdd = toAdd.stream()
                        .filter(canvasObject -> canvasObject.getRelatedId().equals(relatedid)) // 筛选 relatedId 等于指定 id 的对象
                        .findFirst()
                        .orElse(null); // 如果没找到对象，返回 null

                if (canvasAdd != null) {
                    // 处理 cabidsBBC
                    List<Integer> cabidsWBC = (List<Integer>) relatedIdItem.get("cabidsWBC");
                    if (cabidsWBC != null && cabidsWBC.size() >= 2) {
                        Integer relatedCabid1 = cabidsWBC.get(0);
                        Integer relatedCabid2 = cabidsWBC.get(1);

                        // 设置 canvasAdd 的 relatedId 和 relatedId2
                        if (relatedCabid1 != null) {
                            canvasAdd.setRelatedId(relatedCabid1);
                        }
                        if (relatedCabid2 != null) {
                            canvasAdd.setRelatedId2(relatedCabid2);
                        }
                    }

                    // 处理 cabidsBLS
                    List<Integer> cabidsWLS = (List<Integer>) relatedIdItem.get("cabidsWLS");
                    if (cabidsWLS != null && cabidsWLS.size() >= 2) {
                        Integer relatedCabid1 = cabidsWLS.get(0);
                        Integer relatedCabid2 = cabidsWLS.get(1);

                        // 设置 canvasAdd 的 relatedId 和 relatedId2
                        if (relatedCabid1 != null) {
                            canvasAdd.setRelatedId(relatedCabid1);
                        }
                        if (relatedCabid2 != null) {
                            canvasAdd.setRelatedId2(relatedCabid2);
                        }
                    }
                    // 处理 cabidsBLS
                    List<Integer> cabidsWDC = (List<Integer>) relatedIdItem.get("cabidsWDC");
                    if (cabidsWDC != null && cabidsWDC.size() >= 2) {
                        Integer relatedCabid1 = cabidsWDC.get(0);
                        Integer relatedCabid2 = cabidsWDC.get(1);

                        // 设置 canvasAdd 的 relatedId 和 relatedId2
                        if (relatedCabid1 != null) {
                            canvasAdd.setRelatedId(relatedCabid1);
                        }
                        if (relatedCabid2 != null) {
                            canvasAdd.setRelatedId2(relatedCabid2);
                        }
                    }
                    canvasAdd.setId(null);
                    // 更新数据并设置时间戳
                    canvasAdd.setData(canvasAdd.toString());  // 根据需要修改此行
                    canvasAdd.setCreatedAt(serverTime.toInstant());
                    canvasAdd.setUpdatedAt(serverTime.toInstant());
                    // 保存 canvasAdd 对象
                    canvasobjectRepository.save(canvasAdd);
                }
            });
          //过滤Object的wall，island，doors，windows
            List<Canvasobject> filteredCanvasBaseWall = canvasObjectOld.stream()
                    .filter(canvasObject ->
                            Constants.commons.OBJECT_NAME_WALL.equals(canvasObject.getObjectType())                   )
                    .collect(Collectors.toList());
            float scaleValue = Optional.ofNullable(filteredCanvasBaseWall)
            	    .filter(list -> !list.isEmpty())
            	    .map(list -> list.get(0))
            	    .map(Canvasobject::getScale) // 
            	    .orElse(null); //
            List<Canvasobject> filteredCanvasBaseIsland = canvasObjectOld.stream()
                    .filter(canvasObject ->
                            Constants.commons.ISLAND_TYPE_ISLAND.equals(canvasObject.getObjectType()) ||
                            Constants.commons.ISLAND_TYPE_PENINISULA.equals(canvasObject.getObjectType()))
                    .collect(Collectors.toList());
            
            for (Cabinet wbcd : WBCDCab) {
            	Canvasobject canvasObject = canvasObjectGenerator.createCabinetObject(wbcd, null, kitchen, filteredCanvasBaseWall, filteredCanvasBaseIsland, scaleValue);
                canvasobjectRepository.save(canvasObject);
            }
            // 删除数据库中不存在的数据
            for (Canvasobject oldObject : toDelete) {
                // 调用数据库操作方法，删除数据
                canvasobjectRepository.delete(oldObject);
            }
            // 删除数据库中不存在的数据
            for (Cabinet oldObject : toDeleteCab) {
                // 调用数据库操作方法，删除数据
                cabinetRepository.delete(oldObject);
            }
        }
       
        // 筛选出 updateflg 等于 1 的项目
        List<CanvasobjectDto> updatedItems = cabinetObjectDtoList.stream()
                .filter(dto -> dto.getUpdateFlg() == 1) // 筛选条件
                .collect(Collectors.toList());

        List<CabinetDto> updatedCabItems = cabinetDtoList.stream()
                .filter(dto -> dto.getUpdateFlg() == 1) // 筛选条件
                .collect(Collectors.toList());
        
        ZonedDateTime serverTime = ZonedDateTime.now(ZoneId.systemDefault());    
        // 取得需要更新的对象
        // 遍历筛选后的列表并更新到数据库
        updatedCabItems.forEach(dto -> {
            // 从数据库中获取现有实体
            Cabinet existingEntity = cabinetRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Entity not found with id: " + dto.getId()));
            // 更新需要的字段
            existingEntity.setCabinettype(dto.getCabinettype());
            existingEntity.setName(dto.getName());
            existingEntity.setWidth(dto.getWidth());
            // 获取当前服务器时区的时间

            existingEntity.setUpdatedAt(serverTime.toInstant());
            // 保存更新后的实体
            cabinetRepository.save(existingEntity);
        });
        updatedItems.forEach(dto -> {
            // 从数据库中获取现有实体
            Canvasobject existingEntity = canvasobjectRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Entity not found with id: " + dto.getId()));
            // 更新需要的字段
            existingEntity.setCabinettype(dto.getCabinettype());
            existingEntity.setObjectname(dto.getObjectname());
            existingEntity.setWidth(dto.getWidth());
            existingEntity.setWidthcabinet(dto.getWidthcabinet());
            existingEntity.setHeightcabinet(dto.getHeightcabinet());
            existingEntity.setDepthcabinet(dto.getDepthcabinet());
            existingEntity.setX(dto.getX());
            existingEntity.setY(dto.getY());

            existingEntity.setUpdatedAt(serverTime.toInstant());
            // 保存更新后的实体
            canvasobjectRepository.save(existingEntity);
        });
        
     // 筛选出 updateflg 等于 1 的项目
        List<CanvasobjectDto> movedItems = cabinetObjectDtoList.stream()
                .filter(dto -> dto.getUpdateFlg() == 2) // 筛选条件
                .collect(Collectors.toList());

        List<CabinetDto> movedCabItems = cabinetDtoList.stream()
                .filter(dto -> dto.getUpdateFlg() == 2) // 筛选条件
                .collect(Collectors.toList());
        // 遍历筛选后的列表并更新到数据库
        movedCabItems.forEach(dto -> {
            // 从数据库中获取现有实体
            Cabinet existingEntity = cabinetRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Entity not found with id: " + dto.getId()));
            // 更新需要的字段
//            existingEntity.setCabinettype(dto.getCabinettype());
//            existingEntity.setName(dto.getName());
            existingEntity.setStartposition(dto.getStartposition());
            existingEntity.setWidth(dto.getWidth());            
            existingEntity.setHeight(dto.getHeight());
            existingEntity.setDepth(dto.getDepth());
//            existingEntity.setRotation(dto.getRotation());
            // 获取当前服务器时区的时间
            existingEntity.setUpdatedAt(serverTime.toInstant());
            // 保存更新后的实体
            cabinetRepository.save(existingEntity);
        });
        movedItems.forEach(dto -> {
            // 从数据库中获取现有实体
            Canvasobject existingEntity = canvasobjectRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Entity not found with id: " + dto.getId()));
            // 更新需要的字段
//            existingEntity.setCabinettype(dto.getCabinettype());
//            existingEntity.setObjectname(dto.getObjectname());
            existingEntity.setX(dto.getX());
            existingEntity.setY(dto.getY());
            existingEntity.setWidth(dto.getWidth());
            existingEntity.setHeight(dto.getHeight());
            existingEntity.setDepth(dto.getDepth());
            existingEntity.setWidthcabinet(dto.getWidthcabinet());            
            existingEntity.setHeightcabinet(dto.getHeightcabinet());
            existingEntity.setDepthcabinet(dto.getDepthcabinet());
            existingEntity.setUpdatedAt(serverTime.toInstant());
            // 保存更新后的实体
            canvasobjectRepository.save(existingEntity);
        });
        
        
        
        // DB里面的data
        List<Canvasobject> canvasObjectUpdate = canvasobjectRepository.findByKitchenId(kitchenId);
        List<Cabinet> cabinetListUpdate = cabinetRepository.findByKitchenId(kitchenId);
//        List<Canvasobject> filteredList = null;
//        if (canvasId == 1) {
//        	filteredList = canvasObjectUpdate.stream()
//                    .filter(obj -> !"upper".equals(obj.getObjectType()))
//                    .collect(Collectors.toList());
//        } else {
//        	filteredList = canvasObjectUpdate.stream()
//                    .filter(canvasObject ->
//                            Constants.commons.OBJECT_NAME_WALL.equals(canvasObject.getObjectType()) ||
//                                    Constants.commons.OBJECT_TYPE_WINDOW.equals(canvasObject.getObjectType()) ||
//                                    Constants.commons.OBJECT_TYPE_DOOR.equals(canvasObject.getObjectType()) ||
//                                    Constants.commons.ISLAND_TYPE_ISLAND.equals(canvasObject.getObjectType()) ||
//                                    Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(canvasObject.getObjectType()) ||
//                                    Constants.commons.APPLIANCES_NAME_HOOD.equals(canvasObject.getObjectType()) || 
//                                    Constants.commons.CANBINET_TYPE_UPPER.equals(canvasObject.getObjectType())
//                    )
//                    .collect(Collectors.toList());                           
//                            
//        }

        List<CabinetDto> cabinetDtoUpdate = transformCabinetToDto(cabinetListUpdate);
        List<CanvasobjectDto> canvasObjectDTOUpdate = transformToDto(canvasObjectUpdate);

        CanvasData ret = new CanvasData(kitchenId, canvasId, canvasObjectDTOUpdate, cabinetDtoUpdate);
        return ret;
    }

    public List<Map<String, Object>> searchKitchenResult(String kitchenSearch)  {
        logger.info("searchKitchenResult kitchenSearch:" + kitchenSearch);
        List<Kitchen> kitchenList = kitchenRepository.findByKitchenNameLike(kitchenSearch);
        List<Map<String, Object>> resultList = new ArrayList<>(); // 用于存放最终的结果
        for (Kitchen kitchen : kitchenList) {
            Map<String, Object> kitchenData = new HashMap<>();
            kitchenData.put("kitchenId", kitchen.getId()); // 将 kitchenId 放入 Map
            kitchenData.put("kitchenName", kitchen.getKitchenName()); // 将 kitchenName 放入 Map

            resultList.add(kitchenData); // 将 Map 添加到 List 中
        }

        return resultList;
    }

    public KitchenDto getKitchenInfo(Integer kitchenId)  {
        logger.info("getKitchenInfo kitchenId:" + kitchenId);
        // 取得厨房信息
        Kitchen kitchen = getKitchenById(kitchenId);
        // 取得墙体信息
        List<Wall> wallList  = getAllKitchenWallById(kitchenId);
        // 取得岛台信息
        Island island  = getKitchenIslandById(kitchenId);
        // 取得窗户信息
        List<Window> windowList  = getAllKitchenWindowById(kitchenId);
        // 取得门信息
        List<Door> doorList  = getAllKitchenDoorById(kitchenId);
        // 取得电器信息
        List<Appliance> applianceList  = getAllKitchenApplianceById(kitchenId);
   
        KitchenDto ret =  new KitchenDto(kitchenId, kitchen.getKitchenName(), kitchen, wallList, island, windowList, doorList, applianceList);
        return ret;
    }

    public List<ItemListDto> getKitchenItemList(Integer kitchenId)  {
        logger.info("getKitchenItemList kitchenId:" + kitchenId);
        List<Object[]> results = cabinetRepository.findCabinetsByKitchenId(kitchenId);
        
        List<ItemListDto> summaries = results.stream().map(row -> {
            String name = (String) row[0];
            String construction = (String) row[1];
            Long count = ((Number) row[2]).longValue();
            float price = ((Number) row[3]).floatValue();
            float defaultValue = ((Number) row[4]).floatValue();
            
            // 使用适当的构造函数创建ItemListDto对象
            ItemListDto dto = new ItemListDto(name, construction, count, price, defaultValue);
            return dto;
        }).collect(Collectors.toList());
        
        // 计算 sumPrice
        for (ItemListDto item : summaries) {
            float sumPrice = item.getQty() * item.getPrice();
            item.setSum(sumPrice);
        }
        return summaries;
    }
    
    public List<ItemListCsvDto> getKitchenItemListCSV(Integer kitchenId, String po)  {
        logger.info("getKitchenItemList kitchenId:" + kitchenId);
        List<Object[]> results = cabinetRepository.findCabProductionByKitchenId(kitchenId);
        
        List<ItemListCsvDto> itemListCsv = results.stream().map(row -> {
            
            String cabName = (String) row[0];
            String seriesCode = (String) row[1];
            String seriesColor = (String) row[2];
            String id = row[3] == null ? "" : row[3].toString();
//            String po = "test";  // PO#
            String customer = (String) row[4];
            Long quantity = (Long) row[5];
            
            // 使用适当的构造函数创建ItemListDto对象
            ItemListCsvDto dto = new ItemListCsvDto(
            		id, po, customer, cabName, seriesColor, seriesCode, quantity);
            return dto;
        }).collect(Collectors.toList());
       
        return itemListCsv;
    }

    /**
     * 更新 Kitchen 的 notes 字段
     * @param kitchenId Kitchen ID
     * @param notes Notes 内容
     * @return 更新是否成功
     */
    public boolean updateKitchenNotes(Integer kitchenId, String notes) {
        try {
            logger.info("Updating notes for kitchenId: {}, notes: {}", kitchenId, notes);

            // 从数据库加载 Kitchen 记录
            Optional<Kitchen> kitchenOptional = kitchenRepository.findById(kitchenId);

            if (kitchenOptional.isEmpty()) {
                logger.error("Kitchen not found with id: {}", kitchenId);
                return false;
            }

            Kitchen kitchen = kitchenOptional.get();

            // 更新 notes 字段
            kitchen.setNotes(notes);
            kitchen.setUpdatedAt(Instant.now());

            // 保存到数据库
            kitchenRepository.save(kitchen);

            logger.info("Successfully updated notes for kitchenId: {}", kitchenId);
            return true;

        } catch (Exception e) {
            logger.error("Error updating notes for kitchenId: {}", kitchenId, e);
            return false;
        }
    }
}


