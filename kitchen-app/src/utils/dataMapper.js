/**
 * Data Mapper Utility
 * Maps API response data to the form format expected by React Hook Form
 */

/**
 * Maps the fetched kitchen data from API to the form format
 * @param {Object} result - The API response containing kitchen data
 * @returns {Object} - Formatted data object for React Hook Form
 */
export const mapFetchedDataToFormFormat = (result) => {
  const shapeType = result.kitchen?.shapeType || 'I';
  const visibilityMap = {
    'I': [true, false, false, false],
    'II': [true, true, false, false],
    'L': [true, true, false, false],
    'U': [true, true, true, false],
    'O': [true, true, true, true]
  };
  const activeVisibility = visibilityMap[shapeType] || [true, false, false, false];

  const normalizeList = (list, count, defaultObj, isWall = false) => {
    const resultList = Array(count).fill(null).map((_, i) => ({
      ...defaultObj,
      id: i + 1,
      visibility: isWall ? activeVisibility[i] : true
    }));

    (list || []).forEach((item, idx) => {
      const id = item.wallid || item.windowid || item.doorid || (idx + 1);
      const slotIndex = (id >= 1 && id <= count) ? id - 1 : idx;
      if (slotIndex >= 0 && slotIndex < count) {
        resultList[slotIndex] = { ...resultList[slotIndex], ...item };
        if (isWall) {
          resultList[slotIndex].visibility = activeVisibility[slotIndex];
        }
      }
    });
    return resultList;
  };

  const normalizedWalls = normalizeList(result.wallList, 4, {
    wallid: 0,
    visibility: false,
    wallName: "Wall",
    width: 0,
    height: 0,
    isLowerCabinetPlaced: false,
    isUpperCabinetPlaced: false
  }, true);

  normalizedWalls.forEach((w, i) => {
    if (!w.wallName || w.wallName === "Wall") {
      const names = ["One", "Two", "Three", "Four"];
      w.wallName = `Wall ${names[i]}`;
    }
    w.wallid = i + 1;
  });

  // Helper to find wall slot ("one", "two", etc.) by various ID formats
  const findWallSlot = (assocId, wallObj) => {
    const wallIdMap = ['one', 'two', 'three', 'four'];

    // 1. Prioritize nested wall object if it exists (common in search results)
    if (wallObj) {
      if (wallObj.wallid >= 1 && wallObj.wallid <= 4) {
        return wallIdMap[wallObj.wallid - 1];
      }
      // Alternate check: use wallName hint
      const name = (wallObj.wallName || "").toLowerCase();
      if (name.includes("one")) return "one";
      if (name.includes("two")) return "two";
      if (name.includes("three")) return "three";
      if (name.includes("four")) return "four";
    }

    if (!assocId && !wallObj) return 'one';

    // 2. Check if ID is already a slot string or simple numeric index
    const idStr = (assocId || "").toString().toLowerCase();
    if (wallIdMap.includes(idStr)) return idStr;
    if (idStr === '1') return 'one';
    if (idStr === '2') return 'two';
    if (idStr === '3') return 'three';
    if (idStr === '4') return 'four';

    // 3. Deep compare against normalized walls
    const targetId = assocId || (wallObj ? (wallObj.id || wallObj.wallid) : null);
    if (targetId) {
      const idx = normalizedWalls.findIndex(w => (
        w.id === targetId ||
        w.wallid === targetId ||
        (w.originId && w.originId === targetId) ||
        (wallObj && wallObj.id === w.id)
      ));
      if (idx !== -1) return wallIdMap[idx];

      // Final fallback: check raw result list order
      const rawIdx = (result.wallList || []).findIndex(w => (w.wallid === targetId || w.id === targetId));
      if (rawIdx !== -1 && rawIdx < 4) return wallIdMap[rawIdx];
    }

    return 'one';
  };

  const windowObjects = (result.windowList || []).map((w) => {
    // Search results prioritize association via the nested wall object
    const slot = findWallSlot(null, w.wall);
    return { ...w, hasWindow: Number(w.width || 0) !== 0, wallId: slot, position: w.startposition };
  });

  const doorObjects = (result.doorList || []).map((d) => {
    const slot = findWallSlot(null, d.wall);
    return { ...d, hasDoor: Number(d.width || 0) !== 0, wallId: slot, position: d.startposition };
  });

  const applianceObject = (result.applianceList || []).map((app) => {
    let slot = 'one';
    if (app.island || app.islandId) {
      slot = 'island';
    } else {
      slot = findWallSlot(null, app.wall);
    }
    return {
      appliancekind: app.appliancekind,
      width: app.width,
      height: app.height,
      position: app.position,
      wallId: slot
    };
  });

  return {
    kitchenObject: result.kitchen,
    wallObjects: normalizedWalls,
    windowObjects: windowObjects,
    doorObjects: doorObjects,
    applianceObject: applianceObject,
    islandObject: result.island || {
      islandKind: "none",
      width: 0,
      length: 0,
      peninsulaisadjacentto: 'one',
      horverType: 'H',
      isOverhang: false,
      isWaterfall: false
    },
  };
};

/**
 * Maps search result item to display format
 * @param {Object} item - Search result item from API
 * @param {number} index - Index of the item
 * @returns {Object} - Formatted search result item
 */
export const mapSearchResultItem = (item, index) => ({
  id: (index + 1).toString(),
  primary: `Kitchen ID: ${item.kitchenId}`,
  secondary: `Kitchen Name: ${item.kitchenName}`,
  clicked: false,
  kitchenId: item.kitchenId
});
