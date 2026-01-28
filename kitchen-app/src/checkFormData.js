const checkFormData = (data) => {
  // 判断两个 item 是否交叉
  function isOverlap(a, b) {
    const startA = a.position;
    const endA = a.position + a.width;
    const startB = b.position;
    const endB = b.position + b.width;
    return !(endA <= startB || endB <= startA);
  }
  // 生成 valueKey（你原本的逻辑保留）
  function getValueKey(item, wallIndex) {
    if (item.type.includes('.')) {
      return `${item.type}.position`;
    } else if (item.type.includes('applianceObject')) {
      return `${item.type}Position`;
    } else {
      return `${item.type}.position`;
    }
  }
  // 检查一个数组内部是否有交叉
  function checkWithin(items, wallIndex) {
    const sorted = [...items].sort((a, b) => a.position - b.position);
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (isOverlap(current, next)) {
        return {
          isValid: false,
          message: `${current.name || current.type} and ${next.name || next.type} overlap on Wall ${wallIndex + 1}`,
          valueKey1: getValueKey(current, wallIndex),
          valueKey2: getValueKey(next, wallIndex),
        };
      }
    }
    return { isValid: true };
  }
  // 检查两个数组之间是否有交叉
  function checkBetween(arr1, arr2, wallIndex) {
    for (let i = 0; i < arr1.length; i++) {
      for (let j = 0; j < arr2.length; j++) {
        if (isOverlap(arr1[i], arr2[j])) {
          return {
            isValid: false,
            message: `${arr1[i].name || arr1[i].type} and ${arr2[j].name || arr2[j].type} overlap on Wall ${wallIndex + 1}`,
            valueKey1: getValueKey(arr1[i], wallIndex),
            valueKey2: getValueKey(arr2[j], wallIndex),
          };
        }
      }
    }
    return { isValid: true };
  }

  // 总检查逻辑
  function checkAllWalls(validItems, validItemsWindow, validItemsDishwasher, validItemsRange, validItemsHood) {
    for (let wallIndex = 0; wallIndex < validItems.length; wallIndex++) {

      const items = validItems[wallIndex] || [];
      const windows = validItemsWindow[wallIndex] || [];
      const dishwasher = validItemsDishwasher[wallIndex] || [];
      const ranges = validItemsRange[wallIndex] || [];
      const hoods = validItemsHood[wallIndex] || [];

      // 1. 各个组内部检查
      let result = checkWithin(items, wallIndex);
      if (!result.isValid) return { wallIndex, ...result };
      result = checkWithin(windows, wallIndex);
      if (!result.isValid) return { wallIndex, ...result };
      result = checkWithin(dishwasher, wallIndex);
      if (!result.isValid) return { wallIndex, ...result };
      result = checkWithin(ranges, wallIndex);
      if (!result.isValid) return { wallIndex, ...result };
      result = checkWithin(hoods, wallIndex);
      if (!result.isValid) return { wallIndex, ...result };

      // 2. 需要做的 "between 检查" 配置
      const checks = [
        [items, windows],      // Door/Ref vs Window (Rules 1, 2, 3)
        [items, dishwasher],   // Door/Ref vs Dishwasher (Rules 1, 3, 5)
        [items, ranges],       // Door/Ref vs Range (Rules 1, 3, 4)
        [items, hoods],        // Door/Ref vs Hood (Rules 1, 3, 6)
        [windows, hoods],      // Window vs Hood (Rules 2, 6)
        [dishwasher, ranges],  // Dishwasher vs Range (Rules 4, 5)
        // 注意：
        // 1. Windows vs Dishwasher/Range 可以重叠 (不在 Rule 2 中)
        // 2. Ranges vs Hoods 可以重叠 (不在 Rule 4/6 中)
        // 3. Dishwasher vs Hoods 可以重叠 (不在 Rule 5/6 中)
      ];

      // 统一执行检查
      for (const [a, b] of checks) {
        result = checkBetween(a, b, wallIndex);
        if (!result.isValid) return { wallIndex, ...result };
      }
    }
    return { isValid: true };
  }
  function checkOverlapForWall(items, wallIndex) {
    // 按 position 排序
    const sorted = [...items].sort((a, b) => a.position - b.position);

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.position + current.width > next.position) {
        let valueKey1 = '';
        let valueKey2 = '';
        if (current.type.includes('applianceObject')) {
          valueKey1 = `${current.type}.width`;
        } else {
          valueKey1 = `${current.type}.width`;
        }
        if (next.type.includes('applianceObject')) {
          valueKey2 = `${next.type}.width`;
        } else {
          valueKey2 = `${next.type}.width`;
        }
        return {
          isValid: false,
          message: ` ${current.name || current.type} and ${next.name || next.type} have overlapping positions on Wall ${wallIndex + 1}.`,
          valueKey1: valueKey1,
          valueKey2: valueKey2,
        };


      }
    }
    return { isValid: true };
  }

  function checkAllWallsOld(validItems) {
    for (let wallIndex = 0; wallIndex < validItems.length; wallIndex++) {
      const result = checkOverlapForWall(validItems[wallIndex] || [], wallIndex);
      if (!result.isValid) {
        return { wallIndex, ...result };
      }
    }
    return { isValid: true };
  }
  const getApplianceWallIndex = (appliance) => {
    // Check which appliance this is and return its wall index
    return appliance === 'one' ? 0 :
      appliance === 'two' ? 1 :
        appliance === 'three' ? 2 : 3;
  };
  function checkCornerProximity(shapeType, wallIndex, positionValue, widthValue, wallWidth, isLowerCabinetPlaced,
    applianceKey, errors) {
    // 定义错误信息
    const message = `${applianceKey} on Wall is too close to the corner. Please position it at least 24 inches away from the corner.`;

    // L 型厨房的邻接关系
    const LRules = [
      { wall: 0, neighbor: 1, condition: (pos, width, wallW) => pos + width > wallW - 24 },
      { wall: 1, neighbor: 0, condition: (pos) => pos < 24 },
    ];

    // U 型厨房的邻接关系
    const URules = [
      { wall: 0, neighbor: 1, condition: (pos, width, wallW) => pos + width > wallW - 24 },
      { wall: 1, neighbor: 0, condition: (pos) => pos < 24 },
      { wall: 1, neighbor: 2, condition: (pos, width, wallW) => pos + width > wallW - 24 },
      { wall: 2, neighbor: 1, condition: (pos) => pos < 24 },
    ];

    // 根据形状选择规则集
    const rules = shapeType === 'L' ? LRules : shapeType === 'U' ? URules : [];

    // 遍历规则，检查条件
    for (const rule of rules) {
      if (rule.wall === wallIndex && isLowerCabinetPlaced[rule.neighbor]) {
        if (rule.condition(positionValue, widthValue, wallWidth)) {
          errors[`applianceObject.${applianceKey}Position`] = {
            type: "cornerProximity",
            message,
          };
        }
      }
    }
  }

  function cleanupErrors(obj) {
    if (typeof obj !== "object" || obj === null) return obj;
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      const cleaned = cleanupErrors(obj[key]);
      if (
        cleaned && // 不为 null/undefined/false
        (typeof cleaned !== "object" || Object.keys(cleaned).length > 0) // 非空对象
      ) {
        newObj[key] = cleaned;
      }
    });
    return newObj;
  }
  const errors = {};
  const kitchenObject = data.kitchenObject;

  // kitchenObject.kitchenName validation
  if (!kitchenObject?.kitchenName?.trim()) {
    errors["kitchenObject.kitchenName"] = {
      type: "required",
      message: "Kitchen Name is required.",
    };
  }

  let valueToCheck = kitchenObject.ceilingHeight;
  let shapeType = kitchenObject.shapeType;
  const wallMap = {
    'I': { visibility: [true, false, false, false] },
    'II': { visibility: [true, true, false, false] },
    'L': { visibility: [true, true, false, false] },
    'U': { visibility: [true, true, true, false] },
    'O': { visibility: [true, true, true, true] },
    'S': { visibility: [false, false, false, false] },
  };
  const wallObjectVisibility = wallMap[shapeType]?.visibility;

  // kitchenObject.ceilingHeight
  if (!errors.kitchenObject) errors.kitchenObject = {};

  if (!data.kitchenObject.ceilingHeight) {
    errors["kitchenObject.ceilingHeight"] = {
      type: "required",
      message: "Kitchen ceilingHeight is required.",
    };
  } else if (isNaN(valueToCheck)) {
    errors["kitchenObject.ceilingHeight"] = {
      type: "typeError",
      message: "Please enter a numerical value for Kitchen ceilingHeight.",
    };
  } else if (valueToCheck === 0) {
    errors["kitchenObject.ceilingHeight"] = {
      type: "notZero",
      message: "Kitchen ceilingHeight cannot be 0.",
    };
  } else if (valueToCheck < 80) {
    errors["kitchenObject.ceilingHeight"] = {
      type: "min",
      message: "Kitchen ceilingHeight cannot be less than 80.",
    };
  }
  // wallObjects.${index}.width
  // 遍历 wallObjects 验证每个 width
  let isLowerCabinetPlacedFlag = false;
  let isUpperCabinetPlacedFlag = false;

  if (Array.isArray(data.wallObjects)) {
    data.wallObjects.forEach((wall, index) => {
      const widthValue = Number(wall.width);
      let wallVisibilityValues = wallObjectVisibility?.[index];
      if (wallVisibilityValues === true && !wall.width) {
        if (!errors.wallObjects) errors.wallObjects = {};
        if (!errors.wallObjects[index]) errors.wallObjects[index] = {};
        errors.wallObjects[index].width = {
          type: "required",
          message: `The width of the wall ${index + 1} cannot be empty or zero.`,
        };
      } else if (wall.visibility === true && isNaN(widthValue)) {
        if (!errors.wallObjects) errors.wallObjects = {};
        if (!errors.wallObjects[index]) errors.wallObjects[index] = {};
        errors.wallObjects[index].width = {
          type: "typeError",
          message: `The width of the wall ${index + 1} must be a number.`,
        };
      } else if (wall.visibility === true && widthValue === 0) {
        if (!errors.wallObjects) errors.wallObjects = {};
        if (!errors.wallObjects[index]) errors.wallObjects[index] = {};
        errors.wallObjects[index].width = {
          type: "notZero",
          message: `The width of the wall ${index + 1} cannot be 0.`,
        };
      }
      if (wall.visibility === true && wall.isLowerCabinetPlaced === true) {
        isLowerCabinetPlacedFlag = true;
      }
      if (wall.visibility === true && wall.isUpperCabinetPlaced === true) {
        isUpperCabinetPlacedFlag = true;
      }
    });
  }

  if (kitchenObject.construction1 === "" && isUpperCabinetPlacedFlag) {
    errors[`kitchenObject.construction1`] = {
      type: "typeError",
      message: `Upper Cabinet Style cannot be empty .`,
    };
  }

  if (kitchenObject.construction2 === "" && isLowerCabinetPlacedFlag) {
    errors[`kitchenObject.construction2`] = {
      type: "typeError",
      message: `Lower Cabinet Style cannot be empty .`,
    };
  }
  const wallCount = data.wallObjects?.length || 0;
  const validItemsWindow = Array.from({ length: wallCount }, () => []);
  const validItemsDoor = Array.from({ length: wallCount }, () => []);
  const validItemsDishwasher = Array.from({ length: wallCount }, () => []);
  const validItemsRef = Array.from({ length: wallCount }, () => []);
  const validItemsRange = Array.from({ length: wallCount }, () => []);
  const validItemsHood = Array.from({ length: wallCount }, () => []);

  // 收集所有有效的门和窗户用于重叠检查
  // 遍历 windowObjects 验证每个 width/height/position    
  // 遍历 windowObjects 验证每个 width/height/position    
  if (Array.isArray(data.windowObjects)) {
    data.windowObjects.forEach((window, index) => {
      const wallIndex = getApplianceWallIndex(window.wallId);
      const isWallVisible = wallObjectVisibility?.[wallIndex];

      if (!errors.windowObjects) errors.windowObjects = {};
      if (!errors.windowObjects[index]) errors.windowObjects[index] = {};

      if (window.hasWindow === true && !isWallVisible) {
        errors.windowObjects[index].wallId = {
          type: "orphanedItem",
          message: `Wall ${wallIndex + 1} is hidden. Please move or delete this Window.`,
        };
        return; // Skip further checks for this window
      }
      const widthValue = parseFloat(window.width || 0);
      const heightValue = parseFloat(window.height || 0);
      const windowPosition = parseFloat(window.position || 0);

      if (!errors.windowObjects) errors.windowObjects = {};
      if (!errors.windowObjects[index]) errors.windowObjects[index] = {};

      if (window.hasWindow === true && !heightValue) {
        errors.windowObjects[index].height = { type: "required", message: "Height is required" };
      } else if (window.hasWindow === true && isNaN(heightValue)) {
        errors.windowObjects[index].height = { type: "typeError", message: `The height of the window must be a number.` };
      } else if (window.hasWindow === true && heightValue === 0) {
        errors.windowObjects[index].height = { type: "notZero", message: `The height of the window cannot be zero.` };
      }

      if (window.hasWindow === true && !windowPosition) {
        errors.windowObjects[index].position = { type: "required", message: "Position is required" };
      } else if (window.hasWindow === true && isNaN(windowPosition)) {
        errors.windowObjects[index].position = { type: "typeError", message: `The distance of the window must be a number.` };
      } else if (window.hasWindow === true && windowPosition === 0) {
        errors.windowObjects[index].position = { type: "notZero", message: `The distance from side cannot be zero.` };
      }

      if (window.hasWindow === true && !widthValue) {
        errors.windowObjects[index].width = { type: "required", message: "Width is required" };
      } else if (window.hasWindow === true && isNaN(widthValue)) {
        errors.windowObjects[index].width = { type: "typeError", message: `The width of the window must be a number.` };
      } else if (window.hasWindow === true && widthValue === 0) {
        errors.windowObjects[index].width = { type: "notZero", message: "Width is required" };
      } else if (window.hasWindow === true) {
        // 检查是否超出墙体范围
        const wallWidth = data?.wallObjects?.[wallIndex]?.width;
        if (wallWidth && (windowPosition + widthValue > wallWidth)) {
          errors.windowObjects[index].width = {
            type: "boundaryError",
            message: `Window extends beyond wall boundary (Wall width: ${wallWidth} inches).`,
          };
        }
        if (!validItemsWindow[wallIndex]) {
          validItemsWindow[wallIndex] = [];
        }
        validItemsWindow[wallIndex].push({ type: `windowObjects.${index}`, name: `Window ${index + 1}`, position: windowPosition, width: widthValue });
      }
    });
  }

  // 遍历 doorObjects 验证每个 width/height/position    
  if (Array.isArray(data.doorObjects)) {
    data.doorObjects.forEach((door, index) => {
      const wallIndex = getApplianceWallIndex(door.wallId);
      const isWallVisible = wallObjectVisibility?.[wallIndex];

      if (!errors.doorObjects) errors.doorObjects = {};
      if (!errors.doorObjects[index]) errors.doorObjects[index] = {};

      if (door.hasDoor === true && !isWallVisible) {
        errors.doorObjects[index].wallId = {
          type: "orphanedItem",
          message: `Wall ${wallIndex + 1} is hidden. Please move or delete this Door.`,
        };
        return; // Skip further checks for this door
      }
      const widthValue = parseFloat(door.width || 0);
      const heightValue = parseFloat(door.height || 0);
      const positionValue = parseFloat(door.position || 0);

      if (!errors.doorObjects) errors.doorObjects = {};
      if (!errors.doorObjects[index]) errors.doorObjects[index] = {};

      if (door.hasDoor === true && !heightValue) {
        errors.doorObjects[index].height = { type: "required", message: "Height is required" };
      } else if (door.hasDoor === true && isNaN(heightValue)) {
        errors.doorObjects[index].height = { type: "typeError", message: `The height of the door must be a number.` };
      } else if (door.hasDoor === true && heightValue === 0) {
        errors.doorObjects[index].height = { type: "notZero", message: `The height of the door cannot be empty or zero.` };
      }
      if (door.hasDoor === true && !positionValue) {
        errors.doorObjects[index].position = { type: "required", message: "Position is required" };
      } else if (door.hasDoor === true && isNaN(positionValue)) {
        errors.doorObjects[index].position = { type: "typeError", message: `The distance of the door must be a number.` };
      } else if (door.hasDoor === true && positionValue === 0) {
        errors.doorObjects[index].position = { type: "notZero", message: `The distance from side cannot be empty or zero.` };
      }

      if (door.hasDoor === true && !widthValue) {
        errors.doorObjects[index].width = { type: "required", message: "Width is required" };
      } else if (door.hasDoor === true && isNaN(widthValue)) {
        errors.doorObjects[index].width = { type: "typeError", message: `The width of the door must be a number.` };
      } else if (door.hasDoor === true && widthValue === 0) {
        errors.doorObjects[index].width = { type: "notZero", message: "Width is required" };
      } else if (door.hasDoor === true) {
        // 检查墙体范围
        const wallWidth = data?.wallObjects?.[wallIndex]?.width;
        if (wallWidth && (positionValue + widthValue > wallWidth)) {
          errors.doorObjects[index].width = {
            type: "boundaryError",
            message: `Door extends beyond wall boundary (Wall width: ${wallWidth} inches).`,
          };
        }
        if (!validItemsDoor[wallIndex]) {
          validItemsDoor[wallIndex] = [];
        }
        validItemsDoor[wallIndex].push({ type: `doorObjects.${index}`, name: `Door ${index + 1}`, position: positionValue, width: widthValue });
      }
    });
  }

  // island width check
  if (data.islandObject.islandKind === "island") {
    const widthValue = Number(data.islandObject.width);
    const lengthValue = Number(data.islandObject.length);
    if (widthValue === 0) {
      errors[`islandObject.width`] = {
        type: "notZero",
        message: `The width of the island cannot be empty or zero.`,
      };
    }
    if (lengthValue === 0) {
      errors[`islandObject.length`] = {
        type: "notZero",
        message: `The depth of the island cannot be empty or zero.`,
      };
    }
    if (kitchenObject.construction3 === "") {
      errors[`kitchenObject.construction3`] = {
        type: "typeError",
        message: `Island Cabinet Style cannot be empty .`,
      };
    }

    if (shapeType === 'U') {
      if (data.wallObjects[1] &&
        data.wallObjects[1].width !== undefined) {
        // 48: 两侧柜子深度，40: 过道宽度
        let spacewidth = data.wallObjects[1].width - data.islandObject.width - 48 - 40;
        let spacewidth2 = data.wallObjects[1].width - data.islandObject.length - 48 - 40;
        if (spacewidth < 0 && spacewidth2 < 0) {
          errors[`islandObject.width`] = {
            type: "typeError",
            message: `The island width is too wide for the current kitchen space. Please reduce its size or remove it.`,
          };
        }
      }
    }

  }
  // Validation for 'peninsula' 
  if (data.islandObject.islandKind === "peninsula") {
    const widthValue = Number(data.islandObject.width);
    const lengthValue = Number(data.islandObject.length);
    if (widthValue === 0) {
      errors[`islandObject.width`] = {
        type: "notZero",
        message: `The width of the peninsula cannot be empty or zero.`,
      };
    }
    if (lengthValue === 0) {
      errors[`islandObject.length`] = {
        type: "notZero",
        message: `The depth of the peninsula cannot be empty or zero.`,
      };
    }
    if (kitchenObject.construction3 === "") {
      errors[`kitchenObject.construction3`] = {
        type: "typeError",
        message: `Cabinet Finish cannot be empty.`,
      };
    }
    if (!data.islandObject.peninsulaisadjacentto) {
      errors[`islandObject.peninsulaisadjacentto`] = {
        type: "required",
        message: `Please select which wall the peninsula is connected to.`,
      };
    } else {
      const adjWall = data.islandObject.peninsulaisadjacentto;
      const wallIndex = adjWall === "one" ? 0 : adjWall === "two" ? 1 : adjWall === "three" ? 2 : 3;
      const isWallVisible =
        (shapeType === "I" && wallIndex === 0) ||
        (shapeType === "L" && (wallIndex === 0 || wallIndex === 1)) ||
        (shapeType === "U" && (wallIndex === 0 || wallIndex === 1 || wallIndex === 2)) ||
        (shapeType === "O" && (wallIndex === 0 || wallIndex === 1 || wallIndex === 2 || wallIndex === 3));

      if (!isWallVisible) {
        errors[`islandObject.peninsulaisadjacentto`] = {
          type: "orphanedItem",
          message: `Wall ${wallIndex + 1} is hidden. Please move or delete this peninsula.`,
        };
      }
    }

    if (shapeType === 'U') {
      if (parseFloat(data.islandObject.width) > data.wallObjects[1].width - 24) {
        errors[`islandObject.width`] = {
          type: "typeError",
          message: `The width of the peninsula width cannot exceed width of wall. Please reduce its size.`,
        };
      }
    }
  }
  //
  // appliance
  const applianceKindCounters = {};
  (data.applianceObject || []).forEach((app, index) => {
    const positionValue = parseFloat(app.position || 0);
    const widthValue = parseFloat(app.width || 0);
    const heightValue = parseFloat(app.height || 0);

    const kind = app.appliancekind || 'Appliance';
    applianceKindCounters[kind] = (applianceKindCounters[kind] || 0) + 1;
    const friendlyName = `${kind} ${applianceKindCounters[kind]}`;

    if (isNaN(widthValue)) {
      if (!errors.applianceObject) errors.applianceObject = {};
      if (!errors.applianceObject[index]) errors.applianceObject[index] = {};
      errors.applianceObject[index].width = {
        type: "typeError",
        message: `The width of the ${app.appliancekind} must be a number.`,
      };
    }
    if (isNaN(positionValue)) {
      if (!errors.applianceObject) errors.applianceObject = {};
      if (!errors.applianceObject[index]) errors.applianceObject[index] = {};
      errors.applianceObject[index].position = {
        type: "typeError",
        message: `The position of the ${app.appliancekind} must be a number.`,
      };
    }
    if (widthValue === 0) {
      if (!errors.applianceObject) errors.applianceObject = {};
      if (!errors.applianceObject[index]) errors.applianceObject[index] = {};
      errors.applianceObject[index].width = {
        type: "notZero",
        message: `The width of the ${app.appliancekind} cannot be empty or zero.`,
      };
    }
    if (app.appliancekind === 'Hood' && isNaN(heightValue)) {
      if (!errors.applianceObject) errors.applianceObject = {};
      if (!errors.applianceObject[index]) errors.applianceObject[index] = {};
      errors.applianceObject[index].height = {
        type: "typeError",
        message: `The height of the ${app.appliancekind} must be a number.`,
      };
    }
    if (app.appliancekind === 'Hood' && heightValue === 0) {
      if (!errors.applianceObject) errors.applianceObject = {};
      if (!errors.applianceObject[index]) errors.applianceObject[index] = {};
      errors.applianceObject[index].height = {
        type: "notZero",
        message: `The height of the ${app.appliancekind} cannot be empty or zero.`,
      };
    }
    if (!app.wallId || app.wallId === '') {
      if (!errors.applianceObject) errors.applianceObject = {};
      if (!errors.applianceObject[index]) errors.applianceObject[index] = {};
      errors.applianceObject[index].wallId = {
        type: "required",
        message: `Please select where the ${app.appliancekind} is located (Wall or Island).`,
      };
    } else if (app.wallId === 'island') {
      const isIslandVisible = data.islandObject.islandKind && data.islandObject.islandKind !== 'none';
      if (!isIslandVisible) {
        if (!errors.applianceObject) errors.applianceObject = {};
        if (!errors.applianceObject[index]) errors.applianceObject[index] = {};
        errors.applianceObject[index].wallId = {
          type: "orphanedItem",
          message: `The Island/Peninsula is hidden. Please move or delete this ${app.appliancekind}.`,
        };
      } else if (app.appliancekind !== 'Dishwasher' && app.appliancekind !== 'Range') {
        // Check if appliance is allowed on island
        if (app.appliancekind !== 'Dishwasher' && app.appliancekind !== 'Range') {
          if (!errors.applianceObject) errors.applianceObject = {};
          if (!errors.applianceObject[index]) errors.applianceObject[index] = {};
          errors.applianceObject[index].wallId = {
            type: "invalidPlacement",
            message: `Only Dishwasher and Range can be placed on the Island/Peninsula.`,
          };
        }
      }
    } else {
      const wallIndex = getApplianceWallIndex(app.wallId);
      const isWallVisible = wallObjectVisibility?.[wallIndex];

      if (!errors.applianceObject) errors.applianceObject = {};
      if (!errors.applianceObject[index]) errors.applianceObject[index] = {};

      if (!isWallVisible) {
        errors.applianceObject[index].wallId = {
          type: "orphanedItem",
          message: `Wall ${wallIndex + 1} is hidden. Please move or delete this ${app.appliancekind}.`,
        };
        return; // Skip further checks
      }

      const wallWidth = data.wallObjects[wallIndex]?.width;

      if (wallWidth && positionValue + widthValue > wallWidth) {
        if (!errors.applianceObject) errors.applianceObject = {};
        if (!errors.applianceObject[index]) errors.applianceObject[index] = {};
        errors.applianceObject[index].position = {
          type: "boundaryError",
          message: `${app.appliancekind} extends beyond wall boundary (Wall width: ${wallWidth} inches).`,
        };
      } else {
        // Corner proximity check
        let shapeTypT = data.kitchenObject.shapeType;
        const isLowerCabinetPlacedT = data?.wallObjects?.map(wall => wall?.isLowerCabinetPlaced) || [];

        // Custom version of checkCornerProximity for array indices
        const cornerMessage = `${app.appliancekind} is too close to the corner.Please position it at least 24 inches away.`;
        const LRules = [
          { wall: 0, neighbor: 1, condition: (pos, width, wallW) => pos + width > wallW - 24 },
          { wall: 1, neighbor: 0, condition: (pos) => pos < 24 },
        ];
        const URules = [
          { wall: 0, neighbor: 1, condition: (pos, width, wallW) => pos + width > wallW - 24 },
          { wall: 1, neighbor: 0, condition: (pos) => pos < 24 },
          { wall: 1, neighbor: 2, condition: (pos, width, wallW) => pos + width > wallW - 24 },
          { wall: 2, neighbor: 1, condition: (pos) => pos < 24 },
        ];
        const rules = shapeTypT === 'L' ? LRules : shapeTypT === 'U' ? URules : [];
        let hasCornerError = false;
        for (const rule of rules) {
          if (rule.wall === wallIndex && isLowerCabinetPlacedT[rule.neighbor]) {
            if (rule.condition(positionValue, widthValue, wallWidth)) {
              if (!errors.applianceObject) errors.applianceObject = {};
              if (!errors.applianceObject[index]) errors.applianceObject[index] = {};
              errors.applianceObject[index].position = {
                type: "cornerProximity",
                message: cornerMessage,
              };
              hasCornerError = true;
              break; // Only one corner error per appliance is sufficient
            }
          }
        }

        // Add to validation collections only if no boundary or corner errors
        if (!hasCornerError) {
          const item = { type: `applianceObject.${index}`, name: friendlyName, position: positionValue, width: widthValue };
          if (app.appliancekind === 'Refrigerator') validItemsRef[wallIndex].push(item);
          else if (app.appliancekind === 'Dishwasher') validItemsDishwasher[wallIndex].push(item);
          else if (app.appliancekind === 'Range') validItemsRange[wallIndex].push(item);
          else if (app.appliancekind === 'Hood') validItemsHood[wallIndex].push(item);
        }
      }
    }
  });

  // Combined item checks for doors and refrigerators (previously done)
  const validItems = validItemsDoor.map((items, index) => {
    return [
      ...(items || []),
      ...(validItemsRef[index] || []),
    ];
  });

  const result1 = checkAllWalls(validItems, validItemsWindow, validItemsDishwasher, validItemsRange, validItemsHood);
  if (!result1.isValid) {
    if (result1.valueKey1 && result1.valueKey2) {
      // Need to adjust value keys for array structure if they come from validItems
      // getValueKey currently returns `${ item.type }.position` which for appliances will be `applianceObject.${ index }.position`

      const fixKey = (key) => {
        if (key.includes('applianceObject.')) {
          // If the key is already in the correct field.index.property format, return it
          // Otherwise handle specific matches if legacy formats like 'Position' or 'Width' appear
          if (key.includes('.position') || key.includes('.width') || key.includes('.wallId')) {
            return key;
          }

          const posMatch = key.match(/applianceObject\.(\d+)Position/);
          if (posMatch) return `applianceObject.${posMatch[1]}.position`;

          const widthMatch = key.match(/applianceObject\.(\d+)Width/);
          if (widthMatch) return `applianceObject.${widthMatch[1]}.width`;
        }
        return key;
      };

      const key1 = fixKey(result1.valueKey1);
      const key2 = fixKey(result1.valueKey2);

      const setNestedOverlapError = (path, err) => {
        const parts = path.split('.');
        let current = errors;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) current[part] = {};
          current = current[part];
        }
        current[parts[parts.length - 1]] = err;
      };

      setNestedOverlapError(key1, {
        type: "overlapError",
        message: result1.message,
      });
      setNestedOverlapError(key2, {
        type: "overlapError",
        message: result1.message,
      });
    }
  }


  const cleanedErrors = cleanupErrors(errors);
  // 检查如果下面对象都是空，则不 返回错误

  return {
    values: Object.keys(cleanedErrors).length === 0 ? data : {}, // 如果没有错误，返回数据
    errors: cleanedErrors, // 错误对象
  };
};


export default checkFormData;